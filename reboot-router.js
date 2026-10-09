import { request as httpRequest } from 'node:http';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const logger = { ...console };
const baseUrl = 'http://172.16.6.1';
const rebootPageUrl = new URL('/cgi-bin/cgi?req=frm&frm=init.html', baseUrl);
const authorization = `Basic ${Buffer.from('root:').toString('base64')}`;
const requestTimeoutMs = 10_000;

function parseAttributes(tag) {
  const attributes = new Map();
  const pattern = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  for (const match of tag.matchAll(pattern)) {
    const value = (match[2] ?? match[3] ?? match[4] ?? '').replace(
      /&amp;/gi,
      '&',
    );
    attributes.set(match[1].toLowerCase(), value);
  }

  return attributes;
}

function getRebootForm(html) {
  for (const match of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form\s*>/gi)) {
    const formAttributes = parseAttributes(match[1]);
    const formBody = match[2];
    const rebootButton = [...formBody.matchAll(/<input\b[^>]*>/gi)]
    .map(([tag]) => parseAttributes(tag))
    .find((attributes) => attributes.get('name')?.toLowerCase() === 'reboot');

    if (!rebootButton) continue;

    const fields = new URLSearchParams();
    for (const inputMatch of formBody.matchAll(/<input\b[^>]*>/gi)) {
      const attributes = parseAttributes(inputMatch[0]);
      if (
        attributes.get('type')?.toLowerCase() === 'hidden' &&
        attributes.has('name')
      ) {
        fields.append(attributes.get('name'), attributes.get('value') ?? '');
      }
    }

    fields.append('reboot', rebootButton.get('value') ?? '');
    return {
      action: formAttributes.get('action'),
      method: (formAttributes.get('method') ?? 'get').toLowerCase(),
      fields,
    };
  }

  throw new Error('Reboot form was not found on the router page.');
}

function serializeForm(fields) {
  return [...fields]
  .map(([name, value]) => {
    const pair = new URLSearchParams([[name, value]]).toString();
    const separator = pair.indexOf('=');
    const encodedValue =
        name === 'reboot'
          ? {
            再起動: '%BA%C6%B5%AF%C6%B0',
          }[value]
          : pair.slice(separator + 1);

    if (encodedValue === undefined) {
      throw new Error(`Unsupported value for router form field "${name}".`);
    }

    return `${pair.slice(0, separator)}=${encodedValue}`;
  })
  .join('&');
}

function requestRouter(url, options = {}) {
  const body =
    options.body instanceof URLSearchParams
      ? serializeForm(options.body)
      : options.body?.toString();

  return new Promise((resolve, reject) => {
    const request = httpRequest(
      url,
      {
        method: options.method ?? 'GET',
        headers: {
          Authorization: authorization,
          ...options.headers,
          ...body ? { 'Content-Length': Buffer.byteLength(body) } : {},
        },
        insecureHTTPParser: true,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('error', reject);
        response.on('end', () => {
          const status = response.statusCode ?? 0;
          if (status === 401) {
            reject(
              new Error('Router rejected root with an empty password (HTTP 401).'),
            );
            return;
          }
          if (status < 200 || status >= 300) {
            reject(new Error(`Router returned HTTP ${status} for ${url}.`));
            return;
          }

          resolve({
            status,
            text: async () =>
              new TextDecoder('euc-jp').decode(Buffer.concat(chunks)),
          });
        });
      },
    );

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error(`Router request timed out after ${requestTimeoutMs} ms.`));
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });
}

async function rebootRouter() {
  const pageResponse = await requestRouter(rebootPageUrl);
  const html = await pageResponse.text();
  const form = getRebootForm(html);
  if (form.method !== 'post') {
    throw new Error(`Unexpected reboot form method: ${form.method}.`);
  }

  const action = new URL(form.action, rebootPageUrl);
  if (action.origin !== baseUrl) {
    throw new Error('Refusing to submit the reboot form to a different host.');
  }

  const response = await requestRouter(action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.fields,
  });

  logger.info(`Router accepted the reboot request (HTTP ${response.status}).`);
  logger.info('The router may be temporarily unreachable while it restarts.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  rebootRouter().catch((error) => {
    logger.error(`Router reboot failed: ${error.message}`);
    process.exitCode = 1;
  });
}

import { speedTest } from './speed.js';

const logger = console;

const speed = () => speedTest().then(res => {
  logger.info([
    `Download ${res.download * 8} Mbps`,
    `Upload ${res.upload * 8} Mbps`,
    `Latency ${res.latency} ms`,
  ]);
  return res;
}).catch(e => logger.error(e));

export class App {
  async fetch(length) {
    const test = [];
    if (!length || length < 1) length = 3;
    for (let i = 0; i < length; i++) {
      if (i) await new Promise(resolve => { setTimeout(resolve, 200); });
      test.push(await speed());
    }
    const MAX_VALUE = 2 ** 16;
    return test.reduce((acc, value) => ({
      latency: Math.max(acc.latency || 0, value.latency),
      download: Math.min(acc.download || MAX_VALUE, value.download),
      upload: Math.min(acc.upload || MAX_VALUE, value.upload),
    }), {});
  }
}

export const app = new App();

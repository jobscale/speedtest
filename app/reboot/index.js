import { store } from '../store.js';

const logger = console;
const endpoint = 'http://192.168.0.1';

const self = {
  async getCsrfToken() {
    const method = 'GET';
    const url = `${endpoint}/login.php`;
    const headers = {
      accept: '*/*',
      'x-requested-with': 'XMLHttpRequest',
      cookie: 'PHPSESSID=6kh3ruiej9g33bvse1qppk8oe7',
    };
    const response = await fetch(url, { method, headers });
    const text = await response.text();
    const csrfToken = text.match(/csrfToken(.*)[\n]/)?.[1]?.split('"')[2];
    if (!csrfToken) {
      throw new Error('Failed to extract CSRF token');
    }
    return csrfToken;
  },

  async reboot() {
    const method = 'POST';
    const url = `${endpoint}/controller/deviceSettings.php`;
    const headers = {
      accept: '*/*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      cookie: 'PHPSESSID=6kh3ruiej9g33bvse1qppk8oe7',
    };
    const csrfToken = store.getItem('csrfToken');
    const payload = {
      flag: 'device_reboot',
      csrfToken,
    };
    const body = await fetch(url, {
      method,
      headers,
      body: new URLSearchParams(payload).toString(),
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    });
    logger.info('Reboot response:', body);
  },

  main() {
    return self.getCsrfToken()
    .then(csrfToken => {
      store.setItem('csrfToken', csrfToken);
      return self.reboot();
    })
    .catch(e => logger.error(e.message));
  },
};

export const rebootDevice = async () => {
  await self.main();
};

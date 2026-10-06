import { store } from '../store.js';

const logger = console;
const endpoint = 'http://192.168.0.1';
const cookie = 'PHPSESSID=6kh3ruiej9g33bvse1qppk8oe7';
const headers = {
  accept: '*/*',
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'x-requested-with': 'XMLHttpRequest',
  cookie,
};

const bluePrint = opts => {
  const { input1, input2 = cookie, outing = 'hex' } = opts;
  const buf1 = Buffer.isBuffer(input1) ? input1 : Buffer.from(input1, 'utf-8');
  const buf2 = Buffer.isBuffer(input2) ? input2 : Buffer.from(input2, 'utf-8');
  const length = Math.min(buf1.length, buf2.length);
  const resultBuf = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    resultBuf[i] = buf1[i] ^ buf2[i];
  }
  return resultBuf.toString(outing);
};

const self = {
  async getCsrfToken() {
    const method = 'GET';
    const url = `${endpoint}/login.php`;
    const response = await fetch(url, { method, headers });
    const text = await response.text();
    const csrfToken = text.match(/csrfToken(.*)[\n]/)?.[1]?.split('"')[2];
    if (!csrfToken) {
      throw new Error('Failed to extract CSRF token');
    }
    store.setItem('csrfToken', csrfToken);
    logger.info('CSRF Token:', csrfToken);
    return csrfToken;
  },

  async login() {
    const method = 'POST';
    const url = `${endpoint}/controller/password.php`;
    const csrfToken = store.getItem('csrfToken');
    const input1 = Buffer.from('227860272a112078760e', 'hex');
    const credential = bluePrint({ input1, outing: 'utf-8' });
    const payload = {
      operate: 'login',
      username: 'admin',
      password: credential,
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
    logger.info('login response:', body ? JSON.parse(body) : 'No response body');
  },

  async operate(operate = 'get_battery_info') {
    const method = 'POST';
    const url = `${endpoint}/controller/nav.php`;
    const csrfToken = store.getItem('csrfToken');
    const payload = { operate, csrfToken };
    const body = await fetch(url, {
      method,
      headers,
      body: new URLSearchParams(payload).toString(),
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    });
    logger.info('operate response:', body ? JSON.parse(body) : 'No response body');
  },

  async reboot() {
    const method = 'POST';
    const url = `${endpoint}/controller/deviceSettings.php`;
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
    logger.info('reboot response:', body ? JSON.parse(body) : 'No response body');
  },

  main() {
    return self.getCsrfToken()
    .then(() => self.login())
    .then(() => self.operate())
    .then(() => self.reboot())
    .catch(e => logger.error(e.message));
  },
};

export const rebootDevice = async () => {
  await self.main();
};

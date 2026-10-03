import { app as speed } from './app/index.js';
import { store } from './app/store.js';
import { rebootDevice } from './app/reboot/index.js';

const logger = { ...console };
const mem = { late: 0 };

class App {
  postSlack(data) {
    const url = 'https://jsx.jp/api/slack';
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    return fetch(url, options);
  }

  execute() {
    return speed.fetch(2)
    .then(res => {
      const result = [
        `Download ${res.download * 8} Mbps`,
        `Upload ${res.upload * 8} Mbps`,
        `Latency ${res.latency} ms`,
      ];
      const text = result.join('\n');
      logger.info(text);
      store.setItem('text', text);

      if (res.download < 0.1 || res.upload < 0.1 || res.latency > 800) {
        mem.late++;
      }
      store.setItem('late', mem.late);
    });
  }

  async check(opts = { attempts: 3 }) {
    await this.execute();
    // 初回成功は OK
    if (mem.late <= 0) return;
    // 初回に失敗したら 3 回再試行
    if (opts.attempts) {
      await new Promise(resolve => { setTimeout(resolve, 2_000); });
      opts.attempts--;
      await this.check(opts);
      return;
    }
    if (mem.late < 4) return;
    // 4 回中 4 回以上失敗したら通知して再起動
    logger.info('Rebooting device due to repeated slow speeds...');
    const text = store.getItem('text');
    await this.postSlack({
      channel: 'push',
      icon_emoji: ':rocket:',
      username: 'Net speed',
      text,
    });
    await rebootDevice();
  }

  async start() {
    await this.check();
  }
}

new App().start()
.catch(e => logger.error(e));

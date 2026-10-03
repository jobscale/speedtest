import { formatTimestamp } from '@jobscale/timestamp';
import { app as speed } from './app/index.js';
import { store } from './app/store.js';
import { rebootDevice } from './app/reboot/index.js';

const logger = { ...console };
const memo = { ok: false };

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
        `Download ${(res.download * 8).toFixed(2)} Mbps`,
        `Upload ${(res.upload * 8).toFixed(2)} Mbps`,
        `Latency ${res.latency.toFixed(1)} ms`,
      ];
      logger.info(formatTimestamp({ tz: false }), result);
      const text = result.join('\n');
      store.setItem('text', text);

      const ng = res.download < 0.1 || res.upload < 0.1 || res.latency > 800;
      memo.ok = !ng;
    });
  }

  async check(opts = { attempts: 3 }) {
    await this.execute();
    if (memo.ok) return;
    if (opts.attempts) {
      await new Promise(resolve => { setTimeout(resolve, 15_000); });
      opts.attempts--;
      await this.check(opts);
      return;
    }
    logger.info('Rebooting device due to repeated slow speeds...');
    const text = store.getItem('text');
    await this.postSlack({
      channel: 'push',
      icon_emoji: ':rocket:',
      username: 'Net speed',
      text,
    });
    await new Promise(resolve => { setTimeout(resolve, 1_000); });
    await rebootDevice();
    process.exit(1);
  }

  async start() {
    await this.check();
  }
}

new App().start()
.catch(e => logger.error(e));

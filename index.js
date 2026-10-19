import { spawn } from 'child_process';
import { createLogger } from '@jobscale/create-logger';
import { formatTimestamp } from '@jobscale/timestamp';
import { app as speed } from './app/index.js';
import { store } from './app/store.js';
import { rebootDevice } from './app/reboot/index.js';

const { LOG_LEVEL, SOUND } = process.env;

const logger = createLogger(LOG_LEVEL || 'info');
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

  play(sound) {
    return new Promise(resolve => {
      const player = spawn('ffplay', ['-nodisp', '-autoexit', '-ss', '0.0', sound]);
      player.on('close', code => {
        if (code) logger.warn('play failed');
        resolve(code);
      });
    });
  }

  execute() {
    return speed.fetch(2)
    .then(res => {
      const ng = res.download < 0.1 || res.upload < 0.07 || res.latency > 700;
      memo.ok = !ng;
      const result = [
        `Download ${(res.download * 8).toFixed(2)} Mbps`,
        `Upload ${(res.upload * 8).toFixed(2)} Mbps`,
        `Latency ${res.latency.toFixed(1)} ms`,
      ];
      logger.info(formatTimestamp({ tz: false }), result, memo.ok ? 'OK' : 'NG');
      const text = result.join('\n');
      store.setItem('text', text);
    });
  }

  async check(opts = { attempts: 4 }) {
    await this.execute();
    if (memo.ok) return;
    if (SOUND) await this.play(SOUND);
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
.catch(e => logger.error(e.cause?.message ?? e.cause ?? e.message));

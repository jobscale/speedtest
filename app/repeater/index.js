import { spawn } from 'child_process';
import { createLogger } from '@jobscale/create-logger';

const { LOG_LEVEL } = process.env;
const logger = createLogger(LOG_LEVEL || 'info');

class Repeater {
  /**
   * 外部コマンドを実行する共通プライベートメソッド
   */
  #exec(command) {
    return new Promise(resolve => {
      const stack = { out: [], err: [] };
      const terminal = spawn('ssh', ['router', command]);
      terminal.stdout.on('data', stream => stack.out.push(stream.toString()));
      terminal.stderr.on('data', stream => stack.err.push(stream.toString()));
      terminal.on('close', code => {
        if (code) logger.warn('command failed');
        if (stack.out.length) logger.info(stack.out.join(''));
        if (stack.err.length) logger.warn('stderr', stack.err.join(''));
        resolve({ ...stack, code });
      });
      terminal.on('error', e => {
        logger.error(e.message);
        resolve({ ...stack, code: 179 });
      });
    });
  }

  info() {
    const remote = 'iwinfo apcli0 info && date';
    return this.#exec(remote);
  }

  reset() {
    const remote = 'wifi down && wifi up && date';
    return this.#exec(remote);
  }

  restart() {
    const remote = '/etc/init.d/repeater restart && date';
    return this.#exec(remote);
  }
}

export const repeater = new Repeater();
export default { Repeater, repeater };

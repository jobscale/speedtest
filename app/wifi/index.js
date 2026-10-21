import { spawn } from 'child_process';
import { createLogger } from '@jobscale/create-logger';

const { LOG_LEVEL } = process.env;
const logger = createLogger(LOG_LEVEL || 'info');

class Wifi {
  /**
   * 外部コマンドを実行する共通プライベートメソッド
   */
  #exec(command) {
    return new Promise(resolve => {
      const stack = { out: [], err: [] };
      const terminal = spawn('bash', ['-c', command]);
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

  /**
   * Wi-Fi の一覧を取得（rescan=true で強制リフレッシュ）
   */
  list(rescan = false) {
    const option = rescan ? '--rescan yes' : '';
    const command = `nmcli device wifi list ${option} && date`;
    return this.#exec(command);
  }

  /**
   * 保存済みの ssid で Wi-Fi に接続
   */
  attach(ssid) {
    const command = `wifi-connect "${ssid}" && date`;
    return this.#exec(command);
  }
}

export const wifi = new Wifi();
export default { Wifi, wifi };

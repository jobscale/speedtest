import { spawn } from 'child_process';
import { createLogger } from '@jobscale/create-logger';

const { LOG_LEVEL } = process.env;

const logger = createLogger(LOG_LEVEL || 'info');

class Wifi {
  list() {
    const command = 'nmcli device wifi list && date';
    return new Promise(resolve => {
      const stack = { out: [], err: [] };
      const terminal = spawn('bash', ['-c', command]);
      terminal.stdout.on('data', stream => stack.out.push(stream.toString()));
      terminal.stderr.on('data', stream => stack.err.push(stream.toString()));
      terminal.on('close', code => {
        if (code) logger.warn('command failed');
        logger.info(stack.out.join(''));
        if (stack.err.length) logger.warn('stderr', stack.err.join(''));
        resolve({ ...stack, code });
      });
      terminal.on('error', e => {
        logger.error(e.message);
        resolve({ ...stack, code: 179 });
      });
    });
  }

  attach(ssid) {
    const command = `nmcli device wifi connect "${ssid}" && date`;
    return new Promise(resolve => {
      const stack = { out: [], err: [] };
      const terminal = spawn('bash', ['-c', command]);
      terminal.stdout.on('data', stream => stack.out.push(stream.toString()));
      terminal.stderr.on('data', stream => stack.err.push(stream.toString()));
      terminal.on('close', code => {
        if (code) logger.warn('command failed');
        logger.info(stack.out.join(''));
        if (stack.err.length) logger.warn('stderr', stack.err.join(''));
        resolve({ ...stack, code });
      });
      terminal.on('error', e => {
        logger.error(e.message);
        resolve({ ...stack, code: 179 });
      });
    });
  }
}

export const wifi = new Wifi();
export default { Wifi, wifi };

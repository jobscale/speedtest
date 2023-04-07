const speedTest = require('./speed');

const logger = console;

const wait = ms => new Promise(resolve => { setTimeout(resolve, ms); });

const speed = () => speedTest().then(result => {
  if (!result) throw new Error('unknown failed.');
  logger.info(`Download speed: ${result} MiB`);
  return result;
}).catch(e => logger.error(e));

class App {
  async fetch(length) {
    const test = [];
    if (!length || length < 1) length = 3;
    for (let i = 0; i < length;) {
      test.push(await speed());
      if (++i < length) await wait(100);
    }
    return {
      downloadSpeed: test.reduce((acc, value) => Math.max(acc, value), 0),
    };
  }
}

module.exports = {
  App,
  app: new App(),
};

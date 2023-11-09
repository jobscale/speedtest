const { speedTest } = require('./speed');

const logger = console;

const wait = ms => new Promise(resolve => { setTimeout(resolve, ms); });

const speed = () => speedTest().then(res => {
  if (!res) throw new Error('unknown failed.');
  logger.info([
    `Download ${res.download * 8} Mbps`,
    `Upload ${res.upload * 8} Mbps`,
    `Latency ${res.latency} ms`,
  ]);
  return res;
}).catch(e => logger.error(e));

class App {
  async fetch(length) {
    const test = [];
    if (!length || length < 1) length = 3;
    for (let i = 0; i < length; i++) {
      if (i) await wait(200);
      test.push(await speed());
    }
    const MAX_VALUE = 2 ** 16;
    return test.reduce((acc, value) => ({
      latency: Math.min(acc.latency || MAX_VALUE, value.latency),
      download: Math.min(acc.download || MAX_VALUE, value.download),
      upload: Math.min(acc.upload || MAX_VALUE, value.upload),
    }), {});
  }
}

module.exports = {
  App,
  app: new App(),
};

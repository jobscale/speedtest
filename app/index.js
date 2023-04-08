const speedTest = require('./speed');

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
    for (let i = 0; i < length;) {
      test.push(await speed());
      if (++i < length) await wait(200);
    }
    return test.reduce((acc, value) => ({
      latency: Math.min(acc.latency || 2 ** 16, value.latency),
      download: Math.max(acc.download || 0, value.download),
      upload: Math.max(acc.upload || 0, value.upload),
    }), {});
  }
}

module.exports = {
  App,
  app: new App(),
};

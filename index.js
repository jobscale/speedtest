const { app: speed } = require('./app');

const logger = console;

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
      const sum = [
        `Download ${res.download * 8} Mbps`,
        `Upload ${res.upload * 8} Mbps`,
        `Latency ${res.latency} ms`,
      ];
      const text = sum.join('\n');
      logger.info(text);
      return this.postSlack({
        channel: 'push',
        icon_emoji: ':rocket:',
        username: 'Net speed',
        text,
      });
    });
  }

  async start() {
    await this.execute();
  }
}

new App().start()
.catch(e => logger.error(e));

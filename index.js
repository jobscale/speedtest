const { app: speed } = require('./app');

const logger = console;

class App {
  postSlack(data) {
    const url = 'https://tanpo.jsx.jp/api/slack';
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    return fetch(url, options);
  }

  execute() {
    return speed.fetch(3)
    .then(res => {
      const text = `${res.downloadSpeed * 8} Mbps`;
      logger.info(text);
      this.postSlack({
        channel: 'C4WN3244D',
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
.catch(e => {
  logger.error(e.message, e);
});

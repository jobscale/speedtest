require('core');
const { Shell } = require('shell');
class SpeedTest {
  constructor() {
    this.cmd = 'speedtest-cli';
    this.args = ['--simple', '--share'];
  }
  run() {
    return new Shell().spawn(this.cmd, this.args)
    .then(res => res)
    .catch(e => e.toString());
  }
}
module.exports = {
  SpeedTest,
};

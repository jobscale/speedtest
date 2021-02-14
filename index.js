require('core');
const { Shell } = require('shell');
class SpeedTest {
  constructor() {
    this.cmd = 'speedtest-cli --simple --share';
    this.cmd = 'docker';
    this.args = ['exec', '-i', 'node-aws', 'bash', '-c', '"speedtest-cli --simple --share"'];
  }
  run() {
    return new Shell().spawn(this.cmd, this.args)
    .then(res => res)
    .catch(e => e.message);
  }
}
module.exports = {
  SpeedTest,
};

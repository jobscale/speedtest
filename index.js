require('core');
const { Shell } = require('shell');
class SpeedTest {
  constructor() {
    this.cmd = 'speedtest-cli --simple --share';
  }
  run() {
    return new Shell().exec(this.cmd)
    .then(res => res)
    .catch(e => e.message);
  }
}
module.exports = {
  SpeedTest,
};

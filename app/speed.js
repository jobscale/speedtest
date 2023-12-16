const latencyUrls = [
  'https://site-assets.fontawesome.com',
  'https://jsx.jp',
];

const downloadUrls = [
  'https://site-assets.fontawesome.com/releases/v6.3.0/css/all.css',
  'https://site-assets.fontawesome.com/releases/v6.0.0/css/all.css',
];

const uploadUrls = [
  'https://jsx.jp/auth/totp',
];

class NetSpeed {
  async latency() {
    const begin = Date.now();
    await Promise.all([
      fetch(latencyUrls[0], { method: 'head' }),
      fetch(latencyUrls[1], { method: 'head' }),
    ]);
    return Date.now() - begin;
  }

  async download() {
    const begin = Date.now();
    await Promise.all([
      fetch(downloadUrls[0]),
      fetch(downloadUrls[1]),
    ]);
    return Math.floor((1000 / (Date.now() - begin)) * 100) / 100;
  }

  async upload() {
    const begin = Date.now();
    const data = { buffer: '100KB' };
    for (let i = 7330; i; i--) {
      data.buffer += `/${Date.now()}`;
    }
    await Promise.all([
      fetch(uploadUrls[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      fetch(uploadUrls[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    ]);
    return Math.floor((Date.now() - begin) / 10) / 100;
  }
}

module.exports = {
  speedTest: async () => {
    const speed = new NetSpeed();
    const latency = await speed.latency();
    const download = await speed.download();
    const upload = await speed.upload();
    return { latency, download, upload };
  },
};

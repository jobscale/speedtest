import crypto from 'crypto';

const latencyUrls = [
  'https://jsx.jp',
];

const downloadUrls = [
  'https://jsx.jp/api/speed',
];

const uploadUrls = [
  'https://jsx.jp/auth/totp',
];

export class NetSpeed {
  async latency() {
    const begin = Date.now();
    await fetch(latencyUrls[0], { method: 'HEAD' });
    return Date.now() - begin;
  }

  async download() {
    const begin = Date.now();
    const size = await fetch(downloadUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: Date.now() }),
    })
    .then(res => res.blob())
    .then(buffer => buffer.size);
    const duration = Math.max(Date.now() - begin, 1);
    return Math.floor(size * 2 / duration / 10) / 100;
  }

  async upload() {
    const begin = Date.now();
    const size = 100_000;
    const data = {
      buffer: crypto.randomBytes(size),
    };
    await fetch(uploadUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data.buffer,
    });
    const duration = Math.max(Date.now() - begin, 1);
    return Math.floor(size / duration / 10) / 100;
  }
}

export const speedTest = async () => {
  const speed = new NetSpeed();
  const latency = await speed.latency();
  const download = await speed.download();
  const upload = await speed.upload();
  return { latency, download, upload };
};

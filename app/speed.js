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
  /**
   * @returns milliseconds
   */
  async latency() {
    const begin = performance.now();
    await fetch(`${latencyUrls[0]}?t=${Date.now()}`, { method: 'HEAD' });
    return Number.parseFloat((performance.now() - begin).toFixed(1));
  }

  /**
   * @returns MB per sec
   */
  async download() {
    const begin = performance.now();
    const res = await fetch(`${downloadUrls[0]}?t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: Date.now() }),
    });

    const buffer = await res.arrayBuffer();
    const size = buffer.byteLength;

    const duration = Math.max(performance.now() - begin, 1);

    // 単位計算: size(bytes) / duration(ms) * 0.001 = MB/s
    const mbPerSec = size / duration * 0.001;
    return Number.parseFloat(mbPerSec.toFixed(2));
  }

  /**
   * @returns MB per sec
   */
  async upload() {
    const size = 100_000; // 100KB の低負荷測定
    const payload = crypto.randomBytes(size);

    const begin = performance.now();
    await fetch(uploadUrls[0], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        // Node.jsのfetchで確実にContent-Lengthを伝えるための明示
        'Content-Length': size.toString(),
      },
      // Uint8Arrayに変換して渡すことで、ブラウザ互換のfetch APIレイヤーでの互換性を保証
      body: new Uint8Array(payload),
    });

    const duration = Math.max(performance.now() - begin, 1);

    // 単位計算: size(bytes) / duration(ms) * 0.001 = MB/s
    const mbPerSec = size / duration * 0.001;
    return Number.parseFloat(mbPerSec.toFixed(2));
  }
}

export const speedTest = async () => {
  const speed = new NetSpeed();
  const latency = await speed.latency();
  const download = await speed.download();
  const upload = await speed.upload();
  return { latency, download, upload };
};

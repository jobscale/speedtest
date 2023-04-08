const latencyUrls = [
  'https://site-assets.fontawesome.com',
  'https://www.jsx.jp',
];

const downloadUrls = [
  'https://site-assets.fontawesome.com/releases/v6.3.0/css/all.css',
  'https://site-assets.fontawesome.com/releases/v6.0.0/css/all.css',
];

const uploadUrls = [
  'https://www.jsx.jp/favicon.ico',
  'https://www.jsx.jp/assets/img/okutan.svg',
];

module.exports = async () => {
  const beginHead = Date.now();
  await Promise.all([
    fetch(latencyUrls[0], { method: 'head' }),
    fetch(latencyUrls[1], { method: 'head' }),
  ]);
  const latency = Date.now() - beginHead;

  const beginDown = Date.now();
  await Promise.all([
    fetch(downloadUrls[0]),
    fetch(downloadUrls[1]),
  ]);
  const download = Math.floor((1000 / (Date.now() - beginDown)) * 100) / 100;

  const beginUp = Date.now();
  await Promise.all([
    fetch(uploadUrls[0]),
    fetch(uploadUrls[1]),
  ]);
  const upload = Math.floor((500 / (Date.now() - beginUp)) * 100) / 100;

  return { latency, download, upload };
};

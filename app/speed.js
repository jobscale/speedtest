const urls = [
  'https://site-assets.fontawesome.com/releases/v6.3.0/css/all.css',
  'https://site-assets.fontawesome.com/releases/v6.0.0/css/all.css',
];

module.exports = async () => {
  const begin = Date.now();
  await Promise.all([
    fetch(urls[0]),
    fetch(urls[1]),
  ]);
  return Math.floor((1000 / (Date.now() - begin)) * 100) / 100;
};

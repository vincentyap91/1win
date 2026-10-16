await sleep(800);
const imgs = [...document.querySelectorAll('img')].map(i => ({
  src: (i.getAttribute('src') || '').slice(0, 80),
  ok: i.complete && i.naturalWidth > 0,
  w: i.naturalWidth,
  alt: (i.alt || '').slice(0, 40),
}));
const bad = imgs.filter(i => !i.ok && i.src !== 'data:,');
const placeholders = imgs.filter(i => i.src === 'data:,');
return {
  state: document.body.dataset.state,
  total: imgs.length,
  bad: bad.slice(0, 10),
  badCount: bad.length,
  placeholders: placeholders.length,
};

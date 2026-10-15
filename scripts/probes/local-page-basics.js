// Local page health: rendered state vs viewport, horizontal overflow, broken images, in-site links without a local page.
// Wait for the shared UI and for the size-specific state to settle (heavy pages render later under load).
for (let i = 0; i < 40 && document.documentElement.dataset.sharedUi === 'loading'; i++) await sleep(250);
// Same size buckets as keyFor() in common.js; the re-render after the viewport change is debounced.
const bucket = innerWidth < 410 ? '390x844' : innerWidth < 640 ? '430x932' : innerWidth < 1024 ? '768x1024' : innerWidth >= 1680 ? '1920x1080' : '1440x900';
for (let i = 0; i < 40 && !document.body.dataset.state?.endsWith(bucket); i++) await sleep(250);
const imgs = [...document.images].filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth && i.loading !== 'lazy');
const links = [...document.querySelectorAll('a[data-reference-href]')];
const unresolved = links.filter(a => {
  const u = new URL(a.dataset.referenceHref, 'https://one-vv3591.com/');
  return u.hostname === 'one-vv3591.com' && !(a.getAttribute('href') || '').endsWith('.html') && !/\.html\?/.test(a.getAttribute('href') || '');
}).map(a => new URL(a.dataset.referenceHref, 'https://one-vv3591.com/').pathname);
return {
  state: document.body.dataset.state, w: innerWidth,
  hscroll: document.documentElement.scrollWidth > innerWidth + 1,
  brokenImages: imgs.map(i => i.getAttribute('src')).slice(0, 5),
  links: links.length, unresolved: [...new Set(unresolved)].slice(0, 12), unresolvedCount: unresolved.length,
  signed: !!document.querySelector('[data-testid="header-balance-deposit-button"]'),
};

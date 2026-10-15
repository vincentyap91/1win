// Local infinite scroll check, mirroring probe-more-steps.js on the reference: scroll in 25px steps and record the
// marker distance at which each page loads (two pages), then jump to the document bottom, then report duplicates.
const grid = [...document.querySelectorAll('[class*="games-grid_list"]')].find(g => !g.closest('[data-index]') && g.querySelector('[data-testid^="game-card-"]'));
if (!grid) return {error: 'no grid'};
const visible = () => [...grid.children].filter(c => !c.hidden && c.getClientRects().length).length;
const marker = grid.nextElementSibling;
const dist = () => Math.round(marker.getBoundingClientRect().top - innerHeight);
const start = visible(), loads = [];
let count = start;
for (let i = 0; i < 400 && loads.length < 2; i++) {
  const before = dist();
  scrollBy(0, 25);
  await sleep(60);
  const n = visible();
  if (n !== count) { loads.push({from: count, to: n, markerBefore: before}); count = n; }
}
scrollTo(0, document.documentElement.scrollHeight);
await sleep(600);
const afterJump = visible();
const ids = [...grid.children].filter(c => !c.hidden).map(c => (c.matches('[data-reference-href]') ? c : c.querySelector('[data-reference-href]'))?.dataset.referenceHref);
return {start, loads, afterJump, total: grid.children.length, duplicates: ids.length - new Set(ids).size, hscroll: document.documentElement.scrollWidth > innerWidth + 1};

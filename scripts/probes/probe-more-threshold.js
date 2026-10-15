// Find the infinite-scroll trigger distance: place the grid bottom at decreasing distances below the viewport bottom
// (25px steps, 1.2s settle each) and report the first distance at which a new batch arrives. Then jump to the
// document bottom once and report how many batches load back-to-back.
for (let k = 0; k < 30 && !document.querySelector('[data-testid^="game-card-"]'); k++) await sleep(400);
await sleep(2500);
const cards = () => [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => !c.closest('[data-index],[class*="carousel"]'));
const grid = () => cards()[0].parentElement;
const sentinel = grid().nextElementSibling;
const gapNow = () => grid().getBoundingClientRect().bottom - innerHeight;
const start = cards().length;
let trigger = null;
for (let gap = 1200; gap >= 0; gap -= 25) {
  scrollBy(0, gapNow() - gap);
  await sleep(1200);
  if (cards().length !== start) { trigger = gap; break; }
}
const afterTrigger = cards().length;
await sleep(2500);
const before = cards().length;
scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'});
const counts = [];
for (let i = 0; i < 12; i++) { await sleep(500); counts.push(cards().length); }
return {start, trigger, afterTrigger, before, jumpCounts: counts, sentinel: sentinel ? {tag: sentinel.tagName, cls: String(sentinel.className), h: sentinel.offsetHeight, style: sentinel.getAttribute('style')} : null};

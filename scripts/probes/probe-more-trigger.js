// Category page infinite scroll: scroll down in 50px steps and record where the next batch starts loading
// (distance between the grid's bottom and the viewport bottom), which element scrolls, and the batch sizes.
for (let k = 0; k < 30 && !document.querySelector('[data-testid^="game-card-"]'); k++) await sleep(400);
await sleep(2500);
const cards = () => [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => !c.closest('[data-index],[class*="carousel"]'));
const grid = () => cards()[0]?.parentElement;
const scroller = (() => {
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 200 && el.contains(grid())) return el;
  }
  return document.scrollingElement;
})();
const viewBottom = () => scroller === document.scrollingElement ? innerHeight : scroller.getBoundingClientRect().bottom;
const events = [];
let count = cards().length;
const start = count;
const sentinels = [...grid().parentElement.querySelectorAll(':scope > *')].map(n => ({cls: String(n.className).slice(0, 80), h: Math.round(n.getBoundingClientRect().height)}));
for (let i = 0; i < 400 && events.length < 2; i++) {
  scroller.scrollBy(0, 50);
  await sleep(150);
  const n = cards().length;
  if (n !== count) {
    // The batch was requested a bit earlier than it rendered; record the distance at render and 150ms earlier.
    events.push({from: count, to: n, gap: Math.round(grid().getBoundingClientRect().bottom - viewBottom()), scrollTop: Math.round(scroller.scrollTop)});
    count = n;
    await sleep(1500);
  }
}
const footer = document.querySelector('footer,[class*="footer-container_root"]');
return {path: location.pathname, scroller: scroller === document.scrollingElement ? 'document' : String(scroller.className).slice(0, 80), start, events, sentinels, gridToFooter: footer ? Math.round(footer.getBoundingClientRect().top - grid().getBoundingClientRect().bottom) : null};

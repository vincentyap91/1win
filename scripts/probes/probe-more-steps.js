// Scroll in fixed steps (STEP px every WAIT ms) and log the grid-bottom distance and the sentinel distance at each step,
// so the step at which a new batch was requested can be read from the log. Two speeds are run on fresh loads.
for (let k = 0; k < 30 && !document.querySelector('[data-testid^="game-card-"]'); k++) await sleep(400);
await sleep(2500);
const cards = () => [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => !c.closest('[data-index],[class*="carousel"]'));
const grid = cards()[0].parentElement, sentinel = grid.nextElementSibling;
const out = {initial: {gap: Math.round(grid.getBoundingClientRect().bottom - innerHeight), docH: document.documentElement.scrollHeight, html: getComputedStyle(document.documentElement).scrollBehavior}};
const run = async (step, wait, limit) => {
  const log = []; let count = cards().length;
  for (let i = 0; i < limit; i++) {
    const g = Math.round(grid.getBoundingClientRect().bottom - innerHeight), s = Math.round(sentinel.getBoundingClientRect().top - innerHeight);
    document.scrollingElement.scrollTop += step;
    await sleep(wait);
    const n = cards().length;
    log.push([Math.round(scrollY), g, s, n]);
    if (n !== count) { count = n; if (log.filter(r => r[3] !== log[0][3]).length && n >= cards().length && log.length > 3) {} }
    if (log.length > 2 && new Set(log.map(r => r[3])).size >= 3) break;
  }
  return log;
};
out.slow = await run(25, 900, 80);
return out;

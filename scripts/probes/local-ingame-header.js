// Trading in-game header: its buttons/links and test ids (guest vs Demo).
await sleep(1500);
const h = document.querySelector('header[class*="variant-4_root"]');
if (!h) return {error: 'no in-game header'};
return {
  rect: [Math.round(h.getBoundingClientRect().width), Math.round(h.getBoundingClientRect().height)],
  controls: [...h.querySelectorAll('a,button')].map(e => ({tag: e.tagName, testid: e.dataset.testid || null, text: e.textContent.trim().slice(0, 30), cls: String(e.className).split(' ')[0].slice(0, 50)})),
  testids: [...new Set([...h.querySelectorAll('[data-testid]')].map(e => e.dataset.testid))],
};

// Local casino-search / casino-providers: tabs, input focus, recommended rows and their card counts, typing filters.
const q = s => document.querySelector(s);
const tab = id => { const t = q(`[data-testid="${id}"]`); return t && {text: t.textContent.trim(), selected: [...t.classList].some(c => /selected|active/i.test(c)) || t.getAttribute('aria-selected') === 'true'}; };
const input = q('[data-testid="casino-search-input"]');
const rows = [...document.querySelectorAll('[class*="game-slider_root"],[class*="games-section_root"],[class*="games-grid_root"]')]
  .filter(r => r.getClientRects().length)
  .map(r => ({title: (r.querySelector('[class*="title"]')?.textContent || '').trim().slice(0, 40), cards: r.querySelectorAll('[data-testid^="game-card-"]').length}));
const providers = document.querySelectorAll('[data-testid^="provider-card"],[class*="provider-card_root"],[class*="providers-list"] a').length;
const result = {state: document.body.dataset.state, modal: document.body.dataset.localModal || null, tabs: {games: tab('casino-search-tabs-games'), providers: tab('casino-search-tabs-providers')},
  input: input && {focused: document.activeElement === input, placeholder: input.placeholder}, rows, providers, hscroll: document.documentElement.scrollWidth > innerWidth + 1};
if (input) {
  input.value = 'book'; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(400);
  result.typed = {cards: [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => c.getClientRects().length).length,
    sample: [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => c.getClientRects().length).slice(0, 4).map(c => c.dataset.testid)};
}
return result;

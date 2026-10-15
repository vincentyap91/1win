// Reference (guest): the Casino search overlay — input focus, Games/Providers tabs, recommended rows and card counts,
// then the Providers tab and a typed query. Read-only.
const q = s => document.querySelector(s);
for (let i = 0; i < 40 && !q('[data-testid="casino-search-input-button"]'); i++) await sleep(300);
const open = q('[data-testid="casino-search-input-button"]');
if (!open) return {found: false};
open.click();
for (let i = 0; i < 30 && !q('[data-testid="casino-search-input"]'); i++) await sleep(200);
await sleep(1500);
const overlay = () => q('[data-testid="casino-search-input"]')?.closest('[class*="common-layout"],[class*="modal"],[class*="search"]')?.parentElement || document.body;
const tab = id => { const t = q(`[data-testid="${id}"]`); return t && {text: t.textContent.trim(), cls: String(t.className).slice(0, 140), aria: t.getAttribute('aria-selected')}; };
const input = q('[data-testid="casino-search-input"]');
const rowsIn = root => [...root.querySelectorAll('[class*="game-slider_root"],[class*="games-grid_root"]')]
  .filter(r => r.getClientRects().length && r.closest('[data-testid="casino-search-input"]') === null)
  .map(r => ({title: (r.querySelector('[class*="title"]')?.textContent || '').trim().slice(0, 40), cards: r.querySelectorAll('[data-testid^="game-card-"]').length,
    visible: [...r.querySelectorAll('[data-testid^="game-card-"]')].filter(c => { const b = c.getBoundingClientRect(); return b.width && b.right > 0 && b.left < innerWidth; }).length}));
// The overlay is the scroll container around the input; collect rows inside its nearest large ancestor.
let box = input; while (box && box.parentElement && box.getBoundingClientRect().height < innerHeight * 0.6) box = box.parentElement;
const result = {url: location.pathname + location.search, focused: document.activeElement === input, placeholder: input?.placeholder,
  tabs: {games: tab('casino-search-tabs-games'), providers: tab('casino-search-tabs-providers')}, boxCls: String(box?.className).slice(0, 120), rows: box ? rowsIn(box) : []};
const prov = q('[data-testid="casino-search-tabs-providers"]');
if (prov) {
  prov.click(); await sleep(1500);
  result.providersTab = {url: location.pathname + location.search, focused: document.activeElement === q('[data-testid="casino-search-input"]'),
    tabs: {games: tab('casino-search-tabs-games'), providers: tab('casino-search-tabs-providers')},
    providerCards: [...document.querySelectorAll('[data-testid^="provider"],[class*="provider-card"],[class*="providers-grid"] a,[class*="provider-list"] a')].filter(n => n.getClientRects().length).length,
    sample: [...document.querySelectorAll('[data-testid^="provider"]')].slice(0, 6).map(n => n.dataset.testid)};
  q('[data-testid="casino-search-tabs-games"]')?.click(); await sleep(800);
}
const inp = q('[data-testid="casino-search-input"]');
if (inp) {
  inp.focus(); inp.value = 'book'; inp.dispatchEvent(new Event('input', {bubbles: true})); await sleep(2500);
  result.typed = {url: location.pathname + location.search, cards: [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => c.getClientRects().length).length,
    sample: [...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c => c.getClientRects().length).slice(0, 4).map(c => c.dataset.testid)};
}
return result;

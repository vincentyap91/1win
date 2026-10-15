// Casino search overlay ([data-testid="casino-search"]): rows of game cards grouped by parent, with the nearest heading,
// for the Games tab, the Providers tab and a typed query. Runs on the reference (opens the overlay) and on the local
// casino-search / casino-providers pages (overlay already open). Read-only.
const q = s => document.querySelector(s);
if (!q('[data-testid="casino-search"]')) {
  for (let i = 0; i < 40 && !q('[data-testid="casino-search-input-button"]'); i++) await sleep(300);
  q('[data-testid="casino-search-input-button"]')?.click();
  for (let i = 0; i < 30 && !q('[data-testid="casino-search"]'); i++) await sleep(200);
}
await sleep(2000);
const root = () => q('[data-testid="casino-search"]');
if (!root()) return {found: false};
const heading = el => { for (let n = el; n && n !== root(); n = n.parentElement) { const h = [...n.parentElement?.children || []].find(s => s !== n && s.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING && /\S/.test(s.textContent) && s.textContent.length < 60 && !s.querySelector('[data-testid^="game-card-"]')); if (h) return h.textContent.replace(/\s+/g, ' ').trim(); } return ''; };
const rows = () => {
  const groups = new Map();
  root().querySelectorAll('[data-testid^="game-card-"]').forEach(c => { const p = c.closest('[class*="slider"],[class*="grid"],[class*="list"]') || c.parentElement; groups.set(p, (groups.get(p) || 0) + 1); });
  return [...groups].map(([p, n]) => ({cls: String(p.className).split(' ')[0].slice(0, 50), title: heading(p).slice(0, 40), cards: n,
    visible: [...p.querySelectorAll('[data-testid^="game-card-"]')].filter(c => { const b = c.getBoundingClientRect(); return b.width && b.right > 0 && b.left < innerWidth && b.top < innerHeight; }).length}));
};
const input = q('[data-testid="casino-search-input"]');
const selected = id => [...(q(`[data-testid="${id}"]`)?.classList || [])].some(c => c.includes('_selected'));
const result = {focused: document.activeElement === input, gamesSelected: selected('casino-search-tabs-games'), games: rows(), text: root().innerText.replace(/\s+/g, ' ').slice(0, 300)};
// Locally the Providers tab is its own page (casino-providers.html), so only switch tabs in place on the reference.
const local = !!document.body.dataset.page;
if (local && !selected('casino-search-tabs-providers')) return result;
if (!selected('casino-search-tabs-providers')) { q('[data-testid="casino-search-tabs-providers"]')?.click(); await sleep(2000); }
const content = root();
result.providers = {selected: selected('casino-search-tabs-providers'), rows: rows(), text: content.innerText.replace(/\s+/g, ' ').slice(0, 400),
  clickable: [...content.querySelectorAll('a,button,[role="button"],[data-reference-href]')].filter(n => n.getClientRects().length).length,
  imgs: [...content.querySelectorAll('img')].filter(n => n.getClientRects().length).length};
return result;

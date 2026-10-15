// For each guest/Demo state of the page: grid card count, duplicate testids and duplicate hrefs in the captured grid.
const res = {};
const count = (html) => {
  const t = document.createElement('template'); t.innerHTML = html;
  const grid = [...t.content.querySelectorAll('[class*="games-grid_list"]')].find(g => !g.closest('[data-index]') && g.querySelector('[data-testid^="game-card-"]'));
  if (!grid) return null;
  const cards = [...grid.querySelectorAll('[data-testid^="game-card-"]')];
  const ids = cards.map(c => c.dataset.testid), hrefs = cards.map(c => (c.closest('[data-reference-href]') || c.querySelector('[data-reference-href]') || c).dataset.referenceHref || '');
  return {cards: cards.length, dupIds: ids.length - new Set(ids).size, dupHrefs: hrefs.length - new Set(hrefs).size, sidebarOrMobile: !!t.content.querySelector('[data-testid="tabbar-navigation-menu"]')};
};
for (const [k, v] of Object.entries(window.PAGE_STATES || {})) res['guest ' + k] = count(v.html);
for (const [k, v] of Object.entries(window.AUTH_PAGE_STATES || {})) res['auth ' + k] = count(v.html);
return res;

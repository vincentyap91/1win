// After a resize: visible grid cards, duplicates, state key and horizontal overflow.
const grid = [...document.querySelectorAll('[class*="games-grid_list"]')].find(g => !g.closest('[data-index]') && g.querySelector('[data-testid^="game-card-"]'));
if (!grid) return {error: 'no grid'};
const ids = [...grid.children].filter(c => !c.hidden).map(c => (c.matches('[data-reference-href]') ? c : c.querySelector('[data-reference-href]'))?.dataset.referenceHref);
return {key: document.body.dataset.state, visible: ids.length, duplicates: ids.length - new Set(ids).size, markers: document.querySelectorAll('[data-local-more-marker]').length, hscroll: document.documentElement.scrollWidth > innerWidth + 1};

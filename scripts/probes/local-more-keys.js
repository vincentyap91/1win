// State after keyboard scrolling (the runner presses the keys before this probe).
const grid = [...document.querySelectorAll('[class*="games-grid_list"]')].find(g => !g.closest('[data-index]') && g.querySelector('[data-testid^="game-card-"]'));
const ids = grid ? [...grid.children].filter(c => !c.hidden).map(c => (c.matches('[data-reference-href]') ? c : c.querySelector('[data-reference-href]'))?.dataset.referenceHref) : [];
return {key: document.body.dataset.state, scrollY: Math.round(scrollY), visible: ids.length, duplicates: ids.length - new Set(ids).size, hscroll: document.documentElement.scrollWidth > innerWidth + 1};

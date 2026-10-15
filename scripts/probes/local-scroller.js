// Which element scrolls the page? Lists every element whose content overflows vertically with overflow-y auto/scroll.
const out = [];
for (const el of document.querySelectorAll('*')) {
  const cs = getComputedStyle(el);
  if (!/(auto|scroll)/.test(cs.overflowY) || el.scrollHeight <= el.clientHeight + 4) continue;
  out.push({cls: (el.className?.baseVal ?? el.className).toString().slice(0, 90), tag: el.tagName, h: el.clientHeight, sh: el.scrollHeight, inSidebar: !!el.closest('[class*="sidebar_root"]')});
}
const grid = [...document.querySelectorAll('[class*="games-grid_list"]')].find(g => !g.closest('[data-index]') && g.querySelector('[data-testid^="game-card-"]'));
return {doc: {sh: document.documentElement.scrollHeight, ch: innerHeight}, scrollers: out, visible: grid ? [...grid.children].filter(c => !c.hidden).length : null, total: grid?.children.length};

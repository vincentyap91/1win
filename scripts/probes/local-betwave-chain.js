// Ancestor chain of the Betwave content column with the box properties that place it next to the sidebar.
await sleep(1500);
const chain = [];
for (let el = document.querySelector('[class*="variant-1_content-tO84S"]'); el && el !== document.body; el = el.parentElement) {
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  chain.push({tag: el.tagName, cls: String(el.className).slice(0, 120), left: Math.round(r.left), pl: cs.paddingLeft, ml: cs.marginLeft, pis: cs.paddingInlineStart, display: cs.display, gridCols: cs.gridTemplateColumns.slice(0, 60), position: cs.position});
}
const side = document.querySelector('[class*="sidebar_root"]');
return {chain, sidebar: side && {cls: String(side.className).slice(0, 120), parent: String(side.parentElement.className).slice(0, 120), pos: getComputedStyle(side).position, w: Math.round(side.getBoundingClientRect().width)}};

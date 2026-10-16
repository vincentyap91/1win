const root = document.querySelector('[class*="detail_root"]');
const s = root ? getComputedStyle(root) : null;
const vars = root ? [...root.computedStyleMap ? [] : []].concat(
  ['--tournament-leaderboard-width','--tournament-leaderboard-height','--tournament-card-height','--gap-container','--header-height','--heading-controls-height','--container-heading-height','--safe-space-height'].map(k => k + '=' + getComputedStyle(root.parentElement || root).getPropertyValue(k).trim())
) : [];
const kids = root ? [...root.children].map(el => {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {cls: el.className.toString().slice(0, 120), area: cs.gridArea, col: cs.gridColumn, row: cs.gridRow, w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left)};
}) : [];
return {
  cls: root?.className?.toString?.().slice(0, 160),
  display: s?.display,
  cols: s?.gridTemplateColumns,
  rows: s?.gridTemplateRows,
  areas: s?.gridTemplateAreas,
  gap: s?.gap,
  h: s?.height,
  vars,
  kids
};

const root = document.querySelector('[class*="detail_container"]');
const interesting = el => {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    cls: (el.className?.toString?.() || '').slice(0, 160),
    d: s.display,
    dir: s.flexDirection,
    cols: s.gridTemplateColumns,
    rows: s.gridTemplateRows,
    gap: s.gap,
    w: Math.round(r.width),
    h: Math.round(r.height),
    t: Math.round(r.top),
    l: Math.round(r.left),
    pos: s.position,
    ov: s.overflow + '/' + s.overflowX
  };
};
const walk = (el, depth, acc) => {
  if (!el || depth > 3) return;
  const kids = [...el.children].filter(c => c.getBoundingClientRect().width > 4);
  if (depth > 0) acc.push({depth, ...interesting(el), n: kids.length});
  if (kids.length <= 14) kids.forEach(c => walk(c, depth + 1, acc));
  else acc.push({depth: depth + 1, note: 'skip ' + kids.length + ' children of ' + (el.className?.toString?.() || '').slice(0, 80)});
};
const acc = [];
walk(root, 0, acc);
const vars = root ? [...root.style].slice(0, 20).map(k => k + '=' + root.style.getPropertyValue(k)) : [];
return {n: acc.length, vars, acc};

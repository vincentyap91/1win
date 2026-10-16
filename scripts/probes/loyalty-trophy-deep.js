document.querySelector('[class*="levels-block"]')?.scrollIntoView({block:'center'});
await sleep(500);
const card = document.querySelector('[class*="level_root"]');
const fg = card?.querySelector('[class*="level_foreground"]');
const pic = fg?.querySelector('picture');
const img = fg?.querySelector('img');
const s = el => el ? (() => {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    cls: (el.className?.toString?.()||'').slice(0,100),
    style: el.getAttribute('style'),
    w: Math.round(r.width), h: Math.round(r.height),
    t: Math.round(r.top), l: Math.round(r.left),
    cw: el.clientWidth, ch: el.clientHeight,
    nw: el.naturalWidth, nh: el.naturalHeight,
    display: cs.display, pos: cs.position,
    width: cs.width, height: cs.height,
    maxW: cs.maxWidth, inset: cs.inset || `${cs.top}/${cs.right}/${cs.bottom}/${cs.left}`,
    insetBlock: cs.insetBlockStart, insetInline: cs.insetInlineStart,
    z: cs.zIndex, transform: cs.transform,
    vars: [...(el.style||[])].map(k=>k+'='+el.style.getPropertyValue(k)).slice(0,12)
  };
})() : null;
return {
  card: s(card), fg: s(fg), pic: s(pic), img: s(img),
  html: fg?.outerHTML?.slice(0,600),
  src: img?.currentSrc || img?.src
};

// Why the Betwave sidebar backdrop is in flow on some pages: its computed box, inline styles in the body, root attributes.
await sleep(1500);
const b = document.querySelector('[class*="common-layout_backdrop-22BST"]');
const cs = b && getComputedStyle(b);
let containing = null;
for (let x = b?.parentElement; x; x = x.parentElement) {
  const s = getComputedStyle(x);
  if (s.transform !== 'none' || s.filter !== 'none' || /paint|layout|strict|content/.test(s.contain) || s.willChange.includes('transform')) { containing = {cls: String(x.className).slice(0, 100), transform: s.transform, contain: s.contain, filter: s.filter, willChange: s.willChange}; break; }
}
return {
  position: cs?.position, inset: cs && [cs.top, cs.left, cs.right, cs.bottom].join(' '), display: cs?.display, containing,
  bodyStyles: document.body.querySelectorAll('style').length, sheets: document.styleSheets.length,
  htmlClass: document.documentElement.className, bodyAttrs: Object.fromEntries([...document.body.attributes].map(a => [a.name, a.value.slice(0, 80)])),
};

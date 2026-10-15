// Betwave sidebar root: attributes, inline style, computed width rules and direct children.
await sleep(1500);
const root = document.querySelector('[class*="sidebar_root-qgno1"]');
if (!root) return {error: 'no sidebar root'};
const cs = getComputedStyle(root);
return {
  attrs: Object.fromEntries([...root.attributes].map(a => [a.name, a.value.slice(0, 160)])),
  width: cs.width, flex: cs.flex, minWidth: cs.minWidth, maxWidth: cs.maxWidth, flexBasis: cs.flexBasis,
  children: [...root.children].map(c => ({tag: c.tagName, cls: String(c.className).slice(0, 120), w: Math.round(c.getBoundingClientRect().width), pos: getComputedStyle(c).position})),
  parentDisplay: getComputedStyle(root.parentElement).display, parentWrap: getComputedStyle(root.parentElement).flexWrap,
  parentChildren: [...root.parentElement.children].map(c => String(c.className).slice(0, 60) || c.tagName),
};

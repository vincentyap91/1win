// Betwave sidebar: the deepest elements wider than the expected 300px column, with their computed width rules.
await sleep(1500);
const root = document.querySelector('[class*="sidebar_root-qgno1"]');
const wide = [...root.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 400);
const leaves = wide.filter(e => ![...e.children].some(c => c.getBoundingClientRect().width > 400));
return leaves.slice(0, 8).map(e => {
  const cs = getComputedStyle(e);
  return {tag: e.tagName, cls: String(e.className).slice(0, 140), w: Math.round(e.getBoundingClientRect().width), width: cs.width, minWidth: cs.minWidth, display: cs.display, whiteSpace: cs.whiteSpace,
    text: e.textContent.trim().slice(0, 60), path: (() => { const p = []; for (let x = e; x && x !== root; x = x.parentElement) p.push(String(x.className).split(' ')[0] || x.tagName); return p.reverse().join(' > ').slice(0, 300); })()};
});

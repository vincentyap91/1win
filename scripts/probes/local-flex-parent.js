// Betwave layout row: flex direction/alignment of default_root and the rules that set them.
await sleep(1500);
const el = document.querySelector('[class*="default_root-4jzbX"]');
const cs = getComputedStyle(el);
const hits = [];
const walk = (rules, media) => {
  for (const r of rules) {
    if (r.cssRules && !r.selectorText) { if (!r.media || matchMedia(r.media.mediaText).matches) walk(r.cssRules, media + ' ' + (r.media?.mediaText || r.conditionText || '')); continue; }
    try { if (r.selectorText && el.matches(r.selectorText) && /flex|display|align/.test(r.style.cssText)) hits.push({media: media.trim(), sel: r.selectorText.slice(0, 160), css: r.style.cssText.slice(0, 200)}); } catch {}
  }
};
for (const s of document.styleSheets) { try { walk(s.cssRules, ''); } catch {} }
return {direction: cs.flexDirection, align: cs.alignItems, wrap: cs.flexWrap, attrs: Object.fromEntries([...el.attributes].map(a => [a.name, a.value.slice(0, 120)])), parent: Object.fromEntries([...el.parentElement.attributes].map(a => [a.name, a.value.slice(0, 120)])), hits};

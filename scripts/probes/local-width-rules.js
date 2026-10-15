// CSS rules (with media conditions) that match the Betwave sidebar root / layout root and set sizing properties.
await sleep(1500);
const targets = {aside: document.querySelector('[class*="sidebar_root-qgno1"]'), layout: document.querySelector('[class*="sidebar_root-qgno1"] > [class*="common-layout_root"]')};
const sizing = /(^|;)\s*(width|min-width|max-width|flex|flex-basis|inline-size|grid-template-columns|position)\s*:/;
const out = {};
const walk = (rules, media, push) => {
  for (const r of rules) {
    if (r.cssRules && !r.selectorText) { const m = r.media ? r.media.mediaText : r.conditionText || r.constructor.name; if (!r.media || matchMedia(r.media.mediaText).matches) walk(r.cssRules, media + ' ' + m, push); continue; }
    if (r.selectorText && sizing.test(r.style.cssText)) push(r, media);
  }
};
for (const [name, el] of Object.entries(targets)) {
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    walk(rules, '', (r, media) => { try { if (el.matches(r.selectorText)) hits.push({sheet: (sheet.href || '').split('/').pop(), media: media.trim(), sel: r.selectorText.slice(0, 160), css: r.style.cssText.slice(0, 200)}); } catch {} });
  }
  out[name] = {computedWidth: getComputedStyle(el).width, hits};
}
return out;

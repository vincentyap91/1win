// Reference: where the payout coefficient of a Yes/No outcome lives (framework handles on the button, or market API responses).
for (let i = 0; i < 40 && !document.querySelector('[class*="_root_saz1a_"] [class*="_name_5xqiy_"]'); i++) await sleep(300);
const b = [...document.querySelectorAll('[class*="_root_saz1a_"] button')].find(x => x.querySelector('[class*="_name_5xqiy_"]'));
const own = el => Object.getOwnPropertyNames(el).filter(k => k.startsWith('_') || k.startsWith('$'));
const handles = [];
for (let el = b, i = 0; el && i < 8; el = el.parentElement, i++) { const k = own(el); if (k.length) handles.push({tag: el.tagName, cls: String(el.className).slice(0, 50), keys: k}); }
const api = performance.getEntriesByType('resource').map(e => e.name)
  .filter(u => !/\.(js|css|png|jpe?g|webp|svg|avif|woff2?|gif)(\?|$)/i.test(u) && !u.includes('/optimizeimages/'));
return {handles, api: [...new Set(api)].slice(0, 60)};

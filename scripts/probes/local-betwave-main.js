// Betwave subpages: which element the sidebar check measures as "main", and where the visible content column starts
// before and after collapsing the sidebar.
await sleep(1500);
const describe = el => el && {cls: String(el.className).slice(0, 80), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width)};
const snap = () => ({
  layoutMain: [...document.querySelectorAll('[class*="layout-main_main"]')].map(describe),
  variantContent: [...document.querySelectorAll('[class*="variant-1_content-tO84S"]')].map(describe),
  h1: describe(document.querySelector('h1')),
  firstMainChild: describe(document.querySelector('main') || document.querySelector('#__nuxt > div > div:last-child')),
});
const before = snap();
document.querySelector('[data-testid="sidebar-expand-button"]')?.click();
await sleep(900);
const after = snap();
document.querySelector('[data-testid="sidebar-expand-button"]')?.click();
await sleep(600);
return {before, after};

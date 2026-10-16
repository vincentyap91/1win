// Shared layout metrics for guest original ↔ local comparison (Step 5).
// Works on both the reference SPA and local static pages.
for (let i = 0; i < 40 && document.documentElement.dataset.sharedUi === 'loading'; i++) await sleep(250);
const bucket = innerWidth < 410 ? '390x844' : innerWidth < 640 ? '430x932' : innerWidth < 1024 ? '768x1024' : innerWidth >= 1680 ? '1920x1080' : '1440x900';
for (let i = 0; i < 40 && document.body.dataset.state && !document.body.dataset.state.endsWith(bucket); i++) await sleep(250);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
const box = el => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)};
};

scrollTo({top: 0, behavior: 'instant'});
await sleep(400);

const sidebar = $('[class*="sidebar_root"]');
const header = $('header,[class*="header_root"]') || $('[class*="layout-main_main"] [class*="header_root"]');
const content = $('[data-testid="layout-content"]') || $('[class*="layout-content_root"]');
const banner = $('[data-testid="banner-main-container"],[class*="banners-carousel_root"]');

// Top-level sidebar links only (ignore filled expand submenu anchors).
const topNav = $$('a[data-testid^="sidebar-navigation"]').filter(a => !a.closest('[class*="expanded-view_expandable"],[class*="expanded-view_items"]'));
const navLabels = topNav.map(a => text(a)).filter(Boolean);

const chips = $$('[class*="chips"] a, [class*="chips"] button, [data-testid*="chip"]').map(el => text(el)).filter(Boolean).slice(0, 24);

// First-viewport cards only — do this BEFORE scrolling so local infinite-scroll is not triggered.
const inViewport = el => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
};
const allCards = $$('[data-testid^="game-card-"],[class*="game-card_root"]:not([class*="placeholder"])');
const viewportCards = allCards.filter(c => !c.hasAttribute('hidden') && !c.closest('[hidden]') && inViewport(c));
const moreHidden = $$('[data-local-more-card][hidden]').length;
const moreShown = $$('[data-local-more-card]:not([hidden])').length;
const cardsAtTop = viewportCards.length;
const moreShownAtTop = moreShown;

// Scroll only to detect whether a footer exists (reference lazy-mounts it).
let footerPresent = !!$('[class*="footer-container_root"]');
if (!footerPresent) {
  const maxY = Math.min(document.documentElement.scrollHeight || 4000, 20000);
  for (let y = 0; y < maxY && !footerPresent; y += 900) {
    scrollTo({top: y, behavior: 'instant'});
    await sleep(100);
    footerPresent = !!$('[class*="footer-container_root"]');
  }
  for (let i = 0; i < 8 && !footerPresent; i++) {
    scrollTo({top: 1e7, behavior: 'instant'});
    await sleep(300);
    footerPresent = !!$('[class*="footer-container_root"]');
  }
}
const footer = $('[class*="footer-container_root"]');
scrollTo({top: 0, behavior: 'instant'});
await sleep(200);

const expands = $$('[class*="expanded-view_expandable"]').map(el => ({
  open: /_isOpened-/.test(el.className),
  items: el.querySelectorAll('a[href]').length,
  h: Math.round(el.getBoundingClientRect().height),
}));

const broken = $$('img').filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth && i.loading !== 'lazy')
  .map(i => i.getAttribute('src')).slice(0, 8);

return {
  path: location.pathname,
  w: innerWidth,
  h: innerHeight,
  scrollH: document.documentElement.scrollHeight,
  hscroll: document.documentElement.scrollWidth > innerWidth + 1,
  title: document.title.replace(/ - [\d.]+$/, ''),
  state: document.body.dataset.state || null,
  signed: !!$('[data-testid="header-balance-deposit-button"]'),
  sidebar: box(sidebar),
  sidebarCompact: !!$('[class*="common-layout_compact"],[data-sidebar-compact="true"]'),
  header: box(header),
  content: box(content),
  banner: box(banner),
  footer: box(footer),
  footerPresent: !!footer,
  navLabels,
  navCount: navLabels.length,
  chips: chips.slice(0, 16),
  cards: cardsAtTop,
  cardsTotal: allCards.filter(c => !c.hasAttribute('hidden') && !c.closest('[hidden]')).length,
  moreHidden,
  moreShown: moreShownAtTop,
  expands,
  expandItems: expands.reduce((n, e) => n + e.items, 0),
  skeletons: $$('[class*="skeleton_root"]').length,
  brokenImages: broken,
  hasLogin: !!$('[data-testid="header-auth-button"],[data-testid="sidebar-profile-button"]'),
};

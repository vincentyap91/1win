// Deep probe of VIP Club carousels / visibility / drag surface
const blocks = [
  'vipLanding-personalApproachBlock',
  'vipLanding-exclusiveGiftsBlock',
  'vipLanding-statisticsBlock',
  'vipLanding-carBanner',
  'vipLanding-vipManagerBlock',
  'vipLanding-vipStatusBlock',
  'vipLanding-faqBlock',
];

function info(el) {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    testid: el.dataset.testid || null,
    cls: el.className.toString().slice(0, 120),
    display: cs.display,
    visibility: cs.visibility,
    opacity: cs.opacity,
    overflow: cs.overflow + '/' + cs.overflowX + '/' + cs.overflowY,
    transform: cs.transform,
    w: Math.round(r.width),
    h: Math.round(r.height),
    top: Math.round(r.top + window.scrollY),
    children: el.children.length,
    scrollW: el.scrollWidth,
    clientW: el.clientWidth,
    text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100),
  };
}

const byTest = {};
for (const prefix of blocks) {
  const els = [...document.querySelectorAll(`[data-testid*="${prefix}"]`)];
  byTest[prefix] = els.slice(0, 12).map(info);
}

// Find swiper-like structures
const swipers = [...document.querySelectorAll('.swiper, [class*="swiper"]')].slice(0, 40).map(el => ({
  ...info(el),
  slides: el.querySelectorAll('.swiper-slide').length,
  wrapper: !!el.querySelector('.swiper-wrapper'),
}));

// Find prev/next buttons
const navBtns = [...document.querySelectorAll('[data-testid$="-prev"],[data-testid$="-next"]')].map(el => ({
  testid: el.dataset.testid,
  disabled: el.disabled || el.getAttribute('aria-disabled'),
  cls: el.className.toString().slice(0, 100),
  visible: el.getClientRects().length > 0,
}));

// Awards / horizontal rows that overflow
const overflowRows = [...document.querySelectorAll('[class*="vip_"],[class*="Vip"],[class*="awards"],[class*="Awards"],[class*="slider"],[class*="Slider"],[class*="carousel"],[class*="Carousel"]')]
  .filter(el => el.scrollWidth > el.clientWidth + 20)
  .slice(0, 20)
  .map(info);

// Scroll mid-page and check which major blocks are in view / have height 0
window.scrollTo(0, 1800);
await sleep(400);
const midVisible = [...document.querySelectorAll('[data-testid^="vipLanding-"]')]
  .filter(el => {
    const r = el.getBoundingClientRect();
    return r.height > 20 && r.bottom > 0 && r.top < innerHeight;
  })
  .map(el => el.dataset.testid);

window.scrollTo(0, document.documentElement.scrollHeight);
await sleep(400);
const bottomVisible = [...document.querySelectorAll('[data-testid^="vipLanding-"]')]
  .filter(el => {
    const r = el.getBoundingClientRect();
    return r.height > 20 && r.bottom > 0 && r.top < innerHeight;
  })
  .map(el => el.dataset.testid);

// Zero-height vipLanding nodes
window.scrollTo(0, 0);
await sleep(200);
const zeroH = [...document.querySelectorAll('[data-testid^="vipLanding-"]')]
  .map(el => ({ id: el.dataset.testid, h: Math.round(el.getBoundingClientRect().height), display: getComputedStyle(el).display }))
  .filter(x => x.h === 0);

// Try drag simulation on first horizontal overflow
let dragTest = null;
const dragTarget = overflowRows[0] ? document.querySelector(`[class="${CSS.escape ? '' : ''}"]`) : null;
const row = [...document.querySelectorAll('*')].find(el => el.scrollWidth > el.clientWidth + 40 && /vip|swiper|slider|gift|approach|award|statistic/i.test(el.className + (el.dataset.testid || '')));
if (row) {
  const before = row.scrollLeft;
  row.scrollLeft = before + 200;
  await sleep(50);
  dragTest = { cls: row.className.toString().slice(0, 80), testid: row.dataset.testid, before, after: row.scrollLeft, scrollW: row.scrollWidth, clientW: row.clientWidth, overflowX: getComputedStyle(row).overflowX };
}

return {
  scrollH: document.documentElement.scrollHeight,
  byTest,
  swipers: swipers.slice(0, 25),
  navBtns,
  overflowRows,
  midVisible,
  bottomVisible,
  zeroH: zeroH.slice(0, 40),
  dragTest,
};

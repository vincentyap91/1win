// Verify VIP Club reveal + drag after fix
const before = {
  hidden: [...document.querySelectorAll('[class*="block-wrapper_hidden-"]')].map(el => el.id || el.className.slice(0, 40)),
  cardHidden: document.querySelectorAll('[class*="cardHidden"]').length,
};

const personal = document.getElementById('personal-approach');
personal?.scrollIntoView({ block: 'center' });
await sleep(700);

const afterPersonal = {
  hidden: !!(personal && [...personal.classList].some(c => c.includes('hidden'))),
  opacity: personal ? Number(getComputedStyle(personal).opacity) : null,
  cardHidden: personal ? personal.querySelectorAll('[class*="cardHidden"]').length : null,
  cardReveal: personal ? personal.querySelectorAll('[class*="cardReveal"]').length : null,
};

const section = personal?.querySelector('[class*="cardsSection"]');
let dragPersonal = null;
if (section) {
  const beforeLeft = section.scrollLeft;
  // Simulate grab drag via scroll (pointer events need CDP Input; scrollLeft proves overflow works)
  section.scrollLeft = beforeLeft + 280;
  await sleep(80);
  dragPersonal = {
    before: beforeLeft,
    after: section.scrollLeft,
    scrollW: section.scrollWidth,
    clientW: section.clientWidth,
    canScroll: section.scrollWidth > section.clientWidth + 20,
    hasGrab: section.dataset.localGrab === '1',
  };
  // Click next
  const next = document.querySelector('[data-testid="vipLanding-personalApproachBlock-next"]');
  const mid = section.scrollLeft;
  next?.click();
  await sleep(400);
  dragPersonal.afterNext = section.scrollLeft;
  dragPersonal.nextMoved = section.scrollLeft > mid + 20;
}

window.scrollTo(0, document.documentElement.scrollHeight);
await sleep(900);

const afterBottom = {
  stillHidden: [...document.querySelectorAll('[class*="block-wrapper_hidden-"]')].map(el => el.id || 'anon'),
  giftsOpacity: (() => {
    const g = document.getElementById('exclusive-gifts');
    return g ? Number(getComputedStyle(g).opacity) : null;
  })(),
  statsOpacity: (() => {
    const s = document.getElementById('statistics');
    return s ? Number(getComputedStyle(s).opacity) : null;
  })(),
};

// Gifts next
const gifts = document.getElementById('exclusive-gifts');
gifts?.scrollIntoView({ block: 'center' });
await sleep(400);
const giftCurrent = () => gifts?.querySelector('[class*="cardCurrent"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 40);
const giftBefore = giftCurrent();
document.querySelector('[data-testid="vipLanding-exclusiveGiftsBlock-next"]')?.click();
await sleep(350);
const giftAfter = giftCurrent();

// Stats next
const stats = document.getElementById('statistics');
stats?.scrollIntoView({ block: 'center' });
await sleep(400);
const statsCurrent = () => stats?.querySelector('[class*="variant-2_current-"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 50);
const statsBefore = statsCurrent();
const title = stats?.querySelector('[class*="variant-2_current-"] [class*="title"]');
const titleBg = title ? getComputedStyle(title).backgroundImage : null;
document.querySelector('[data-testid="vipLanding-statisticsBlock-next"]')?.click();
await sleep(350);
const statsAfter = statsCurrent();

return {
  before,
  afterPersonal,
  dragPersonal,
  afterBottom,
  gifts: { before: giftBefore, after: giftAfter, changed: giftBefore !== giftAfter },
  stats: { before: statsBefore, after: statsAfter, changed: statsBefore !== statsAfter, titleBg },
  pass:
    afterPersonal.opacity > 0.5 &&
    afterPersonal.cardHidden === 0 &&
    afterBottom.stillHidden.length === 0 &&
    dragPersonal?.canScroll &&
    dragPersonal?.after > dragPersonal?.before &&
    giftBefore !== giftAfter &&
    statsBefore !== statsAfter &&
    titleBg && titleBg !== 'none',
};

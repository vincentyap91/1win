// Inspect carousel structure + try interactions on original/local
function cls(el, part) {
  return [...(el?.classList || [])].find(c => c.includes(part)) || null;
}

const personal = document.getElementById('personal-approach');
const gifts = document.getElementById('exclusive-gifts');
const stats = document.getElementById('statistics');

const personalSection = personal?.querySelector('[class*="cardsSection"]');
const giftsRoot = gifts?.querySelector('[class*="cards-swiper-mobile_root"]');
const giftsWrappers = gifts ? [...gifts.querySelectorAll('[class*="cards-swiper-mobile_cardWrapper"]')] : [];
const statsCard = stats?.querySelector('[data-testid="vipLanding-statisticsBlock"]');
const statsItems = statsCard ? [...statsCard.querySelectorAll('[class*="variant-2_item-"]')] : [];
const interaction = stats?.querySelector('[class*="magnetic-slider_interaction"]');

const giftStates = giftsWrappers.map(w => ({
  z: getComputedStyle(w).zIndex,
  transform: w.style.transform || getComputedStyle(w).transform,
  cardCls: [...w.firstElementChild?.classList || []].filter(c => /cardCurrent|cardNext|cardSecond|cardOut|card-/.test(c)),
  text: (w.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
}));

const itemStates = statsItems.map(el => ({
  cls: [...el.classList].filter(c => /current|prev|next|far|hidden/i.test(c)),
  opacity: getComputedStyle(el).opacity,
  transform: getComputedStyle(el).transform,
  titleBg: getComputedStyle(el.querySelector('[class*="title"]') || el).backgroundImage,
  titleColor: getComputedStyle(el.querySelector('[class*="title"]') || el).color,
  text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50),
}));

// Scroll into view and wait for reveal on original
personal?.scrollIntoView({ block: 'center' });
await sleep(900);

const afterReveal = {
  personalHidden: !!(personal && [...personal.classList].some(c => c.includes('hidden'))),
  personalOpacity: personal ? getComputedStyle(personal).opacity : null,
  cardHiddenLeft: personal ? personal.querySelectorAll('[class*="cardHidden"]').length : null,
  cardReveal: personal ? personal.querySelectorAll('[class*="cardReveal"]').length : null,
};

// Measure personal scroll width
let personalScroll = null;
if (personalSection) {
  personalScroll = {
    scrollW: personalSection.scrollWidth,
    clientW: personalSection.clientWidth,
    scrollLeft: personalSection.scrollLeft,
    overflowX: getComputedStyle(personalSection).overflowX,
    cursor: getComputedStyle(personalSection).cursor,
  };
  const before = personalSection.scrollLeft;
  personalSection.scrollLeft = before + 240;
  await sleep(50);
  personalScroll.afterProgrammatic = personalSection.scrollLeft;
  personalSection.scrollLeft = before;
}

return {
  afterReveal,
  personalScroll,
  giftStates,
  giftCount: giftsWrappers.length,
  itemStates,
  itemCount: statsItems.length,
  hasInteraction: !!interaction,
  interactionSize: interaction ? { w: interaction.clientWidth, h: interaction.clientHeight } : null,
  concierge: (() => {
    const c = document.getElementById('concierge-service');
    const section = c?.querySelector('[class*="cardsSection"]');
    return section ? { scrollW: section.scrollWidth, clientW: section.clientWidth, cursor: getComputedStyle(section).cursor, overflowX: getComputedStyle(section).overflowX } : null;
  })(),
};

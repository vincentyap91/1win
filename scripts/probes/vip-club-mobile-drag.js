function dispatchDrag(el, fromX, toX) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const y = r.top + r.height / 2;
  const opts = (x, type) => new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch',
    clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1,
  });
  el.dispatchEvent(opts(fromX, 'pointerdown'));
  el.dispatchEvent(opts((fromX + toX) / 2, 'pointermove'));
  el.dispatchEvent(opts(toX, 'pointerup'));
  return true;
}

window.scrollTo(0, document.documentElement.scrollHeight);
await sleep(800);

const personal = document.getElementById('personal-approach');
personal?.scrollIntoView({ block: 'center' });
await sleep(500);
const section = personal?.querySelector('[class*="cardsSection"]');
const pBefore = section?.scrollLeft;
if (section) {
  const r = section.getBoundingClientRect();
  dispatchDrag(section, r.left + r.width * 0.7, r.left + r.width * 0.2);
  await sleep(100);
}
const pAfter = section?.scrollLeft;

const gifts = document.getElementById('exclusive-gifts');
gifts?.scrollIntoView({ block: 'center' });
await sleep(500);
const giftText = () => gifts?.querySelector('[class*="cardCurrent"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 40);
const gBefore = giftText();
const giftRoot = gifts?.querySelector('[class*="cards-swiper-mobile_root"]');
if (giftRoot) {
  const r = giftRoot.getBoundingClientRect();
  dispatchDrag(giftRoot, r.left + r.width * 0.75, r.left + r.width * 0.25);
  await sleep(200);
}
const gAfter = giftText();

const stats = document.getElementById('statistics');
stats?.scrollIntoView({ block: 'center' });
await sleep(500);
const statsText = () => stats?.querySelector('[class*="variant-2_current-"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 50);
const sBefore = statsText();
const surface = stats?.querySelector('[data-testid="vipLanding-statisticsBlock"]');
if (surface) {
  const r = surface.getBoundingClientRect();
  // Mobile stats carousel is vertical.
  const opts = (x, y, type) => new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch',
    clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1,
  });
  const x = r.left + r.width / 2;
  surface.dispatchEvent(opts(x, r.top + r.height * 0.7, 'pointerdown'));
  surface.dispatchEvent(opts(x, r.top + r.height * 0.45, 'pointermove'));
  surface.dispatchEvent(opts(x, r.top + r.height * 0.2, 'pointerup'));
  await sleep(200);
}
const sAfter = statsText();

return {
  personal: { before: pBefore, after: pAfter, moved: (pAfter ?? 0) > (pBefore ?? 0) + 20, hasGrab: section?.dataset.localGrab === '1' },
  gifts: { before: gBefore, after: gAfter, changed: gBefore !== gAfter, hasSwiper: giftRoot?.dataset.localSwiper === '1' },
  stats: { before: sBefore, after: sAfter, changed: sBefore !== sAfter, hasMagnetic: stats?.querySelector('[class*="magnetic-slider_root"]')?.dataset.localMagnetic === '1', hasInteraction: !!stats?.querySelector('[class*="magnetic-slider_interaction-"]') },
  pass: (pAfter ?? 0) > (pBefore ?? 0) + 20 && gBefore !== gAfter && sBefore !== sAfter,
};

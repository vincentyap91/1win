const section = document.querySelector('#concierge-service [class*="cardsSection"]');
const thumb = document.querySelector('#concierge-service [class*="slider-indicator_slider"]');
if (!section) return {missing: true};
section.scrollIntoView({block: 'center'});
await sleep(500);
const before = section.scrollLeft;
const r = section.getBoundingClientRect();
const x = r.left + Math.min(220, r.width * 0.6);
const y = r.top + r.height * 0.45;
const fire = (type, cx) => section.dispatchEvent(new PointerEvent(type, {
  bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0,
  buttons: type === 'pointerup' ? 0 : 1, clientX: cx, clientY: y,
}));
fire('pointerdown', x);
await sleep(30);
fire('pointermove', x - 160);
await sleep(30);
const mid = section.scrollLeft;
fire('pointerup', x - 160);
return {
  grab: section.dataset.localGrab || null,
  scrollW: section.scrollWidth,
  clientW: section.clientWidth,
  before, mid, after: section.scrollLeft,
  delta: mid - before,
  thumb: thumb ? getComputedStyle(thumb).insetInlineStart : null,
  overflow: getComputedStyle(section).overflowX,
};

const hiddenBlocks = [...document.querySelectorAll('[class*="block-wrapper_hidden"]')].map(el => ({
  id: el.id || null,
  cls: el.className.toString().slice(0, 120),
  h: Math.round(el.getBoundingClientRect().height),
  opacity: getComputedStyle(el).opacity,
  transform: getComputedStyle(el).transform,
  visibility: getComputedStyle(el).visibility,
  filter: getComputedStyle(el).filter,
  text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
}));

const hiddenCards = [...document.querySelectorAll('[class*="cardHidden"]')].slice(0, 20).map(el => ({
  cls: el.className.toString().slice(0, 100),
  h: Math.round(el.getBoundingClientRect().height),
  opacity: getComputedStyle(el).opacity,
  transform: getComputedStyle(el).transform,
  text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
}));

// After scrolling, does original remove hidden?
window.scrollTo(0, document.documentElement.scrollHeight);
await sleep(800);
const stillHidden = [...document.querySelectorAll('[class*="block-wrapper_hidden"]')].map(el => el.id || el.className.toString().slice(0, 60));
const revealed = [...document.querySelectorAll('[class*="block-wrapper_reveal"]')].filter(el => !/block-wrapper_hidden/.test(el.className)).map(el => el.id || el.className.toString().slice(0, 60));

return {
  scrollH: document.documentElement.scrollHeight,
  hiddenBlocksCount: hiddenBlocks.length,
  hiddenBlocks,
  hiddenCardsCount: document.querySelectorAll('[class*="cardHidden"]').length,
  hiddenCards,
  stillHiddenAfterScroll: stillHidden,
  revealedAfterScroll: revealed,
};

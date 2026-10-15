// Local twin of probe-yesno-actions.js: inline Yes/No bet form on the Markets pages.
const form = () => document.querySelector('[data-local-bet-form]');
const read = () => {
  const f = form();
  if (!f) return null;
  const input = f.querySelector('input');
  const [minus, plus, max] = f.querySelectorAll('[class*="_field_ruqaw_"] button');
  return {value: input.value.replace(/\u00a0/g, ' '), empty: [...input.classList].some(c => c.startsWith('_inputEmpty_')), minusDisabled: minus.disabled,
    win: f.querySelector('[class*="_profitAmount_"]').textContent.replace(/\u00a0/g, ' '), label: f.querySelector('[class*="_value_1vsuw_"]').textContent.trim(),
    question: f.querySelector('[class*="_labelContent_"]').textContent.trim(), logo: f.querySelector('img').getAttribute('src'),
    logoLoaded: f.querySelector('img').complete && f.querySelector('img').naturalWidth > 0};
};
const cards = [...document.querySelectorAll('[class*="_root_saz1a_"]')];
const btnOf = (card, side) => [...card.querySelectorAll('button')].find(b => b.querySelector('[class*="_name_5xqiy_"]')?.textContent.trim() === side);
if (!cards.length) return {cards: 0};
const first = cards[0];
first.scrollIntoView({block: 'center'}); await sleep(200);
const cardBox = first.getBoundingClientRect();
btnOf(first, 'Yes').click(); await sleep(300);
const steps = {cards: cards.length, open: read()};
const f = form();
steps.icons = [...f.querySelectorAll('[class*="_monochrome_"]')].map(s => { const m = getComputedStyle(s).maskImage || getComputedStyle(s).webkitMaskImage; return m.startsWith('url("data:') ? 'data' : m.slice(0, 40); });
steps.position = {formFirstInParent: f.parentElement.firstElementChild === f, wrapperHidden: f.nextElementSibling.style.display, cardInside: f.nextElementSibling.firstElementChild === first,
  formWidth: Math.round(f.getBoundingClientRect().width), cardWidth: Math.round(cardBox.width), formHeight: Math.round(f.getBoundingClientRect().height)};
const field = i => form().querySelectorAll('[class*="_field_ruqaw_"] button')[i];
field(1).click(); await sleep(100); steps.plus1 = read();
field(1).click(); await sleep(100); steps.plus2 = read();
field(0).click(); await sleep(100); steps.minus1 = read();
field(2).click(); await sleep(100); steps.max = read();
const input = form().querySelector('input');
input.focus(); steps.focused = read();
input.value = '10'; input.dispatchEvent(new Event('input', {bubbles: true})); steps.typed10 = read();
input.value = '12.345'; input.dispatchEvent(new Event('input', {bubbles: true})); steps.typedDecimals = read();
input.value = 'abc'; input.dispatchEvent(new Event('input', {bubbles: true})); steps.typedLetters = read();
// Headless tabs have no window focus, so .blur() fires no focusout; dispatch it the way a real blur would.
const leave = () => { input.blur(); input.dispatchEvent(new FocusEvent('focusout', {bubbles: true})); };
leave(); steps.blurred = read();
input.dispatchEvent(new FocusEvent('focusin', {bubbles: true})); input.value = '1600'; input.dispatchEvent(new Event('input', {bubbles: true})); leave(); steps.thousands = read();
input.dispatchEvent(new FocusEvent('focusin', {bubbles: true})); input.value = ''; input.dispatchEvent(new Event('input', {bubbles: true})); leave(); steps.clearedThenLeft = read();
const second = cards.find(c => c !== first && btnOf(c, 'No')) || cards.find(c => c !== first) || first;
btnOf(second, 'No') ? btnOf(second, 'No').click() : btnOf(second, 'Yes').click(); await sleep(300);
steps.second = {forms: document.querySelectorAll('[data-local-bet-form]').length, firstRestored: first.parentElement.getAttribute('data-local-bet-card') === null && !first.closest('[style*="display: none"]'), read: read()};
form().querySelector('[class*="_icon_1cufa_"] span').click(); await sleep(200);
steps.afterClose = {forms: document.querySelectorAll('[data-local-bet-form]').length, wrappers: document.querySelectorAll('[data-local-bet-card]').length};
btnOf(cards.find(c => btnOf(c, 'No')) || first, btnOf(first, 'No') ? 'No' : 'Yes').click(); await sleep(200);
[...form().querySelectorAll('button')].find(b => b.textContent.trim() === 'Place a bet').click(); await sleep(600);
steps.placeBet = {modal: document.querySelector('[data-local-modal]')?.dataset.localModal || null, formStillOpen: !!form()};
steps.hscroll = document.documentElement.scrollWidth > innerWidth + 1;
return steps;

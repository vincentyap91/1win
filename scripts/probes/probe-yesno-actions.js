// Reference (guest): inline Yes/No bet form behaviour on /betting/markets. Never clicks "Place a bet".
// Records: +/− step, minus disabled state, MAX, typed amount, Possible win text, close/restore,
// and what happens to an open form when Yes/No is clicked on a second card.
for (let i = 0; i < 40 && !document.querySelector('[class*="_root_saz1a_"] [class*="_name_5xqiy_"]'); i++) await sleep(300);
const cards = [...document.querySelectorAll('[class*="_root_saz1a_"]')];
if (!cards.length) return {found: false};
const btnOf = (card, side) => [...card.querySelectorAll('button')].find(b => b.querySelector('[class*="_name_5xqiy_"]')?.textContent.trim() === side);
const form = () => document.querySelector('[class*="_root_qead3_"]');
const read = () => {
  const f = form();
  if (!f) return null;
  const input = f.querySelector('input');
  const [minus, plus, max] = f.querySelectorAll('[class*="_field_ruqaw_"] button');
  return {value: input.value, inputCls: input.className, minusDisabled: minus.disabled, plusDisabled: plus.disabled, maxDisabled: max.disabled,
    win: f.querySelector('[class*="_profitAmount_"]').textContent, label: f.querySelector('[class*="_value_1vsuw_"]').textContent.trim(),
    placeDisabled: [...f.querySelectorAll('button')].pop().disabled, alert: f.querySelector('[class*="_alert_qead3_"]').textContent.trim()};
};
const steps = {};
const first = cards[0];
first.scrollIntoView({block: 'center'}); await sleep(300);
btnOf(first, 'Yes').click(); await sleep(600);
steps.open = read();
steps.formParent = form() && String(form().parentElement.className).slice(0, 80);
steps.cardHidden = first.parentElement.style.display;
const plus = () => form().querySelectorAll('[class*="_field_ruqaw_"] button')[1];
const minus = () => form().querySelectorAll('[class*="_field_ruqaw_"] button')[0];
plus().click(); await sleep(300); steps.plus1 = read();
plus().click(); await sleep(300); steps.plus2 = read();
minus().click(); await sleep(300); steps.minus1 = read();
form().querySelectorAll('[class*="_field_ruqaw_"] button')[2].click(); await sleep(400); steps.max = read();
const input = form().querySelector('input');
input.focus();
input.value = ''; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(200); steps.cleared = read();
input.value = '10'; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(300); steps.typed10 = read();
input.dispatchEvent(new Event('blur')); input.blur(); await sleep(300); steps.blurred = read();
input.focus(); input.value = '12.345'; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(300); steps.typedDecimals = read();
input.value = 'abc'; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(300); steps.typedLetters = read();
// Second card while the first form is open.
const second = cards.find(c => c !== first && btnOf(c, 'No'));
if (second) {
  btnOf(second, 'No').click(); await sleep(600);
  steps.second = {forms: document.querySelectorAll('[class*="_root_qead3_"]').length, firstHidden: first.parentElement.style.display, read: read()};
}
// Close icon restores the card.
const close = form().querySelector('[class*="_icon_1cufa_"]');
close.click(); await sleep(600);
steps.afterClose = {forms: document.querySelectorAll('[class*="_root_qead3_"]').length,
  hiddenWrappers: [...document.querySelectorAll('[class*="_root_saz1a_"]')].filter(c => c.parentElement.style.display === 'none').length};
return steps;

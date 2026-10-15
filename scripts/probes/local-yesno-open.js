// Open the Yes form on the first Markets card with a 3.00 stake, or (after a resize) report what survived.
const f = document.querySelector('[data-local-bet-form]');
if (!f) {
  const card = document.querySelector('[class*="_root_saz1a_"]');
  const yes = [...card.querySelectorAll('button')].find(b => b.querySelector('[class*="_name_5xqiy_"]')?.textContent.trim() === 'Yes');
  yes.click(); await sleep(200);
  const plus = document.querySelector('[data-local-bet-form] [class*="_field_ruqaw_"] button:nth-of-type(2)');
  for (let i = 0; i < 3; i++) { plus.click(); await sleep(50); }
}
const form = document.querySelector('[data-local-bet-form]');
return {state: document.body.dataset.state, open: !!form, forms: document.querySelectorAll('[data-local-bet-form]').length,
  question: form?.dataset.question, side: form?.dataset.side, value: form?.querySelector('input').value.replace(/\u00a0/g, ' '),
  win: form?.querySelector('[class*="_profitAmount_"]').textContent.replace(/\u00a0/g, ' '),
  hiddenCards: document.querySelectorAll('[data-local-bet-card]').length, hscroll: document.documentElement.scrollWidth > innerWidth + 1};

// Reference (guest): what clicking "Up" on a crypto-live price market does (inline form, betslip, login?). Never places a bet.
for (let i = 0; i < 40 && ![...document.querySelectorAll('button')].some(b => /^Up\s*\d+%$/.test(b.textContent.replace(/\s+/g, ' ').trim())); i++) await sleep(300);
const up = [...document.querySelectorAll('button')].find(b => /^Up\s*\d+%$/.test(b.textContent.replace(/\s+/g, ' ').trim()));
if (!up) return {found: false};
const card = up.closest('[data-scope="Card"]');
const before = {html: card?.outerHTML.length, text: card?.innerText.replace(/\s+/g, ' ').slice(0, 300), modals: document.querySelectorAll('[data-testid="modal-layout"]').length};
up.scrollIntoView({block: 'center'}); await sleep(200);
up.click(); await sleep(900);
const form = document.querySelector('[class*="_root_qead3_"]');
return {found: true, upClass: up.className, before,
  after: {cardText: card?.isConnected ? card.innerText.replace(/\s+/g, ' ').slice(0, 300) : '(card replaced)', modals: document.querySelectorAll('[data-testid="modal-layout"]').length,
    inlineForm: !!form, formHtml: form?.outerHTML.slice(0, 4000), path: location.pathname,
    betslip: document.querySelector('[data-scope="Betslip"]')?.innerText.replace(/\s+/g, ' ').slice(0, 200) || null}};

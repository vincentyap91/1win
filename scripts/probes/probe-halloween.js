// Guest path to the Halloween tournament: open the promotion and follow "More details".
for (let i = 0; i < 6; i++) {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Show more');
  if (!b) break;
  b.click();
  await sleep(1500);
}
const card = [...document.querySelectorAll('[class*="variant-1_root"]')].find(n => /Halloween/i.test(n.innerText));
if (!card) return {error: 'no halloween card', titles: [...document.querySelectorAll('[class*="variant-1_title"]')].map(n => n.textContent.trim()).slice(0, 20)};
(card.querySelector('[class*="variant-1_titleBlock"],[class*="variant-1_picture"]') || card).click();
await sleep(2500);
const more = [...document.querySelectorAll('button,a')].find(b => /More details/i.test(b.textContent));
if (!more) return {error: 'no more details', dialog: document.body.innerText.slice(0, 400)};
more.click();
await sleep(4000);
const text = document.body.innerText;
const back = text.indexOf('Back');
return {path: location.pathname, head: text.slice(Math.max(0, back), Math.max(0, back) + 200).replace(/\s+/g, ' ')};

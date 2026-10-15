// Open one promotion dialog (desktop) and one betslip selection, then return every stylesheet's text.
for (let k = 0; k < 25 && !document.querySelector('[class*="variant-1_root-i8wf0"]'); k++) await sleep(400);
await sleep(1500);
document.querySelector('[class*="variant-1_titleBlock-i8wf0"]')?.click();
for (let k = 0; k < 25 && !document.querySelector('[data-testid="modal-layout"] [class*="modal-promo"]'); k++) await sleep(300);
await sleep(2500);
return [...document.styleSheets].map(s => { try { return {href: s.href, text: [...s.cssRules].map(r => r.cssText).join('\n')}; } catch { return {href: s.href, text: ''}; } });

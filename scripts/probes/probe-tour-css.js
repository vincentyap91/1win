// Stylesheets after the tournament Rules dialog has opened, so rules-only CSS chunks are included.
await router.push('/tournaments/814264');
for (let i = 0; i < 25 && location.pathname !== '/tournaments/814264'; i++) await sleep(300);
await sleep(2000);
[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Rules')?.click();
for (let i = 0; i < 20 && !document.querySelector('[data-testid="tournament-rules"]'); i++) await sleep(300);
await sleep(1000);
return [...document.styleSheets].map(s => { try { return {href: s.href, text: [...s.cssRules].map(r => r.cssText).join('\n')}; } catch { return {href: s.href, text: ''}; } });

[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Rules')?.click();
await sleep(200);
return {open: !!document.querySelector('[data-testid="tournament-rules"]')};

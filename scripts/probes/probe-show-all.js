await router.push('/tournaments/814264');
for (let i = 0; i < 25 && location.pathname !== '/tournaments/814264'; i++) await sleep(300);
await sleep(2000);
const dataRows = () => [...document.querySelectorAll('[class*="leaderboard-row-container_row"]')].filter(r => !r.className.includes('leaderboard_header'));
const beforeParents = [...new Set(dataRows().map(r => r.parentElement.className))];
const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Show all') && b.closest('[class*="leaderboard"]'));
btn?.click();
await sleep(1500);
const after = dataRows();
const added = after.slice(10);
return {
  beforeParents,
  buttonText: btn?.textContent.trim().slice(0, 30),
  buttonParent: btn?.parentElement.className,
  addedParents: [...new Set(added.map(r => r.parentElement.className))],
  addedInModal: added.some(r => r.closest('[data-testid="modal-layout"]')),
  addedHidden: added.filter(r => !r.getClientRects().length).length,
  total: after.length
};

const ids = ['813699', '813768', '814264', '816330', '817708', '819462'];
const out = {};
for (const id of ids) {
  await router.push('/tournaments/' + id);
  for (let i = 0; i < 25 && location.pathname !== '/tournaments/' + id; i++) await sleep(300);
  await sleep(1800);
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Show all') && b.closest('[class*="leaderboard"]'));
  if (!btn) { out[id] = ''; continue; }
  btn.click();
  await sleep(1200);
  const modal = [...document.querySelectorAll('[data-testid="modal-layout"]')].find(n => n.querySelector('[class*="leaderboard-table_root"]'));
  out[id] = modal ? modal.outerHTML : '';
  [...document.querySelectorAll('button')].find(b => b.querySelector('[data-icon="close"]'))?.click();
  await sleep(300);
}
return out;

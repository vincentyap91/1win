// One tournament's Rules dialog, leaderboard "Show all" and games "Show more". Scroll first so lazy blocks render.
await router.push('/tournaments/814264');
for (let i = 0; i < 25 && location.pathname !== '/tournaments/814264'; i++) await sleep(300);
await sleep(2000);
for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await sleep(200); }
scrollTo(0, 0);
const btn = label => [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(label));
const rows = () => document.querySelectorAll('[class*="leaderboard-row-container_row"]').length;
const gameLinks = () => [...document.querySelectorAll('[class*="games-list_games"] > a')];
btn('Rules')?.click();
await sleep(1500);
const modal = [...document.querySelectorAll('[data-testid="modal-layout"]')].find(n => n.firstElementChild);
const rules = modal ? {test: modal.querySelector('[data-testid]')?.dataset.testid, html: modal.outerHTML} : null;
[...document.querySelectorAll('button')].find(b => b.querySelector('[data-icon="close"]'))?.click();
await sleep(600);
const rankSteps = [];
for (let i = 0; i < 5; i++) {
  const b = btn('Show all');
  if (!b) { rankSteps.push({done: true, rows: rows()}); break; }
  b.click();
  await sleep(1200);
  rankSteps.push({label: b.textContent.trim().slice(0, 20), rows: rows(), gone: !b.isConnected});
}
const gamesBefore = gameLinks().length;
const gameSteps = [];
for (let i = 0; i < 4; i++) {
  const b = [...document.querySelectorAll('[class*="games-list_root"] button')].find(x => x.textContent.trim().startsWith('Show more'));
  if (!b) { gameSteps.push({done: true, games: gameLinks().length}); break; }
  b.click();
  await sleep(1500);
  gameSteps.push({games: gameLinks().length, progress: document.querySelector('[data-testid="progress-text"]')?.textContent || null});
}
return {rulesBytes: rules ? rules.html.length : 0, rulesTest: rules?.test, rulesHead: rules ? rules.html.slice(0, 300) : null, rankSteps, gamesBefore, gameSteps};

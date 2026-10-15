// For every tournament still on the list: the Rules dialog, the leaderboard rows "Show all" reveals and the
// game cards "Show more" reveals. Opened in-app, because a direct URL bounces to the list.
const ids = ['788264', '788267', '813699', '813768', '814264', '814607', '816330', '817708', '818243', '819055', '819462', '820166'];
const btn = (root, label) => [...(root || document).querySelectorAll('button')].find(b => b.textContent.trim().startsWith(label));
const out = {};
for (const id of ids) {
  await router.push('/tournaments/' + id);
  for (let i = 0; i < 25 && location.pathname !== '/tournaments/' + id; i++) await sleep(300);
  await sleep(2000);
  for (let y = 0, guard = 0; y < document.documentElement.scrollHeight && guard < 30; y += 700, guard++) { scrollTo(0, y); await sleep(150); }
  const title = document.body.innerText.replace(/\s+/g, ' ');
  const at = title.indexOf('Back');
  const name = title.slice(at, at + 120);
  let rules = '';
  btn(document, 'Rules')?.click();
  await sleep(1200);
  const modal = [...document.querySelectorAll('[data-testid="modal-layout"]')].find(n => n.querySelector('[data-testid="tournament-rules"]'));
  if (modal) rules = modal.outerHTML;
  [...document.querySelectorAll('[data-testid="tournament-rules"] button')].find(b => b.querySelector('[data-icon="close"]'))?.click();
  await sleep(400);
  const dataRows = () => [...document.querySelectorAll('[class*="leaderboard-row-container_row"]')].filter(r => !r.className.includes('leaderboard_header'));
  const beforeRows = dataRows();
  const showAll = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Show all') && b.closest('[class*="leaderboard"]'));
  showAll?.click();
  await sleep(1200);
  const extraRows = dataRows().slice(beforeRows.length).map(r => r.outerHTML).join('');
  const grid = document.querySelector('[class*="detail_games"] [class*="games-list_games"], [class*="games-list_games"]');
  const gamesBefore = grid ? grid.querySelectorAll(':scope > a').length : 0;
  for (let i = 0; i < 6; i++) {
    const more = [...document.querySelectorAll('[class*="games-list_root"] button')].find(b => b.textContent.trim().startsWith('Show more'));
    if (!more) break;
    const count = grid.querySelectorAll(':scope > a').length;
    more.click();
    await sleep(1500);
    if (grid.querySelectorAll(':scope > a').length === count) break;
  }
  const extraGames = grid ? [...grid.querySelectorAll(':scope > a')].slice(gamesBefore).map(a => a.outerHTML).join('') : '';
  out[id] = {name, rules, extraRows, extraGames, rows: [beforeRows.length, beforeRows.length + (extraRows ? extraRows.split('leaderboard-row-container_row').length - 1 : 0)], games: [gamesBefore, gamesBefore + (extraGames ? extraGames.split('<a ').length - 1 : 0)]};
}
return out;

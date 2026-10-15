const key = r => r.querySelector('[class*="leaderboard-row-container_start"]')?.textContent.trim();
const table = document.querySelector('[class*="leaderboard-table_root"]');
const have = table ? [...table.querySelectorAll('[class*="leaderboard-row-container_row"]')].map(key) : null;
const t = document.createElement('template');
t.innerHTML = window.TOURNAMENT_DETAIL?.['814264']?.rows || '';
const stored = [...t.content.children].map(key);
const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith('Show all'));
return {have, stored, inLeaderboard: !!btn?.closest('[class*="leaderboard"]'), root: !!btn?.closest('[class*="leaderboard_root"]')};

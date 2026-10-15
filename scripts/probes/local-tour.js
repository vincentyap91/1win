// Tournament detail: Rules dialog, leaderboard Show all, games Show more, keyboard close, no overflow.
const button = label => [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(label));
const rows = () => [...document.querySelectorAll('[class*="leaderboard-row-container_row"]')].filter(r => !r.className.includes('leaderboard_header')).length;
const games = () => document.querySelectorAll('[class*="games-list_games"] > a').length;
const before = {rows: rows(), games: games()};
const rules = button('Rules');
rules?.click();
await sleep(300);
const dialog = document.querySelector('[data-testid="tournament-rules"]');
const close = document.querySelector('[data-testid="tournament-rules"] [data-testid="modal-header-button-close"]');
close?.focus();
close?.click();
await sleep(200);
const showAll = button('Show all');
showAll?.click();
await sleep(300);
const board = !!document.querySelector('[data-testid="modal-layout"] [class*="leaderboard-table_root"]');
document.querySelector('[data-testid="modal-layout"] [data-testid="modal-header-button-close"]')?.click();
await sleep(200);
const showMore = document.querySelector('[class*="games-list_root"] [data-testid="progress-button"]');
const progressBefore = document.querySelector('[data-testid="progress-text"]')?.textContent || null;
showMore?.click();
await sleep(300);
const shown = [...document.querySelectorAll('[class*="games-list_games"] > a img')];
const broken = shown.filter(i => i.complete && !i.naturalWidth && i.getAttribute('src') && i.getAttribute('src') !== 'data:,').map(i => i.getAttribute('src')).slice(0, 5);
return {
  key: document.body.dataset.state,
  before,
  rulesOpened: !!dialog,
  rulesClosed: !document.querySelector('[data-testid="tournament-rules"]'),
  leaderboardOpened: board,
  leaderboardClosed: !document.querySelector('[data-testid="modal-layout"] [class*="leaderboard-table_root"]'),
  showAllStays: !!button('Show all'),
  gamesAfter: games(),
  progressBefore,
  progressAfter: document.querySelector('[data-testid="progress-text"]')?.textContent || null,
  broken,
  hscroll: document.documentElement.scrollWidth > innerWidth + 1
};

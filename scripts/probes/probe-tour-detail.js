// Tournament detail interactions, reached in-app (a direct URL bounces). Records what Rules, the leaderboard
// "Show all" and the games "Show more" do, and returns the markup each one adds.
await router.push('/tournaments/814264');
for (let i = 0; i < 20 && !document.body.innerText.includes('Crypto Month'); i++) await sleep(400);
await sleep(1500);
const btn = label => [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(label));
const rows = () => document.querySelectorAll('[class*="leaderboard_row"],[class*="leaderboard"] [class*="_row"]').length;
const games = () => document.querySelectorAll('[data-testid^="game-card-"]').length;
const before = {rows: rows(), games: games(), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)};
const rulesBtn = btn('Rules');
rulesBtn?.click();
await sleep(2000);
const rules = {clicked: !!rulesBtn, path: location.pathname, dialog: !!document.querySelector('[data-testid="modal-layout"]')?.firstElementChild, added: document.body.innerText.replace(/\s+/g, ' ').slice(0, 600)};
const sheet = document.querySelector('[class*="modal"],[role="dialog"]');
const rulesHtml = sheet ? sheet.outerHTML.slice(0, 200) : '';
const close = [...document.querySelectorAll('button')].find(b => b.querySelector('[data-icon="close"]') || b.getAttribute('aria-label') === 'Close');
if (location.pathname !== '/tournaments/814264') { history.back(); await sleep(1500); }
else close?.click();
await sleep(800);
const rank = btn('Show all');
const rankBefore = document.querySelector('[class*="leaderboard_buttonWrapper"]')?.parentElement;
const rankHtmlBefore = rankBefore ? rankBefore.querySelectorAll('[class*="leaderboard_place"],[class*="leaderboard_row"]').length : rows();
rank?.click();
await sleep(2000);
const rankAfter = document.querySelector('[class*="leaderboard_buttonWrapper"]');
const more = btn('Show more');
const gamesBefore = games();
more?.click();
await sleep(2500);
return {
  path: location.pathname,
  before,
  rules: {clicked: !!rulesBtn, path: rules.path, dialog: rules.dialog, rulesHtml, snippet: rules.added.slice(0, 400)},
  rank: {clicked: !!rank, rowsBefore: rankHtmlBefore, buttonGone: !rankAfter, rowsAfter: rows()},
  games: {clicked: !!more, before: gamesBefore, after: games(), progress: document.querySelector('[data-testid="progress-text"]')?.textContent || null}
};

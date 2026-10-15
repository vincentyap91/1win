// Spinoleague paginates further than the other tournaments. Click "Show more" until it is gone and return
// every game link collected, so the local page can reveal the same list.
await router.push('/tournaments/788264');
for (let i = 0; i < 25 && location.pathname !== '/tournaments/788264'; i++) await sleep(300);
await sleep(2000);
for (let y = 0, guard = 0; y < document.documentElement.scrollHeight && guard < 40; y += 800, guard++) { scrollTo(0, y); await sleep(100); }
const grid = document.querySelector('[class*="detail_games"] [class*="games-list_games"], [class*="games-list_games"]');
const steps = [grid.querySelectorAll(':scope > a').length];
for (let i = 0; i < 30; i++) {
  const more = [...document.querySelectorAll('[class*="games-list_root"] button')].find(b => b.textContent.trim().startsWith('Show more'));
  if (!more) break;
  more.click();
  await sleep(1200);
  steps.push(grid.querySelectorAll(':scope > a').length);
  if (steps.at(-1) === steps.at(-2)) break;
}
return {steps, progress: document.querySelector('[data-testid="progress-text"]')?.textContent || null, games: [...grid.querySelectorAll(':scope > a')].map(a => a.outerHTML).join('')};

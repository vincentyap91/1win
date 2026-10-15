// How a guest actually reaches a tournament that redirects when its URL is opened directly.
// Click "Show more" until it is gone, then try the in-app router and, if that bounces, a click on the card.
const ids = ['788262', '814264', '817472'];
for (let i = 0; i < 8; i++) {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Show more');
  if (!b) break;
  b.click();
  await sleep(2000);
}
const cards = ids.map(id => !!document.querySelector('[data-testid="tournament-card-' + id + '"]'));
const out = {cardsOnList: Object.fromEntries(ids.map((id, i) => [id, cards[i]])), total: document.querySelectorAll('[data-testid^="tournament-card-"]').length, opened: {}};
for (const id of ids) {
  await router.push('/tournaments/' + id);
  await sleep(3500);
  let path = location.pathname, how = 'router';
  if (path !== '/tournaments/' + id) {
    await router.push('/tournaments');
    await sleep(1500);
    const card = document.querySelector('[data-testid="tournament-card-' + id + '"]');
    const details = card && [...card.querySelectorAll('button,a')].find(b => b.textContent.trim() === 'Details');
    (details || card)?.click();
    await sleep(3500);
    path = location.pathname;
    how = 'click';
  }
  const text = document.body.innerText;
  const back = text.indexOf('Back');
  out.opened[id] = {path, how, head: text.slice(Math.max(0, back), Math.max(0, back) + 180).replace(/\s+/g, ' ')};
  await router.push('/tournaments');
  await sleep(1200);
}
return out;

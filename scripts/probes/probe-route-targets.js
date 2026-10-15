// Where in-app routes land on the reference (aliases, redirects) when pushed through the Vue router.
const routes = ['/betting/esport/call-of-duty-163', '/betting/prematch/rugby-19', '/betting/prematch/soccer-18', '/betting/stats',
  '/casino/endorphina-e-drops', '/casino/fast-games/popular-turbo-games', '/casino/tournaments-categories'];
const out = {};
for (const r of routes) {
  await router.push(r).catch(e => (out[r + ' error'] = String(e)));
  await sleep(4000);
  out[r] = {path: location.pathname, title: document.title.replace(/ - [\d.]+$/, ''), h1: document.querySelector('h1')?.textContent.trim().slice(0, 60) || null};
}
await router.push('/casino'); await sleep(1500);
return out;

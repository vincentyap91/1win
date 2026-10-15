// Reference (guest): footer Forum/Poker link attributes (after scrolling the lazy footer in), then where in-app
// navigation to /forum and /poker ends up and what the landing page shows.
for (let y = 0; y < document.documentElement.scrollHeight; y += 900) { scrollTo(0, y); await sleep(120); }
await sleep(1200);
const footer = [...document.querySelectorAll('footer a,[class*="footer"] a')].filter(a => /forum|poker/i.test(a.textContent + ' ' + (a.getAttribute('href') || '')))
  .map(a => ({text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), href: a.getAttribute('href'), target: a.getAttribute('target')}));
const visit = async path => {
  try { await router.push(path); } catch (e) { return {path, error: String(e).slice(0, 120)}; }
  await sleep(3500);
  const main = document.querySelector('[class*="layout-main_main"]') || document.body;
  return {path, landed: location.pathname + location.search, title: document.title, text: main.innerText.replace(/\s+/g, ' ').slice(0, 160),
    modal: document.querySelector('[data-testid="modal-layout"] > *') ? document.querySelector('[data-testid="modal-layout"]').innerText.replace(/\s+/g, ' ').slice(0, 120) : null};
};
const forum = await visit('/forum');
await router.push('/casino').catch(() => {}); await sleep(1500);
const poker = await visit('/poker');
return {footer, forum, poker};

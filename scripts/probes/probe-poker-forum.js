// Reference (guest): attributes of the sidebar / footer "Forum" and "Poker" links (no clicks; a click leaves the page).
for (let i = 0; i < 40 && ![...document.querySelectorAll('a')].some(a => a.textContent.trim() === 'Forum'); i++) await sleep(300);
const where = a => a.closest('[class*="sidebar"]') ? 'sidebar' : a.closest('footer,[class*="footer"]') ? 'footer' : a.closest('[class*="seo"]') ? 'seo' : 'other';
return [...document.querySelectorAll('a')].filter(a => /forum|poker/i.test(a.textContent + ' ' + (a.getAttribute('href') || '')))
  .map(a => ({text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), href: a.getAttribute('href'), resolved: a.href, target: a.getAttribute('target'), rel: a.getAttribute('rel'), where: where(a)}))
  .filter((v, i, all) => all.findIndex(x => x.text === v.text && x.href === v.href && x.where === v.where) === i);

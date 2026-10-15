// Outcome button labels on a Markets page (Yes/No, Up/Down, team names …) and how many cards carry each.
const cards = [...document.querySelectorAll('[class*="_root_saz1a_"]')];
const labels = {};
for (const b of document.querySelectorAll('[class*="_root_saz1a_"] button[class*="_root_5xqiy_"]')) {
  const name = b.querySelector('[class*="_name_5xqiy_"]')?.textContent.trim() || '(none)';
  labels[name] = (labels[name] || 0) + 1;
}
const other = [...document.querySelectorAll('[data-scope="CardContent"] > div')].filter(d => !d.matches('[class*="_root_saz1a_"]')).map(d => String(d.className).split(' ')[0]);
return {cards: cards.length, labels: Object.entries(labels).sort((a, b) => b[1] - a[1]).slice(0, 12), otherCardRoots: [...new Set(other)].slice(0, 8)};

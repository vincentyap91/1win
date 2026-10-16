const games = document.querySelector('[class*="games-list_games"]');
const list = document.querySelector('[class*="games-list_root"]');
const card = document.querySelector('[class*="detail_card"]');
const s = games ? getComputedStyle(games) : null;
const cards = games ? [...games.children].slice(0, 3).map(el => {
  const r = el.getBoundingClientRect();
  return {cls: el.className.toString().slice(0, 80), w: Math.round(r.width), h: Math.round(r.height)};
}) : [];
const hero = card ? (() => {
  const cs = getComputedStyle(card);
  const r = card.getBoundingClientRect();
  return {cls: card.className.toString().slice(0, 140), d: cs.display, w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundImage.slice(0, 80)};
})() : null;
return {
  list: list?.className?.toString?.().slice(0, 160),
  gamesCls: games?.className?.toString?.().slice(0, 160),
  display: s?.display,
  cols: s?.gridTemplateColumns,
  rows: s?.gridTemplateRows,
  gap: s?.gap,
  n: games?.children.length,
  cards,
  hero
};

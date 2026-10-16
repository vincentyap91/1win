const el = document.querySelector('[class*="detail_leaderboard"]');
const s = getComputedStyle(el);
const r = el.getBoundingClientRect();
const card = document.querySelector('[class*="detail_card"]').getBoundingClientRect();
return {top: s.top, pos: s.position, mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, align: s.alignSelf, t: Math.round(r.top), cardT: Math.round(card.top), h: Math.round(r.height)};

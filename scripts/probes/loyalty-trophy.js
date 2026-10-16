const cards = [...document.querySelectorAll('[class*="level_root"]')].slice(0, 3);
const info = cards.map(card => {
  const imgs = [...card.querySelectorAll('img, picture, [class*="image"], [class*="icon"], [class*="trophy"], [class*="award"], svg')];
  return {
    cls: card.className.toString().slice(0, 120),
    box: (() => { const r = card.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height)}; })(),
    overflow: getComputedStyle(card).overflow,
    kids: imgs.slice(0, 8).map(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: (el.className?.toString?.() || '').slice(0, 100),
        src: (el.currentSrc || el.src || el.querySelector?.('img')?.src || '').slice(-60),
        w: Math.round(r.width), h: Math.round(r.height),
        t: Math.round(r.top), l: Math.round(r.left),
        maxW: s.maxWidth, maxH: s.maxHeight, width: s.width, height: s.height,
        transform: s.transform, pos: s.position, objectFit: s.objectFit
      };
    })
  };
});
// Also scroll levels into view
const levels = document.querySelector('[class*="levels-block"], #levels, [id*="level"]');
levels?.scrollIntoView({block: 'center'});
await sleep(400);
return {n: cards.length, info, html: cards[0]?.innerHTML?.slice(0, 800)};

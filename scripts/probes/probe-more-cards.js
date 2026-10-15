// Category page: record the initial card count, scroll twice to trigger infinite loading, return the added cards.
for (let k=0;k<30&&!document.querySelector('[data-testid^="game-card-"]');k++) await sleep(400);
await sleep(2500);
const cards=()=>[...document.querySelectorAll('[data-testid^="game-card-"]')].filter(c=>!c.closest('[data-index],[class*="carousel"]'));
const first=cards(); if(!first.length) return {error:'no grid cards'};
const parent=first[0].parentElement, start=first.length, steps=[];
for(let i=0;i<2;i++){const before=cards().length; scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}); for(let k=0;k<20&&cards().length===before;k++) await sleep(400); await sleep(1500); steps.push(cards().length);}
const all=cards();
return {path:location.pathname, start, steps, parentClass:parent.className, sameParent:all.every(c=>c.parentElement===parent), wrap:first[0].parentElement===parent&&parent.children.length===start?'direct':'other', cards:all.slice(start).map(c=>c.outerHTML)};

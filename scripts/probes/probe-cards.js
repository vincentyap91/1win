for (let k=0;k<30&&!document.querySelector('[data-testid^="game-card-"]');k++) await sleep(400);
await sleep(2000);
const count=()=>document.querySelectorAll('main [data-testid^="game-card-"], [data-testid^="game-card-"]').length;
const r={start:count(), path:location.pathname, steps:[]};
for(let i=0;i<4;i++){scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}); await sleep(3000); r.steps.push({n:count(), h:document.documentElement.scrollHeight, btn:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>/more|Show/i.test(t))});}
scrollTo({top:0,behavior:'instant'}); await sleep(800);
const card=document.querySelector('[data-testid^="game-card-"]'); const a=card.closest('a')||card.querySelector('a');
r.cardHref=a?.getAttribute('href'); r.cardHtml=card.outerHTML.slice(0,600);
card.querySelector('img')?.click(); await sleep(3500);
r.after={path:location.pathname+location.search, auth:!!document.querySelector('[data-testid="auth"]'), modal:document.querySelector('[data-testid="modal-layout"]')?.innerText.slice(0,200)};
return r;

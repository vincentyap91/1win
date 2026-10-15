await sleep(5000);
for(let i=0;i<20&&!document.querySelector('[data-testid="language-picker-button"]');i++){scrollTo({top:1e7,behavior:'instant'});await sleep(500);}
document.querySelector('[data-testid="language-picker-button"]').click(); await sleep(2000);
const tip=document.querySelector('[class*="language-picker_tooltip"]')||document.querySelector('[class*="languages-list_root"]');
const sc=[...tip.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+5);
for(const el of sc){for(let y=0;y<=el.scrollHeight;y+=150){el.scrollTop=y;await sleep(250);}}
[...tip.querySelectorAll('button')].forEach(b=>b.scrollIntoView({block:'center'}));
await sleep(2500);
return [...tip.querySelectorAll('button')].map(b=>({name:b.textContent.replace(/\s+/g,' ').trim().slice(0,40), src:b.querySelector('img')?.getAttribute('src')||null}));

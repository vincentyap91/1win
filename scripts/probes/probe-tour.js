for (let k=0;k<30&&!document.querySelector('[data-testid^="tournament-card-"]');k++) await sleep(400);
await sleep(1500);
const card=document.querySelector('[data-testid^="tournament-card-"]');
const id=card.dataset.testid; const det=[...card.querySelectorAll('button,a')].find(b=>b.textContent.trim()==='Details'); (det||card).click();
const seen=[];
for(let k=0;k<8;k++){await sleep(1500); seen.push(location.pathname);}
const t=document.body.innerText; const i=t.indexOf('Registration');
return {id, seen, after:t.slice(i,i+1500)};

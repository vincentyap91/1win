await sleep(6000);
const out={};
for(const label of ['Yes','No']){
  const b=[...document.querySelectorAll('button')].find(x=>x.querySelector('[class*="_name_5xqiy_"]')?.textContent.trim()===label);
  let card=b; while(card&&card.parentElement&&card.parentElement.querySelectorAll('button').length<20&&!/card|_root_/.test(card.parentElement.className)) card=card.parentElement;
  // climb to the market card: the nearest ancestor containing a title link
  card=b; for(let i=0;i<10&&card.parentElement;i++){card=card.parentElement; if(card.querySelector('a')&&card.getBoundingClientRect().height>150)break;}
  const before=card.outerHTML; b.click(); await sleep(2500);
  out[label]={cardClass:card.className, before, after:card.outerHTML};
  b.click(); await sleep(1500); out[label].toggledBack=card.outerHTML===before;
}
return out;

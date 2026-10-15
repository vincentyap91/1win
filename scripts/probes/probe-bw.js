await sleep(8000);
for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await sleep(300);}
const m={}; document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href').split('?')[0]; if(h.includes('betwave')) m[h]=(m[h]||a.textContent.trim().slice(0,40));});
const iframes=[...document.querySelectorAll('iframe')].map(f=>f.src.split('?')[0]);
return {path:location.pathname, m, iframes, buttons:[...document.querySelectorAll('main button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,40)};

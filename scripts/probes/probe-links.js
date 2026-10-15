await sleep(5000);
for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await sleep(250);}
const m={}; document.querySelectorAll('a[href^="/"]').forEach(a=>{const h=a.getAttribute('href').split('?')[0]; if(!h.startsWith('/casino/play/')) m[h]=m[h]||a.textContent.trim().slice(0,40);});
return m;

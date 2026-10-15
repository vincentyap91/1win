await sleep(8000);
const t=document.body.innerText; const i=t.indexOf('Registration');
return {path:location.pathname, text:t.slice(i,i+800), iframes:[...document.querySelectorAll('iframe')].map(f=>(f.src||'').split('?')[0].slice(0,100)), buttons:[...document.querySelectorAll('main button, [class*="game"] button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,20)};

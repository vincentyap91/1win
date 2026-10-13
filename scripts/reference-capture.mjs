// Used only inside the documented cua_repl browser session. No standalone browser driver.
import fs from 'node:fs/promises';
export function createCapture({tab,viewport,assets,folder,report=()=>{}}){
 const capture=async(p,w,h)=>{
  const d=await tab.playwright.evaluate(()=>{
   const chunks=s=>{let a=[];for(let i=0;i<s.length;i+=60000)a.push(s.slice(i,i+60000));return a};
   return {url:location.origin+location.pathname,htmlChunks:chunks(document.documentElement.outerHTML),styles:[...document.styleSheets].map(s=>{try{return{href:s.href,chunks:chunks([...s.cssRules].map(r=>r.cssText).join('\n'))}}catch{return{href:s.href,chunks:[]}}}),metrics:{width:innerWidth,height:innerHeight,scrollY,scrollWidth:document.documentElement.scrollWidth,fullHeight:document.documentElement.scrollHeight},usedAssets:[...document.images].map(i=>({url:i.currentSrc||i.src,alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),privateLabels:[...document.querySelectorAll('[data-testid="sidebar-profile-button"] [class*="horizontal_content"] *')].filter(n=>n.children.length===0).map(n=>n.textContent.trim()).filter(Boolean),signed:!!document.querySelector('[data-testid="header-balance-deposit-button"]'),capturedAt:new Date().toISOString()};
  });
  let s=d.htmlChunks.join('').replace(/<(script|iframe|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
  if(d.signed)d.privateLabels.forEach((v,i)=>{s=s.split(v).join(i===0?'Demo user':'ID 00000000')});
  delete d.privateLabels;d.htmlChunks=[s];
  const name=p+(d.signed?'-auth':'')+'-'+w+'x'+h;
  await fs.writeFile(folder+'/'+name+'.json',JSON.stringify(d));report({capture:name,...d.metrics,images:d.usedAssets.length});
 };
 const saveAssets=async(p)=>{
  const inv=await assets.list();const allowed=inv.assets.filter(a=>['image','font'].includes(a.kind)&&!/(doubleclick|google|analytics|adservice|facebook\.net)/i.test(a.url)&&(a.kind==='font'||a.sources.some(s=>['attribute','computedStyle'].includes(s.kind))));
  const b=await assets.bundle({inventoryId:inv.id,assetIds:allowed.map(a=>a.id)});
  b.failures=b.failures.map(f=>({id:f.id,url:f.url.split('?')[0],reason:f.reason.split('\n')[0]}));
  await fs.writeFile(folder+'/assets-'+p+'.json',JSON.stringify(b));report(b.summary);
 };
 const scan=async(n,w,h)=>{for(let i=0;i<n;i++){await tab.scroll([Math.floor(w*.55),Math.min(h-150,500)],'down',1);await tab.getAXState({emit:false});}};
 const view=async(p,w,h)=>{
  await viewport.set({width:w,height:h});await tab.getAXState({emit:false});
  if(p.startsWith('casino')&&!/search|providers/.test(p))await tab.playwright.locator('img[alt$=" game"]').nth(6).waitFor({state:'attached',timeoutMs:15000});
  await scan(12,w,h);await tab.scroll([Math.floor(w*.55),240],'up',30);await tab.getAXState({emit:false});await capture(p,w,h);await saveAssets(p+'-full-'+w);
 };
 return {capture,saveAssets,scan,view};
}


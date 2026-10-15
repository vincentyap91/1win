// Capture reference pages (guest) with a local headless Chrome/Edge — no Browser pane, no login.
// node --experimental-websocket scripts/reference-capture-cdp.mjs --map routes.json --out DIR [--sizes 1920x1080,1440x900,768x1024,430x932,390x844] [--rows] [--settle 4000]
// routes.json: {"<local page name>": "/reference/path", ...}
// Writes DIR/<page>-<W>x<H>.json: {url, path, w, h, title, htmlClass, bodyAttrs, body, css:[{href,text}], footerSig, at}
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : f; };
const map = JSON.parse(fs.readFileSync(arg('map'), 'utf8'));
const out = arg('out'); fs.mkdirSync(out, {recursive: true});
const sizes = arg('sizes', '1920x1080,1440x900,768x1024,430x932,390x844').split(',').map(s => s.split('x').map(Number));
const settle = Number(arg('settle', 4000)), pageRows = process.argv.includes('--rows'), withCss = !process.argv.includes('--no-css');
const origin = arg('origin', 'https://one-vv3591.com');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ref-capture-'));
const port = 9500 + Math.floor(Math.random() * 300);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--force-device-scale-factor=1', '--disable-blink-features=AutomationControlled', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) { for (let i = 0; i < 60; i++) { try { return await (await fetch(url, opts)).json(); } catch { await sleep(250); } } throw new Error('DevTools not reachable'); }
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map();
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
  return {ready: new Promise(r => s.onopen = r), close: () => s.close(), send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); })};
}
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
// A map value may be "/route" or {"route": "/route", "click": "Show more"} — the button is clicked until it disappears.
// {"route": "/tournaments/123", "via": "/tournaments"} loads `via` first and then pushes `route` with the app router:
// some detail pages only load their data on in-app navigation (a direct guest URL redirects to the list).
const probe = (rows, clickText) => `(async()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(let y=0;y<document.documentElement.scrollHeight&&y<40000;y+=500){scrollTo({top:y,behavior:'instant'});await sleep(200);}
  for(let i=0;i<20&&!document.querySelector('[class*="footer-container_root"]');i++){scrollTo({top:1e7,behavior:'instant'});await sleep(500);}
  ${clickText ? `for(let i=0;i<15;i++){const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(clickText)});if(!b)break;b.scrollIntoView({block:'center'});b.click();await sleep(2500);}` : ''}
  ${rows ? `for(const row of document.querySelectorAll('[data-index]')){const grid=row.querySelector('[class*="games-grid_carousel"]');if(!grid)continue;const next=[...row.querySelectorAll('[class*="arrows_root"] button')][1];let last=-1,same=0;
    for(let i=0;i<25&&same<3;i++){if(next&&!next.disabled&&next.offsetParent)next.click();else{grid.scrollLeft=grid.scrollWidth;}await sleep(450);const n=grid.querySelectorAll('[data-testid^="game-card-"]').length;const ph=grid.querySelectorAll('[class*="game-card-placeholder"]').length;if(n===last&&!ph)same++;else same=0;last=n;}
    grid.scrollTo({left:0,behavior:'instant'});}` : ''}
  scrollTo({top:0,behavior:'instant'});await sleep(1500);
  const norm=s=>s.replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi,'').replace(/<!--[\\s\\S]*?-->/g,'').replace(/<([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>/g,(m,t,a)=>{const c=a.match(/\\sclass="([^"]*)"/);return '<'+t.toLowerCase()+(c?' class="'+c[1].trim().replace(/\\s+/g,' ')+'"':'')+'>'}).replace(/<\\/([a-zA-Z0-9:-]+)>/g,(m,t)=>'</'+t.toLowerCase()+'>').replace(/\\s+/g,' ').replace(/>\\s+</g,'><').trim();
  const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,12);
  const fc=document.querySelector('[class*="footer-container_root"]');
  const css=${withCss}?[...document.styleSheets].map(s=>{try{return{href:s.href,text:[...s.cssRules].map(r=>r.cssText).join('\\n')}}catch{return{href:s.href,text:''}}}):[];
  return JSON.stringify({url:location.href.split('?')[0],path:location.pathname,w:innerWidth,h:innerHeight,title:document.title.replace(/ - [\\d.]+$/,''),htmlClass:document.documentElement.className,
    bodyAttrs:Object.fromEntries([...document.body.attributes].map(a=>[a.name,a.value])),body:document.body.innerHTML,css,footerSig:fc?await sha(norm(fc.outerHTML)):null,
    signed:!!document.querySelector('[data-testid="header-balance-deposit-button"]'),skeletons:document.querySelectorAll('[class*="skeleton_root"]').length,at:new Date().toISOString()});
})()`;

await json(`http://127.0.0.1:${port}/json/version`);
const report = [];
for (const [page, spec] of Object.entries(map)) {
  const route = typeof spec === 'string' ? spec : spec.route, clickText = typeof spec === 'string' ? '' : (spec.click || '');
  for (const [w, h] of sizes) {
    const file = path.join(out, `${page}-${w}x${h}.json`);
    if (fs.existsSync(file) && !process.argv.includes('--force')) { report.push({page, size: `${w}x${h}`, skipped: true}); continue; }
    const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
    const s = session(target.webSocketDebuggerUrl); await s.ready;
    await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(x => s.send(x)));
    const mobile = w < 768;
    await s.send('Network.setUserAgentOverride', {userAgent: mobile ? MOBILE_UA : DESKTOP_UA, acceptLanguage: 'en-US,en'});
    // Betwave picks its language from the browser locale (a Malaysian IP gave /ms/betwave); the reference captures are English.
    await s.send('Emulation.setLocaleOverride', {locale: 'en-US'}).catch(() => {});
    await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
    if (mobile) await s.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
    const via = typeof spec === 'string' ? '' : (spec.via || '');
    await s.send('Page.navigate', {url: origin + (via || route)});
    await sleep(settle);
    // The site may bounce through /cdaredirect once; wait until we are back on the route.
    for (let i = 0; i < 20; i++) {
      const p = (await s.send('Runtime.evaluate', {expression: 'location.pathname+"|"+document.readyState', returnByValue: true})).result?.result?.value || '';
      if (!p.startsWith('/cdaredirect') && p.endsWith('complete')) break;
      await sleep(1000);
    }
    if (via) {
      await s.send('Runtime.evaluate', {expression: `document.querySelector('[data-v-app]').__vue_app__.config.globalProperties.$router.push(${JSON.stringify(route)})`, awaitPromise: true});
      await sleep(settle * 2);
    }
    await sleep(1500);
    const res = await s.send('Runtime.evaluate', {expression: probe(pageRows, clickText), awaitPromise: true, returnByValue: true, timeout: 180000});
    const value = res.result?.result?.value;
    if (!value) { report.push({page, size: `${w}x${h}`, error: JSON.stringify(res.result?.exceptionDetails || res.error).slice(0, 200)}); }
    else {
      const d = JSON.parse(value);
      fs.writeFileSync(file, value);
      report.push({page, size: `${w}x${h}`, path: d.path, expected: route, title: d.title.slice(0, 50), bytes: value.length, footerSig: d.footerSig, skeletons: d.skeletons, signed: d.signed});
    }
    console.log(JSON.stringify(report[report.length - 1]));
    s.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
  }
}
fs.writeFileSync(path.join(out, '_report.json'), JSON.stringify(report, null, 2));
browser.kill(); try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

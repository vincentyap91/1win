// Opens every HTML entry over file:// in headless Chrome/Edge and records what fails to load.
// Run: node --experimental-websocket scripts/file-protocol-check.mjs [--width 1440 --height 900] [--shots]
// Needs Chrome or Edge installed; uses a throwaway profile in the OS temp folder.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : fallback; };
const width = Number(arg('width', 1440)), height = Number(arg('height', 900));
const shots = process.argv.includes('--shots');
const only = arg('pages', '');
const out = path.join(root, 'qa', 'file-protocol-' + new Date().toISOString().slice(0, 10));
fs.mkdirSync(out, {recursive: true});

const candidates = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const exe = candidates.find(p => fs.existsSync(p));
if (!exe) throw new Error('Chrome or Edge not found');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'file-check-'));
const port = 9300 + Math.floor(Math.random() * 500);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--force-device-scale-factor=1', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function json(url) { for (let i = 0; i < 50; i++) { try { return await (await fetch(url)).json(); } catch { await sleep(200); } } throw new Error('DevTools not reachable'); }

function session(wsUrl) {
  const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach(f => f(m)); };
  const ready = new Promise(r => ws.onopen = r);
  return {ready, on: f => listeners.push(f), close: () => ws.close(),
    send: (method, params = {}) => new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({id: n, method, params})); })};
}

const pages = fs.readdirSync(root).filter(f => f.endsWith('.html')).filter(f => !only || only.split(',').includes(f));
await json(`http://127.0.0.1:${port}/json/version`);
const results = {};
for (const page of pages) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'})).json();
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  const failed = [], console_ = [];
  s.on(m => {
    if (m.method === 'Network.loadingFailed') failed.push({error: m.params.errorText, blocked: m.params.blockedReason || m.params.corsErrorStatus?.corsError, id: m.params.requestId});
    if (m.method === 'Network.requestWillBeSent') s[m.params.requestId] = m.params.request.url;
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) console_.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 200));
    if (m.method === 'Runtime.exceptionThrown') console_.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
    if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level)) console_.push('LOG ' + m.params.entry.text.slice(0, 200) + ' ' + (m.params.entry.url || '').slice(0, 120));
  });
  await Promise.all(['Network.enable', 'Runtime.enable', 'Log.enable', 'Page.enable'].map(x => s.send(x)));
  await s.send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 768});
  await s.send('Page.navigate', {url: pathToFileURL(path.join(root, page)).href});
  await sleep(4000);
  // Heavy pages under load can still be mounting header/sidebar/footer after the first wait.
  for (let i = 0; i < 30; i++) {
    const ui = await s.send('Runtime.evaluate', {returnByValue: true, expression: 'document.documentElement.dataset.sharedUi||""'});
    if (ui.result?.result?.value !== 'loading') break;
    await sleep(500);
  }
  const probe = await s.send('Runtime.evaluate', {returnByValue: true, awaitPromise: true, expression: `(async()=>{
    for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}
    scrollTo(0,0); await new Promise(r=>setTimeout(r,1500));
    const imgs=[...document.images];
    const broken=imgs.filter(i=>i.complete&&!i.naturalWidth&&i.getAttribute('src')!=='data:,').map(i=>i.getAttribute('src'));
    const placeholders=imgs.filter(i=>i.getAttribute('src')==='data:,').length;
    const masks=[...document.querySelectorAll('*')].map(e=>getComputedStyle(e).maskImage||getComputedStyle(e).webkitMaskImage).filter(v=>v&&v!=='none');
    const maskUrls=[...new Set(masks.filter(v=>!v.includes('data:')))].slice(0,10);
    const uses=[...document.querySelectorAll('use')].map(u=>u.getAttribute('href')||u.getAttribute('xlink:href')).filter(h=>h&&!h.startsWith('#'));
    return {state:document.body.dataset.state, shared:document.documentElement.dataset.sharedUi, imgs:imgs.length, broken:[...new Set(broken)].slice(0,20), brokenCount:broken.length, placeholders, masks:masks.length, externalMasks:maskUrls, externalUses:[...new Set(uses)].slice(0,10), templatesLeft:document.querySelectorAll('template[data-shared-component]').length};
  })()`});
  if (shots) {
    const shot = await s.send('Page.captureScreenshot', {format: 'png'});
    fs.writeFileSync(path.join(out, page.replace('.html', '') + `-${width}.png`), Buffer.from(shot.result.data, 'base64'));
  }
  results[page] = {...probe.result.result.value, failed: failed.map(f => ({url: (s[f.id] || '').slice(0, 160), error: f.error, blocked: f.blocked})).slice(0, 30), failedCount: failed.length, console: [...new Set(console_)].slice(0, 15)};
  s.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
  const r = results[page];
  console.log(page, 'imgs', r.imgs, 'broken', r.brokenCount, 'failed', r.failedCount, 'masks', r.masks, 'extMasks', r.externalMasks.length, 'extUse', r.externalUses.length, 'templatesLeft', r.templatesLeft, 'console', r.console.length);
}
fs.writeFileSync(path.join(out, `report-${width}x${height}.json`), JSON.stringify({browser: exe, width, height, results}, null, 2));
browser.kill();
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

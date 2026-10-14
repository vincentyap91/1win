// Desktop sidebar expand/collapse on every HTML entry (headless Chrome/Edge over file://).
// Run: node --experimental-websocket scripts/sidebar-toggle-check.mjs [--width 1440 --height 900] [--pages a.html,b.html]
// For each page: expanded width, click toggle -> compact width + content offset, click again -> restored,
// then reload to confirm the choice persists (localStorage), and report console exceptions.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : fallback; };
const width = Number(arg('width', 1440)), height = Number(arg('height', 900)), only = arg('pages', '');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-check-'));
const port = 9800 + Math.floor(Math.random() * 150);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--force-device-scale-factor=1', '--allow-file-access-from-files', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) { for (let i = 0; i < 50; i++) { try { return await (await fetch(url, opts)).json(); } catch { await sleep(200); } } throw new Error('DevTools not reachable'); }
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map(); const on = [];
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } else on.forEach(f => f(m)); };
  return {ready: new Promise(r => s.onopen = r), on: f => on.push(f), close: () => s.close(), send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); })};
}
const probe = `(()=>{const sb=document.querySelector('[class*="sidebar_root"]');const sheet=sb&&(sb.querySelector('[class*="common-layout_sleave"]')||sb);
  const main=document.querySelector('[class*="layout-main_main"]')||document.querySelector('[class*="variant-1_content-tO84S"]');const t=document.querySelector('[data-testid="sidebar-expand-button"]');
  return {sidebar:sheet?Math.round(sheet.getBoundingClientRect().width):null,compact:!!document.querySelector('[class*="sidebar_root"] [class*="common-layout_compact"],[class*="sidebar_root"][data-local-compact]'),main:main?Math.round(main.getBoundingClientRect().left):null,toggle:!!t,expanded:t&&t.getAttribute('aria-expanded'),bodyCls:document.body.classList.contains('local-sidebar-collapsed'),overflow:document.documentElement.scrollWidth>innerWidth+1};})()`;
const click = `(()=>{const t=document.querySelector('[data-testid="sidebar-expand-button"]');if(!t)return false;t.click();return true;})()`;
await json(`http://127.0.0.1:${port}/json/version`);
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && !['login.html', 'register.html', 'recovery.html'].includes(f)).filter(f => !only || only.split(',').includes(f));
const results = {};
for (const page of pages) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  const errors = [];
  s.on(m => { if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 160)); });
  await Promise.all(['Runtime.enable', 'Page.enable'].map(x => s.send(x)));
  await s.send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: false});
  const ev = async expr => (await s.send('Runtime.evaluate', {expression: expr, returnByValue: true})).result.result.value;
  const url = pathToFileURL(path.join(root, page)).href;
  await s.send('Page.navigate', {url}); await sleep(2200);
  await ev(`localStorage.removeItem('1win-preview-sidebar'),1`); await s.send('Page.reload'); await sleep(2200);
  const start = await ev(probe);
  await ev(click); await sleep(700); const collapsed = await ev(probe);
  await s.send('Page.reload'); await sleep(2200); const persisted = await ev(probe);
  await ev(click); await sleep(700); const restored = await ev(probe);
  results[page] = {start, collapsed, persisted, restored, errors};
  const ok = start.toggle && collapsed.compact && collapsed.sidebar < start.sidebar && collapsed.main < start.main && persisted.compact && !restored.compact && restored.sidebar === start.sidebar && restored.main === start.main && !errors.length && !collapsed.overflow;
  results[page].ok = ok;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + page, 'sidebar', start.sidebar, '->', collapsed.sidebar, 'main', start.main, '->', collapsed.main, 'persist', persisted.compact, 'restore', restored.sidebar, restored.main, errors.length ? 'ERR ' + errors[0] : '');
  s.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
}
const out = path.join(root, 'qa', 'sidebar-toggle-' + new Date().toISOString().slice(0, 10));
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, `report-${width}x${height}.json`), JSON.stringify(results, null, 2));
browser.kill(); try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

// Run an in-page script on a LOCAL page in headless Chrome/Edge and save what it returns (local twin of reference-run-cdp.mjs).
// node --experimental-websocket scripts/local-run-cdp.mjs --page casino-slots.html --script probe.js [--out result.json] [--sizes 1440x900,390x844] [--query view=x] [--http]
// probe.js is the BODY of an async function; it may use sleep(ms) and must `return` a JSON-serialisable value.
// The page is opened over file:// unless --http is given (then http://127.0.0.1:4174, start scripts/serve.mjs first).
// --resize WxH [--then-script p.js]: afterwards resize the same tab and run a second probe (default: the same one).
// Each result also lists console exceptions raised while the page and probe ran.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : f; };
const pages = arg('page', 'index.html').split(','), body = fs.readFileSync(arg('script'), 'utf8'), outFile = arg('out');
const sizes = arg('sizes', '1440x900').split(',').map(s => s.split('x').map(Number));
const query = arg('query', ''), http = process.argv.includes('--http'), settle = Number(arg('settle', 1800));
const resizeTo = arg('resize', ''), thenBody = resizeTo ? fs.readFileSync(arg('then-script', arg('script')), 'utf8') : '';
const press = arg('press', ''), afterPress = arg('after-press', ''); // "Key:times" (End, PageDown, Enter, Escape)
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'local-run-'));
const port = 9450 + Math.floor(Math.random() * 300);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--force-device-scale-factor=1', '--allow-file-access-from-files', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) { for (let i = 0; i < 60; i++) { try { return await (await fetch(url, opts)).json(); } catch { await sleep(250); } } throw new Error('DevTools not reachable'); }
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map(); const on = [];
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } else on.forEach(f => f(m)); };
  return {ready: new Promise(r => s.onopen = r), on: f => on.push(f), close: () => s.close(), send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); })};
}
await json(`http://127.0.0.1:${port}/json/version`);
const result = {};
for (const page of pages) for (const [w, h] of sizes) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  const errors = [];
  s.on(m => {
    if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 200));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push((m.params.entry.text + ' ' + (m.params.entry.url || '')).slice(0, 200));
  });
  await Promise.all(['Runtime.enable', 'Page.enable', 'Log.enable'].map(x => s.send(x)));
  const mobile = w < 768;
  await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
  if (mobile) await s.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
  const base = http ? `http://127.0.0.1:4174/${page}` : pathToFileURL(path.join(root, page)).href;
  await s.send('Page.navigate', {url: base + (query ? '?' + query : '')});
  await sleep(settle);
  const tap = async spec => {
    const code = {End: 35, PageDown: 34, Enter: 13, Escape: 27, ' ': 32};
    for (const item of spec.split(',').filter(Boolean)) {
      const [key, times = '1'] = item.split(':');
      for (let i = 0; i < Number(times); i++) {
        const vk = code[key] || 0;
        await s.send('Input.dispatchKeyEvent', {type: 'keyDown', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk});
        await s.send('Input.dispatchKeyEvent', {type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk});
        await sleep(350);
      }
    }
  };
  await tap(press);
  const expr = `(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));\n${body}\n})().then(v=>JSON.stringify(v))`;
  const res = await s.send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true, timeout: 300000});
  const value = res.result?.result?.value;
  const key = (pages.length > 1 ? page + '@' : '') + `${w}x${h}`;
  result[key] = {value: typeof value === 'string' ? JSON.parse(value) : {error: JSON.stringify(res.result?.exceptionDetails || res.error).slice(0, 300)}, errors};
  if (afterPress) {
    await tap(afterPress);
    const again = await s.send('Runtime.evaluate', {expression: '!!document.querySelector(\'[data-testid="tournament-rules"],[data-local-modal="tournament-leaderboard"]\')', returnByValue: true});
    result[key].afterKey = again.result?.result?.value;
  }
  if (resizeTo) {
    // Resize the same page (fires the page's resize handler) and run --then-script on it.
    const [rw, rh] = resizeTo.split('x').map(Number);
    await s.send('Emulation.setDeviceMetricsOverride', {width: rw, height: rh, deviceScaleFactor: 1, mobile: rw < 768});
    await sleep(800);
    const r2 = await s.send('Runtime.evaluate', {expression: `(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));\n${thenBody}\n})().then(v=>JSON.stringify(v))`, awaitPromise: true, returnByValue: true, timeout: 300000});
    const v2 = r2.result?.result?.value;
    result[key].after = {size: resizeTo, value: typeof v2 === 'string' ? JSON.parse(v2) : {error: JSON.stringify(r2.result?.exceptionDetails || r2.error).slice(0, 300)}};
  }
  console.log(key, JSON.stringify(result[key]).slice(0, 400));
  s.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
}
if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
browser.kill(); try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

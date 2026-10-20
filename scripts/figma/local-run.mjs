// Run an in-page script on the LOCAL clone (node scripts/serve.mjs, port 4174) in headless Chrome and save what it returns.
// Used to measure local pages for the Figma build (scripts/figma/*).
// node --experimental-websocket scripts/figma/local-run.mjs --route /bonuses.html --script probe.js --out result.json [--sizes 1440x900,390x844]
// probe.js is the BODY of an async function; it may use sleep(ms), router (the app's $router) and must `return` a JSON-serialisable value.
// Output: {"<W>x<H>": <returned value>, ...}
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : f; };
const route = arg('route', '/'), body = fs.readFileSync(arg('script'), 'utf8'), outFile = arg('out');
const sizes = arg('sizes', '1440x900').split(',').map(s => s.split('x').map(Number));
const origin = arg('origin', 'http://127.0.0.1:4174');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ref-run-'));
const port = 9100 + Math.floor(Math.random() * 300);
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
await json(`http://127.0.0.1:${port}/json/version`);
const result = {};
for (const [w, h] of sizes) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(x => s.send(x)));
  const mobile = w < 768;
  await s.send('Network.setUserAgentOverride', {userAgent: mobile ? MOBILE_UA : DESKTOP_UA, acceptLanguage: 'en-US,en'});
    // Betwave picks its language from the browser locale (a Malaysian IP gave /ms/betwave); the reference captures are English.
    await s.send('Emulation.setLocaleOverride', {locale: 'en-US'}).catch(() => {});
  await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
  if (mobile) await s.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
  await s.send('Page.navigate', {url: origin + route});
  await sleep(1500);
  for (let i = 0; i < 0; i++) {
    const p = (await s.send('Runtime.evaluate', {expression: 'location.pathname+"|"+document.readyState', returnByValue: true})).result?.result?.value || '';
    if (p.startsWith(route + '|') && p.endsWith('complete')) break;
    if (i === 10) await s.send('Page.navigate', {url: origin + route});
    await sleep(1000);
  }
  await sleep(1500);
  const expr = `(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));\n${body}\n})().then(v=>JSON.stringify(v))`;
  const res = await s.send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000});
  const value = res.result?.result?.value;
  result[`${w}x${h}`] = typeof value === 'string' ? JSON.parse(value) : value ? value : {error: JSON.stringify(res.result?.exceptionDetails || res.error).slice(0, 300)};
  console.log(`${w}x${h}`, typeof value === 'string' ? value.length : JSON.stringify(value).slice(0, 200));
  // --shot <prefix>: also save the viewport as it is after the script ran (<prefix>-WxH.png).
  if (arg('shot')) { const png = await s.send('Page.captureScreenshot', {format: 'png'}); fs.writeFileSync(`${arg('shot')}-${w}x${h}.png`, Buffer.from(png.result.data, 'base64')); }
  s.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
}
fs.writeFileSync(outFile, JSON.stringify(result));
browser.kill(); try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

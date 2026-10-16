// Full-page screenshot of a local page or a reference route in headless Chrome, for side-by-side design checks.
//   node --experimental-websocket scripts/shot.mjs --url <url> [--via <reference path>] --out shot.png [--size 1440x900] [--wait 6000]
// --via: open that reference path first, then push --url's path with the app router (detail pages that a direct
// guest URL redirects away from, e.g. /tournaments/<id>).
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : f; };
const url = arg('url'), via = arg('via', ''), out = arg('out'), wait = Number(arg('wait', 6000));
const [w, h] = arg('size', '1440x900').split('x').map(Number);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shot-'));
const port = 9500 + Math.floor(Math.random() * 300);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--force-device-scale-factor=1', '--hide-scrollbars', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(u, o) { for (let i = 0; i < 60; i++) { try { return await (await fetch(u, o)).json(); } catch { await sleep(250); } } throw new Error('no devtools'); }
await json(`http://127.0.0.1:${port}/json/version`);
const t = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({id: n, method, params})); });
const mobile = w < 768;
await send('Page.enable'); await send('Runtime.enable');
await send('Network.setUserAgentOverride', {userAgent: mobile ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', acceptLanguage: 'en-US,en'});
await send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
const u = new URL(url);
await send('Page.navigate', {url: via ? u.origin + via : url});
await sleep(wait);
if (via) {
  await send('Runtime.evaluate', {expression: `[...document.querySelectorAll('#root,[data-v-app]')].map(e=>e.__vue_app__).find(Boolean).config.globalProperties.$router.push(${JSON.stringify(u.pathname)})`, awaitPromise: true});
  await sleep(wait);
}
// Scroll through so lazy sections render, then back to the top.
await send('Runtime.evaluate', {expression: `(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,150));}scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,1500));})()`, awaitPromise: true});
const m = (await send('Page.getLayoutMetrics')).result;
const H = Math.min(Math.ceil(m.cssContentSize.height), 12000);
await send('Emulation.setDeviceMetricsOverride', {width: w, height: H, deviceScaleFactor: 1, mobile});
await sleep(1500);
const shot = await send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true});
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
const p = (await send('Runtime.evaluate', {expression: 'location.pathname', returnByValue: true})).result.result.value;
console.log(out, w + 'x' + H, p);
ws.close(); browser.kill(); try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

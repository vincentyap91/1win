import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const outDir = path.resolve('qa/forum');
fs.mkdirSync(outDir, {recursive: true});
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'forum-shot-'));
const port = 9800 + Math.floor(Math.random() * 150);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--force-device-scale-factor=1', '--disable-blink-features=AutomationControlled', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) { for (let i = 0; i < 60; i++) { try { return await (await fetch(url, opts)).json(); } catch { await sleep(250); } } throw new Error('down'); }
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map();
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
  return {ready: new Promise(r => s.onopen = r), close: () => s.close(), send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); })};
}
const outline = `(() => {
  const text = el => (el.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 90);
  const box = el => { const r = el.getBoundingClientRect(); return {t: Math.round(r.top + scrollY), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height)}; };
  const body = document.body;
  const kids = [...document.body.children].slice(0, 8).map(el => ({tag: el.tagName, id: el.id, cls: (el.className?.toString?.() || '').slice(0, 80), box: box(el)}));
  const links = [...document.querySelectorAll('a')].slice(0, 40).map(a => ({t: text(a).slice(0, 40), href: a.getAttribute('href')}));
  return {title: document.title, path: location.href, bg: getComputedStyle(document.body).backgroundColor, font: getComputedStyle(document.body).fontFamily, scrollH: document.documentElement.scrollHeight, kids, h1: [...document.querySelectorAll('h1,h2')].slice(0, 8).map(el => text(el)), links};
})()`;
await json(`http://127.0.0.1:${port}/json/version`);
for (const [name, w, h, ua] of [
  ['desk', 1440, 900, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'],
  ['mobile', 390, 844, 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'],
]) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(x => s.send(x)));
  await s.send('Network.setUserAgentOverride', {userAgent: ua, acceptLanguage: 'en-US,en'});
  await s.send('Emulation.setLocaleOverride', {locale: 'en-US'}).catch(() => {});
  await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile: w < 768});
  await s.send('Page.navigate', {url: 'https://forum.one-vv3591.com/'});
  await sleep(7000);
  const info = await s.send('Runtime.evaluate', {expression: outline, returnByValue: true});
  fs.writeFileSync(path.join(outDir, name + '-outline.json'), JSON.stringify(info.result?.result?.value || info, null, 2));
  const png = await s.send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(png.result.data, 'base64'));
  const full = await s.send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true});
  fs.writeFileSync(path.join(outDir, name + '-full.png'), Buffer.from(full.result.data, 'base64'));
  const html = await s.send('Runtime.evaluate', {expression: 'document.documentElement.outerHTML.slice(0, 200000)', returnByValue: true});
  fs.writeFileSync(path.join(outDir, name + '.html'), html.result?.result?.value || '');
  console.log(name, JSON.stringify(info.result?.result?.value).slice(0, 300));
  s.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
}
browser.kill();
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

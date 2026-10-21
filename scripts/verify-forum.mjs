// Headless check of the local forum. Uses a throwaway Chrome profile, not the user's Chrome.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'qa', 'forum');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'forum-check-'));
const port = 9600 + Math.floor(Math.random() * 200);
const browser = spawn(exe, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--no-first-run', '--disable-gpu', '--force-device-scale-factor=1', '--allow-file-access-from-files', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.webp': 'image/webp'};
const server = http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('missing'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(data);
  });
});
await new Promise(r => server.listen(4175, '127.0.0.1', r));
async function json(url, opts) { for (let i = 0; i < 60; i++) { try { return await (await fetch(url, opts)).json(); } catch { await sleep(250); } } throw new Error('no devtools'); }
await json(`http://127.0.0.1:${port}/json/version`);

function session(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const wait = new Map();
  const errors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '').slice(0, 240));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push((m.params.entry.text || '').slice(0, 240));
  };
  const send = (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); ws.send(JSON.stringify({id: n, method, params})); });
  return {ready: new Promise(r => ws.onopen = r), send, errors, close: () => ws.close()};
}

async function open(width, height) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl);
  await s.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(m => s.send(m)));
  await s.send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 768});
  return s;
}
async function evalJson(s, expression) {
  const res = await s.send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails).slice(0, 400));
  return res.result?.result?.value;
}
async function go(s, url, wait = 1800) {
  await s.send('Page.navigate', {url});
  await sleep(wait);
}
const metrics = `(() => {
  const imgs = [...document.images];
  const broken = imgs.filter(img => img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:')).map(img => img.src.slice(0, 140));
  const body = getComputedStyle(document.body);
  return {
    title: document.title,
    href: location.href,
    bg: body.backgroundColor,
    font: body.fontFamily,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    scrollW: document.documentElement.scrollWidth,
    inner: innerWidth,
    imgs: imgs.length,
    broken: broken.slice(0, 8),
    brokenCount: broken.length,
    h1: [...document.querySelectorAll('h1,h2')].slice(0, 6).map(n => n.textContent.trim().slice(0, 80)),
    sheets: [...document.styleSheets].length,
    inter: document.fonts.check('16px Inter'),
    awesome: document.fonts.check('900 16px "Font Awesome 5 Free"')
  };
})()`;

const report = {};
const desk = await open(1440, 900);
const fileHome = pathToFileURL(path.join(root, 'index.html')).href;
await go(desk, fileHome, 2000);
report.mainForumLink = await evalJson(desk, `new Promise(resolve => {
  const start = Date.now();
  const tick = () => {
    const a = document.querySelector('[data-reference-href="/forum"]');
    if (a || Date.now() - start > 20000) {
      resolve({
        found: !!a,
        href: a ? a.getAttribute('href') : '',
        text: a ? a.textContent.trim().slice(0, 40) : '',
        routes: !!(window.PROJECT_ROUTES && window.PROJECT_ROUTES.pages['/forum']),
        ready: document.readyState,
        waited: Date.now() - start
      });
    } else setTimeout(tick, 250);
  };
  tick();
})`);
if (!report.mainForumLink.found) throw new Error('forum link missing ' + JSON.stringify(report.mainForumLink));
await evalJson(desk, `document.querySelector('[data-reference-href="/forum"]').click()`);
await sleep(1800);
report.fileForum = await evalJson(desk, metrics);
await desk.send('Page.captureScreenshot', {format: 'png'}).then(shot => fs.writeFileSync(path.join(outDir, 'local-desk.png'), Buffer.from(shot.result.data, 'base64')));
report.signIn = await evalJson(desk, `(() => {
  document.getElementById('elUserSignIn').click();
  const menu = document.getElementById('elUserSignIn_menu');
  const box = menu.getBoundingClientRect();
  return {hidden: menu.classList.contains('ipsHide'), w: Math.round(box.width), h: Math.round(box.height), text: menu.innerText.replace(/\\s+/g, ' ').slice(0, 120)};
})()`);
await evalJson(desk, `document.querySelector('a[href^="2-casino-promotions.html"]').click()`);
await sleep(1600);
report.fileCategory = await evalJson(desk, metrics);
await evalJson(desk, `document.querySelector('a[href^="topic-2200.html"]').click()`);
await sleep(1600);
report.fileTopic = await evalJson(desk, metrics);
report.fileTopic.sample = await evalJson(desk, `document.querySelector('.cPost, .ipsType_richText, [data-role="commentContent"]')?.innerText.replace(/\\s+/g,' ').slice(0, 160) || ''`);
await evalJson(desk, `document.querySelector('a[href^="register.html"]')?.click()`);
await sleep(1200);
report.fileRegister = await evalJson(desk, `({title: document.title, action: document.querySelector('form')?.getAttribute('action'), fields: document.querySelectorAll('input,button').length})`);

const phone = await open(390, 844);
await go(phone, pathToFileURL(path.join(root, 'forum', 'index.html')).href);
report.fileMobile = await evalJson(phone, metrics);
await phone.send('Page.captureScreenshot', {format: 'png'}).then(shot => fs.writeFileSync(path.join(outDir, 'local-mobile.png'), Buffer.from(shot.result.data, 'base64')));
report.drawer = await evalJson(phone, `(() => {
  document.querySelector('[data-ipsdrawer], [data-ipsDrawer]').click();
  const drawer = document.getElementById('elMobileDrawer');
  const box = drawer.getBoundingClientRect();
  return {open: drawer.classList.contains('forum-open'), w: Math.round(box.width), h: Math.round(box.height), text: drawer.innerText.replace(/\\s+/g, ' ').slice(0, 180)};
})()`);
await phone.send('Page.captureScreenshot', {format: 'png'}).then(shot => fs.writeFileSync(path.join(outDir, 'local-mobile-drawer.png'), Buffer.from(shot.result.data, 'base64')));
await evalJson(phone, `document.querySelector('#elMobileDrawer [data-action="close"]').click()`);
report.drawerClosed = await evalJson(phone, `document.getElementById('elMobileDrawer').classList.contains('forum-open')`);

const httpTab = await open(1440, 900);
await go(httpTab, 'http://127.0.0.1:4175/index.html', 2000);
await evalJson(httpTab, `new Promise(resolve => {
  const start = Date.now();
  const tick = () => {
    if (document.querySelector('[data-reference-href="/forum"]') || Date.now() - start > 20000) resolve(true);
    else setTimeout(tick, 250);
  };
  tick();
})`);
await evalJson(httpTab, `document.querySelector('[data-reference-href="/forum"]').click()`);
await sleep(1600);
report.httpForum = await evalJson(httpTab, metrics);
report.errors = {desk: desk.errors.slice(0, 12), phone: phone.errors.slice(0, 12), http: httpTab.errors.slice(0, 12)};
fs.writeFileSync(path.join(outDir, 'local-check.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
desk.close(); phone.close(); httpTab.close();
browser.kill();
server.close();
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

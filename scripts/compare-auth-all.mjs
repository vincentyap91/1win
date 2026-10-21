// Compare every local Demo page with the logged-in reference site.
// node scripts/compare-auth-all.mjs
// Writes qa/auth-all-2026-10-16/report.jsonl (structure only: no names, balances, or cookies).
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'qa', 'auth-all-2026-10-16');
fs.mkdirSync(outDir, {recursive: true});
const logPath = path.join(outDir, 'report.jsonl');
const refPort = 9335;
const localBase = 'http://127.0.0.1:4174';
const origin = 'https://one-vv3591.com';
const sizes = (process.argv.includes('--sizes') ? process.argv[process.argv.indexOf('--sizes') + 1] : '1440x900,390x844')
  .split(',').map(s => s.split('x').map(Number));
const only = process.argv.includes('--only') ? new Set(process.argv[process.argv.indexOf('--only') + 1].split(',')) : null;

const ctx = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/routes.js'), 'utf8'), ctx);
const fileToRoute = new Map();
for (const [route, file] of Object.entries(ctx.window.PROJECT_ROUTES.pages)) {
  if (!fileToRoute.has(file)) fileToRoute.set(file, route);
}
let pages = [...fileToRoute.entries()].map(([page, route]) => ({page, route}))
  .filter(p => fs.existsSync(path.join(root, p.page)));
if (only) pages = pages.filter(p => only.has(p.page) || only.has(p.page.replace('.html', '')));

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) {
  for (let i = 0; i < 40; i++) {
    try { return await (await fetch(url, opts)).json(); } catch { await sleep(200); }
  }
  throw new Error('devtools down ' + url);
}
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map();
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
  return {ready: new Promise(r => { s.onopen = r; }), close: () => s.close(), send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); })};
}
const probe = `(() => {
  const box = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height)}; };
  const ids = [...document.querySelectorAll('[data-testid]')].map(el => el.getAttribute('data-testid'));
  const keep = /^(header-|sidebar-profile|tabbar-navigation-menu|game-auth)$/;
  return {
    path: location.pathname,
    signed: !!document.querySelector('[data-testid="header-balance-button"]'),
    login: !!document.querySelector('[data-testid="header-auth-button"]'),
    gameAuth: !!document.querySelector('[data-testid="game-auth"]'),
    tabbar: !!document.querySelector('[class*="tabbar-navigation"]'),
    note: !!document.querySelector('[data-testid="header-notification-button"]'),
    ids: [...new Set(ids.filter(id => keep.test(id)))].sort(),
    header: box('header'),
    hscroll: document.documentElement.scrollWidth > innerWidth + 1,
  };
})()`;

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function openBrowser(port, extra) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl);
  await s.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(m => s.send(m)));
  s.targetId = target.id;
  s.port = port;
  return s;
}
async function prepare(s, w, h) {
  const mobile = w < 768;
  await s.send('Network.setUserAgentOverride', {userAgent: mobile ? MOBILE_UA : DESKTOP_UA, acceptLanguage: 'en-US,en'});
  await s.send('Emulation.setLocaleOverride', {locale: 'en-US'}).catch(() => {});
  await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
  if (mobile) await s.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
}
async function measure(s, url) {
  await s.send('Page.navigate', {url});
  for (let i = 0; i < 16; i++) {
    await sleep(350);
    const st = (await s.send('Runtime.evaluate', {expression: `({h:!!document.querySelector('header'), signed:!!document.querySelector('[data-testid="header-balance-button"]'), login:!!document.querySelector('[data-testid="header-auth-button"]')})`, returnByValue: true})).result?.result?.value || {};
    if (st.signed) break;
    if (st.login && i >= 6) break;
    if (st.h && i >= 12) break;
  }
  const res = await s.send('Runtime.evaluate', {expression: probe, returnByValue: true});
  return res.result?.result?.value || {error: 'empty'};
}
function flags(ref, local) {
  const out = [];
  if (!ref.signed) out.push('ref-not-signed');
  if (ref.signed && !local.signed) out.push('local-missing-balance');
  if (ref.signed && local.login) out.push('local-still-login');
  if (!!ref.gameAuth !== !!local.gameAuth) out.push(local.gameAuth ? 'local-extra-game-auth' : 'local-missing-game-auth');
  if (!!ref.tabbar !== !!local.tabbar) out.push('tabbar');
  if (!!ref.note !== !!local.note) out.push(local.note ? 'local-extra-note' : 'local-missing-note');
  if (ref.header && local.header && Math.abs(ref.header.h - local.header.h) > 8) out.push('header-h');
  if (local.hscroll && !ref.hscroll) out.push('local-hscroll');
  if (ref.path && local.path && ref.path !== '/' && local.path === '/' && !ref.path.startsWith('/betting')) out.push('path');
  return out;
}

const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), '1win-authall-'));
const localPort = 9246;
const localBrowser = spawn(exe, ['--headless=new', `--remote-debugging-port=${localPort}`, `--user-data-dir=${profile}`, '--no-first-run', '--force-device-scale-factor=1', 'about:blank'], {stdio: 'ignore'});
await json(`http://127.0.0.1:${localPort}/json/version`);
await json(`http://127.0.0.1:${refPort}/json/version`);

const summary = {ok: 0, bad: 0, refGuest: 0};
try {
  for (const [w, h] of sizes) {
    const ref = await openBrowser(refPort);
    const local = await openBrowser(localPort);
    // Signed-in view comes from the stored login session (Demo state), not the URL.
    await local.send('Page.addScriptToEvaluateOnNewDocument', {source: "try{localStorage.setItem('1win-local-session','demo')}catch{}"});
    await prepare(ref, w, h);
    await prepare(local, w, h);
    for (const p of pages) {
      const [r, l] = await Promise.all([
        measure(ref, origin + p.route),
        measure(local, `${localBase}/${p.page}`),
      ]);
      const f = flags(r, l);
      if (!r.signed) summary.refGuest++;
      if (f.length) summary.bad++; else summary.ok++;
      const row = {page: p.page, route: p.route, size: `${w}x${h}`, flags: f, ref: {path: r.path, signed: r.signed, login: r.login, gameAuth: r.gameAuth, tabbar: r.tabbar, note: r.note, header: r.header}, local: {path: l.path, signed: l.signed, login: l.login, gameAuth: l.gameAuth, tabbar: l.tabbar, note: l.note, header: l.header}};
      fs.appendFileSync(logPath, JSON.stringify(row) + '\n');
      if (f.length || summary.ok + summary.bad <= 2) console.log(p.page, `${w}x${h}`, f.join(',') || 'ok', 'ref', !!r.signed);
    }
    ref.close(); local.close();
    await fetch(`http://127.0.0.1:${refPort}/json/close/${ref.targetId}`).catch(() => {});
    await fetch(`http://127.0.0.1:${localPort}/json/close/${local.targetId}`).catch(() => {});
    console.log('size done', `${w}x${h}`, JSON.stringify(summary));
  }
} finally {
  localBrowser.kill();
  try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}
}
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log('done', JSON.stringify(summary));

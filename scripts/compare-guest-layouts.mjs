// Step 5 guest layout compare: original https://one-vv3591.com/ ↔ local HTTP preview.
// node --experimental-websocket scripts/compare-guest-layouts.mjs
// Requires: PORT=4174 node scripts/serve.mjs already running.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : f; };
const outDir = path.join(root, 'qa', arg('out', 'step5-layout-2026-10-16'));
fs.mkdirSync(outDir, {recursive: true});
const probe = fs.readFileSync(path.join(root, 'scripts/probes/layout-metrics.js'), 'utf8');
const origin = 'https://one-vv3591.com';
const localBase = 'http://127.0.0.1:4174';
const sizes = arg('sizes', '1440x900,390x844').split(',').map(s => s.split('x').map(Number));
const only = new Set((arg('only', '') || '').split(',').filter(Boolean));

// Unique layout families still needing Step 5 guest visual QA (Betwave skipped; Demo needs user login).
const allPages = [
  {page: 'index.html', route: '/'},
  {page: 'casino.html', route: '/casino'},
  {page: 'casino-slots.html', route: '/casino/slots'},
  {page: 'casino-live.html', route: '/casino/live-games'},
  {page: 'casino-quick.html', route: '/casino/fast-games'},
  {page: 'sports.html', route: '/betting'},
  {page: 'sports-live.html', route: '/betting/live'},
  {page: 'sports-markets.html', route: '/betting/markets'},
  {page: 'sports-topbets.html', route: '/betting/topbets'},
  {page: 'bonuses.html', route: '/bonuses'},
  {page: 'freemoney.html', route: '/freemoney'},
  {page: 'loyalty-program.html', route: '/loyalty-program'},
  {page: 'vip-club.html', route: '/vip-club'},
  {page: 'promotions.html', route: '/promotions'},
  {page: 'tournaments.html', route: '/tournaments'},
  {page: 'blog.html', route: '/blog'},
  {page: 'rules.html', route: '/rules'},
  {page: 'poker-app.html', route: '/poker-app'},
  {page: 'trading.html', route: '/trading'},
];
const pages = only.size ? allPages.filter(p => only.has(p.page) || only.has(p.page.replace('.html', ''))) : allPages;

const exe = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));
if (!exe) throw new Error('Chrome/Edge not found');

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) {
  for (let i = 0; i < 60; i++) {
    try { return await (await fetch(url, opts)).json(); } catch { await sleep(250); }
  }
  throw new Error('DevTools not reachable');
}
function session(ws) {
  const s = new WebSocket(ws); let id = 0; const wait = new Map();
  s.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } };
  return {
    ready: new Promise(r => { s.onopen = r; }),
    close: () => s.close(),
    send: (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); s.send(JSON.stringify({id: n, method, params})); }),
  };
}

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'step5-cmp-'));
const port = 9600 + Math.floor(Math.random() * 200);
const browser = spawn(exe, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--force-device-scale-factor=1', '--disable-blink-features=AutomationControlled', 'about:blank',
], {stdio: 'ignore'});

await json(`http://127.0.0.1:${port}/json/version`);

async function measure(url, w, h, settle) {
  const target = await json(`http://127.0.0.1:${port}/json/new?about:blank`, {method: 'PUT'});
  const s = session(target.webSocketDebuggerUrl); await s.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(x => s.send(x)));
  const mobile = w < 768;
  await s.send('Network.setUserAgentOverride', {userAgent: mobile ? MOBILE_UA : DESKTOP_UA, acceptLanguage: 'en-US,en'});
  await s.send('Emulation.setLocaleOverride', {locale: 'en-US'}).catch(() => {});
  await s.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
  if (mobile) await s.send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
  await s.send('Page.navigate', {url});
  await sleep(settle);
  for (let i = 0; i < 25; i++) {
    const p = (await s.send('Runtime.evaluate', {expression: 'location.pathname+"|"+document.readyState', returnByValue: true})).result?.result?.value || '';
    if (!p.startsWith('/cdaredirect') && p.endsWith('complete')) break;
    await sleep(800);
  }
  // Original SPA needs mount wait; local needs shared UI.
  for (let i = 0; i < 40; i++) {
    const ok = (await s.send('Runtime.evaluate', {
      expression: `!!document.querySelector('[class*="sidebar_root"],[data-testid="layout-content"],[class*="footer-container"]')`,
      returnByValue: true,
    })).result?.result?.value;
    if (ok) break;
    await sleep(500);
  }
  await sleep(1200);
  const expr = `(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));\n${probe}\n})().then(v=>JSON.stringify(v))`;
  const res = await s.send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true, timeout: 180000});
  const value = res.result?.result?.value;
  const shot = await s.send('Page.captureScreenshot', {format: 'png', fromSurface: true});
  s.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
  return {
    metrics: typeof value === 'string' ? JSON.parse(value) : {error: JSON.stringify(res.result?.exceptionDetails || res.error).slice(0, 300)},
    png: shot.result?.data,
  };
}

function diffBox(a, b, tol = 8) {
  if (!a && !b) return null;
  // Which side is missing the element.
  if (!a || !b) return {missing: !a ? 'ref' : 'local'};
  const d = {dx: b.x - a.x, dy: b.y - a.y, dw: b.w - a.w, dh: b.h - a.h};
  const big = Object.values(d).some(v => Math.abs(v) > tol);
  return big ? d : null;
}

function compare(ref, local) {
  const issues = [];
  if (ref.error || local.error) {
    issues.push({type: 'probe-error', ref: ref.error, local: local.error});
    return issues;
  }
  if (local.hscroll) issues.push({type: 'hscroll'});
  if (local.brokenImages?.length) issues.push({type: 'broken-images', count: local.brokenImages.length, samples: local.brokenImages.slice(0, 3)});
  if (ref.footerPresent && !local.footerPresent) issues.push({type: 'missing-footer'});
  if (!ref.footerPresent && local.footerPresent) {
    // Reference still did not mount footer after scroll — note only, not a local defect.
    issues.push({type: 'ref-footer-unloaded'});
  }
  if (local.signed) issues.push({type: 'unexpected-signed-local'});
  const navDelta = (local.navCount || 0) - (ref.navCount || 0);
  if (Math.abs(navDelta) > 2) issues.push({type: 'nav-count', ref: ref.navCount, local: local.navCount, refLabels: ref.navLabels, localLabels: local.navLabels});
  // Visible cards: local infinite-scroll extras stay [hidden] until scrolled — compare visible only.
  if (ref.cards > 0 && local.cards === 0) issues.push({type: 'no-cards', ref: ref.cards});
  if (ref.cards >= 6 && local.cards > 0) {
    const ratio = Math.abs(local.cards - ref.cards) / ref.cards;
    // Reference carousels often still show skeletons on first paint; don't treat that as a local defect.
    if (ratio > 0.35 && (ref.skeletons || 0) < 8) {
      issues.push({type: 'card-count-gap', ref: ref.cards, local: local.cards, moreShown: local.moreShown, moreHidden: local.moreHidden, refSkeletons: ref.skeletons});
    } else if (ratio > 0.35) {
      issues.push({type: 'ref-cards-still-loading', ref: ref.cards, local: local.cards, refSkeletons: ref.skeletons});
    }
  }
  // Geometry: ignore content/footer height (live feed + lazy sections change length). Flag x/w and header/sidebar/banner.
  for (const key of ['sidebar', 'header', 'banner']) {
    const d = diffBox(ref[key], local[key], 12);
    if (d) issues.push({type: `box-${key}`, ...d, ref: ref[key], local: local[key]});
  }
  if (ref.content && local.content) {
    const dw = local.content.w - ref.content.w, dx = local.content.x - ref.content.x, dy = local.content.y - ref.content.y;
    if (Math.abs(dw) > 12 || Math.abs(dx) > 12 || Math.abs(dy) > 12) {
      issues.push({type: 'box-content-frame', dx, dy, dw, ref: ref.content, local: local.content});
    }
  }
  if ((ref.expands?.length || 0) >= 3 && (local.expands?.length || 0) < 3) {
    issues.push({type: 'expand-count', ref: ref.expands.length, local: local.expands?.length || 0});
  }
  // After sidebar fill, local expand subtrees should have items even while collapsed.
  if ((local.expandItems || 0) < 8) issues.push({type: 'expand-empty', expandItems: local.expandItems || 0});
  return issues;
}

// Smoke local server
try {
  const r = await fetch(localBase + '/index.html');
  if (!r.ok) throw new Error('status ' + r.status);
} catch (e) {
  console.error('Local preview not reachable on 4174. Start: $env:PORT=4174; node scripts/serve.mjs');
  browser.kill();
  process.exit(1);
}

const report = {date: '2026-10-16', origin, localBase, sizes: sizes.map(([w, h]) => `${w}x${h}`), pages: []};

for (const {page, route} of pages) {
  for (const [w, h] of sizes) {
    const key = `${page.replace('.html', '')}-${w}x${h}`;
    console.log('compare', key);
    let ref, local;
    try {
      ref = await measure(origin + route, w, h, 4500);
      local = await measure(`${localBase}/${page}`, w, h, 2200);
    } catch (e) {
      report.pages.push({page, route, size: `${w}x${h}`, error: String(e).slice(0, 200)});
      continue;
    }
    if (ref.png) fs.writeFileSync(path.join(outDir, `${key}-ref.png`), Buffer.from(ref.png, 'base64'));
    if (local.png) fs.writeFileSync(path.join(outDir, `${key}-local.png`), Buffer.from(local.png, 'base64'));
    const issues = compare(ref.metrics, local.metrics);
    // Original lazy-load notes are not local defects.
    const material = issues.filter(i => i.type !== 'ref-footer-unloaded' && i.type !== 'ref-cards-still-loading');
    const row = {
      page, route, size: `${w}x${h}`,
      issues,
      ok: material.length === 0,
      ref: {
        path: ref.metrics.path, scrollH: ref.metrics.scrollH, navCount: ref.metrics.navCount,
        cards: ref.metrics.cards, footer: ref.metrics.footerPresent, skeletons: ref.metrics.skeletons,
        sidebar: ref.metrics.sidebar, content: ref.metrics.content,
      },
      local: {
        path: local.metrics.path, state: local.metrics.state, scrollH: local.metrics.scrollH,
        navCount: local.metrics.navCount, cards: local.metrics.cards, footer: local.metrics.footerPresent,
        skeletons: local.metrics.skeletons, sidebar: local.metrics.sidebar, content: local.metrics.content,
        hscroll: local.metrics.hscroll, brokenImages: local.metrics.brokenImages,
      },
    };
    report.pages.push(row);
    fs.writeFileSync(path.join(outDir, `${key}.json`), JSON.stringify({ref: ref.metrics, local: local.metrics, issues}, null, 2));
    console.log(key, row.ok ? 'OK' : 'ISSUES ' + issues.map(i => i.type).join(','));
  }
}

report.summary = {
  total: report.pages.length,
  ok: report.pages.filter(p => p.ok).length,
  failed: report.pages.filter(p => !p.ok && !p.error).length,
  errors: report.pages.filter(p => p.error).length,
  issueTypes: Object.fromEntries(
    report.pages.flatMap(p => (p.issues || []).map(i => i.type))
      .reduce((m, t) => (m.set(t, (m.get(t) || 0) + 1), m), new Map())
  ),
};
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
browser.kill();
try { fs.rmSync(profile, {recursive: true, force: true}); } catch {}

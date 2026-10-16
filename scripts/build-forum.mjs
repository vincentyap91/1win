// Save the public 1win forum as local static pages. No accounts, no posting.
// node scripts/build-forum.mjs
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import {fileURLToPath} from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://forum.one-vv3591.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const SEED_BOARDS = [
  '/2-casino-promotions/',
  '/39-sportbook-promotion/',
  '/7-announcements/',
  '/8-casino-discussion/',
  '/10-sportbook-discussion/',
  '/11-poker/',
  '/13-introduction/',
  '/14-crypto/',
  '/15-gaming/',
  '/16-movies-series/',
  '/19-cybersport/',
  '/27-espa%C3%B1ol/',
  '/26-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/',
  '/25-%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-hindi/',
  '/28-portugu%C3%AAs/',
  '/29-fran%C3%A7ais/',
];
const PROMO_HOSTS = new Set(['1win-resmi.com', 'www.1win-resmi.com', '1wcjlr.com', 'www.1wcjlr.com', '1win.com', 'www.1win.com', 'one-vv3591.com', 'www.one-vv3591.com']);
const ASSET_EXT = /\.(?:png|jpe?g|gif|webp|svg|avif|ico|woff2?|ttf|eot|otf|css)(?:$|\?)/i;

const pages = new Map();
const assets = new Map();
const failed = [];

const sleep = ms => new Promise(r => setTimeout(r, ms));
function pathKey(pathname) {
  let p = pathname || '/';
  try { p = decodeURIComponent(p); } catch {}
  p = p.replace(/\/page\/\d+\/?$/, '').replace(/\/+$/, '');
  return p || '/';
}
function safeSegment(seg) {
  let s = seg.replace(/[<>:"|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '');
  if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(s)) s = '_' + s;
  return s || '_';
}
function boardFile(pathname) {
  const slug = pathKey(pathname).replace(/^\//, '').normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/[. ]+$/g, '').slice(0, 120);
  return slug + '.html';
}
function topicFile(pathname) {
  const id = pathKey(pathname).match(/^\/topic\/(\d+)/);
  return id ? `topic-${id[1]}.html` : null;
}
function specialFile(pathname) {
  const key = pathKey(pathname);
  if (key === '/') return 'index.html';
  if (key === '/login') return 'login.html';
  if (key === '/register') return 'register.html';
  if (key === '/lostpassword') return 'lostpassword.html';
  return topicFile(pathname) || (/^\/\d+-/.test(key) ? boardFile(pathname) : null);
}
async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({length: Math.min(n, items.length)}, async () => {
    while (i < items.length) await fn(items[i++]);
  });
  await Promise.all(workers);
}
async function getBuf(url, tries = 3) {
  let last;
  for (let n = 0; n < tries; n++) {
    try {
      const res = await fetch(url, {headers: {'User-Agent': UA, 'Accept': '*/*'}, redirect: 'follow'});
      if (!res.ok) throw new Error(res.status + ' ' + url);
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
      return {buf, final: res.url, type: res.headers.get('content-type') || ''};
    } catch (err) {
      last = err;
      await sleep(350 * (n + 1));
    }
  }
  throw last;
}
function hrefsOf(html) {
  const out = [];
  const re = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1] ?? m[2]);
  return out;
}
function decodeAttr(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function escAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`(?<![\\w-])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? decodeAttr(m[1] ?? m[2]) : '';
}
function replaceAttr(tag, name, value) {
  const re = new RegExp(`((?<![\\w-])${name}\\s*=\\s*)(?:"[^"]*"|'[^']*')`, 'i');
  const next = `${name}="${escAttr(value)}"`;
  if (re.test(tag)) return tag.replace(re, `$1"${escAttr(value)}"`);
  return tag.replace(/>$/, ` ${next}>`);
}
function forumUrl(href) {
  const u = new URL(decodeAttr(href), ORIGIN + '/');
  if (u.hostname !== 'forum.one-vv3591.com') return null;
  u.hash = '';
  u.search = '';
  return u;
}
function isBoardPath(pathname) {
  return /^\/\d+-[^/]+$/.test(pathKey(pathname));
}
function assetKey(url) {
  const u = new URL(url);
  u.hash = '';
  u.search = '';
  return u.href;
}
function repoPathFor(remote) {
  const u = new URL(remote);
  const parts = decodeURIComponent(u.pathname).split('/').filter(Boolean).map(safeSegment);
  let rel = 'assets/forum/' + (u.hostname.replace(/[^a-z0-9.-]/gi, '_') + '/' + parts.join('/'));
  if (path.join(root, rel).length > 240) {
    const ext = path.posix.extname(parts.at(-1) || '').slice(0, 8);
    rel = 'assets/forum/long/' + crypto.createHash('sha1').update(u.pathname).digest('hex').slice(0, 20) + ext;
  }
  return rel.replace(/\\/g, '/');
}
function hrefFrom(dir, repoRel) {
  const rel = path.posix.relative(dir, repoRel);
  return rel.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');
}
function mainFile(pathname) {
  const p = pathKey(pathname).toLowerCase();
  if (p === '/') return '../index.html';
  if (p.includes('free-money') || p.includes('freemoney')) return '../freemoney.html';
  if (p.includes('bonus')) return '../bonuses.html';
  if (p.includes('betting') || p.includes('sport')) return '../sports.html';
  if (p.includes('live-game') || p.includes('live-casino')) return '../casino-live.html';
  if (p.includes('1win-games')) return '../casino-1win.html';
  if (p.includes('poker')) return '../poker-app.html';
  if (p.includes('casino')) return '../casino.html';
  return null;
}
function rememberAsset(remote) {
  let abs;
  try { abs = new URL(remote); } catch { return null; }
  if (!/^https?:$/.test(abs.protocol)) return null;
  if (/\.(?:js|php)(?:$|\?)/i.test(abs.pathname)) return null;
  if (/googletagmanager|amplitude|google-analytics|doubleclick|facebook\.net|code\.jquery/.test(abs.hostname)) return null;
  const key = assetKey(abs.href);
  if (!assets.has(key)) assets.set(key, {remote: key, repo: repoPathFor(key), ok: false});
  return key;
}
function collectFromHtml(html, pageUrl) {
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const re = /<(img|source|video|link)\b[^>]*>/gi;
  let tag;
  while ((tag = re.exec(withoutScripts))) {
    const el = tag[0];
    const rel = attr(el, 'rel').toLowerCase();
    const keys = rel.includes('stylesheet') ? [] : ['src', 'poster', 'data-src', 'href'];
    for (const key of keys) {
      const raw = attr(el, key);
      if (!raw || raw.startsWith('data:') || raw.startsWith('#')) continue;
      if (key === 'href' && !rel.includes('icon') && !ASSET_EXT.test(raw.split('?')[0])) continue;
      try { rememberAsset(new URL(raw, pageUrl).href); } catch {}
    }
    const srcset = attr(el, 'srcset');
    if (srcset) {
      for (const part of srcset.split(',')) {
        const raw = part.trim().split(/\s+/)[0];
        if (!raw || raw.startsWith('data:')) continue;
        try { rememberAsset(new URL(decodeAttr(raw), pageUrl).href); } catch {}
      }
    }
  }
  const styles = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = styles.exec(withoutScripts))) {
    for (const remote of cssUrls(m[1] ?? m[2], pageUrl)) rememberAsset(remote);
  }
}
function cssUrls(css, base) {
  const found = [];
  const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  let m;
  while ((m = re.exec(css))) {
    const raw = m[2].trim();
    if (!raw || raw.startsWith('data:') || raw.startsWith('#')) continue;
    if (!/^(?:https?:)?\/\//.test(raw) && !ASSET_EXT.test(raw.split('?')[0])) continue;
    try { found.push(new URL(raw, base).href); } catch {}
  }
  return found;
}
function rewriteCss(css, base, cssDir) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (full, q, raw) => {
    const value = raw.trim();
    if (!value || value.startsWith('data:') || value.startsWith('#')) return full;
    if (!/^(?:https?:)?\/\//.test(value) && !ASSET_EXT.test(value.split('?')[0])) return full;
    let abs;
    try { abs = new URL(value, base); } catch { return full; }
    const item = assets.get(assetKey(abs.href));
    if (!item?.ok) return 'none';
    return `url(${q}${hrefFrom(cssDir, item.repo)}${q})`;
  });
}

async function fetchPage(url, filename) {
  const got = await getBuf(url);
  const html = got.buf.toString('utf8');
  if (!html.includes('</html>')) throw new Error('incomplete html ' + url);
  pages.set(filename, html);
  console.log('page', filename, html.length);
  return html;
}

console.log('home');
const home = await fetchPage(ORIGIN + '/', 'index.html');
const boardUrls = new Map();
function addBoard(href) {
  const u = forumUrl(href);
  if (!u || !isBoardPath(u.pathname)) return;
  const key = pathKey(u.pathname);
  if (!boardUrls.has(key)) boardUrls.set(key, u.origin + u.pathname.replace(/\/?$/, '/'));
}
for (const href of [...SEED_BOARDS, ...hrefsOf(home)]) addBoard(href);
console.log('boards', boardUrls.size);
await pool([...boardUrls.entries()], 4, async ([key, url]) => {
  try { await fetchPage(url, boardFile(key)); }
  catch (err) { failed.push(String(err.message || err)); console.log('board fail', key, err.message); }
});
for (const html of pages.values()) for (const href of hrefsOf(html)) addBoard(href);
const extra = [...boardUrls.entries()].filter(([key]) => !pages.has(boardFile(key)));
if (extra.length) {
  console.log('extra boards', extra.length);
  await pool(extra, 4, async ([key, url]) => {
    try { await fetchPage(url, boardFile(key)); }
    catch (err) { failed.push(String(err.message || err)); }
  });
}

const topicUrls = new Map();
function addTopic(href) {
  const u = forumUrl(href);
  if (!u) return;
  const file = topicFile(u.pathname);
  if (!file || topicUrls.has(file)) return;
  const clean = new URL(u.href);
  clean.pathname = clean.pathname.replace(/\/page\/\d+\/?$/, '/');
  topicUrls.set(file, clean.origin + clean.pathname.replace(/\/?$/, '/'));
}
for (const html of pages.values()) for (const href of hrefsOf(html)) addTopic(href);
console.log('topics', topicUrls.size);
await pool([...topicUrls.entries()], 6, async ([file, url]) => {
  try { await fetchPage(url, file); }
  catch (err) { failed.push(String(err.message || err)); console.log('topic fail', file, err.message); topicUrls.delete(file); }
});

for (const [file, pathName] of [['login.html', '/login/'], ['register.html', '/register/'], ['lostpassword.html', '/lostpassword/']]) {
  try { await fetchPage(ORIGIN + pathName, file); }
  catch (err) { failed.push(String(err.message || err)); console.log('auth fail', file, err.message); }
}

const stylesheetBases = [];
const head = pages.get('index.html');
const sheetRe = /<link\b[^>]*rel=['"]stylesheet['"][^>]*>/gi;
let sm;
while ((sm = sheetRe.exec(head))) {
  const href = attr(sm[0], 'href');
  if (!href || /fontawesome|fonts\.googleapis/.test(href)) continue;
  const abs = new URL(href, ORIGIN + '/');
  stylesheetBases.push(abs.href);
}
for (const href of [
  'https://use.fontawesome.com/releases/v5.8.1/css/all.css',
  'https://use.fontawesome.com/releases/v5.8.1/css/v4-shims.css',
]) stylesheetBases.push(href);
const interUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
stylesheetBases.push(interUrl);

const cssFiles = [];
console.log('styles', stylesheetBases.length);
for (const href of stylesheetBases) {
  try {
    const got = await getBuf(href);
    const text = got.buf.toString('utf8');
    const base = new URL(href);
    base.search = '';
    let repo;
    if (href.includes('fontawesome') && href.endsWith('all.css')) repo = 'css/forum/vendor/fontawesome/css/all.css';
    else if (href.includes('v4-shims')) repo = 'css/forum/vendor/fontawesome/css/v4-shims.css';
    else if (href.includes('fonts.googleapis.com')) repo = 'css/forum/inter.css';
    else {
      const name = path.posix.basename(base.pathname).replace(/\.gz$/, '');
      repo = 'css/forum/' + name;
    }
    cssFiles.push({href: base.href, text, repo});
    for (const u of cssUrls(text, base.href)) rememberAsset(u);
    console.log('css', repo, text.length, 'urls queued', assets.size);
  } catch (err) {
    failed.push('css ' + href + ' ' + (err.message || err));
    console.log('css fail', href, err.message);
  }
}

for (const html of pages.values()) collectFromHtml(html, ORIGIN + '/');
console.log('assets', assets.size);
let done = 0;
await pool([...assets.values()], 8, async item => {
  try {
    const got = await getBuf(item.remote);
    if (/text\/html/i.test(got.type) && !item.remote.endsWith('.svg')) throw new Error('html body');
    if (got.buf.length > 12 * 1024 * 1024) throw new Error('too large');
    const dest = path.join(root, item.repo);
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.writeFileSync(dest, got.buf);
    item.ok = true;
  } catch (err) {
    failed.push('asset ' + item.remote + ' ' + (err.message || err));
  }
  done++;
  if (done % 40 === 0) console.log('assets saved', done, '/', assets.size);
});
console.log('assets ok', [...assets.values()].filter(a => a.ok).length, '/', assets.size);

for (const css of cssFiles) {
  const dir = path.posix.dirname(css.repo);
  const rewritten = rewriteCss(css.text, css.href, dir);
  const dest = path.join(root, css.repo);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, rewritten);
}

const have = new Set(pages.keys());
function classify(href) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return {href, local: false};
  let u;
  try { u = new URL(decodeAttr(href), ORIGIN + '/'); } catch { return {href: '#', skip: 'forum'}; }
  if (u.protocol === 'data:') return {href, local: false};
  if (u.hostname === 'forum.one-vv3591.com') {
    const key = pathKey(u.pathname);
    if (/^\/profile\//.test(key)) return {href: '#', skip: 'profile'};
    if (/\/page\/\d+/.test(u.pathname) && !topicFile(u.pathname) && !isBoardPath(u.pathname)) return {href: '#', skip: 'page'};
    const file = specialFile(u.pathname);
    if (file && have.has(file)) return {href: hrefFrom('forum', 'forum/' + file) + (file.startsWith('topic-') ? '' : '') + u.hash, local: true};
    if (/\/page\/\d+/.test(u.pathname)) return {href: '#', skip: 'page'};
    const asset = assets.get(assetKey(u.href));
    if (asset?.ok) return {href: hrefFrom('forum', asset.repo), local: true};
    return {href: '#', skip: 'forum'};
  }
  if (PROMO_HOSTS.has(u.hostname)) {
    const file = mainFile(u.pathname);
    return file ? {href: file, local: true} : {href: '#', skip: 'forum'};
  }
  const asset = assets.get(assetKey(u.href));
  if (asset?.ok) return {href: hrefFrom('forum', asset.repo), local: true};
  if (u.hostname.includes('amazonaws') || ASSET_EXT.test(u.pathname)) return {href: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', local: true};
  return {href: u.href, local: false};
}
function localAsset(raw, pageUrl) {
  if (!raw || raw.startsWith('data:') || raw.startsWith('#')) return raw;
  let abs;
  try { abs = new URL(decodeAttr(raw), pageUrl); } catch { return raw; }
  const item = assets.get(assetKey(abs.href));
  if (item?.ok) return hrefFrom('forum', item.repo);
  if (item || abs.hostname.includes('amazonaws') || ASSET_EXT.test(abs.pathname)) return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  return raw;
}

const sheetMap = new Map(cssFiles.map(css => [assetKey(css.href), '../' + css.repo]));
function sheetHref(href) {
  if (/fonts\.googleapis\.com/.test(href)) return '../css/forum/inter.css';
  if (/fontawesome/.test(href) && /v4-shims/.test(href)) return '../css/forum/vendor/fontawesome/css/v4-shims.css';
  if (/fontawesome/.test(href)) return '../css/forum/vendor/fontawesome/css/all.css';
  try {
    const abs = new URL(href, ORIGIN + '/');
    abs.search = '';
    return sheetMap.get(assetKey(abs.href)) || href;
  } catch { return href; }
}

function rewriteHtml(html, pageUrl) {
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/\bipsJS_none\b/g, 'ipsJS_has');
  html = html.replace(/\sdata-ipsHover(?:-target|-width)?\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
  html = html.replace(/<link\b[^>]*\brel=(["'])(?:manifest|preconnect|dns-prefetch)\1[^>]*>\s*/gi, '');
  html = html.replace(/<meta\b[^>]*\bname=(["'])msapplication-config\1[^>]*>\s*/gi, '');
  html = html.replace(/(<input\b[^>]*\bname=(["'])csrfKey\2[^>]*>)/gi, tag => tag.replace(/\bvalue=(["'])[^"']*\1/i, 'value=$1$1'));
  html = html.replace(/<a\b[^>]*>/gi, tag => {
    const decision = classify(attr(tag, 'href'));
    let next = replaceAttr(tag, 'href', decision.href);
    if (decision.skip) next = replaceAttr(next, 'data-local-skip', decision.skip);
    if (decision.local) next = next.replace(/\s+target=(["'])_blank\1/ig, '');
    return next;
  });
  html = html.replace(/<(?:img|source|video|form|link)\b[^>]*>/gi, tag => {
    const name = tag.slice(1).split(/\s|>/)[0].toLowerCase();
    if (name === 'form') return replaceAttr(tag, 'action', '#');
    if (name === 'link') {
      const rel = attr(tag, 'rel').toLowerCase();
      if (rel.includes('stylesheet') || rel.includes('icon')) return replaceAttr(tag, 'href', rel.includes('stylesheet') ? sheetHref(attr(tag, 'href')) : localAsset(attr(tag, 'href'), pageUrl));
      return tag;
    }
    let next = tag;
    for (const key of ['src', 'poster', 'data-src']) {
      if (attr(next, key)) next = replaceAttr(next, key, localAsset(attr(next, key), pageUrl));
    }
    const lazy = attr(next, 'data-src');
    if (lazy && !lazy.startsWith('data:')) next = replaceAttr(next, 'src', lazy);
    if (attr(next, 'srcset')) {
      const value = attr(next, 'srcset').split(',').map(part => {
        const bits = part.trim().split(/\s+/);
        if (bits[0]) bits[0] = localAsset(bits[0], pageUrl);
        return bits.join(' ');
      }).join(', ');
      next = replaceAttr(next, 'srcset', value);
    }
    return next;
  });
  html = html.replace(/\bstyle=(["'])([\s\S]*?)\1/gi, (full, q, value) => {
    const next = value.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, qq, raw) => {
      if (raw.trim().startsWith('data:')) return m;
      return `url(${qq}${localAsset(raw.trim(), pageUrl)}${qq})`;
    });
    return `style=${q}${next}${q}`;
  });
  if (!html.includes('css/forum/inter.css')) html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="../css/forum/inter.css">\n</head>');
  if (!html.includes('css/forum/preview.css')) html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="../css/forum/preview.css">\n</head>');
  html = html.replace(/<\/body>/i, '<script src="../js/forum.js"></script>\n</body>');
  return html;
}

const forumDir = path.join(root, 'forum');
fs.mkdirSync(forumDir, {recursive: true});
const remoteLeft = [];
for (const [file, html] of pages) {
  const pageUrl = file === 'index.html' ? ORIGIN + '/' : ORIGIN + '/' + file;
  const out = rewriteHtml(html, pageUrl);
  fs.writeFileSync(path.join(forumDir, file), out);
  const leftovers = out.match(/https?:\/\/[^"'\\\s)]+/g) || [];
  for (const hit of leftovers) {
    if (/twitter\.com|t\.me|instagram\.com|schema\.org|youtube\.com|youtu\.be/.test(hit)) continue;
    remoteLeft.push(file + ' ' + hit.slice(0, 140));
  }
}

const summary = {
  pages: [...pages.keys()].sort(),
  pageCount: pages.size,
  boards: [...boardUrls.keys()],
  topics: [...topicUrls.keys()].length,
  assetsOk: [...assets.values()].filter(a => a.ok).length,
  assetsFailed: assets.size - [...assets.values()].filter(a => a.ok).length,
  failed: failed.slice(0, 40),
  remoteLeft: remoteLeft.slice(0, 40),
  remoteLeftCount: remoteLeft.length,
};
fs.mkdirSync(path.join(root, 'qa', 'forum'), {recursive: true});
fs.writeFileSync(path.join(root, 'qa', 'forum', 'local-build.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({pageCount: summary.pageCount, topics: summary.topics, assetsOk: summary.assetsOk, assetsFailed: summary.assetsFailed, remoteLeft: summary.remoteLeftCount, failed: failed.length}, null, 2));

// Point Demo states at the signed-in header/sidebar of the right size, and fill the
// logged-in Trading header (balance + notifications) instead of the guest login popup.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const jsDir = path.join(root, 'js');

function loadComponents() {
  const ctx = {window: {SHARED_UI: {register(name, map) { this[name] = map; }}}};
  vm.runInNewContext(fs.readFileSync(path.join(jsDir, 'components/header.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(path.join(jsDir, 'components/sidebar.js'), 'utf8'), ctx);
  return ctx.window.SHARED_UI;
}
const {header: headers, sidebar: sidebars} = loadComponents();
function loadStates(file, prefix) {
  const ctx = {window: {}};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
  return ctx.window[prefix];
}
function endOfElement(html, start) {
  const open = html.slice(start, html.indexOf('>', start) + 1);
  const tag = open.match(/^<([a-zA-Z0-9:-]+)/)[1];
  if (open.endsWith('/>')) return start + open.length;
  const re = new RegExp(`<(/?)${tag}(?=[\\s>])`, 'g');
  re.lastIndex = start + 1;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] === '/') depth--;
    else depth++;
    if (depth === 0) return html.indexOf('>', m.index) + 1;
  }
  throw new Error('unclosed ' + tag);
}
function elementFrom(html, index) {
  const start = html.lastIndexOf('<', index);
  const end = endOfElement(html, start);
  return html.slice(start, end);
}

const signedHeader = headers['header.standard.home-1440x900.8299c65e'];
const balance = elementFrom(signedHeader, signedHeader.indexOf('ce-balance-rendered')).replace(
  '<div data-critical-id="ce-balance-rendered"',
  '<div data-critical-id="ce-balance-rendered" style="grid-area: balance"',
);
const notifBtn = elementFrom(signedHeader, signedHeader.indexOf('header-notification-button'));
const notif = `<div class="buttons_root-CmW73" style="grid-area: notifications">${notifBtn}</div>`;
if (!balance.includes('header-balance-deposit-button') || !balance.includes('0.00')) throw new Error('balance block unexpected');
if (!notifBtn.includes('header-notification-button')) throw new Error('notification block unexpected');

const DESKTOP_HEADER = {
  wide: 'header.standard.home-1920x1080.4a7eadf7',
  desk: 'header.standard.home-1440x900.8299c65e',
  phone: 'header.standard.blog-390x844.fc0e8612',
};
function headerFor(width) {
  if (width >= 1680) return DESKTOP_HEADER.wide;
  if (width >= 1024) return DESKTOP_HEADER.desk;
  return DESKTOP_HEADER.phone;
}
const demoSidebars = Object.entries(sidebars).filter(([, html]) => html.includes('Demo user')).map(([key]) => key);
function widthOf(key) {
  const m = key.match(/(\d+)x\d+/);
  return m ? Number(m[1]) : 0;
}
function sidebarFor(page, width) {
  const desktop = width >= 1024;
  const family = page.split('-')[0];
  let best = null;
  let score = -1;
  for (const key of demoSidebars) {
    const sw = widthOf(key);
    if ((sw >= 1024) !== desktop) continue;
    let sc = 0;
    if (key.includes(page)) sc += 10;
    if (family && key.includes(family + '-')) sc += 4;
    if (sw === width) sc += 2;
    if (sc > score) { score = sc; best = key; }
  }
  return best || (desktop ? 'sidebar.standard.home-1440x900.6f3796a7' : 'sidebar.standard.blog-390x844.3fe4e735');
}
function replaceKind(html, kind, nextId) {
  if (!nextId || !html.includes(`data-shared-component="${kind}`)) return html;
  return html.replace(new RegExp(`data-shared-component="${kind}[^"]+"`, 'g'), `data-shared-component="${nextId}"`);
}
function mobile(html) { return html.includes('tabbar-navigation-menu'); }

function fillTrading(html) {
  const marker = 'grid-area: actions;"></div>';
  if (html.includes(marker) && !html.includes('header-balance-button')) {
    html = html.replace(marker, `grid-area: actions;">${balance}${notif}</div>`);
  }
  const modalAt = html.indexOf('data-testid="modal-layout"');
  if (modalAt > 0 && html.includes('data-testid="game-auth"')) {
    const start = html.lastIndexOf('<div', modalAt);
    const slice = html.slice(start, start + 400);
    if (slice.includes('modal-layout')) {
      const end = endOfElement(html, start);
      const chunk = html.slice(start, end);
      if (chunk.includes('game-auth')) html = html.slice(0, start) + html.slice(end);
    }
  }
  return html;
}

const changed = [];
for (const file of fs.readdirSync(jsDir).filter(f => f.endsWith('-auth.js'))) {
  const page = file.replace(/-auth\.js$/, '');
  const authPath = path.join(jsDir, file);
  const guestPath = path.join(jsDir, page + '.js');
  if (!fs.existsSync(guestPath)) continue;
  const auth = loadStates(authPath, 'AUTH_PAGE_STATES');
  const guest = loadStates(guestPath, 'PAGE_STATES');
  let dirty = false;
  for (const [key, state] of Object.entries(auth)) {
    const g = guest[key];
    if (!g) continue;
    const width = widthOf(key);
    let html = state.html;
    const betwave = page.startsWith('betwave');
    if (betwave && mobile(html) !== mobile(g.html)) html = g.html;
    else if (!betwave && mobile(html) !== mobile(g.html)) {
      html = replaceKind(g.html, 'header.', headerFor(width));
      html = replaceKind(html, 'sidebar.', sidebarFor(page, width));
    }
    if (page === 'trading' || page === 'casino-trading') html = fillTrading(html);
    if ((page === 'trading' || page === 'casino-trading') && width < 768) {
      const at = html.indexOf('style="grid-area: notifications"');
      if (at > 0) {
        const start = html.lastIndexOf('<div', at);
        html = html.slice(0, start) + html.slice(endOfElement(html, start));
      }
    }
    if (html !== state.html) {
      state.html = html;
      dirty = true;
      changed.push(key);
    }
  }
  if (dirty) {
    fs.writeFileSync(authPath, 'window.AUTH_PAGE_STATES=' + JSON.stringify(auth) + ';\n');
  }
}
console.log('updated', changed.length);
console.log(changed.join('\n'));

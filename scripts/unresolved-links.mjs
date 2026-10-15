// List in-site links (data-reference-href) in page states and shared components that have no local page.
// Resolution mirrors routeFile() in js/common.js.
// node scripts/unresolved-links.mjs [--out file.json]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const ctx = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/routes.js'), 'utf8'), ctx);
const pages = ctx.window.PROJECT_ROUTES.pages;
const routeFile = p => {
  p = p.replace(/(.)\/$/, '$1').replace(/^\/betwave(?=\/|$)/, '/en/betwave');
  if (pages[p]) return pages[p];
  const sport = p.match(/^(\/betting\/[^/]+\/)[^/]+-(\d+)$/);
  if (sport) { const key = Object.keys(pages).find(k => k.startsWith(sport[1]) && k.endsWith('-' + sport[2]) && !k.slice(sport[1].length).includes('/')); if (key) return pages[key]; }
  const bw = p.match(/^\/en\/betwave\/(?:(event|prediction)\/[^/]+|bw-\d+(?:\/[^/]*)?)$/);
  return bw ? 'betwave-sample' : undefined;
};
// Game links, /forum and live league listings are answered by navigate() on click (game page or notice).
const handled = p => p.startsWith('/casino/play/') || p === '/forum' || /^\/betting\/[^/]+\/[^/]+\/[^/]+$/.test(p);
const files = [
  ...fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f),
  ...fs.readdirSync(path.join(root, 'js/components')).map(f => 'js/components/' + f),
];
const found = {};
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of text.matchAll(/data-reference-href=\\?"([^"\\]+)/g)) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&'), 'https://one-vv3591.com/'); } catch { continue; }
    if (u.hostname !== 'one-vv3591.com' || u.searchParams.get('x')?.includes('sign-up')) continue;
    if (handled(u.pathname) || routeFile(u.pathname)) continue;
    (found[u.pathname] ||= new Set()).add(f.replace(/^js\//, '').replace(/(-auth|-more)?\.js$/, ''));
  }
}
const out = Object.fromEntries(Object.entries(found).sort().map(([p, s]) => [p, [...s].sort()]));
const i = process.argv.indexOf('--out');
if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(out, null, 1));
console.log(JSON.stringify({unresolved: Object.keys(out).length}));
for (const [p, s] of Object.entries(out)) console.log(p, '<-', s.slice(0, 4).join(', ') + (s.length > 4 ? ` (+${s.length - 4})` : ''));

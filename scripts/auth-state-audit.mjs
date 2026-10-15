// Audit js/<page>-auth.js: does each Demo state's markup belong to the size in its key?
// Phone/tablet layouts carry the bottom tab bar (tabbar-navigation-menu); desktop layouts (>=1024) do not.
// Compares with the guest state of the same key. Run: node scripts/auth-state-audit.mjs [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = file => { const ctx = {window: {}}; vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx); return ctx.window; };
const mobileMarkup = html => html.includes('tabbar-navigation-menu');
const report = {}, bad = [];
for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('-auth.js'))) {
  const page = f.replace(/-auth\.js$/, '');
  const guestFile = path.join(root, 'js', page + '.js');
  const auth = load(path.join(root, 'js', f)).AUTH_PAGE_STATES || {};
  const guest = fs.existsSync(guestFile) ? load(guestFile).PAGE_STATES || {} : {};
  for (const [key, state] of Object.entries(auth)) {
    const size = key.slice(page.length + 1), width = Number(size.split('x')[0]);
    const expectMobile = guest[key] ? mobileMarkup(guest[key].html) : width < 1024;
    const isMobile = mobileMarkup(state.html);
    const row = {expectMobile, isMobile, ok: expectMobile === isMobile};
    report[key] = row;
    if (!row.ok) bad.push(key);
  }
}
const i = process.argv.indexOf('--json');
if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify({bad, report}, null, 1));
console.log(JSON.stringify({states: Object.keys(report).length, mismatched: bad.length, pages: [...new Set(bad.map(k => k.replace(/-\d+x\d+$/, '')))].length}));
console.log(bad.join('\n'));

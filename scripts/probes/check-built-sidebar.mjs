import fs from 'node:fs';
const js = fs.readFileSync('js/components/sidebar.js', 'utf8');
const id = 'sidebar.standard.casino-live-1440x900.fd82742b';
const key = JSON.stringify(id);
const i = js.indexOf(key);
console.log('key index', i);
if (i < 0) process.exit(1);
const start = js.indexOf(':"', i) + 2;
// find matching end - values are JSON stringified in register call
const objStart = js.indexOf('{', js.indexOf('register'));
// simpler: eval the register payload
const m = js.match(/window\.SHARED_UI\.register\("sidebar",(\{[\s\S]*\})\);\s*$/);
if (!m) { console.log('parse fail'); process.exit(1); }
const values = JSON.parse(m[1]);
const html = values[id];
console.log('html len', html?.length);
const i2 = html.indexOf('data-testid="casino-group-toggle"');
const slice = html.slice(i2, i2 + 2500);
const ei = slice.indexOf('expanded-view_expandable');
const after = slice.slice(ei);
const gt = after.indexOf('>');
const chunk = after.slice(gt + 1, gt + 400);
console.log('expand preview', chunk.replace(/\s+/g, ' ').trim().slice(0, 200));
console.log('expand htmlLen rough', (() => {
  // between open expandable and next sibling close - count until items end
  const open = html.indexOf('expanded-view_expandable', i2);
  const tagEnd = html.indexOf('>', open);
  return html.slice(tagEnd + 1, tagEnd + 1 + 200).length;
})());

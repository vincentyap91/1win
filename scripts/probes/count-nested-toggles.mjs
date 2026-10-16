import fs from 'node:fs';
const js = fs.readFileSync('js/components/sidebar.js', 'utf8');
for (const id of ['casino-lobby-toggle','casino-live-toggle','casino-fast-toggle','casino-brand-toggle']) {
  console.log(id, js.split(`data-testid=\\"${id}\\"`).length - 1);
}
// Sample labels under casino expand in home template
const m = js.match(/window\.SHARED_UI\.register\("sidebar",(\{[\s\S]*\})\);\s*$/);
const values = JSON.parse(m[1]);
const html = values['sidebar.standard.casino-live-1440x900.fd82742b'];
const i = html.indexOf('data-testid="casino-group-toggle"');
const slice = html.slice(i, i + 5000);
const labels = [...slice.matchAll(/data-testid="([^"]+)"/g)].map(x => x[1]);
console.log('labels near casino group', labels);

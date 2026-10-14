import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kinds = ['header', 'sidebar', 'footer'];
const all = Object.create(null);
const outputs = [];
for (const kind of kinds) {
  const source = fs.readFileSync(path.join(root, 'components', kind + '.html'), 'utf8');
  const values = {};
  const pattern = /<template data-component="([^"]+)">\r?\n([\s\S]*?)\r?\n<\/template>/g;
  for (const match of source.matchAll(pattern)) {
    if (!match[1].startsWith(kind + '.')) throw new Error('Wrong component family: ' + match[1]);
    if (Object.hasOwn(all, match[1])) throw new Error('Duplicate component: ' + match[1]);
    values[match[1]] = match[2];
    all[match[1]] = match[2];
  }
  if (!Object.keys(values).length) throw new Error('No components in ' + kind + '.html');
  const openingCount = (source.match(/<template data-component=/g) || []).length;
  if (openingCount !== Object.keys(values).length) throw new Error('Malformed template wrapper: ' + kind);
  outputs.push([path.join(root, 'js', 'components', kind + '.js'), 'window.SHARED_UI.register(' + JSON.stringify(kind) + ',' + JSON.stringify(values) + ');\n']);
}
const slotPattern = /<template data-shared-component="([^"]+)"><\/template>/g;
function check(value, label) {
  for (const match of value.matchAll(slotPattern)) if (!Object.hasOwn(all, match[1])) throw new Error(label + ': missing ' + match[1]);
}
for (const filename of fs.readdirSync(root).filter(x => x.endsWith('.html'))) check(fs.readFileSync(path.join(root, filename), 'utf8'), filename);
for (const filename of fs.readdirSync(path.join(root, 'js')).filter(x => x.endsWith('.js'))) {
  const value = fs.readFileSync(path.join(root, 'js', filename), 'utf8');
  if (/^window\.(?:PAGE_STATES|AUTH_PAGE_STATES|SIDEBAR_STATES)=/.test(value)) {
    const states = JSON.parse(value.slice(value.indexOf('=') + 1).trim().replace(/;$/, ''));
    for (const [name, state] of Object.entries(states)) check(state.html, filename + ':' + name);
  }
}
fs.mkdirSync(path.join(root, 'js', 'components'), { recursive: true });
for (const [filename, value] of outputs) fs.writeFileSync(filename, value);
console.log(JSON.stringify({ sharedComponents: Object.keys(all).length, generated: outputs.map(([file]) => path.relative(root, file)), missingComponents: 0 }));

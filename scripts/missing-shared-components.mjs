// List shared-component names referenced by page states that js/components/*.js do not define.
// node scripts/missing-shared-components.mjs [page ...]
import fs from 'node:fs';

const defined = new Set();
for (const f of fs.readdirSync('js/components')) {
  for (const m of fs.readFileSync('js/components/' + f, 'utf8').matchAll(/"([\w.-]+)"\s*:/g)) defined.add(m[1]);
}
const pages = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync('.').filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const out = {};
for (const page of pages) {
  for (const suffix of ['', '-auth']) {
    const file = `js/${page}${suffix}.js`;
    if (!fs.existsSync(file)) continue;
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/data-shared-component=\\?"([^"\\]+)/g)) {
      if (!defined.has(m[1])) (out[m[1]] ||= new Set()).add(page + suffix);
    }
  }
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v].slice(0, 6).concat(v.size > 6 ? [`+${v.size - 6}`] : [])])), null, 1));

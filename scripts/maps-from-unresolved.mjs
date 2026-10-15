// Turn unresolved-links.mjs output into capture maps (page name -> route) for reference-capture-cdp.mjs.
// node scripts/maps-from-unresolved.mjs <unresolved.json> <outdir> <prefix>...
// Each prefix (e.g. /blog/ or /en/betwave/events/) gets its own map file, named after the prefix.
import fs from 'node:fs';
import path from 'node:path';

const [src, outDir, ...prefixes] = process.argv.slice(2);
const routes = Object.keys(JSON.parse(fs.readFileSync(src, 'utf8')));
const pageName = route => decodeURIComponent(route).replace(/^\/en\//, '/').replace(/^\//, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
fs.mkdirSync(outDir, {recursive: true});
for (const prefix of prefixes) {
  const map = Object.fromEntries(routes.filter(r => r.startsWith(prefix)).map(r => [pageName(r), r]));
  const file = path.join(outDir, 'map-' + prefix.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '.json');
  fs.writeFileSync(file, JSON.stringify(map, null, 1));
  console.log(file, Object.keys(map).length);
}

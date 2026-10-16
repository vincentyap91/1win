
import fs from 'node:fs';
const h = fs.readFileSync('components/sidebar.html', 'utf8');
const toggles = ['casino-group-toggle','betting-group-toggle','markets-toggle','betwave-toggle'];
const results = [];
for (const id of toggles) {
  let from = 0, hits = [];
  while (true) {
    const i = h.indexOf('data-testid="' + id + '"', from);
    if (i < 0) break;
    const slice = h.slice(i, i + 8000);
    const exp = slice.match(/<div class="[^"]*expanded-view_expandable[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    const inner = exp ? exp[1] : '';
    const labels = [...inner.matchAll(/data-testid="menu-item-([^"]+)"/g)].map(m => m[1]);
    hits.push({ at: i, htmlLen: inner.length, labels: labels.slice(0, 12), labelCount: labels.length });
    from = i + id.length;
  }
  results.push({ id, count: hits.length, sample: hits[0] || null, nonempty: hits.filter(x => x.htmlLen > 50).length });
}
console.log(JSON.stringify(results, null, 2));

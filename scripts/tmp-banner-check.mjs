import fs from 'node:fs';

const js = fs.readFileSync('js/casino.js', 'utf8');
const key = '"casino-768x1024"';
const idx = js.indexOf(key);
const chunk = js.slice(idx, idx + 80000);
const root = chunk.match(/banners-carousel_root[^>]{0,300}/);
console.log('root', root?.[0]?.slice(0, 280));
const styles = [...chunk.matchAll(/style="([^"]*aspect[^"]*)"/gi)].slice(0, 8);
console.log('styles', styles.map(s => s[1].slice(0, 120)));
const vars = [...chunk.matchAll(/--[a-z0-9-]+:\s*[^;"]+/gi)].filter(m => /aspect|banner|ratio|height/i.test(m[0])).slice(0, 20);
console.log('vars', vars.map(v => v[0]));

// Compare 1440 vs 768 banner container snippet lengths / aspect vars from PAGE_STATES via regex on full file
for (const size of ['1440x900', '768x1024', '430x932', '390x844']) {
  const i = js.indexOf(`"casino-${size}"`);
  const c = js.slice(i, i + 30000);
  const m = c.match(/banners-carousel_root-[^"]*"[^>]*/);
  console.log('\n', size, m?.[0]?.slice(0, 220));
}

import fs from 'node:fs';
const home = fs.readFileSync('js/home.js', 'utf8');
const m = home.match(/data-shared-component=\\"([^\\"]*sidebar[^\\"]*)\\"/);
const m2 = home.match(/data-shared-component="([^"]*sidebar[^"]*)"/);
console.log('slot from escaped', m?.[1] || null);
console.log('slot from plain', m2?.[1] || null);
// Also search first occurrence of casino-group-toggle near expandable emptiness in PAGE_STATES
const idx = home.indexOf('casino-group-toggle');
console.log('toggle in home.js', idx);
if (idx > 0) {
  const slice = home.slice(idx, idx + 1200);
  console.log(slice.slice(0, 800));
}
const sidebarHtml = fs.readFileSync('components/sidebar.html', 'utf8');
const ids = [...sidebarHtml.matchAll(/data-component-id="([^"]+)"/g)].map(x => x[1]);
console.log('component ids count', ids.length);
console.log('sample ids', ids.filter(id => id.includes('home') || id.includes('1440')).slice(0, 20));
const ao = ids.filter(id => id.includes('home-1440'));
console.log('home-1440 ids', ao);

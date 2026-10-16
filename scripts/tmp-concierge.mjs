import fs from 'node:fs';
const js = fs.readFileSync('js/vip-club.js', 'utf8');
let from = 0, n = 0;
while (n < 6) {
  const i = js.indexOf('concierge-service', from);
  if (i < 0) break;
  n++;
  const slice = js.slice(i, i + 400).replace(/\\"/g, '"');
  console.log('\n---', n, i, '---');
  console.log(slice.slice(0, 350));
  from = i + 20;
}
const ind = js.indexOf('variant-2_indicator-EvuSH');
console.log('\nindicator idx', ind);
if (ind > 0) console.log(js.slice(ind - 80, ind + 700).replace(/\\"/g, '"'));

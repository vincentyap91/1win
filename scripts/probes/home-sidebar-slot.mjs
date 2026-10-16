import fs from 'node:fs';
const home = fs.readFileSync('js/home.js', 'utf8');
const states = JSON.parse(home.slice(home.indexOf('=') + 1).trim().replace(/;$/, ''));
const state = states['home-1440x900'];
const slots = [...state.html.matchAll(/data-shared-component="([^"]+)"/g)].map(m => m[1]);
console.log('slots', slots);
const sidebarId = slots.find(s => s.startsWith('sidebar.'));
console.log('sidebarId', sidebarId);

const source = fs.readFileSync('components/sidebar.html', 'utf8');
const re = new RegExp(`<template data-component="${sidebarId.replace(/\./g, '\\.')}">\\r?\\n([\\s\\S]*?)\\r?\\n</template>`);
const m = source.match(re);
if (!m) {
  console.log('NOT FOUND in components/sidebar.html');
  // list similar
  const ids = [...source.matchAll(/data-component="([^"]+)"/g)].map(x => x[1]);
  console.log('similar', ids.filter(id => id.includes('home') || id.includes(sidebarId?.split('.')[2] || 'x')).slice(0, 30));
  process.exit(0);
}
const html = m[1];
console.log('aside class', html.match(/sidebar_root-[^\s"]+/)?.[0]);
for (const id of ['casino-group-toggle','betting-group-toggle','markets-toggle','betwave-toggle']) {
  const i = html.indexOf(`data-testid="${id}"`);
  if (i < 0) { console.log(id, 'MISSING'); continue; }
  const slice = html.slice(i, i + 4000);
  const exp = slice.match(/expanded-view_expandable[^"]*"[^>]*>([\s\S]*?)$/);
  // find expandable after toggle
  const ei = slice.indexOf('expanded-view_expandable');
  if (ei < 0) { console.log(id, 'no expandable nearby'); continue; }
  const after = slice.slice(ei);
  const gt = after.indexOf('>');
  // crude: take until itemsContainer closes - measure first 800 chars
  const chunk = after.slice(gt + 1, gt + 1 + 800);
  const labels = [...chunk.matchAll(/data-testid="([^"]+)"/g)].map(x => x[1]);
  console.log(id, { htmlStartLen: chunk.trim().length, labels: labels.slice(0, 10), chunkPreview: chunk.replace(/\s+/g,' ').trim().slice(0, 180) });
}

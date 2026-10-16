import fs from 'node:fs';
const js = fs.readFileSync('js/components/sidebar.js', 'utf8');
const m = js.match(/window\.SHARED_UI\.register\("sidebar",(\{[\s\S]*\})\);\s*$/);
const values = JSON.parse(m[1]);
const id = 'sidebar.standard.casino-live-1440x900.fd82742b';
const html = values[id];

function analyze(html, label) {
  const toggles = ['casino-group-toggle','betting-group-toggle','markets-toggle','betwave-toggle'];
  const rows = [];
  for (const tid of toggles) {
    let from = 0, n = 0;
    while (true) {
      const i = html.indexOf(`data-testid="${tid}"`, from);
      if (i < 0) break;
      n++;
      const slice = html.slice(i, i + 6000);
      const ei = slice.indexOf('expanded-view_expandable');
      if (ei < 0) { rows.push({tid, n, error: 'no expandable'}); from = i + tid.length; continue; }
      const after = slice.slice(ei);
      const gt = after.indexOf('>');
      // get inner until we hit a reasonable close - match first child structure
      const innerStart = gt + 1;
      // Find matching close for expandable div: look for itemsContainer presence and length until </div></div> after items
      const inner = after.slice(innerStart, innerStart + 50);
      const hasItems = after.includes('expanded-view_itemsContainer');
      // measure content between > and the next section or empty
      let depth = 1, p = innerStart, end = innerStart;
      const full = after; // from expandable open tag start... actually after includes class=...
      // better: from character after >
      const src = html.slice(html.indexOf('expanded-view_expandable', i));
      const openGt = src.indexOf('>');
      let d = 1, j = openGt + 1;
      while (j < src.length && d > 0) {
        if (src.startsWith('</div>', j)) { d--; j += 6; if (d === 0) { end = j - 6; break; } }
        else if (src.startsWith('<div', j)) { d++; j += 4; }
        else j++;
      }
      const innerHtml = src.slice(openGt + 1, end);
      rows.push({ tid, n, htmlLen: innerHtml.length, hasItems, preview: innerHtml.replace(/\s+/g,' ').trim().slice(0, 100) });
      from = i + tid.length;
    }
    if (!n) rows.push({ tid, n: 0 });
  }
  console.log(label, JSON.stringify(rows, null, 2));
}

analyze(html, 'built-fd82742b');

// Also check components source
const source = fs.readFileSync('components/sidebar.html', 'utf8');
const re = new RegExp(`<template data-component="${id.replace(/\./g,'\\.')}">\\r?\\n([\\s\\S]*?)\\r?\\n</template>`);
const sm = source.match(re);
analyze(sm[1], 'source-fd82742b');

// Count how many templates have nonempty casino expand
let filled = 0, empty = 0;
for (const [cid, h] of Object.entries(values)) {
  const i = h.indexOf('data-testid="casino-group-toggle"');
  if (i < 0) continue;
  const slice = h.slice(i, i + 2000);
  const ei = slice.indexOf('expanded-view_expandable');
  if (ei < 0) continue;
  const after = slice.slice(ei);
  const has = after.includes('expanded-view_itemsContainer');
  if (has) filled++; else empty++;
}
console.log(JSON.stringify({ templatesWithCasinoToggle: filled + empty, filled, empty }));

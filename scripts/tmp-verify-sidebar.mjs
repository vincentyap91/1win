import fs from 'node:fs';

for (const f of ['js/home.js', 'js/index.js', 'js/common.js']) {
  if (!fs.existsSync(f)) continue;
  const t = fs.readFileSync(f, 'utf8');
  console.log(
    f,
    'shared sidebar refs',
    (t.match(/data-shared-component="sidebar\.[^"]+"/g) || []).slice(0, 5),
    'empty expand',
    (t.match(/expanded-view_expandable-DJsWU" inert=""><\/div>/g) || []).length,
    'lobby',
    t.includes('sidebar-navigation-casino-lobby')
  );
}

// What does index actually request after render?
const probe = `
await sleep(1000);
const slot = document.querySelector('[data-shared-component]');
const asides = [...document.querySelectorAll('[class*="sidebar_root"]')];
const html = asides[0]?.outerHTML || '';
return {
  remainingSlots: [...document.querySelectorAll('[data-shared-component]')].map(n => n.getAttribute('data-shared-component')),
  asideCount: asides.length,
  hasLobby: html.includes('sidebar-navigation-casino-lobby'),
  emptyExpand: (html.match(/expanded-view_expandable-DJsWU" inert=""><\\/div>/g) || []).length,
  sharedIds: (html.match(/data-component="[^"]+"/g) || []).slice(0, 3),
  state: document.body.dataset.state,
  page: document.body.dataset.page,
  firstExpandSnippet: html.includes('expanded-view_expandable')
    ? html.slice(html.indexOf('expanded-view_expandable') - 80, html.indexOf('expanded-view_expandable') + 120)
    : null,
};
`;
fs.writeFileSync('scripts/probes/local-sidebar-expand-inspect.js', probe);
import { spawnSync } from 'node:child_process';
const r = spawnSync(
  'C:\\Program Files\\nodejs\\node.exe',
  [
    '--experimental-websocket',
    'scripts/local-run-cdp.mjs',
    '--page',
    'index.html',
    '--script',
    'scripts/probes/local-sidebar-expand-inspect.js',
    '--sizes',
    '1440x900',
    '--http',
    '--settle',
    '3500',
    '--out',
    'qa/sidebar-expand-inspect.json',
  ],
  { encoding: 'utf8' }
);
console.log(r.stdout);
console.log(fs.readFileSync('qa/sidebar-expand-inspect.json', 'utf8'));

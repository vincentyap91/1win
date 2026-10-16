/**
 * Fix casino-1920 / casino-768 sidebars where nested casino-* expandables
 * were wrongly filled with top-level Sports/Markets/Betwave panels.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sidebarPath = path.join(root, 'components/sidebar.html');
let html = fs.readFileSync(sidebarPath, 'utf8');

const donorId = 'sidebar.standard.home-1440x900.6f3796a7';
const donorStart = html.indexOf('data-component="' + donorId + '"');
const donorBody = html.slice(donorStart, donorStart + html.slice(donorStart).indexOf('</template>'));

function extractPanel(body, toggleTestId) {
  const toggle = `data-testid="${toggleTestId}"`;
  const ti = body.indexOf(toggle);
  if (ti < 0) throw new Error('missing toggle ' + toggleTestId);
  const ei = body.indexOf('expanded-view_expandable-DJsWU', ti);
  if (ei < 0) throw new Error('missing expandable after ' + toggleTestId);
  const divStart = body.lastIndexOf('<div class="expanded-view_expandable-DJsWU', ei);
  // find matching close for this expandable: first </div></div></div> pattern after items — use depth parse
  let i = divStart;
  let depth = 0;
  let end = -1;
  while (i < body.length) {
    if (body.startsWith('<div', i)) {
      depth++;
      i = body.indexOf('>', i) + 1;
      continue;
    }
    if (body.startsWith('</div>', i)) {
      depth--;
      i += 6;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) throw new Error('unclosed expandable ' + toggleTestId);
  return body.slice(divStart, end);
}

const sportsPanel = extractPanel(donorBody, 'betting-group-toggle');
const marketsPanel = extractPanel(donorBody, 'markets-toggle');
const betwavePanel = extractPanel(donorBody, 'betwave-toggle');
const emptyPanel = '<div class="expanded-view_expandable-DJsWU" inert=""></div>';

function replaceExpandableAfter(body, toggleTestId, panelHtml) {
  const toggle = `data-testid="${toggleTestId}"`;
  const ti = body.indexOf(toggle);
  if (ti < 0) throw new Error('missing ' + toggleTestId);
  const ei = body.indexOf('expanded-view_expandable-DJsWU', ti);
  const divStart = body.lastIndexOf('<div class="expanded-view_expandable-DJsWU', ei);
  let i = divStart;
  let depth = 0;
  let end = -1;
  while (i < body.length) {
    if (body.startsWith('<div', i)) {
      depth++;
      i = body.indexOf('>', i) + 1;
      continue;
    }
    if (body.startsWith('</div>', i)) {
      depth--;
      i += 6;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  return body.slice(0, divStart) + panelHtml + body.slice(end);
}

const targets = [
  'sidebar.standard.casino-1920x1080.f1117c71',
  'sidebar.standard.casino-768x1024.c815cd79',
];

for (const id of targets) {
  const marker = `data-component="${id}"`;
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) throw new Error('missing template ' + id);
  const openEnd = html.indexOf('>', markerAt) + 1;
  // skip optional newline after >
  let bodyStart = openEnd;
  if (html[bodyStart] === '\r') bodyStart++;
  if (html[bodyStart] === '\n') bodyStart++;
  const close = html.indexOf('</template>', bodyStart);
  let body = html.slice(bodyStart, close);
  // trim trailing newline before </template>
  if (body.endsWith('\n')) body = body.slice(0, -1);
  if (body.endsWith('\r')) body = body.slice(0, -1);
  const closePrefix = html.slice(bodyStart + body.length, close); // newlines kept when writing back

  // Nested casino dynamic presets: restore empty expandables
  for (const t of ['casino-lobby-toggle', 'casino-live-toggle', 'casino-fast-toggle']) {
    if (body.includes(`data-testid="${t}"`)) body = replaceExpandableAfter(body, t, emptyPanel);
  }
  body = replaceExpandableAfter(body, 'betting-group-toggle', sportsPanel);
  body = replaceExpandableAfter(body, 'markets-toggle', marketsPanel);
  body = replaceExpandableAfter(body, 'betwave-toggle', betwavePanel);

  html = html.slice(0, bodyStart) + body + closePrefix + html.slice(close);
  console.log('fixed', id);
}

fs.writeFileSync(sidebarPath, html);

const node24 = 'C:\\Program Files\\nodejs\\node.exe';
const build = spawnSync(node24, [path.join(root, 'scripts/build-components.mjs')], {
  cwd: root,
  encoding: 'utf8',
});
console.log(build.stdout);
if (build.status !== 0) {
  console.error(build.stderr);
  process.exit(1);
}

// Verify
const h2 = fs.readFileSync(sidebarPath, 'utf8');
for (const id of targets) {
  const start = h2.indexOf('data-component="' + id + '"');
  const body = h2.slice(start, start + h2.slice(start).indexOf('</template>'));
  let from = 0;
  console.log('\nverify', id);
  while (true) {
    const i = body.indexOf('expanded-view_expandable-DJsWU', from);
    if (i < 0) break;
    const before = body.slice(Math.max(0, i - 400), i);
    const testid = (before.match(/data-testid="([^"]+)"/g) || []).pop();
    const empty = body.slice(i, i + 80).includes('inert=""></div>');
    const hasItems = body.slice(i, i + 200).includes('expanded-view_items');
    console.log(' ', testid, { empty, hasItems });
    from = i + 30;
  }
}

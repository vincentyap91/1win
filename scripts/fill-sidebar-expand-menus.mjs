/**
 * Fill empty sidebar expand menus (Casino / Sports / Markets / Betwave)
 * from the live SDUI menu tree on one-vv3591.com.
 *
 * Usage: node scripts/fill-sidebar-expand-menus.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://v3.bundlecdn.com';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'user-agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          httpsGet(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode !== 200) reject(new Error(`${url}: ${res.statusCode}`));
          else resolve(buf.toString('utf8'));
        });
      })
      .on('error', reject);
  });
}

const GROUPS = [
  {
    id: 'casino',
    items: [
      { id: 'casino-lobby', title: 'Lobby', href: 'casino.html', ref: '/casino', icon: 'casino-lobby-v2.svg' },
      { id: 'casino-live', title: 'Live Casino', href: 'casino-live.html', ref: '/casino/live-games', icon: 'casino-live.svg' },
      { id: 'casino-fast', title: 'Quick games', href: 'casino-quick.html', ref: '/casino/fast-games', icon: 'casino-fast.svg' },
      { id: 'casino-brand', title: '1win games', href: 'casino-1win.html', ref: '/casino/1win-games', icon: 'casino-brand-inline.svg' },
    ],
  },
  {
    id: 'sports',
    items: [
      { id: 'betting-main', title: 'Sports', href: 'sports.html', ref: '/betting', icon: 'betting-main.svg' },
      { id: 'betting-live', title: 'Live', href: 'sports-live.html', ref: '/betting/live', icon: 'betting-live.svg' },
      { id: 'betting-prematch', title: 'Prematch', href: 'sports-upcoming.html', ref: '/betting/prematch', icon: 'betting-prematch.svg' },
      { id: 'betting-topbets', title: 'Top Bets', href: 'sports-topbets.html', ref: '/betting/topbets', icon: 'betting-topbets.svg' },
      { id: 'betting-cybersport', title: 'Esports', href: 'sports-esports.html', ref: '/betting/esport', icon: 'betting-cybersport.svg' },
      { id: 'betting-bets-history', title: 'Bet History', href: 'sports-bets-history.html', ref: '/betting/bets-history', icon: 'betting-bets-history.svg' },
    ],
  },
  {
    id: 'markets',
    items: [
      { id: 'markets-crypto-live', title: 'Crypto Live', href: 'sports-markets-crypto-live.html', ref: '/betting/markets/crypto-live-2072', icon: 'crypto-live.svg' },
      { id: 'markets-politics', title: 'Politics', href: 'sports-markets-politics.html', ref: '/betting/markets/politics-1032', icon: 'politics.svg' },
    ],
  },
  {
    id: 'betwave',
    items: [
      { id: 'betwave-all-predictions', title: 'All predictions', href: 'betwave-predictions-all.html', ref: '/en/betwave/predictions/all', icon: 'betwave-all-forecasts.svg' },
      { id: 'betwave-express', title: 'Multiples', href: 'betwave-predictions-express.html', ref: '/en/betwave/predictions/express', icon: 'betwave-forecasts-express.svg' },
      { id: 'betwave-today', title: 'Today', href: 'betwave-predictions-all.html', ref: '/en/betwave/predictions/all?period=today', icon: 'betwave-forecasts-today.svg' },
      { id: 'betwave-tomorrow', title: 'Tomorrow', href: 'betwave-predictions-all.html', ref: '/en/betwave/predictions/all?period=tomorrow', icon: 'betwave-forecasts-tomorrow.svg' },
      { id: 'betwave-top-events', title: 'Top events', href: 'betwave-events-all.html', ref: '/en/betwave/events/all', icon: 'betwave-top.svg' },
      { id: 'betwave-top-predictors', title: 'Top predictors', href: 'betwave-predictors.html', ref: '/en/betwave/predictors', icon: 'betwave-statistics.svg' },
      { id: 'betwave-create', title: 'Create prediction', href: 'betwave-create.html', ref: '/en/betwave/create', icon: 'betwave-create-forecast.svg' },
    ],
  },
];

function hashMask(dataUrl) {
  return '--m-' + crypto.createHash('sha256').update(dataUrl).digest('hex').slice(0, 12);
}

function toDataUrl(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

async function fetchIcon(name) {
  const url = `${CDN}/b02632/plain/route/sidebar/${name}`;
  const text = await httpsGet(url);
  if (!text.includes('<svg')) throw new Error(`icon ${name}: not svg (${text.slice(0, 80)})`);
  return text;
}

function leafLink({ id, title, href, ref, mask }) {
  return (
    `<div class="tooltip_root-2Fdac"><div class="tooltip_trigger-2Fdac">` +
    `<a href="${href}" class="base_root-ht1p8" data-testid="sidebar-navigation-${id}" data-reference-href="${ref}">` +
    `<div class="base_icon-ht1p8"><div style="display: contents;"><div class="menu-icon_iconContainer-2Ndwa">` +
    `<div class="menu-icon_maskedIcon-2Ndwa menu-icon_icon-2Ndwa" style="mask-image: var(${mask});"></div>` +
    `</div></div></div>` +
    `<div class="base_contentWrapper-ht1p8"><div class="base_content-ht1p8"><div style="display: contents;">${title}</div></div></div>` +
    `</a></div></div>`
  );
}

function expandableHtml(items) {
  const links = items.map(leafLink).join('');
  return (
    `<div class="expanded-view_expandable-DJsWU" inert="">` +
    `<div class="expanded-view_itemsContainer-DJsWU"><div class="expanded-view_items-DJsWU">${links}</div></div>` +
    `</div>`
  );
}

function loadMaskMap(cssPath) {
  const map = new Map();
  if (!fs.existsSync(cssPath)) return map;
  const css = fs.readFileSync(cssPath, 'utf8');
  for (const m of css.matchAll(/(--m-[0-9a-f]{12}):\s*url\("([^"]+)"\)/g)) {
    map.set(m[2], m[1]);
  }
  return map;
}

function writeMasks(cssPath, map) {
  const entries = [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const body = ':root{\n' + entries.map(([d, n]) => `${n}: url("${d}");\n`).join('') + '}\n';
  fs.writeFileSync(cssPath, '/* Shared inline mask images (scripts/dedupe-inline-masks.py). */\n' + body);
}

function fillTemplateBody(body, panels) {
  const empty = 'expanded-view_expandable-DJsWU" inert=""></div>';
  let idx = 0;
  let out = '';
  let cursor = 0;
  while (idx < panels.length) {
    const pos = body.indexOf(empty, cursor);
    if (pos < 0) break;
    // include leading `class="` match: find start of the empty expandable div
    const divStart = body.lastIndexOf('<div class="expanded-view_expandable-DJsWU"', pos);
    if (divStart < 0 || divStart < cursor) break;
    out += body.slice(cursor, divStart);
    out += panels[idx];
    cursor = pos + empty.length;
    idx++;
  }
  if (idx !== panels.length) return null;
  out += body.slice(cursor);
  return out;
}

async function main() {
  const iconsNeeded = [...new Set(GROUPS.flatMap((g) => g.items.map((i) => i.icon)))];
  const maskMap = loadMaskMap(path.join(root, 'css/inline-masks.css'));
  const iconToMask = {};

  for (const name of iconsNeeded) {
    process.stdout.write(`fetch ${name}… `);
    const svg = await fetchIcon(name);
    const dataUrl = toDataUrl(svg);
    let mask = maskMap.get(dataUrl);
    if (!mask) {
      mask = hashMask(dataUrl);
      maskMap.set(dataUrl, mask);
    }
    iconToMask[name] = mask;
    console.log(mask);
  }
  writeMasks(path.join(root, 'css/inline-masks.css'), maskMap);

  const panels = GROUPS.map((g) =>
    expandableHtml(
      g.items.map((item) => ({
        ...item,
        mask: iconToMask[item.icon],
      }))
    )
  );

  const sidebarPath = path.join(root, 'components/sidebar.html');
  let html = fs.readFileSync(sidebarPath, 'utf8');
  const pattern = /(<template data-component="([^"]+)">\r?\n)([\s\S]*?)(\r?\n<\/template>)/g;
  let filled = 0;
  let skipped = 0;
  html = html.replace(pattern, (full, open, id, body, close) => {
    if (!body.includes('expanded-view_expandable-DJsWU" inert=""></div>')) {
      skipped++;
      return full;
    }
    // Only fill templates that have the four group toggles
    const emptyCount = (body.match(/expanded-view_expandable-DJsWU" inert=""><\/div>/g) || []).length;
    if (emptyCount < 4) {
      skipped++;
      return full;
    }
    // Replace first 4 empty expandables in order Casino/Sports/Markets/Betwave
    let replaced = 0;
    const next = body.replace(/<div class="expanded-view_expandable-DJsWU" inert=""><\/div>/g, () => {
      if (replaced < 4) return panels[replaced++];
      return '<div class="expanded-view_expandable-DJsWU" inert=""></div>';
    });
    if (replaced !== 4) {
      skipped++;
      return full;
    }
    filled++;
    return open + next + close;
  });

  fs.writeFileSync(sidebarPath, html);

  // Rebuild js/components/sidebar.js from components
  const { spawnSync } = await import('node:child_process');
  const build = spawnSync(process.execPath, [path.join(root, 'scripts/build-components.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  if (build.status !== 0) {
    console.error(build.stdout, build.stderr);
    throw new Error('build-components failed');
  }

  // Extend REFERENCE_SIDEBAR_ICONS with submenu icons
  const dialogsPath = path.join(root, 'js/dialogs.js');
  let dialogs = fs.readFileSync(dialogsPath, 'utf8');
  const iconEntries = GROUPS.flatMap((g) =>
    g.items.map((item) => {
      const mask = iconToMask[item.icon];
      const htmlIcon =
        `<div class="menu-icon_iconContainer-2Ndwa"><div class="menu-icon_maskedIcon-2Ndwa menu-icon_icon-2Ndwa" style="mask-image: var(${mask});"></div></div>`;
      return [JSON.stringify('sidebar-navigation-' + item.id), JSON.stringify(htmlIcon)];
    })
  );
  const inject = iconEntries.map(([k, v]) => `${k}:${v}`).join(',');
  if (!dialogs.includes('sidebar-navigation-casino-lobby')) {
    dialogs = dialogs.replace(
      /window\.REFERENCE_SIDEBAR_ICONS=\{/,
      `window.REFERENCE_SIDEBAR_ICONS={${inject},`
    );
    fs.writeFileSync(dialogsPath, dialogs);
  }

  console.log(
    JSON.stringify(
      {
        filledTemplates: filled,
        skippedTemplates: skipped,
        icons: iconToMask,
        build: JSON.parse(build.stdout || '{}'),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

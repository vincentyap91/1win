import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

for (const f of ['promotions.html', 'js/promotions.js', 'js/promotions-modals.js', 'promotion-halloween-2026.html']) {
  if (!fs.existsSync(f)) {
    console.log('missing', f);
    continue;
  }
  const t = fs.readFileSync(f, 'utf8');
  console.log(f, 'data:,', (t.match(/data:,/g) || []).length, 'size', t.length);
}

// Quick functional check: serve + probe expand menus on index
const serve = spawnSync(
  'C:\\Program Files\\nodejs\\node.exe',
  ['scripts/serve.mjs'],
  { detached: true, stdio: 'ignore', env: { ...process.env, PORT: '4174' } }
);
console.log('serve spawn pid hint', serve.pid);

import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const targets = [
  'js/promotions.js',
  'js/promotions-auth.js',
  'js/promotions-modals.js',
  'js/promotion-halloween-2026.js',
  'js/promotion-halloween-2026-auth.js',
];
for (const f of targets) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.log(f, 'missing'); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const src = (t.match(/src=\\"data:,\\"/g) || []).length + (t.match(/src="data:,"/g) || []).length;
  const any = (t.match(/data:,/g) || []).length;
  console.log(JSON.stringify({ f, srcPlaceholders: src, anyDataUri: any, size: t.length }));
}

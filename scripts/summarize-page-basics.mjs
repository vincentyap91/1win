// Summarise local-run-cdp output of scripts/probes/local-page-basics.js.
// node scripts/summarize-page-basics.mjs qa/.../guest.json [--auth]
import fs from 'node:fs';

const file = process.argv[2], auth = process.argv.includes('--auth');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
// Game links open casino-play.html and /forum shows the external-site notice on click; neither needs an href.
const handledOnClick = p => p.startsWith('/casino/play/') || p === '/forum';
const problems = [], unresolved = {};
for (const [key, v] of Object.entries(data)) {
  const [page, size] = key.split('@'), r = v.value || {};
  const expected = page.replace(/\.html$/, '') + '-' + size;
  if (r.state !== expected) problems.push({key, issue: 'state', got: r.state});
  if (r.hscroll) problems.push({key, issue: 'horizontal scroll'});
  if (r.brokenImages?.length) problems.push({key, issue: 'broken images', list: r.brokenImages});
  if (v.errors?.length) problems.push({key, issue: 'console', list: v.errors.slice(0, 3)});
  if (auth && !r.signed) problems.push({key, issue: 'not signed'});
  for (const p of r.unresolved || []) if (!handledOnClick(p)) (unresolved[p] ||= new Set()).add(page);
}
console.log(JSON.stringify({
  checked: Object.keys(data).length, problems,
  unresolvedRoutes: Object.fromEntries(Object.entries(unresolved).sort().map(([p, s]) => [p, [...s].length])),
}, null, 1));

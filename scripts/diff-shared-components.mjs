// Show where two shared components first differ, and the class/attribute tokens only one of them has.
// node scripts/diff-shared-components.mjs <state-key-a> <state-key-b> [header|sidebar|footer]
import fs from 'node:fs';
import vm from 'node:vm';

const [a, b, kind = 'sidebar'] = process.argv.slice(2);
const componentOf = key => {
  const page = key.replace(/-\d+x\d+$/, '');
  const ctx = {window: {}};
  vm.runInNewContext(fs.readFileSync(`js/${page}.js`, 'utf8'), ctx);
  const html = ctx.window.PAGE_STATES[key].html;
  return html.match(new RegExp(`data-shared-component="(${kind}\\.[^"]+)"`))?.[1];
};
const store = {};
vm.runInNewContext(fs.readFileSync(`js/components/${kind}.js`, 'utf8'), {window: {SHARED_UI: {register: (_, map) => Object.assign(store, map)}}});
const [ka, kb] = [componentOf(a), componentOf(b)];
const [ha, hb] = [store[ka], store[kb]];
console.log({ka, kb, lenA: ha?.length, lenB: hb?.length});
if (!ha || !hb) process.exit(1);
let i = 0; while (i < ha.length && ha[i] === hb[i]) i++;
console.log('first difference at', i);
console.log('A:', ha.slice(Math.max(0, i - 200), i + 300));
console.log('B:', hb.slice(Math.max(0, i - 200), i + 300));
const tokens = h => new Set(h.match(/class="[^"]*"/g)?.flatMap(c => c.slice(7, -1).split(/\s+/)) || []);
const [ta, tb] = [tokens(ha), tokens(hb)];
console.log('classes only in A:', [...ta].filter(t => !tb.has(t)).slice(0, 30));
console.log('classes only in B:', [...tb].filter(t => !ta.has(t)).slice(0, 30));

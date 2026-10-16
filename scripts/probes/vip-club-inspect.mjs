import fs from 'fs';
import vm from 'vm';

const s = fs.readFileSync('js/vip-club.js', 'utf8');
const ctx = { window: {}, PAGE_STATES: null };
vm.runInNewContext(s + '\nthis.PAGE_STATES = window.PAGE_STATES;', ctx);
const obj = ctx.PAGE_STATES || ctx.window.PAGE_STATES;
const keys = Object.keys(obj);
console.log('states', keys.join(', '));

for (const key of ['vip-club-1440x900', 'vip-club-390x844']) {
  const h = obj[key]?.html || '';
  console.log('\n===', key, 'html', h.length, '===');
  console.log('arrows-scroll roots', (h.match(/arrows-scroll-view_root/g) || []).length);
  console.log('VIP manager', h.includes('VIP manager'));
  console.log('Concierge', h.includes('Concierge'));
  const titles = [...h.matchAll(/>([^<]{3,80})</g)]
    .map(m => m[1].replace(/\s+/g, ' ').trim())
    .filter(t => /[A-Za-z]/.test(t) && t.length < 80 && !/[{};]/.test(t) && !t.startsWith('http') && !t.includes('clip'));
  const interesting = [...new Set(titles)].filter(t =>
    /VIP|Concierge|Exclusive|Personal|Priority|Award|Benefit|Club|manager|service|bonus|cash|jet|event|gift|limit|withdraw|support|sport|casino|travel|birthday/i.test(t)
  );
  console.log('interesting texts:');
  interesting.forEach(t => console.log(' -', t));
  const testids = [...new Set([...h.matchAll(/data-testid="([^"]+)"/g)].map(m => m[1]))];
  console.log('testids', testids.slice(0, 40).join(', '));
  const scrollClasses = [...new Set([...h.matchAll(/class="([^"]*arrows-scroll-view[^"]*)"/g)].map(m => m[1].slice(0, 100)))];
  console.log('scroll class samples', scrollClasses.slice(0, 8));
}

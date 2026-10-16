import fs from 'fs';
import vm from 'vm';

const s = fs.readFileSync('js/vip-club.js', 'utf8');
const ctx = { window: {} };
vm.runInNewContext(s + '\nthis.PAGE_STATES = window.PAGE_STATES;', ctx);
const h = ctx.window.PAGE_STATES['vip-club-1440x900'].html;

for (const needle of [
  'vipLanding-personalApproachBlock-title',
  'vipLanding-exclusiveGiftsBlock-title',
  'vipLanding-statisticsBlock-title',
  'swiper-wrapper',
  'A personal approach',
  'vipLanding-personalApproachCard',
  'vipLanding-exclusiveGiftsSwiperCard',
]) {
  const i = h.indexOf(needle);
  console.log('\n===', needle, 'at', i, '===');
  if (i < 0) continue;
  console.log(h.slice(Math.max(0, i - 300), i + 900));
}

// Count cards
console.log('\ncounts');
for (const n of [
  'vipLanding-personalApproachCard',
  'vipLanding-exclusiveGiftsSwiperCard',
  'swiper-slide',
  'swiper-wrapper',
  '-prev',
  '-next',
]) {
  console.log(n, (h.match(new RegExp(n, 'g')) || []).length);
}

// Find parent structure class names near personal approach
const i = h.indexOf('vipLanding-personalApproachBlock-title');
const chunk = h.slice(i - 1500, i + 2500);
const classes = [...chunk.matchAll(/class="([^"]+)"/g)].map(m => m[1]);
console.log('\nclasses near personalApproach (unique first tokens):');
[...new Set(classes.map(c => c.split(/\s+/)[0]))].slice(0, 40).forEach(c => console.log(' ', c));

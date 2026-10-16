await sleep(1000);
const asides = [...document.querySelectorAll('[class*="sidebar_root"]')];
const info = asides.map((el) => ({
  classes: el.className,
  bypass: /bypassTransition/i.test(el.className),
  inert: el.hasAttribute('inert'),
  hidden: el.className.includes('hidden') || el.className.includes('offscreen'),
  rect: (() => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) };
  })(),
  childTransition: (() => {
    const space = el.querySelector('[class*="common-layout_space"]');
    return space ? getComputedStyle(space).transitionDuration : null;
  })(),
  expandTransition: (() => {
    const exp = el.querySelector('[class*="expanded-view_expandable"]');
    return exp ? getComputedStyle(exp).transitionDuration : null;
  })(),
}));

// Emulate full motion and re-check accordion helper
const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
const motion = window.PREVIEW_MOTION;

// Force-check CSS vars used by motion
const root = getComputedStyle(document.documentElement);
return {
  reduced: reduceMq.matches,
  asides: info,
  easeOut: root.getPropertyValue('--ease-out').trim(),
  easeDrawer: root.getPropertyValue('--ease-drawer').trim(),
  hasMotion: !!motion,
  bodyMotion: {
    count: document.body.dataset.motionCount || null,
    last: document.body.dataset.lastMotion || null,
  },
};

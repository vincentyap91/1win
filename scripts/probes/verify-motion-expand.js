await sleep(800);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const layout = document.querySelector('[class*="common-layout_root"]:not([class*="hidden"])');
const expand = document.querySelector('[class*="expanded-view_expandable"]');
const toggle = document.querySelector('[data-testid="casino-group-toggle"]');
const before = {
  htmlLen: expand?.innerHTML?.length || 0,
  labels: [...(expand?.querySelectorAll('[data-testid^="menu-item"],[data-testid^="sidebar-navigation-"]') || [])].map(n => n.getAttribute('data-testid')).slice(0, 8),
  opened: !!expand && [...expand.classList].some(c => c.includes('isOpened')),
  gridTransition: expand ? getComputedStyle(expand).transition : null,
  layoutTransition: layout ? getComputedStyle(layout).transition : null,
  spaceTransition: layout?.querySelector?.('[class*="common-layout_space"]')
    ? getComputedStyle(layout.querySelector('[class*="common-layout_space"]')).transitionDuration
    : null,
};

// Click toggle and sample height over ~220ms to detect CSS grid animation
let heights = [];
if (toggle && expand) {
  const start = performance.now();
  toggle.click();
  for (let i = 0; i < 6; i++) {
    await sleep(40);
    heights.push({
      t: Math.round(performance.now() - start),
      h: Math.round(expand.getBoundingClientRect().height),
      opened: [...expand.classList].some(c => c.includes('isOpened')),
    });
  }
}

// Modal motion sample
const motion = window.PREVIEW_MOTION;
let modalInfo = null;
if (motion) {
  const node = document.createElement('div');
  node.innerHTML = '<div class="desktop-modal_backdrop-x" style="position:fixed;inset:0;opacity:1;width:100px;height:100px;background:#000"></div><div class="desktop-modal_card-x" style="position:fixed;left:40%;top:40%;width:200px;height:120px;background:#333;opacity:1"></div>';
  document.body.append(node);
  await motion.modal(node);
  modalInfo = {
    last: document.body.dataset.lastMotion,
    duration: document.body.dataset.motionDuration,
    count: document.body.dataset.motionCount,
  };
  node.remove();
}

return {
  reduce,
  easeOut: getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim(),
  before,
  heights,
  animated: heights.length > 1 && heights.some(h => h.h > 0) && (heights[0].h !== heights.at(-1).h || heights.some((h,i,a)=>i&&h.h!==a[0].h)),
  endHeight: heights.at(-1)?.h ?? null,
  endLabels: [...(expand?.querySelectorAll('[data-testid^="sidebar-navigation-"]') || [])].length,
  modalInfo,
  bypassOnLive: /bypassTransition/i.test(document.querySelector('[class*="sidebar_root"]:not([inert])')?.className || ''),
};

await sleep(500);
const btn = document.querySelector('[data-testid="casino-group-toggle"]');
if (!btn) return { missing: true };
const tooltip = btn.closest('[class*="tooltip_root"]');
const parent = tooltip?.parentElement;
const content = parent?.querySelector('[class*="expanded-view_expandable"]');
const allExpand = [...document.querySelectorAll('[class*="expanded-view_expandable"]')].slice(0, 6).map(el => ({
  htmlLen: el.innerHTML.length,
  prevTestId: el.previousElementSibling?.querySelector?.('[data-testid]')?.getAttribute('data-testid') || null,
  classes: el.className.slice(0, 80),
}));
return {
  btnOk: true,
  tooltipClass: tooltip?.className?.slice(0, 60),
  parentChildren: [...(parent?.children || [])].map(c => ({
    tag: c.tagName,
    class: String(c.className).slice(0, 70),
    testid: c.getAttribute?.('data-testid') || c.querySelector?.('[data-testid]')?.getAttribute('data-testid'),
    htmlLen: c.innerHTML?.length,
  })),
  contentHtmlLen: content?.innerHTML?.length ?? null,
  contentClasses: content?.className?.slice(0, 80) ?? null,
  mountedSidebarIds: window.SHARED_UI?.ids?.()?.filter(id => id.includes('fd82742b') || id.includes('home-1440')) || [],
  allExpand,
  asideOuter: document.querySelector('[class*="sidebar_root"]')?.outerHTML?.slice(0, 200),
  // Direct search near button
  nearbyHTML: tooltip?.parentElement?.innerHTML?.slice(0, 500) || null,
};

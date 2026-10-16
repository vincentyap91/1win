await sleep(500);
const aside = document.querySelector('[class*="sidebar_root"]:not([inert])') || document.querySelector('[class*="sidebar_root"]');
const toggles = ['casino-group-toggle','betting-group-toggle','markets-toggle','betwave-toggle'];
const rows = toggles.map(id => {
  const btn = document.querySelector(`[data-testid="${id}"]`);
  const parent = btn?.closest('[class*="tooltip_root"]')?.parentElement;
  const content = parent?.querySelector('[class*="expanded-view_expandable"]');
  return {
    id,
    btn: !!btn,
    htmlLen: content?.innerHTML?.length || 0,
    opened: !!content && [...(content.classList||[])].some(c => c.includes('isOpened')),
    preview: (content?.textContent || '').replace(/\s+/g,' ').trim().slice(0, 120),
    labels: [...(content?.querySelectorAll('[data-testid^="menu-item"]') || [])].map(n => n.getAttribute('data-testid')).slice(0, 8),
  };
});
return {
  state: document.body.dataset.state,
  page: document.body.dataset.page,
  asideClass: aside?.className?.slice(0, 80) || null,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  minAnimateNote: 'OS MinAnimate=0 forces reduce',
  rows,
  sharedKeys: Object.keys(window.SHARED_UI?.templates || window.SHARED_UI?._ || {}).filter(k => k.includes('sidebar')).slice(0, 5),
  hasShared: !!window.SHARED_UI,
};

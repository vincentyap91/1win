await sleep(600);
const ids = [
  'casino-group-toggle',
  'betting-group-toggle',
  'markets-toggle',
  'betwave-toggle',
  'casino-lobby-toggle',
  'casino-live-toggle',
  'casino-fast-toggle',
];
const rows = [];
for (const id of ids) {
  const btn = document.querySelector(`[data-testid="${id}"]`);
  if (!btn) { rows.push({ id, missing: true }); continue; }
  const parent = btn.closest('[class*="tooltip_root"]')?.parentElement;
  const content = parent?.querySelector(':scope > [class*="expanded-view_expandable"]')
    || parent?.querySelector('[class*="expanded-view_expandable"]');
  const labels = [...(content?.querySelectorAll('[data-testid^="sidebar-navigation-"]') || [])]
    .map(n => n.getAttribute('data-testid').replace('sidebar-navigation-', ''));
  // open top-level groups first so nested toggles exist in layout
  if (!content?.className.includes('isOpened') && id.endsWith('-group-toggle') || id === 'markets-toggle' || id === 'betwave-toggle') {
    btn.click();
    await sleep(50);
  }
  if (id.startsWith('casino-') && id.endsWith('-toggle') && id !== 'casino-group-toggle') {
    const casino = document.querySelector('[data-testid="casino-group-toggle"]');
    const cParent = casino?.closest('[class*="tooltip_root"]')?.parentElement;
    const cExp = cParent?.querySelector('[class*="expanded-view_expandable"]');
    if (cExp && !cExp.className.includes('isOpened')) { casino.click(); await sleep(80); }
    const nestedBtn = document.querySelector(`[data-testid="${id}"]`);
    const nestedParent = nestedBtn?.closest('[class*="tooltip_root"]')?.parentElement;
    const nestedContent = nestedParent?.querySelector('[class*="expanded-view_expandable"]');
    const nestedLabels = [...(nestedContent?.querySelectorAll('[data-testid^="sidebar-navigation-"]') || [])]
      .map(n => n.getAttribute('data-testid').replace('sidebar-navigation-', ''));
    if (nestedBtn && nestedContent && !nestedContent.className.includes('isOpened')) {
      nestedBtn.click();
      await sleep(220);
    }
    rows.push({
      id,
      htmlLen: nestedContent?.innerHTML?.length || 0,
      labels: nestedLabels,
      height: Math.round(nestedContent?.getBoundingClientRect().height || 0),
    });
    continue;
  }
  rows.push({
    id,
    htmlLen: content?.innerHTML?.length || 0,
    labels,
    height: Math.round(content?.getBoundingClientRect().height || 0),
    opened: !!content && content.className.includes('isOpened'),
  });
}
return { state: document.body.dataset.state, rows };

// Probe: open Casino / Sports / Markets / Betwave expand menus and list child labels.
await sleep(500);
const toggles = [
  'casino-group-toggle',
  'betting-group-toggle',
  'markets-toggle',
  'betwave-toggle',
];
const result = {
  page: location.pathname,
  sidebarComponent: document.querySelector('[data-shared-component]')?.getAttribute('data-shared-component') || null,
  hasItemsInDom: !!document.querySelector('[class*="expanded-view_items"]'),
  lobbyLinks: document.querySelectorAll('[data-testid="sidebar-navigation-casino-lobby"]').length,
  groups: {},
};
for (const id of toggles) {
  const btn = document.querySelector(`[data-testid="${id}"]`);
  if (!btn) {
    result.groups[id] = { present: false };
    continue;
  }
  const parent = btn.closest('[class*="tooltip_root"]')?.parentElement;
  const contentBefore = parent?.querySelector('[class*="expanded-view_expandable"]');
  const htmlLenBefore = contentBefore?.innerHTML?.length || 0;
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(50);
  const content = parent?.querySelector('[class*="expanded-view_expandable"]');
  const opened = !!content && [...content.classList].some((c) => c.includes('expanded-view_isOpened'));
  const labels = [...(content?.querySelectorAll('a[data-testid^="sidebar-navigation"]') || [])].map((a) =>
    a.textContent.replace(/\s+/g, ' ').trim()
  );
  result.groups[id] = {
    present: true,
    opened,
    aria: btn.getAttribute('aria-expanded'),
    htmlLenBefore,
    htmlLenAfter: content?.innerHTML?.length || 0,
    className: content?.className || null,
    labels,
    count: labels.length,
  };
}
return result;

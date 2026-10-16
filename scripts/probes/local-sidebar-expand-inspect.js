
await sleep(1000);
const slot = document.querySelector('[data-shared-component]');
const asides = [...document.querySelectorAll('[class*="sidebar_root"]')];
const html = asides[0]?.outerHTML || '';
return {
  remainingSlots: [...document.querySelectorAll('[data-shared-component]')].map(n => n.getAttribute('data-shared-component')),
  asideCount: asides.length,
  hasLobby: html.includes('sidebar-navigation-casino-lobby'),
  emptyExpand: (html.match(/expanded-view_expandable-DJsWU" inert=""><\/div>/g) || []).length,
  sharedIds: (html.match(/data-component="[^"]+"/g) || []).slice(0, 3),
  state: document.body.dataset.state,
  page: document.body.dataset.page,
  firstExpandSnippet: html.includes('expanded-view_expandable')
    ? html.slice(html.indexOf('expanded-view_expandable') - 80, html.indexOf('expanded-view_expandable') + 120)
    : null,
};

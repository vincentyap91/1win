// Why a page keeps its initial state: loaded state keys, shared UI status and scripts on the page.
await sleep(3000);
return {
  keys: Object.keys(window.PAGE_STATES || {}), authKeys: Object.keys(window.AUTH_PAGE_STATES || {}),
  sharedUi: document.documentElement.dataset.sharedUi || null, state: document.body.dataset.state,
  scripts: [...document.scripts].map(s => s.getAttribute('src')),
  more: Object.keys(window.CASINO_MORE_CARDS || {}),
};

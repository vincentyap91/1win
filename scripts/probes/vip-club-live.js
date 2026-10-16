// Probe body for local-run-cdp / reference-run-cdp
const main = document.querySelector('[data-testid="layout-content"],[class*="common-layout_content"],main') || document.body;
const scrollers = [...document.querySelectorAll('[class*="arrows-scroll-view_root-"]')].map(root => {
  const content = root.querySelector('[class*="arrows-scroll-view_content-"]');
  const list = content && ([content.firstElementChild, content].find(n => n && n.scrollWidth > n.clientWidth + 8) || content.firstElementChild || content);
  const rect = root.getBoundingClientRect();
  return {
    top: Math.round(rect.top + window.scrollY),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
    scrollW: list ? list.scrollWidth : 0,
    clientW: list ? list.clientWidth : 0,
    canScroll: !!(list && list.scrollWidth > list.clientWidth + 8),
    overflowX: list ? getComputedStyle(list).overflowX : null,
    childCount: list ? list.children.length : 0,
    sampleText: (root.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
  };
});

// Collect visible section headings after scrolling through page
const headings = [];
const collect = () => {
  for (const el of document.querySelectorAll('h1,h2,h3,[class*="title"],[class*="Title"],[class*="heading"]')) {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t && t.length < 80) headings.push(t);
  }
};
collect();
const maxY = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
for (let y = 0; y < maxY; y += 700) {
  window.scrollTo(0, y);
  await sleep(200);
  collect();
}
window.scrollTo(0, 0);
await sleep(100);

const cards = [...document.querySelectorAll('[class*="Vip"],[class*="vip"],[class*="benefit"],[class*="perk"],[class*="feature"]')]
  .slice(0, 30)
  .map(el => ({
    cls: el.className.toString().slice(0, 80),
    text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
    h: Math.round(el.getBoundingClientRect().height),
  }));

return {
  title: document.title,
  scrollH: document.documentElement.scrollHeight,
  contentH: main ? Math.round(main.getBoundingClientRect().height) : null,
  scrollers,
  headings: [...new Set(headings)].slice(0, 60),
  cards,
  bodyTextLen: (document.body.innerText || '').length,
  bodySnippet: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500),
};

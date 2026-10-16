const box = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const pick = (props) => Object.fromEntries(props.map((p) => [p, cs[p]]));
  return {
    tag: el.tagName.toLowerCase(),
    testid: el.dataset?.testid || '',
    cls: (el.className && el.className.baseVal !== undefined ? '' : String(el.className || '')).split(' ').filter(c => /modal|button|footer|header|info|group|card|holder|root|size|detent/.test(c)).slice(0, 8).join(' '),
    x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    pad: cs.padding, margin: cs.margin, gap: cs.gap,
    radius: cs.borderRadius,
    paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft,
    marginTop: cs.marginTop, marginRight: cs.marginRight, marginBottom: cs.marginBottom, marginLeft: cs.marginLeft,
    rowGap: cs.rowGap, columnGap: cs.columnGap,
    width: cs.width, maxWidth: cs.maxWidth, height: cs.height,
    display: cs.display, position: cs.position,
    align: cs.alignItems, justify: cs.justifyContent,
    inset: `${cs.top}/${cs.right}/${cs.bottom}/${cs.left}`,
  };
};
const gapsBetween = (nodes) => {
  const vis = nodes.filter(Boolean).map(el => ({el, r: el.getBoundingClientRect()})).filter(x => x.r.width > 0 && x.r.height > 0);
  const out = [];
  for (let i = 1; i < vis.length; i++) {
    const a = vis[i - 1], b = vis[i];
    out.push({
      from: a.el.dataset?.testid || a.el.className.toString().split(' ')[0],
      to: b.el.dataset?.testid || b.el.className.toString().split(' ')[0],
      gapY: Math.round(b.r.top - a.r.bottom),
      gapX: Math.round(b.r.left - a.r.right),
    });
  }
  return out;
};
const findAuth = (doc) => doc.querySelector('[data-testid="game-auth"]');
const locate = () => {
  const own = findAuth(document);
  if (own) return {doc: document, auth: own};
  for (const frame of document.querySelectorAll('iframe')) {
    try {
      const d = frame.contentDocument;
      const inner = d && findAuth(d);
      if (inner) return {doc: d, auth: inner};
    } catch {}
  }
  return null;
};
let found = locate();
for (let i = 0; i < 16 && !found; i++) {
  await sleep(500);
  found = locate();
}
const doc = found?.doc || document;
const auth = found?.auth || null;
if (!auth) return {missing: true, title: document.title, path: location.pathname, text: document.body?.innerText?.slice(0, 200)};
const shell = auth.querySelector('[class*="desktop-modal_card"], [class*="mobile-modal_modal"]');
const holder = auth.querySelector('[class*="desktop-modal_holder"], [class*="mobile-modal_holder"]');
const header = auth.querySelector('[class*="modal-header_primaryHeader"]');
const title = auth.querySelector('[data-testid="modal-header-title"]');
const info = auth.querySelector('[class*="modal-info_root"]');
const subtitle = auth.querySelector('[class*="modal-info_subtitle"]');
const footer = auth.querySelector('[class*="modal-footer_root"]');
const group = auth.querySelector('[class*="buttons-group_root"]');
const buttons = [...auth.querySelectorAll('[class*="buttons-group_root"] > button')];
const close = auth.querySelector('[data-testid="modal-header-button-close"]');
const cardR = shell?.getBoundingClientRect();
const view = {w: doc.defaultView.innerWidth, h: doc.defaultView.innerHeight};
const inset = cardR ? {
  top: Math.round(cardR.top),
  right: Math.round(view.w - cardR.right),
  bottom: Math.round(view.h - cardR.bottom),
  left: Math.round(cardR.left),
} : null;
return {
  view,
  kind: shell?.className?.toString().includes('mobile-modal') ? 'mobile' : 'desktop',
  inset,
  shell: box(shell),
  holder: box(holder),
  header: box(header),
  title: box(title),
  info: box(info),
  subtitle: box(subtitle),
  footer: box(footer),
  group: box(group),
  buttons: buttons.map(box),
  close: box(close),
  gaps: gapsBetween([title, subtitle, buttons[0], buttons[1]].filter(Boolean)),
  buttonGap: buttons.length === 2 ? Math.round(buttons[1].getBoundingClientRect().left - buttons[0].getBoundingClientRect().right) : null,
  buttonGapY: buttons.length === 2 ? Math.round(buttons[1].getBoundingClientRect().top - buttons[0].getBoundingClientRect().bottom) : null,
};

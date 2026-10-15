const FIGMA_MAXY = 2600;
// Body of an async function run by scripts/figma/local-run.mjs on a local page.
// Serialises the page content (between the shared header and footer: [class*="layout-content_root"]) into a
// compact layout tree for scripts/figma/build-frame.js. Coordinates are relative to the content root.
// Node: {k:'F'|'T'|'I'|'V', n:name, x,y,w,h, bg, r, b:[color,width], op, clip, flex:'row'|'col', ch:[...]}
//  T: txt, c (color), fs, fw, lh, ls, al (text-align), tt (uppercase), ff
//  I: src (local asset path), fit ('cover'|'contain'|'fill')
//  V: svg (markup), c (fill colour when the source is a CSS mask)
// Header, sidebar and footer are not serialised: Figma frames use the shared components for them.
// FIGMA_ROOT (prepended by prepare-pages.sh) overrides the root, e.g. Betwave serialises its whole page because it has
// its own header/sidebar/footer that are not shared components in Figma.
// FIGMA_PRE (optional async function, prepended like FIGMA_ROOT) opens a dialog/menu state before measuring.
if (typeof FIGMA_PRE === 'function') { await sleep(800); await FIGMA_PRE(); await sleep(900); }
const root = document.querySelector(typeof FIGMA_ROOT !== 'undefined' ? FIGMA_ROOT : '[class*="layout-content_root"]');
if (!root) return {error: 'no content root'};
if (typeof FIGMA_PRE !== 'function') { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await sleep(60); } scrollTo(0, 0); await sleep(400); }
// Overlay wrappers (modal layout, bottom sheets) are 0px tall with fixed children: measure them against the viewport.
const rr = root.getBoundingClientRect();
const R = rr.height < 1 ? {left: 0, top: 0, width: innerWidth, height: innerHeight} : rr, ox = R.left, oy = R.top + scrollY;
const svgCache = new Map();
async function svgText(url) {
  if (svgCache.has(url)) return svgCache.get(url);
  let t = null;
  try {
    if (url.startsWith('data:image/svg+xml')) {
      const body = url.slice(url.indexOf(',') + 1);
      t = url.includes(';base64,') ? atob(body) : decodeURIComponent(body);
    } else if (/\.svg(\?|$)/.test(url)) t = await (await fetch(url)).text();
  } catch {}
  svgCache.set(url, t); return t;
}
const urlOf = v => { const m = /url\(["']?([^"')]+)["']?\)/.exec(v || ''); return m ? m[1] : null; };
const local = u => { try { const p = new URL(u, location.href); return p.origin === location.origin ? decodeURIComponent(p.pathname.replace(/^\//, '')) : null; } catch { return null; } };
const col = v => (!v || v === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(v)) ? undefined : v;
const num = v => Math.round(parseFloat(v) * 100) / 100 || 0;
function box(el) { const r = el.getBoundingClientRect(); return {x: Math.round((r.left - ox) * 100) / 100, y: Math.round((r.top + scrollY - oy) * 100) / 100, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100}; }
function visible(el, cs) { return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01; }
function textProps(cs) {
  return {c: cs.color, fs: num(cs.fontSize), fw: +cs.fontWeight || 400, lh: cs.lineHeight === 'normal' ? Math.round(num(cs.fontSize) * 1.2) : num(cs.lineHeight),
    ls: cs.letterSpacing === 'normal' ? 0 : num(cs.letterSpacing), al: cs.textAlign, tt: cs.textTransform === 'uppercase' ? 1 : undefined, ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()};
}
async function children(el, cs) {
  const kids = [];
  for (const c of el.childNodes) {
    if (c.nodeType === 3) {
      const text = c.textContent.replace(/\s+/g, ' ');
      if (!text.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(c);
      const rects = [...range.getClientRects()].filter(r => r.width > 0);
      if (!rects.length) continue;
      const l = Math.min(...rects.map(r => r.left)), t = Math.min(...rects.map(r => r.top)), rr = Math.max(...rects.map(r => r.right)), bb = Math.max(...rects.map(r => r.bottom));
      // Split into rendered lines (word by word) so SVG/Figma text keeps the browser's line breaks.
      const lines = []; const raw = c.textContent; const re = /\S+/g; let m;
      while ((m = re.exec(raw))) {
        const wr = document.createRange(); wr.setStart(c, m.index); wr.setEnd(c, m.index + m[0].length);
        const q = [...wr.getClientRects()].filter(r => r.width > 0)[0]; if (!q) continue;
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.top - q.top) < 2) { last.t += ' ' + m[0]; last.right = q.right; }
        else lines.push({t: m[0], top: q.top, left: q.left, right: q.right, bottom: q.bottom});
      }
      kids.push({k: 'T', n: text.trim().slice(0, 40), x: Math.round((l - ox) * 100) / 100, y: Math.round((t + scrollY - oy) * 100) / 100, w: Math.round((rr - l) * 100) / 100 + 0.5, h: Math.round((bb - t) * 100) / 100, txt: text.trim(), ...textProps(cs),
        lines: lines.map(q => ({t: q.t, x: Math.round((q.left - ox) * 100) / 100, y: Math.round((q.top + scrollY - oy) * 100) / 100, w: Math.round((q.right - q.left) * 100) / 100, h: Math.round((q.bottom - q.top) * 100) / 100}))});
    } else if (c.nodeType === 1) {
      const k = await walk(c, 0);
      if (k) { if (k.k === 'G') kids.push(...k.ch); else kids.push(k); }
    }
  }
  return kids;
}
async function walk(el, depth) {
  const cs = getComputedStyle(el);
  if (!visible(el, cs)) return null;
  // Floating overlays (bet slip trigger, chat bubbles) are not part of the page layout.
  if (cs.position === 'fixed' && el !== root && typeof FIGMA_ROOT === 'undefined') return null;
  const b = box(el);
  if (cs.display === 'contents' || ((b.w < 0.5 || b.h < 0.5) && cs.overflow === 'visible')) {
    // Layout-transparent wrapper: its children (text included) belong to the parent.
    const kids = await children(el, cs);
    return kids.length ? {k: 'G', ch: kids} : null;
  }
  if (b.w < 0.5 || b.h < 0.5) return null;
  // Skip content far outside the content root (carousel slides off to the right are clipped by their parent).
  if (b.x > R.width + 400 || b.x + b.w < -400) return null;
  // FIGMA_MAXY trims long repeated lists (TOP Bets, Markets): nodes starting below it are left out.
  if (typeof FIGMA_MAXY !== 'undefined' && b.y > FIGMA_MAXY) return null;
  const name = (el.className && el.className.toString().split(' ')[0]) || el.tagName.toLowerCase();
  const tag = el.tagName;
  if (tag === 'svg') {
    const clone = el.cloneNode(true); clone.setAttribute('width', b.w); clone.setAttribute('height', b.h);
    const html = clone.outerHTML.replace(/currentColor/g, cs.color);
    return {k: 'V', n: el.getAttribute('data-icon') || 'icon', ...b, svg: html, c: cs.color};
  }
  if (tag === 'IMG') {
    const src = local(el.currentSrc || el.src);
    if (!src) return null;
    if (src.endsWith('.svg')) { const t = await svgText(el.currentSrc || el.src); if (t) return {k: 'V', n: el.alt || 'image', ...b, svg: t}; }
    return {k: 'I', n: el.alt || 'image', ...b, src, fit: cs.objectFit === 'contain' ? 'contain' : 'cover', r: num(cs.borderTopLeftRadius) || undefined, op: parseFloat(cs.opacity) < 1 ? num(cs.opacity) : undefined};
  }
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    const node = {k: 'F', n: 'Input', ...b, bg: col(cs.backgroundColor), r: num(cs.borderTopLeftRadius) || undefined, ch: []};
    const t = el.value || el.placeholder;
    if (t) node.ch.push({k: 'T', n: t, x: b.x + num(cs.paddingLeft), y: b.y, w: Math.max(1, b.w - num(cs.paddingLeft) - num(cs.paddingRight)), h: b.h, txt: t, ...textProps(cs), c: el.value ? cs.color : (getComputedStyle(el, '::placeholder').color || cs.color), vc: 1});
    return node;
  }
  const node = {k: 'F', n: name, ...b};
  const bg = col(cs.backgroundColor); if (bg) node.bg = bg;
  const radius = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(num);
  if (radius.some(Boolean)) node.r = radius.every(v => v === radius[0]) ? radius[0] : radius;
  const bw = num(cs.borderTopWidth) || num(cs.borderBottomWidth) || num(cs.borderLeftWidth);
  if (bw && col(cs.borderTopColor || cs.borderBottomColor)) node.b = [cs.borderTopColor, bw];
  if (parseFloat(cs.opacity) < 1) node.op = num(cs.opacity);
  if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') node.clip = 1;
  if (cs.display.includes('flex')) node.flex = cs.flexDirection.startsWith('column') ? 'col' : 'row';
  // Background image: raster → image child; gradient kept as CSS for the builder.
  const bgUrl = urlOf(cs.backgroundImage);
  const kids = [];
  if (cs.backgroundImage.includes('gradient')) node.grad = cs.backgroundImage;
  if (bgUrl && !bgUrl.startsWith('data:')) { const src = local(bgUrl); if (src && !src.endsWith('.svg')) kids.push({k: 'I', n: 'background', ...b, src, fit: cs.backgroundSize === 'contain' ? 'contain' : 'cover', r: node.r}); else if (src) { const t = await svgText(bgUrl); if (t) kids.push({k: 'V', n: 'background', ...b, svg: t}); } }
  // CSS mask icon: the element's background colour painted through an SVG mask.
  const mask = urlOf(cs.maskImage || cs.webkitMaskImage);
  if (mask) { const t = await svgText(mask); if (t) return {k: 'V', n: name, ...b, svg: t, c: bg || cs.color, mask: 1, op: node.op, ms: cs.maskSize || cs.webkitMaskSize, mp: cs.maskPosition || cs.webkitMaskPosition}; }
  kids.push(...await children(el, cs));
  // Pseudo-element text (e.g. counters) is ignored; ::before/::after icons are rare in this app.
  if (kids.length) node.ch = kids;
  // Collapse layout-neutral wrappers (no paint, same box as its only child).
  if (!node.bg && !node.b && !node.grad && !node.clip && kids.length === 1 && kids[0].k !== 'T' && Math.abs(kids[0].x - b.x) < .5 && Math.abs(kids[0].y - b.y) < .5 && Math.abs(kids[0].w - b.w) < .5 && Math.abs(kids[0].h - b.h) < .5) return kids[0];
  if (!node.bg && !node.b && !node.grad && !kids.length) return null;
  return node;
}
// The page may re-render once after load (viewport adaptation), detaching nodes mid-walk: retry until stable.
let tree = null;
for (let attempt = 0; attempt < 4 && !tree; attempt++) {
  const r = document.querySelector(typeof FIGMA_ROOT !== 'undefined' ? FIGMA_ROOT : '[class*="layout-content_root"]') || root;
  tree = await walk(r, 0);
  if (!tree) await sleep(1200);
}
if (tree && tree.k === 'G') tree = {k: 'F', n: 'Overlay', x: 0, y: 0, w: R.width, h: R.height, ch: tree.ch};
let contentH = R.height;
if (typeof FIGMA_MAXY !== 'undefined' && tree) {
  let bottom = 0; const scan = n => { if (n.k !== 'G') bottom = Math.max(bottom, Math.min(n.y + n.h, FIGMA_MAXY + 400)); if (n.y + n.h <= FIGMA_MAXY + 400) (n.ch || []).forEach(scan); };
  (tree.ch || []).forEach(scan); contentH = Math.min(R.height, bottom + 32); tree.h = contentH;
  const clamp = n => { if (n.y + n.h > contentH) n.h = Math.max(1, contentH - n.y); (n.ch || []).forEach(clamp); }; clamp(tree);
}
let pageBg; for (let e = root; e && !pageBg; e = e.parentElement) pageBg = col(getComputedStyle(e).backgroundColor);
return {page: location.pathname, w: innerWidth, contentW: R.width, contentH, pageBg: pageBg || col(getComputedStyle(document.body).backgroundColor), tree};

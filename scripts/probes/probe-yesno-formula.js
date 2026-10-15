// Reference (guest): Possible win for a 100.00 stake on several cards/sides (to derive the payout formula),
// then which part of the form header closes it. Never clicks "Place a bet".
for (let i = 0; i < 40 && !document.querySelector('[class*="_root_saz1a_"] [class*="_name_5xqiy_"]'); i++) await sleep(300);
const form = () => document.querySelector('[class*="_root_qead3_"]');
const rows = [];
const buttons = [...document.querySelectorAll('[class*="_root_saz1a_"] button')].filter(b => b.querySelector('[class*="_name_5xqiy_"]')).slice(0, 12);
for (const b of buttons) {
  if (!b.isConnected) continue;
  const label = b.textContent.replace(/\s+/g, ' ').trim();
  b.scrollIntoView({block: 'center'}); b.click(); await sleep(500);
  const f = form(); if (!f) { rows.push({label, form: false}); continue; }
  const input = f.querySelector('input');
  input.focus(); input.value = '100'; input.dispatchEvent(new Event('input', {bubbles: true})); await sleep(300);
  rows.push({label, formLabel: f.querySelector('[class*="_value_1vsuw_"]').textContent.trim(), win: f.querySelector('[class*="_profitAmount_"]').textContent.replace(/\s/g, ' ')});
}
// Close: try the icon's inner span, then the title row, then Escape.
const tries = {};
const hidden = () => [...document.querySelectorAll('[class*="_root_saz1a_"]')].filter(c => c.parentElement.style.display === 'none').length;
const attempt = async (name, fn) => { if (!form()) return; fn(); await sleep(500); tries[name] = {forms: document.querySelectorAll('[class*="_root_qead3_"]').length, hidden: hidden()}; };
const icon = () => form()?.querySelector('[class*="_icon_1cufa_"]');
tries.iconHtml = icon()?.outerHTML.slice(0, 300);
tries.iconCursor = icon() && getComputedStyle(icon()).cursor;
tries.iconPointer = icon() && getComputedStyle(icon()).pointerEvents;
await attempt('innerSpanClick', () => icon().firstElementChild.click());
await attempt('pointerSeq', () => { const el = icon(); const r = el.getBoundingClientRect(); const o = {bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2};
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) el.dispatchEvent(new (t.startsWith('pointer') ? PointerEvent : MouseEvent)(t, o)); });
await attempt('elementFromPoint', () => { const r = icon().getBoundingClientRect(); document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2).click(); });
await attempt('titleRow', () => form().querySelector('[class*="_titleRow_1cufa_"]').click());
await attempt('escape', () => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
await attempt('outside', () => document.body.click());
return {rows, tries};

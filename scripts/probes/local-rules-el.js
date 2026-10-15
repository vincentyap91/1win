// Every element whose own text is "Rules", with its focusable ancestor, then keyboard-path activation of the tournament one.
const all = [...document.querySelectorAll('*')].filter(e => e.children.length <= 2 && e.textContent.trim() === 'Rules' && e.getBoundingClientRect().width > 0);
const list = all.map(e => { const b = e.closest('button,a,[role="button"]'); return {tag: e.tagName, cls: String(e.className).slice(0, 80), owner: b?.tagName, ownerCls: b ? String(b.className).slice(0, 80) : null}; });
const btn = all.map(e => e.closest('button')).find(b => b && /detailsButton|tournament/.test(b.className));
if (!btn) return {list};
btn.focus();
const focused = document.activeElement === btn;
// A native <button> turns Enter into a click event; replay that path rather than a synthetic keydown.
btn.click();
await sleep(600);
return {list, focused, opened: !!document.querySelector('[data-local-modal="tournament-rules"]')};

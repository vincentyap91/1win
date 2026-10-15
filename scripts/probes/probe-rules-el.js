// Reference: what element carries the tournament "Rules" control (button vs div) and whether it is focusable.
for (let i = 0; i < 30 && ![...document.querySelectorAll('button,div,span')].some(e => e.textContent.trim() === 'Rules'); i++) await sleep(300);
const el = [...document.querySelectorAll('button,a,[role="button"],div,span')].find(e => e.children.length <= 2 && e.textContent.trim() === 'Rules');
if (!el) return {found: false};
const btn = el.closest('button,a,[role="button"],[tabindex]') || el;
btn.focus();
return {found: true, tag: btn.tagName, type: btn.getAttribute('type'), tabindex: btn.getAttribute('tabindex'), focused: document.activeElement === btn, html: btn.outerHTML.slice(0, 200)};

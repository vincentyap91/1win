// What the crypto-live Markets page offers instead of Yes/No cards (button labels and card roots).
const buttons = [...document.querySelectorAll('main button, [class*="layout-main_main"] button')].filter(b => b.getClientRects().length);
const labels = {};
buttons.forEach(b => { const t = b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) || '(icon)'; labels[t] = (labels[t] || 0) + 1; });
const scopes = [...new Set([...document.querySelectorAll('[data-scope]')].map(n => n.dataset.scope))];
return {buttons: buttons.length, labels: Object.entries(labels).sort((a, b) => b[1] - a[1]).slice(0, 20), scopes, outcome5xqiy: document.querySelectorAll('button[class*="_root_5xqiy_"]').length};

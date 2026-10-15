// Local crypto-live: what wraps an "Up" button, and what a click on it does.
const up = [...document.querySelectorAll('button')].find(b => /^Up\s*\d+%$/.test(b.textContent.replace(/\s+/g, ' ').trim()));
if (!up) return {found: false};
const link = up.closest('a,[data-reference-href]');
const cardLink = up.closest('[data-scope="Card"]')?.querySelector('a[href],[data-reference-href]');
const href = location.href;
up.click(); await sleep(700);
const notice = [...document.querySelectorAll('[role="status"],[data-local-notice],[class*="local-notice"]')].map(n => n.textContent.trim()).filter(Boolean);
return {found: true, upClass: String(up.className).slice(0, 120), link: link && (link.getAttribute('href') || link.dataset.referenceHref),
  cardLink: cardLink && (cardLink.getAttribute('href') || cardLink.dataset.referenceHref), navigated: location.href !== href, notice};

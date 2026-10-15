// Local: sidebar Forum shows the external-site notice; the SEO "1win Poker" link (/poker) opens the home page like the reference.
const forum = [...document.querySelectorAll('a')].find(a => a.textContent.trim() === 'Forum' && a.closest('[class*="sidebar"]'));
forum.click(); await sleep(500);
const notice = [...document.querySelectorAll('[role="status"],[data-local-notice]')].map(n => n.textContent.trim()).filter(Boolean);
const poker = [...document.querySelectorAll('a[data-reference-href="/poker"]')][0];
const target = poker ? (window.PROJECT_ROUTES?.pages || {})['/poker'] : null;
return {forumNotice: notice, pokerLink: !!poker, pokerTarget: target};

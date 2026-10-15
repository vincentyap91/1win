// Demo preview: masked profile and balance visible anywhere on the page (sidebar profile, header).
await sleep(1500);
const text = document.body.innerText;
return {
  demoUser: text.includes('Demo user'), demoId: /ID\s*00000000/.test(text), zeroBalance: /0\.00/.test(text),
  profileButton: !!document.querySelector('[data-testid="sidebar-profile-button"]'),
  loginButtons: [...document.querySelectorAll('button,a')].filter(e => /^(Log in|Login|Registration)$/i.test(e.textContent.trim()) && e.getClientRects().length).length,
};

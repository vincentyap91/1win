// How the reference renders the language flag on the "Greek Roulette 500x" live card (local copy has an <img> without src).
for (let i = 0; i < 40; i++) { if (document.querySelector('[data-testid="game-card-Greek Roulette 500x"]')) break; scrollBy(0, 900); await sleep(400); }
const card = document.querySelector('[data-testid="game-card-Greek Roulette 500x"]');
if (!card) return {found: false};
card.scrollIntoView({block: 'center'}); await sleep(1500);
return {found: true, imgs: [...card.querySelectorAll('img')].map(i => ({
  src: i.getAttribute('src'), cls: i.className, complete: i.complete, w: i.naturalWidth,
  shown: getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0,
  html: i.outerHTML.slice(0, 300)
}))};

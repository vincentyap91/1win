// Every tournament card after "Show more", plus what each filter tab shows.
for (let i = 0; i < 8; i++) {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Show more');
  if (!b) break;
  b.click();
  await sleep(2000);
}
const read = () => [...document.querySelectorAll('[data-testid^="tournament-card-"]')].map(c => ({id: c.dataset.testid.replace('tournament-card-', ''), title: c.innerText.replace(/\s+/g, ' ').slice(0, 80)}));
const tabs = [...document.querySelectorAll('button')].filter(b => /^(All|Exclusive|From providers)$/.test(b.textContent.trim()));
const out = {all: read()};
for (const tab of tabs) {
  tab.click();
  await sleep(1500);
  out[tab.textContent.trim()] = read();
}
return out;

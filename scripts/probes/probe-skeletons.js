// Where skeleton placeholders sit, and whether they disappear after scrolling the whole page and waiting.
const where = () => {
  const groups = {};
  for (const s of document.querySelectorAll('[class*="skeleton_root"]')) {
    let p = s.parentElement, chain = [];
    for (let i = 0; p && i < 4; i++, p = p.parentElement) chain.push((p.className && String(p.className).split(' ')[0]) || p.tagName);
    const key = chain.join(' < ');
    groups[key] = (groups[key] || 0) + 1;
  }
  return groups;
};
const before = where();
for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await sleep(400); }
await sleep(6000);
scrollTo(0, 0); await sleep(1500);
return {before, after: where(), height: document.documentElement.scrollHeight};

// Lists <img> elements without a src attribute (file-protocol-check reports them as broken: null).
for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await sleep(60); }
scrollTo(0, 0); await sleep(800);
return [...document.images].filter(i => i.getAttribute('src') === null).map(i => ({
  srcset: i.getAttribute('srcset'),
  cls: i.className,
  alt: i.alt,
  parent: i.parentElement?.className?.toString().slice(0, 120),
  card: i.closest('[data-testid]')?.dataset.testid,
  html: i.outerHTML.slice(0, 300)
}));

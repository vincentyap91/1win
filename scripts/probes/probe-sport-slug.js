// Old sport slugs from blog links (soccer-18, rugby-19): compare the betting area text with the current slug's page.
await sleep(6000);
const text = document.body.innerText.replace(/\s+/g, ' ');
const at = text.indexOf('Top L');
return {path: location.pathname, betting: text.slice(at, at + 700)};

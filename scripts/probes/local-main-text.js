// Visible text of the main content area plus page-level layout facts.
const main = document.querySelector('[class*="layout-main_main"]') || document.querySelector('main') || document.body;
return {
  state: document.body.dataset.state,
  text: main.innerText.replace(/\s+/g, ' ').trim().slice(0, 400),
  links: [...main.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).slice(0, 10),
  hscroll: document.documentElement.scrollWidth > innerWidth + 1
};

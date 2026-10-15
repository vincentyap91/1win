// Reference (guest): where a directly opened route lands (redirects, query, dialogs) once the app settles.
await sleep(2500);
const layer = document.querySelector('[data-testid="modal-layout"] > *');
return {href: location.href, title: document.title, modal: layer ? document.querySelector('[data-testid="modal-layout"]').innerText.replace(/\s+/g, ' ').slice(0, 160) : null,
  head: (document.querySelector('[class*="layout-main_main"]') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 160)};

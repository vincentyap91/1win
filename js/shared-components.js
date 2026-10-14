/* Classic scripts and HTML templates keep shared UI usable from both HTTP and file URLs. */
window.SHARED_UI = (() => {
  'use strict';
  const templates = Object.create(null);
  const slotPattern = /<template data-shared-component="([^"]+)"><\/template>/g;
  function register(kind, values) {
    for (const [id, html] of Object.entries(values)) {
      if (Object.prototype.hasOwnProperty.call(templates, id)) throw new Error('Duplicate shared component: ' + id);
      templates[id] = html;
    }
  }
  function expand(value, stack = []) {
    return value.replace(slotPattern, (slot, id) => {
      if (!Object.prototype.hasOwnProperty.call(templates, id)) throw new Error('Missing shared component: ' + id);
      if (stack.includes(id)) throw new Error('Recursive shared component: ' + id);
      return expand(templates[id], [...stack, id]);
    });
  }
  function mount(root) {
    for (const slot of root.querySelectorAll('template[data-shared-component]')) {
      const template = document.createElement('template');
      template.innerHTML = expand(slot.outerHTML);
      slot.replaceWith(template.content);
    }
  }
  function ready() { document.documentElement.removeAttribute('data-shared-ui'); }
  return Object.freeze({ register, expand, mount, ready, ids: () => Object.keys(templates) });
})();

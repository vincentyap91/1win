await sleep(500);
// Access templates indirectly by expand
const id = 'sidebar.standard.casino-live-1440x900.fd82742b';
const slot = `<template data-shared-component="${id}"></template>`;
let expanded = '';
try { expanded = window.SHARED_UI.expand(slot); } catch (e) { return { error: String(e) }; }
const i = expanded.indexOf('data-testid="casino-group-toggle"');
const slice = expanded.slice(i, i + 2000);
const ei = slice.indexOf('expanded-view_expandable');
const after = slice.slice(ei);
const gt = after.indexOf('>');
const fromTemplate = after.slice(gt + 1, gt + 300);

// Also find how many casino-group-toggle vs casino-group links
const toggles = document.querySelectorAll('[data-testid="casino-group-toggle"]').length;
const groups = document.querySelectorAll('[data-testid="sidebar-navigation-casino-group"]').length;
const expandables = [...document.querySelectorAll('[class*="expanded-view_expandable"]')];

// Check if mount replaced with empty - compare template expand count of items
const templateItemCount = (expanded.match(/expanded-view_items-DJsWU/g) || []).length;
const templateMenuLinks = (expanded.match(/sidebar-navigation-/g) || []).length;

return {
  templateExpandPreview: fromTemplate.replace(/\s+/g, ' ').trim().slice(0, 220),
  templateExpandLen: fromTemplate.length,
  templateHasItems: /expanded-view_itemsContainer/.test(fromTemplate),
  toggles, groups,
  domExpandLens: expandables.map(e => e.innerHTML.length),
  templateItemCount,
  templateMenuLinks,
  // Did something clear after mount?
  scripts: [...document.scripts].map(s => s.src.split('/').pop()).filter(Boolean),
};

# 1win — reference replication contract

Reference: https://one-vv3591.com/
User destination: C:\Users\Vincent\OneDrive\Desktop\1win
Deliver a local HTML5 / CSS3 / vanilla JavaScript project. Do not deploy.

## Objective
Reproduce the inspected reference's visual presentation and front-end behavior with the highest verifiable fidelity. No redesign, modernization, simplification, theme substitution, or creative interpretation. Never claim 100% fidelity without evidence. The folder name is not evidence of the site's actual appearance. Do not use another 1win site as a substitute.

## Read before continuing
Read PROGRESS.md, qa/audit.json and qa/page-inventory.csv. Update these after meaningful work so future sessions can resume. The current cloud session could not load the reference. No design tokens, routes, fonts, assets, or actual page layout have been verified. No replica page has been implemented.

## Phase 1: inspect
Use an authorized interactive browser to inspect every publicly accessible route and significant state. Inventory the URL, title, components, interactions, responsive behavior and inspection status. Follow observed navigation; never invent routes. Inspect menus, dropdowns, search, provider/game filters, tabs, forms, validation, dialogs, notifications, carousels, loading, empty, success and error states, hover/focus/selected/disabled states, sticky navigation and scroll behavior. Inspect authenticated views only with authorized test access. Do not bypass access restrictions or perform real financial or wagering actions.

If blocked, record the exact observed limitation. Continue work independent of that blocker. Never invent an inaccessible design or mark an uninspected page as complete. Ordinary implementation choices within the authorized scope do not require repeated approval.

## Phase 2: measure and collect
Record font family and exact weights, sizes, line heights, letter spacing, text and wrapping; widths, heights, coordinates, margins, padding, gaps; colors, gradients, opacity, shadows, borders and radii; image crops, icon geometry and assets; breakpoints, visibility and ordering; transition duration and animation behavior. Use measured computed styles and bounding boxes where available. Label screenshot-derived estimates. Keep original asset proportions. Use original fonts/artwork only when permitted and accessible; report missing assets rather than silently substituting them. Do not generate new art to fill unknown parts.

## Phase 3: implement
Use real HTML elements, CSS and working vanilla JS, shared components/styles and page files or local routes. Preserve inspected content, navigation, responsive layout and state changes. Do not implement the entire UI as screenshots. Internal links must work. Never use placeholders as final artwork. Keep guest screens faithful; clearly explain demo/backend limitations in the README. No production authentication, payment, balance, wagering, settlement or provider integration is inferred from a static UI. Do not collect or transmit real credentials or payment information. Mock behavior, if needed, stays local and is explicitly recorded.

## Phase 4: responsive coverage
Reference and implementation must be compared at identical CSS viewport sizes:
- Desktop: 1920×1080 and 1440×900.
- Tablet: 768×1024.
- Mobile: 390×844 and 430×932.
Check widths between these too. Match observed mobile navigation/order, not a shrunken desktop. Record browser version, OS, device scale factor, zoom, locale, scroll position, state and baseline time. Desktop widths alone do not prove mobile behavior.

## Phase 5: visual QA
For each page/state capture both reference and local screenshots at identical viewport, zoom, browser/OS/DPR, scroll position and UI state. Compare side by side, by overlay and by difference image where feasible. Check coordinates, section heights, text wraps/font metrics, crops, alignment, padding, margins, colors, borders and shadows. Identify every mismatch, fix, recapture. Stabilize dynamic content/animations only through an explicitly recorded baseline procedure. Mask justified dynamic regions rather than silently ignoring them. A numeric pixel score is evidence for that capture only, not proof of complete site fidelity. Record remaining differences and tolerances; do not invent a passing threshold.

## Phase 6: behavioral QA
Exercise navigation, all inspected menus/tabs/search/filters, carousels, forms, modal open/close, notifications and scroll/sticky behavior. Check console errors, missing assets/fonts, overflow and mobile navigation. Untested interactions remain unverified. Perform meaningful checks appropriate to changes and fix observed failures.

## Phase 7: finish
Deliver all verified pages, authorized local assets, shared HTML/CSS/JS, responsive interactions, full discovered sitemap/inventory, comparison evidence, QA records, setup README and remaining limitations. Report coverage as inspected / implemented / visually compared / behaviorally tested. Distinguish precise measured matches from approximations. Never silently omit pages, stop at a homepage and call the site complete, or claim backend functionality is replicated.

## Execution order
Audit accessible site → extract measured design/assets → implement and verify homepage → remaining pages and states → final visual/behavioral QA. Use deeper analysis for inspection, difficult interactions and comparison fixes; be efficient on routine repeated work while preserving the established values. Do not change model or reasoning UI automatically or claim a prompt changes those settings. Prioritize correctness over speed.

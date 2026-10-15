// use_figma script template: wrap an imported content SVG (upload_assets) into an editable page frame.
// Replace the PARAMS line before sending. Same structure as the existing page frames:
//   desktop: Frame 1440 → Body (row: 280 spacer + Container[Header, Content, Footer]) + Sidebar instance
//   mobile:  Frame 390  → Body (column: Header, Content, Footer) + Bottom navigation (absolute, viewport bottom)
// Text layers carry their CSS weight as "__w600" in the name (SVG import maps 600 to Bold); it is applied here.
const PARAMS = {contentId: 'X', title: 'Page', viewport: 'desktop', pageId: '7:4', header: '28:65', sidebar: '28:403', footer: '28:640', nav: '38:543'};
const page = await figma.getNodeByIdAsync(PARAMS.pageId);
await figma.setCurrentPageAsync(page);
const content = await figma.getNodeByIdAsync(PARAMS.contentId);
const desktop = PARAMS.viewport === 'desktop';
const W = desktop ? 1440 : 390;
const name = `${PARAMS.title} · ${desktop ? 'Desktop 1440' : 'Mobile 390'} · Editable`;
const existing = page.children.find(n => n.name === name);
if (existing) return {alreadyExists: existing.id};
// Fonts: Inter weights used by the source.
const styles = {400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black'};
for (const s of new Set(Object.values(styles))) await figma.loadFontAsync({family: 'Inter', style: s});
const texts = content.findAll(n => n.type === 'TEXT');
let reweighted = 0;
for (const t of texts) {
  for (const seg of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(seg.fontName);
  const m = /__w(\d+)/.exec(t.name);
  if (m) { const w = Math.round(+m[1] / 100) * 100; const style = styles[w] || 'Regular'; if (t.fontName.style !== style) { t.fontName = {family: 'Inter', style}; reweighted++; } }
  t.name = t.characters.slice(0, 60) || 'Text';
}
// Readable layer names: drop CSS-module hashes ("variant-1_root-BE5MN" → "variant-1 root").
content.findAll(n => n.type !== 'TEXT').forEach(n => { n.name = n.name.replace(/[-_][A-Za-z0-9]{5}(_\d+)?$/, '').replace(/_\d+$/, '').replace(/_/g, ' '); });
content.name = 'Content';
// Page frame.
const frame = figma.createFrame();
frame.name = name;
frame.fills = [{type: 'SOLID', color: {r: 20 / 255, g: 20 / 255, b: 21 / 255}}];
frame.clipsContent = true;
const body = figma.createAutoLayout(desktop ? 'HORIZONTAL' : 'VERTICAL', {name: 'Body'});
body.fills = [];
frame.appendChild(body);
const header = (await figma.getNodeByIdAsync(PARAMS.header)).createInstance();
const footer = (await figma.getNodeByIdAsync(PARAMS.footer)).createInstance();
let column = body;
if (desktop) {
  const spacer = figma.createFrame(); spacer.name = 'Sidebar space'; spacer.resize(280, 1); spacer.fills = []; body.appendChild(spacer);
  column = figma.createAutoLayout('VERTICAL', {name: 'Container'}); column.fills = []; body.appendChild(column);
}
column.appendChild(header);
column.appendChild(content);
column.appendChild(footer);
content.x = 0; content.y = 0;
const height = body.height + (desktop ? 0 : 60);
frame.resize(W, Math.max(desktop ? 900 : 844, height));
body.x = 0; body.y = 0;
const created = [frame.id, body.id, header.id, footer.id];
if (desktop) {
  const sidebar = (await figma.getNodeByIdAsync(PARAMS.sidebar)).createInstance();
  frame.appendChild(sidebar); sidebar.x = 0; sidebar.y = 0; created.push(sidebar.id);
} else {
  const nav = (await figma.getNodeByIdAsync(PARAMS.nav)).createInstance();
  frame.appendChild(nav); nav.x = 0; nav.y = 844 - nav.height; created.push(nav.id);
}
// Place below/after the existing frames without overlapping them.
const others = page.children.filter(n => n !== frame && n.type === 'FRAME' && /· Editable$/.test(n.name));
if (desktop) {
  const bottom = Math.max(...others.map(n => n.y + n.height));
  const row = others.filter(n => n.y > bottom - 12000 && n.y + n.height >= bottom - 12000);
  const lastRowY = Math.max(...others.map(n => n.y));
  const inRow = others.filter(n => n.y === lastRowY);
  const nextX = Math.max(...inRow.map(n => n.x + n.width)) + 160;
  if (nextX + W < 5000) { frame.x = nextX; frame.y = lastRowY; } else { frame.x = 100; frame.y = Math.ceil((bottom + 400) / 100) * 100; }
} else {
  frame.x = Math.max(...others.map(n => n.x + n.width)) + 160; frame.y = 100;
}
return {frameId: frame.id, name, size: [frame.width, frame.height], at: [frame.x, frame.y], texts: texts.length, reweighted, created};

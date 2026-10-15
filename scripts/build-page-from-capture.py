"""Create (or refresh) a local page entry from full-page reference captures made by reference-capture-cdp.mjs.

  python scripts/build-page-from-capture.py --page sports-markets --route /betting/markets \
      --template sports --captures DIR --date YYYY-MM-DD [--title "Sports Markets"]

For every <page>-<W>x<H>.json in DIR:
- the captured <body> is cleaned with the shared capture rules (links, local media, masks, var urls);
- guest state  -> js/<page>.js  (window.PAGE_STATES)
- Demo state   -> js/<page>-auth.js: the guest body with the signed-in header and sidebar profile taken from the
  template page's Demo state of the same size (same rule as audit-update.py for pages without a signed-in capture);
- <page>.html is written from the template entry (head, scripts) with the 1440 state as initial body;
- CSS rules for classes the project does not style yet are copied from the captured stylesheets into css/audit.css;
- the route is registered in js/routes.js and the footer signature in qa/footer-*/footer-signatures.json.
Run migrate-shared-components.py and build-components.mjs afterwards (header/sidebar/footer become shared slots).
"""
import argparse
import html as htmllib
import json
import pathlib
import re

from capture_clean import ROOT, Media, clean, parse
from html_fragments import Fragments
from local_mask_assets import embed_css_masks, embed_html_masks
from shared_components import expand, read_templates

SIZES = ['1920x1080', '1440x900', '768x1024', '430x932', '390x844']


def load_states(path, prefix):
    return json.loads(path.read_text(encoding='utf-8')[len(prefix):].rstrip().rstrip(';'))


def neutral_ids(markup):
    # Other players' identifiers in live feeds are already masked by the site; neutralise the visible letter too.
    return re.sub(r'(prize-card-v1_userId-[\w-]+">)\s*[^*\s<]', r'\1u', markup)


def element(source, predicate):
    tree = Fragments(source)
    for node in tree.elements:
        if node.end and predicate(node):
            return tree, node
    return tree, None


def is_header(node):
    return node.tag == 'header' and any(c.startswith(('variant-1_root-', 'variant-2_root-', 'header_root-')) for c in node.classes.split())


def is_profile(node):
    return node.attrs.get('data-testid') == 'sidebar-profile-button'


def drop_guest_auth_dialog(markup):
    """A guest-only page may open Registration/Login on load; a signed-in visitor never sees it."""
    tree, node = element(markup, lambda n: n.attrs.get('data-testid') == 'modal-layout')
    if node and 'data-testid="auth"' in markup[node.start:node.end]:
        markup = tree.replace([(node, '')])
        markup = markup.replace('<div inert="">', '<div>', 1)
    return markup


def signed_variant(guest, signed_template):
    """Swap the guest header and sidebar profile for the signed-in ones of the template page."""
    out = drop_guest_auth_dialog(guest)
    for pred in (is_header, is_profile):
        _, src = element(signed_template, pred)
        tree, dst = element(out, pred)
        if src and dst:
            out = tree.replace([(dst, signed_template[src.start:src.end])])
    return out


def css_rules(text):
    """Split stylesheet text into top-level blocks (rules or at-rules with their bodies)."""
    rules, depth, start = [], 0, 0
    for i, ch in enumerate(text):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                rules.append(text[start:i + 1].strip()); start = i + 1
    return rules


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--page', required=True)
    ap.add_argument('--route', required=True)
    ap.add_argument('--template', required=True)
    ap.add_argument('--captures', required=True)
    ap.add_argument('--date', required=True)
    ap.add_argument('--title')
    args = ap.parse_args()
    cap_dir = pathlib.Path(args.captures)
    media = Media(args.date)
    templates = read_templates()
    tpl_auth = load_states(ROOT / 'js' / (args.template + '-auth.js'), 'window.AUTH_PAGE_STATES=')
    guest, auth, css_texts, footer = {}, {}, [], {}
    for size in SIZES:
        cap = cap_dir / f'{args.page}-{size}.json'
        if not cap.exists():
            continue
        d = json.loads(cap.read_text(encoding='utf-8'))
        if d.get('signed'):
            raise SystemExit('capture is signed in: ' + cap.name)
        root = parse(d['body'])
        clean(root, media)
        body = neutral_ids(embed_html_masks(root.render(), ROOT))
        attrs = {k: v for k, v in d.get('bodyAttrs', {}).items() if k not in ('inert', 'style')}
        key = f'{args.page}-{size}'
        guest[key] = {'html': body, 'attrs': attrs}
        tkey = f'{args.template}-{size}'
        if tkey in tpl_auth:
            auth[key] = {'html': signed_variant(body, expand(tpl_auth[tkey]['html'], templates)), 'attrs': attrs,
                         'coverage': 'guest capture with the signed-in header/profile of ' + args.template}
        css_texts += [s['text'] for s in d.get('css', []) if s.get('text')]
        footer['desktop' if int(size.split('x')[0]) >= 1024 else 'mobile'] = d.get('footerSig')
    if not guest:
        raise SystemExit('no captures for ' + args.page)

    (ROOT / 'js' / f'{args.page}.js').write_text('window.PAGE_STATES=' + json.dumps(guest, ensure_ascii=False) + ';\n', encoding='utf-8')
    (ROOT / 'js' / f'{args.page}-auth.js').write_text('window.AUTH_PAGE_STATES=' + json.dumps(auth, ensure_ascii=False) + ';\n', encoding='utf-8')

    # HTML entry from the template entry.
    tpl_html = (ROOT / ('index.html' if args.template == 'home' else args.template + '.html')).read_text(encoding='utf-8')
    head = tpl_html[:tpl_html.index('<body')]
    title = args.title or ' '.join(w.capitalize() for w in args.page.split('-'))
    head = re.sub(r'<title>[^<]*</title>', '<title>1win | ' + htmllib.escape(title) + '</title>', head, count=1)
    scripts = ''.join(re.findall(r'<script src="[^"]+"></script>', tpl_html))
    scripts = scripts.replace(f'js/{args.template}.js"', f'js/{args.page}.js"').replace(f'js/{args.template}-auth.js"', f'js/{args.page}-auth.js"')
    # Infinite-scroll cards belong to the template's category; build-more-cards.py adds the page's own file.
    scripts = scripts.replace(f'<script src="js/{args.template}-more.js"></script>', '')
    first = guest.get(f'{args.page}-1440x900') or next(iter(guest.values()))
    battrs = dict(first['attrs']); battrs.update({'data-page': args.page, 'data-state': next(k for k, v in guest.items() if v is first), 'data-asset-prefix': ''})
    body_open = '<body' + ''.join(f' {k}="{htmllib.escape(v or "", quote=True)}"' for k, v in battrs.items()) + '>'
    (ROOT / f'{args.page}.html').write_text(head + body_open + first['html'] + scripts + '</body></html>\n', encoding='utf-8')

    # CSS for classes that have no rule yet.
    css_path = ROOT / 'css/audit.css'
    existing = css_path.read_text(encoding='utf-8') + (ROOT / 'css/styles.css').read_text(encoding='utf-8')
    used = set(c for v in guest.values() for m in re.findall(r'class="([^"]*)"', v['html']) for c in m.split())
    missing = {c for c in used if '.' + c not in existing and re.match(r'^[A-Za-z][\w-]*-[A-Za-z0-9]{5}$', c)}
    added, seen = [], set()
    for text in css_texts:
        for rule in css_rules(text):
            if rule in seen or rule in existing:
                continue
            if any(re.search(r'\.' + re.escape(c) + r'(?![\w-])', rule) for c in missing):
                seen.add(rule)
                added.append(re.sub(r'url\(\s*[\'"]?([^)\'"]+)[\'"]?\s*\)', lambda m: 'url("' + ('../' + media.map(m[1]) if not m[1].startswith(('data:', '#', '%23')) else m[1]) + '")', rule))
    if added:
        block = embed_css_masks('\n'.join(added), ROOT)
        with css_path.open('a', encoding='utf-8') as f:
            f.write(f'\n/* {args.page} ({args.route}) — rules for classes first seen on this page, {args.date} */\n' + block + '\n')

    # Routes and footer table.
    routes_path = ROOT / 'js/routes.js'
    routes = json.loads(routes_path.read_text(encoding='utf-8-sig').split('=', 1)[1].strip().removesuffix(';'))
    routes['pages'][args.route] = args.page + '.html'
    routes_path.write_text('window.PROJECT_ROUTES=' + json.dumps(routes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    table_path = sorted((ROOT / 'qa').glob('footer-*/footer-signatures.json'))[-1]
    table = json.loads(table_path.read_text(encoding='utf-8'))
    if footer.get('desktop') or footer.get('mobile'):
        table['routes'][args.route] = {k: v for k, v in footer.items() if v}
        table['pages'][args.page] = args.route
        table_path.write_text(json.dumps(table, ensure_ascii=False, indent=2), encoding='utf-8')
    media.save()
    print(json.dumps({'page': args.page, 'states': len(guest), 'auth': len(auth), 'css_rules_added': len(added), 'missing_classes': len(missing),
                      'images_downloaded': len(media.downloaded), 'images_missing': len(media.missing), 'footer': footer}))


if __name__ == '__main__':
    main()

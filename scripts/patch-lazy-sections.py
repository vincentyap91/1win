"""Replace lazy-loaded lobby sections in a page's states with blocks captured from the reference site.

Usage:
  python scripts/patch-lazy-sections.py --page casino --captures DIR --date YYYY-MM-DD [--auth]

DIR holds <page>-<W>x<H>.json files: {"blocks": {"i0": outerHTML, ..., "lastwins": outerHTML}}.
Only [data-index] lobby rows and the Last wins block are touched; everything else stays byte-identical.
"""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import shutil

from capture_clean import ROOT, Media, clean, parse
from html_fragments import Fragments
from local_mask_assets import embed_html_masks

TRANSIENT = re.compile(r'(slide-(enter|leave)[\w-]*|[\w-]*_slide(Enter|Leave|Move)[\w-]*)$')


def tidy_last_wins(root):
    """Settle the TransitionGroup snapshot: drop leaving cards and transition classes."""
    for node in list(root.walk()):
        cls = node.attrs.get('class')
        if cls is None:
            continue
        if 'slide-leave-active' in cls.split() and node.parent:
            node.parent.children.remove(node)
            continue
        kept = [c for c in cls.split() if not TRANSIENT.match(c)]
        node.attrs['class'] = ' '.join(kept)
    for node in root.walk():
        if 'prize-card-v1_userId' in node.attrs.get('class', ''):
            for ch in node.children:
                if ch.text:
                    # Other players' identifiers are already masked by the site; neutralise the visible letter too.
                    ch.text = re.sub(r'^\s*[^*\s]', 'u', ch.text)


def cleaned(markup, media, last_wins=False):
    root = parse(markup)
    clean(root, media)
    if last_wins:
        tidy_last_wins(root)
    # Mask icons must be data URLs: file:// blocks CORS mask fetches and var() urls resolve against css/.
    return embed_html_masks(root.render(), ROOT)


def lobby_targets(source):
    tree = Fragments(source)
    rows, last, lobby, footer = {}, None, None, None
    for node in tree.elements:
        if lobby is None and 'variant-1_root-aNH8T' in node.classes and any('casino-preset-navigation_root' in d.classes for d in tree.elements if d.start > node.start and d.end and node.end and d.end <= node.end):
            lobby = node
        if footer is None and node.tag == 'div' and node.attrs.get('style') == 'position: relative;' and node.parent and 'layout-main_main' in node.parent.classes:
            footer = node
        if 'data-index' in node.attrs and node.parent and 'variant-1_root-aNH8T' in node.parent.classes:
            rows[node.attrs['data-index']] = node
        if node.tag == 'div' and not node.attrs and node.children and len(node.children) == 1:
            only = node.children[0]
            if 'last-wins-placeholder_root' in only.classes or only.attrs.get('data-testid') == 'casino-last-wins':
                last = node
    return tree, rows, last, lobby, footer


def patch(source, blocks, media, report, label):
    tree, rows, last, lobby, footer = lobby_targets(source)
    replacements = []
    if 'lobby' in blocks:
        # Whole-container refresh: one consistent snapshot of every lobby block.
        if not lobby:
            report['unmatched'].append(label + ':lobby')
            return source
        replacements.append((lobby, cleaned(blocks['lobby'], media, True)))
        if 'footer' in blocks:
            if footer:
                replacements.append((footer, cleaned(blocks['footer'], media)))
            else:
                report['unmatched'].append(label + ':footer')
        report['replaced'][label] = len(replacements)
        return tree.replace(replacements)
    for key, markup in blocks.items():
        if key == 'lastwins':
            continue
        index = key[1:]
        if index in rows:
            replacements.append((rows[index], cleaned(markup, media)))
        else:
            report['unmatched'].append(label + ':' + key)
    if 'lastwins' in blocks:
        if last:
            replacements.append((last, cleaned(blocks['lastwins'], media, True)))
        else:
            report['unmatched'].append(label + ':lastwins')
    extra = sorted(set(rows) - {k[1:] for k in blocks if k != 'lastwins'}, key=int)
    if extra:
        report['kept_rows'].append({label: extra})
    report['replaced'][label] = len(replacements)
    return tree.replace(replacements)


def keep_first_backup(file, evidence):
    """The first run's copy is the pre-change original; later runs must not replace it."""
    target = evidence / 'backup' / file.name
    if not target.exists():
        shutil.copy2(file, target)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--page', required=True)
    ap.add_argument('--captures', required=True)
    ap.add_argument('--date', default=datetime.date.today().isoformat())
    ap.add_argument('--auth', action='store_true')
    args = ap.parse_args()
    date = datetime.date.fromisoformat(args.date).isoformat()
    captures = pathlib.Path(args.captures)
    evidence = ROOT / 'qa' / ('lazy-sections-' + date) / args.page
    (evidence / 'backup').mkdir(parents=True, exist_ok=True)
    (evidence / 'reference').mkdir(parents=True, exist_ok=True)

    state_file = ROOT / 'js' / (args.page + ('-auth' if args.auth else '') + '.js')
    prefix = 'window.AUTH_PAGE_STATES=' if args.auth else 'window.PAGE_STATES='
    text = state_file.read_text(encoding='utf-8')
    if not text.startswith(prefix):
        raise SystemExit('Unexpected state file format: ' + str(state_file))
    states = json.loads(text[len(prefix):].rstrip().rstrip(';'))
    html_file = ROOT / ('index.html' if args.page == 'home' else args.page + '.html')

    media = Media(date)
    report = {'page': args.page, 'auth': args.auth, 'date': date, 'replaced': {}, 'unmatched': [], 'kept_rows': [], 'captures': {}}
    keep_first_backup(state_file, evidence)
    html_patched = None
    for key in states:
        size = key.rsplit('-', 1)[1]
        cap = captures / (args.page + ('-auth' if args.auth else '') + '-' + size + '.json')
        if not cap.exists():
            report['unmatched'].append(key + ':no-capture')
            continue
        data = json.loads(cap.read_text(encoding='utf-8'))
        raw = cap.read_bytes()
        report['captures'][key] = {'file': cap.name, 'sha256': hashlib.sha256(raw).hexdigest()[:12], 'captured_at': data.get('at'), 'viewport': [data.get('w'), data.get('h')]}
        shutil.copy2(cap, evidence / 'reference' / cap.name)
        before = states[key]['html']
        states[key]['html'] = patch(before, data['blocks'], media, report, key)
        if not args.auth and size == '1440x900':
            keep_first_backup(html_file, evidence)
            html_patched = patch(html_file.read_text(encoding='utf-8'), data['blocks'], media, report, html_file.name)

    state_file.write_text(prefix + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
    if html_patched is not None:
        html_file.write_text(html_patched, encoding='utf-8')
    media.save()
    report['downloaded'] = media.downloaded
    report['missing'] = media.missing
    out = evidence / ('patch-report' + ('-auth' if args.auth else '') + '.json')
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['replaced', 'unmatched', 'kept_rows']}, ensure_ascii=False), 'downloaded', len(media.downloaded), 'missing', len(media.missing))


if __name__ == '__main__':
    main()

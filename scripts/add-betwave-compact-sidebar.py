"""Add the Betwave-family compact sidebar (sidebar_root-qgno1) to js/sidebar.js as SIDEBAR_STATES['compact-betwave'].

Betwave uses its own sidebar markup, so the standard compact template made its collapsed state differ
from the reference. The capture is the reference sidebar outerHTML at 1440x900 (guest, collapsed),
saved by the in-page probe; it is cleaned with the same rules as other captures.

  python scripts/add-betwave-compact-sidebar.py <capture.json> --date YYYY-MM-DD
"""
import argparse
import json

from capture_clean import ROOT, Media, clean, parse
from local_mask_assets import embed_html_masks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('capture')
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    data = json.loads(open(args.capture, encoding='utf-8').read())
    media = Media(args.date)
    tree = parse(data['html'])
    clean(tree, media)
    html = embed_html_masks(tree.render(), ROOT)
    evidence = ROOT / 'qa' / ('sidebar-toggle-' + args.date)
    evidence.mkdir(parents=True, exist_ok=True)
    (evidence / 'reference-betwave-compact.html').write_text(data['html'], encoding='utf-8')
    path = ROOT / 'js/sidebar.js'
    states = json.loads(path.read_text(encoding='utf-8').split('=', 1)[1].strip().removesuffix(';'))
    states['compact-betwave'] = {'html': html, 'capture': 'qa/sidebar-toggle-' + args.date + '/reference-betwave-compact.html'}
    path.write_text('window.SIDEBAR_STATES=' + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
    media.save()
    print(json.dumps({'states': list(states), 'downloaded': len(media.downloaded), 'missing': media.missing}))


if __name__ == '__main__':
    main()

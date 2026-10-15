"""Build js/promotions-modals.js from reference captures of the promotion detail dialogs.

On /promotions, clicking a card title opens a dialog on the same URL (no route change). The capture holds,
per size, the dialog markup for each card title; js/common.js opens the matching one.

  python scripts/build-promo-modals.py <promo-modals-all.json> --date YYYY-MM-DD
"""
import argparse
import html
import json

from capture_clean import ROOT, Media, clean, parse
from local_mask_assets import embed_html_masks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('capture')
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    data = json.load(open(args.capture, encoding='utf-8'))
    media = Media(args.date)
    out = {}
    for size, items in data.items():
        out[size] = {}
        for item in items:
            if not item.get('html'):
                continue
            root = parse(item['html']); clean(root, media)
            title = html.unescape(item['title'].split(':dir(rtl)')[0]).replace('\xa0', ' ').strip()
            out[size][title] = embed_html_masks(root.render(), ROOT)
    (ROOT / 'js/promotions-modals.js').write_text('window.PROMO_MODALS=' + json.dumps(out, ensure_ascii=False) + ';\n', encoding='utf-8')
    evidence = ROOT / 'qa' / ('promotions-' + args.date); evidence.mkdir(parents=True, exist_ok=True)
    json.dump(data, open(evidence / 'reference-promo-modals.json', 'w', encoding='utf-8'), ensure_ascii=False)
    media.save()
    print(json.dumps({s: len(v) for s, v in out.items()} | {'downloaded': len(media.downloaded), 'missing': len(media.missing)}))


if __name__ == '__main__':
    main()

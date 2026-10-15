"""Build js/<page>-more.js for casino category infinite scroll.

The reference appends one page of game cards (as large as the first page: 1920 27, 1440 24, 768 21, 390 9) each time
the empty marker after the grid reaches the viewport bottom, repeating while it stays visible. The collector (probe-more-cards.js run by reference-run-cdp.mjs, one JSON per page) returns the
initial count, the counts after each load and the added cards. We keep the first LOADS batches, clean them like any
capture (local images, routes) and write window.CASINO_MORE_CARDS = {"<size>": {"start": n, "batches": [[html…]…]}}.
js/common.js appends one batch each time the grid end comes into view.

  python scripts/build-more-cards.py --captures DIR --date YYYY-MM-DD [--loads 1]
"""
import argparse
import json
import re
from pathlib import Path

from capture_clean import ROOT, Media, clean, parse
from local_mask_assets import embed_html_masks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--captures', required=True)
    ap.add_argument('--date', required=True)
    ap.add_argument('--loads', type=int, default=2)
    args = ap.parse_args()
    media = Media(args.date)
    report = {}
    for f in sorted(Path(args.captures).glob('casino-*.json')):
        page = f.stem
        if '@' in page:
            continue
        html_path = ROOT / f'{page}.html'
        if not html_path.exists():
            continue
        data = json.load(open(f, encoding='utf-8'))
        for extra in Path(args.captures).glob(page + '@*.json'):  # other sizes collected in a later run
            data.update(json.load(open(extra, encoding='utf-8')))
        out = {}
        for size, v in data.items():
            if not isinstance(v, dict) or not v.get('cards'):
                continue
            counts = [v['start']] + v['steps']
            batches = []
            for i in range(min(args.loads, len(v['steps']))):
                part = v['cards'][counts[i] - v['start']:counts[i + 1] - v['start']]
                if not part:
                    break
                root = parse(''.join(part)); clean(root, media)
                batches.append(embed_html_masks(root.render(), ROOT))
            if batches:
                # One reference page is as large as the first one (1440: 24, 390: 9); the collector's jump to the bottom
                # loaded two pages at once, so its counts are not the page size (captures/more-steps-slots.json).
                out[size] = {'start': v['start'], 'step': v['start'], 'batches': batches}
        if not out:
            report[page] = 'no grid'
            continue
        (ROOT / f'js/{page}-more.js').write_text('window.CASINO_MORE_CARDS=' + json.dumps(out, ensure_ascii=False) + ';\n', encoding='utf-8')
        html = html_path.read_text(encoding='utf-8')
        tag = f'<script src="js/{page}-more.js"></script>'
        if tag not in html:
            html = re.sub(r'(<script src="js/common\.js")', tag + r'\n\1', html, count=1)
            html_path.write_text(html, encoding='utf-8')
        report[page] = {s: [v['start'], len(re.findall(r'data-testid="game-card-', ''.join(v['batches'])))] for s, v in out.items()}
    evidence = ROOT / 'qa' / f'casino-more-{args.date}'; evidence.mkdir(parents=True, exist_ok=True)
    json.dump(report, open(evidence / 'report.json', 'w', encoding='utf-8'), indent=1)
    media.save()
    print(json.dumps({'pages': len([r for r in report.values() if r != 'no grid']), 'no_grid': [p for p, r in report.items() if r == 'no grid'], 'downloaded': len(media.downloaded), 'missing': len(media.missing)}))


if __name__ == '__main__':
    main()

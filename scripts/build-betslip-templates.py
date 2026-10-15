"""Build js/betslip-templates.js from reference betslip captures (guest, 2026-10-15).

  python scripts/build-betslip-templates.py <desktop.json> <mobile.json> --date YYYY-MM-DD

desktop.json: {"empty", "single", "multi"} — the right-column [data-scope="Betslip"] at 1440 with 0 / 1 / 2 selections.
mobile.json:  {"triggerHtml", "sheetHtml"} — the floating coupon button and the bottom sheet that opens on selection at 390.
The markup is cleaned with the shared capture rules; js/common.js fills the coupon rows from the clicked odd.
"""
import argparse
import json

from capture_clean import ROOT, Media, clean, parse
from local_mask_assets import embed_html_masks


def cleaned(markup, media):
    root = parse(markup)
    clean(root, media)
    return embed_html_masks(root.render(), ROOT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('desktop')
    ap.add_argument('mobile')
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    media = Media(args.date)
    desk = json.load(open(args.desktop, encoding='utf-8'))
    mob = json.load(open(args.mobile, encoding='utf-8'))
    out = {k: cleaned(desk[k], media) for k in ('empty', 'single', 'multi')}
    out['trigger'] = cleaned(mob['triggerHtml'], media)
    out['sheet'] = cleaned(mob['sheetHtml'], media)
    (ROOT / 'js/betslip-templates.js').write_text('window.BETSLIP_TEMPLATES=' + json.dumps(out, ensure_ascii=False) + ';\n', encoding='utf-8')
    evidence = ROOT / 'qa' / ('betslip-' + args.date)
    evidence.mkdir(parents=True, exist_ok=True)
    json.dump({'desktop': desk, 'mobile': mob}, open(evidence / 'reference-betslip.json', 'w', encoding='utf-8'), ensure_ascii=False)
    media.save()
    print(json.dumps({k: len(v) for k, v in out.items()} | {'downloaded': len(media.downloaded), 'missing': len(media.missing)}))


if __name__ == '__main__':
    main()

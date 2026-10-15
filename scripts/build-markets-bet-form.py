"""Build js/markets-bet-form.js: the inline Yes/No bet form of the Markets pages.

captures/markets-yes-no.json holds the market list before and after clicking Yes / No (1440 and 390). The form
markup is identical at both sizes apart from the outcome label, so one template is kept; common.js fills the
logo, title, question and "Yes 15%" label from the clicked card. Icons are localised the same way as page states.

  python scripts/build-markets-bet-form.py --date YYYY-MM-DD
"""
import json
import pathlib
import re

from capture_clean import ROOT, Media, clean_fragment
from local_mask_assets import embed_html_masks

PAGES = sorted(p.name for p in ROOT.glob('sports-markets*.html'))
LOGO, TITLE, QUESTION, OUTCOME = '{{logo}}', '{{title}}', '{{question}}', '{{outcome}}'


def element_at(html, start):
    """outerHTML of the element whose start tag begins at `start`, balanced on its tag name."""
    tag = re.match(r'<([a-zA-Z0-9-]+)', html[start:]).group(1)
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*?(/?)>' % tag, html[start:]):
        if m.group(1):
            depth -= 1
        elif not m.group(2):
            depth += 1
        if depth == 0:
            return html[start:start + m.end()]
    raise ValueError('unbalanced element')


def captured_form(after):
    m = re.search(r'<div[^>]*class="[^"]*_root_qead3_[^"]*"', after)
    if not m:
        raise SystemExit('No inline bet form (_root_qead3_) in the capture')
    return element_at(after, m.start())


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    data = json.loads((ROOT / 'captures/markets-yes-no.json').read_text(encoding='utf-8'))
    forms = {f'{size}.{side}': captured_form(rec['after']) for size, sides in data.items() for side, rec in sides.items()}
    # Only the outcome label differs between sizes and sides; refuse to build if the reference grows a size variant.
    normalised = {re.sub(r'(<span class="_text_1vsuw_55">)(Yes|No) \d+%', r'\1', f) for f in forms.values()}
    if len(normalised) != 1:
        raise SystemExit(f'Form markup differs between captures ({len(normalised)} variants); keep one template per size')
    form = forms['1440x900.Yes']
    form = re.sub(r'(<img class="_logo_1ih13_18" src=")[^"]*', r'\1' + LOGO, form, count=1)
    form = re.sub(r'(<div class="_title_1cufa_8">)[^<]*', r'\1' + TITLE, form, count=1)
    form = re.sub(r'(_labelContent_1vsuw_32">)[^<]*', r'\1' + QUESTION, form, count=1)
    form = re.sub(r'(<span class="_text_1vsuw_55">)(Yes|No) \d+%', r'\1' + OUTCOME, form, count=1)
    if any(p not in form for p in (LOGO, TITLE, QUESTION, OUTCOME)):
        raise SystemExit('Form structure changed; placeholders were not all placed')
    # Hide the placeholder logo from the asset cleaner, then localise the close / minus / plus mask icons.
    media = Media(args.date)
    form = embed_html_masks(clean_fragment(form.replace(LOGO, 'data:,'), media), ROOT).replace('data:,', LOGO, 1)
    if re.search(r'url\((&quot;|["\'])?/resources/', form):
        raise SystemExit('A form icon is still a remote /resources/ URL')
    (ROOT / 'js/markets-bet-form.js').write_text('window.MARKETS_BET_FORM=' + json.dumps(form, ensure_ascii=False) + ';\n', encoding='utf-8')
    tag = '<script src="js/markets-bet-form.js"></script>'
    for name in PAGES:
        path = ROOT / name
        html = path.read_text(encoding='utf-8')
        if tag not in html:
            html = html.replace('<script src="js/common.js"></script>', tag + '<script src="js/common.js"></script>')
            path.write_text(html, encoding='utf-8')
    media.save()
    print(json.dumps({'pages': len(PAGES), 'form_bytes': len(form), 'downloaded': len(media.downloaded), 'missing': len(media.missing)}))


if __name__ == '__main__':
    main()

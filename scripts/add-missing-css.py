"""Copy reference CSS rules for classes used by local markup that has no rule in css/audit.css or css/styles.css.

Some components load their CSS chunk only when they open (promotion dialog, betslip sheet …), so a page
capture does not include it. Capture the stylesheets while the component is open (reference-run-cdp.mjs
returning [{href, text}]) and run:

  python scripts/add-missing-css.py --css capture.json --markup js/promotions-modals.js [--markup …] --label promo --date YYYY-MM-DD

capture.json may be {"<size>": [{href,text}…]} as written by reference-run-cdp.mjs.
"""
import argparse
import json
import re

from capture_clean import ROOT, Media
from local_mask_assets import embed_css_masks


def css_rules(text):
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
    ap.add_argument('--css', required=True)
    ap.add_argument('--markup', action='append', required=True)
    ap.add_argument('--label', required=True)
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    raw = json.load(open(args.css, encoding='utf-8'))
    sheets = [s for v in (raw.values() if isinstance(raw, dict) else [raw]) for s in v]
    texts = [s['text'] for s in sheets if s.get('text')]
    css_path = ROOT / 'css/audit.css'
    existing = css_path.read_text(encoding='utf-8') + (ROOT / 'css/styles.css').read_text(encoding='utf-8')
    markup = ''.join(open(ROOT / m if not m.startswith(('/', 'C:')) else m, encoding='utf-8').read() for m in args.markup)
    used = set(c for m in re.findall(r'class=\\?"([^"\\]*)', markup) for c in m.split())
    missing = {c for c in used if '.' + c not in existing and re.match(r'^[A-Za-z_][\w-]*$', c)}
    media = Media(args.date)
    added, seen = [], set()
    for text in texts:
        for rule in css_rules(text):
            if rule in seen or rule in existing:
                continue
            if any(re.search(r'\.' + re.escape(c) + r'(?![\w-])', rule) for c in missing):
                seen.add(rule)
                added.append(re.sub(r'url\(\s*[\'"]?([^)\'"]+)[\'"]?\s*\)', lambda m: 'url("' + ('../' + media.map(m[1]) if not m[1].startswith(('data:', '#', '%23')) else m[1]) + '")', rule))
    if added:
        with css_path.open('a', encoding='utf-8') as f:
            f.write(f'\n/* {args.label} — rules loaded on demand by the reference, {args.date} */\n' + embed_css_masks('\n'.join(added), ROOT) + '\n')
    media.save()
    still = sorted(c for c in missing if not any(re.search(r'\.' + re.escape(c) + r'(?![\w-])', r) for r in added))
    print(json.dumps({'missing_before': len(missing), 'rules_added': len(added), 'still_missing': still[:40]}))


if __name__ == '__main__':
    main()

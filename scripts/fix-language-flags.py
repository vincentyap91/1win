"""Fill the language picker flags in js/dialogs.js.

The captured picker list was not scrolled, so most flag <img> kept the lazy placeholder src="data:,". The
reference list (button text + flag src, captured after scrolling the list) maps each language to its flag:

  python scripts/fix-language-flags.py <lang.json> --date YYYY-MM-DD

lang.json is {"<size>": [{"name": "...", "src": "/resources/v1/shared/images/languages/xx-XX.svg"}, ...]}.
"""
import argparse
import json
import re

from capture_clean import ROOT, Media


def key(text):
    return re.sub(r'\s+', '', text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('capture')
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    ref = {key(x['name']): x['src'] for v in json.load(open(args.capture, encoding='utf-8')).values() for x in v if x.get('src')}
    media = Media(args.date)
    path = ROOT / 'js/dialogs.js'
    raw = path.read_text(encoding='utf-8')
    prefix = 'window.DIALOG_STATES='
    states, end = json.JSONDecoder().raw_decode(raw, len(prefix))
    rest = raw[end:]  # other globals defined after the states (e.g. REFERENCE_SIDEBAR_ICONS)
    fixed = missing = 0
    for name, state in states.items():
        if not name.startswith('language'):
            continue
        parts = state['html'].split('<button')
        for i, part in enumerate(parts[1:], 1):
            if 'src="data:,"' not in part:
                continue
            text = key(re.sub(r'<svg[\s\S]*?</svg>|<[^>]+>', '', part.split('>', 1)[1].split('</button>')[0]))
            src = next((s for k, s in ref.items() if text.startswith(k) or k.startswith(text)), None)
            if not src:
                missing += 1; continue
            parts[i] = part.replace('src="data:,"', 'src="' + media.map(src) + '"', 1); fixed += 1
        state['html'] = '<button'.join(parts)
    path.write_text(prefix + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
    media.save()
    print(json.dumps({'fixed': fixed, 'unmatched': missing, 'downloaded': len(media.downloaded), 'missing_media': len(media.missing)}))


if __name__ == '__main__':
    main()

"""Turn <p> elements that contain block children (<div …>) into <div> so HTML parsing keeps the original nesting.

The reference builds its DOM with Vue, so <p class="x"><div class="custom-html_root">text</div></p> stays nested. When
our captured markup is parsed as HTML, the parser closes the <p> at the <div>: the text leaves the styled element
(VIP "by the numbers" captions lost their black caption style). A <div> with the same class keeps the structure; the
reference CSS for these classes sets margins explicitly, so the visual result matches.

  python scripts/fix-p-div-nesting.py [--dry-run]
"""
import glob
import json
import re
import sys

from capture_clean import ROOT

# <p …><div …>…</div></p> where the p holds exactly that block (plain or JS-escaped quotes inside attributes).
PAT = re.compile(r'<p((?:\s[^<>]*)?)>(<div\b(?:(?!</?p\b).)*?</div>)</p>', re.S)


def main():
    dry = '--dry-run' in sys.argv
    files = glob.glob(str(ROOT / '*.html')) + glob.glob(str(ROOT / 'js' / '*.js')) + glob.glob(str(ROOT / 'components' / '*.html'))
    total, touched = 0, 0
    for f in files:
        s = open(f, encoding='utf-8').read()
        if '<p' not in s:
            continue
        new, n = PAT.subn(r'<div\1>\2</div>', s)
        if n:
            total += n; touched += 1
            if not dry:
                open(f, 'w', encoding='utf-8').write(new)
    print(json.dumps({'files': touched, 'replaced': total, 'dry_run': dry}))


if __name__ == '__main__':
    main()

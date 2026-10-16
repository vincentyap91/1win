"""Drop srcset "2x" candidates that point at the same local file as the 1x one.

The reference serves different URLs for 1x and 2x (e.g. optimizeimages/.../quality_2to1/... vs .../quality/...), but they
are often byte-identical, so capture_clean stores them as one local asset and the srcset becomes "a.png, a.png 2x".
Browsers may then pick the 2x candidate and give the image half its intrinsic size (tournament leaderboard medals at
16px instead of 32px, loyalty trophies at 135px). Keeping only the first candidate restores the reference size.

  python scripts/fix-duplicate-srcset.py [--dry-run]
"""
import glob
import json
import re
import sys

from capture_clean import ROOT

# srcset="A, A 2x" / srcset="A 1x, A 2x", with plain or JS-escaped quotes.
PAT = re.compile(r'srcset=(\\?")([^"\\,\s]+)(?: 1x)?, \2 2x\1')


def main():
    dry = '--dry-run' in sys.argv
    report, total = {}, 0
    files = glob.glob(str(ROOT / '*.html')) + glob.glob(str(ROOT / 'js' / '*.js')) + glob.glob(str(ROOT / 'components' / '*.html'))
    for f in files:
        s = open(f, encoding='utf-8').read()
        new, n = PAT.subn(lambda m: f'srcset={m[1]}{m[2]}{m[1]}', s)
        if n:
            total += n
            report[f.replace(str(ROOT), '').lstrip('\\/')] = n
            if not dry:
                open(f, 'w', encoding='utf-8').write(new)
    print(json.dumps({'files': len(report), 'replaced': total, 'dry_run': dry}))


if __name__ == '__main__':
    main()

"""Repair srcset lists joined without a space ("a.avif,a.avif 2x"), which browsers read as a single URL.

Earlier captures joined candidates with "," only. Run once after older captures; it is idempotent.
"""
import datetime
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Matches srcset="..." in HTML and srcset=\"...\" inside JSON-encoded state scripts.
ATTR = re.compile(r'(srcset=\\?")([^"\\]*)')


def fix(value):
    return re.sub(r',(?=\S)', ', ', value)


def main(date):
    backup = ROOT / 'qa' / ('srcset-fix-' + date) / 'backup'
    files = list(ROOT.glob('*.html')) + list((ROOT / 'js').glob('*.js')) + list((ROOT / 'components').glob('*.html'))
    changed = {}
    for file in files:
        text = file.read_text(encoding='utf-8')
        count = 0

        def repl(m):
            nonlocal count
            new = fix(m[2])
            count += new != m[2]
            return m[1] + new
        out = ATTR.sub(repl, text)
        if count:
            target = backup / file.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                shutil.copy2(file, target)
            file.write_text(out, encoding='utf-8')
            changed[str(file.relative_to(ROOT))] = count
    print(sum(changed.values()), 'srcset values fixed in', len(changed), 'files')
    return changed


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().isoformat())

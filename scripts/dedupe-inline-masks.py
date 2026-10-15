"""Move repeated inline data-URL SVG masks into css/inline-masks.css custom properties.

local_mask_assets.py embeds mask images as data URLs (file:// cannot fetch masks), which repeats the same
base64 SVG in thousands of style attributes. This replaces each  url(&quot;data:image/svg+xml;base64,…&quot;)
inside style attributes with  var(--m-<hash>)  and defines the variables once on :root.
A data URL in a stylesheet has no base-path or CORS issue, so direct file:// previews keep working.
Idempotent; every HTML entry gets <link rel="stylesheet" href="css/inline-masks.css">.

  python scripts/dedupe-inline-masks.py [--apply]
"""
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Inside style="…" the quotes are &quot;; inside JSON-encoded states the same text appears unchanged.
PATTERN = re.compile(r'url\(&quot;(data:image/svg\+xml;base64,[A-Za-z0-9+/=]{200,})&quot;\)')
CSS = ROOT / 'css/inline-masks.css'


def main(apply):
    names = {}
    if CSS.exists():
        for m in re.finditer(r'(--m-[0-9a-f]{12}):\s*url\("([^"]+)"\)', CSS.read_text(encoding='utf-8')):
            names[m[2]] = m[1]
    files = list(ROOT.glob('*.html')) + list((ROOT / 'components').glob('*.html')) + [p for p in (ROOT / 'js').glob('*.js')]
    saved, changed = 0, 0
    for f in files:
        text = f.read_text(encoding='utf-8')
        if 'base64' not in text:
            continue

        def repl(m):
            data = m[1]
            name = names.setdefault(data, '--m-' + hashlib.sha256(data.encode()).hexdigest()[:12])
            return f'var({name})'
        new = PATTERN.sub(repl, text)
        if new != text:
            saved += len(text) - len(new); changed += 1
            if apply:
                f.write_text(new, encoding='utf-8')
    css = ':root{\n' + ''.join(f'{n}: url("{d}");\n' for d, n in sorted(names.items(), key=lambda x: x[1])) + '}\n'
    linked = 0
    if apply:
        CSS.write_text('/* Shared inline mask images (scripts/dedupe-inline-masks.py). */\n' + css, encoding='utf-8')
        for f in ROOT.glob('*.html'):
            s = f.read_text(encoding='utf-8')
            if 'css/inline-masks.css' not in s and 'href="css/audit.css">' in s:
                f.write_text(s.replace('href="css/audit.css">', 'href="css/audit.css"><link rel="stylesheet" href="css/inline-masks.css">', 1), encoding='utf-8')
                linked += 1
    print(json.dumps({'mode': 'applied' if apply else 'dry-run', 'files_changed': changed, 'bytes_saved': saved, 'unique_masks': len(names), 'html_linked': linked}))


if __name__ == '__main__':
    main('--apply' in sys.argv)

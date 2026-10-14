"""Point url() values stored in inline CSS custom properties at ../assets/.

Chrome resolves a url() held in a custom property against the stylesheet that reads it with var(),
and every consumer lives in css/. "assets/x.svg" therefore became css/assets/x.svg (404 over HTTP and
file://). Mask variables are embedded as data URLs by local_mask_assets.py; this handles the rest
(backgrounds, pictures). Idempotent.

  python scripts/fix-variable-urls.py [--apply]
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# --name: url("assets/..")  with the quote written as &quot; (HTML) or \" / &quot; inside JSON strings.
VAR_URL = re.compile(r'(--[\w-]+:\s*url\((?:&quot;|\\?["\']?)?)assets/')


def fix(text):
    return VAR_URL.subn(r'\1../assets/', text)


def main(apply):
    files = list(ROOT.glob('*.html')) + list((ROOT / 'components').glob('*.html')) + list((ROOT / 'js').glob('*.js'))
    changed = {}
    for file in files:
        text = file.read_text(encoding='utf-8')
        new, count = fix(text)
        if count:
            changed[str(file.relative_to(ROOT))] = count
            if apply:
                file.write_text(new, encoding='utf-8')
    print(json.dumps({'mode': 'applied' if apply else 'dry-run', 'urls': sum(changed.values()), 'files': len(changed)}))
    return changed


if __name__ == '__main__':
    main('--apply' in sys.argv)

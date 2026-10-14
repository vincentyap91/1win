"""Restore CSS backgrounds that the capture left as url("data:,") placeholders.

Values were read from the reference site's CSSOM on 2026-10-14:
- lottery ticket cells and the steps-card "done" state use files under /resources/v1/app/assets/;
- the 169x34 ticket shape inside .countdown_timer is an inline SVG whose filter='url(#a)' had been
  rewritten to data:, and whose '#' characters were left unencoded (which truncates a data URI).

  python scripts/fix-css-placeholders.py
"""
import hashlib
import json
import re
import urllib.request

from capture_clean import ROOT

ORIGIN = 'https://one-vv3591.com'
RULES = {
    '.lottery-ticket-editor-cell_ticketCellDashed-vdEFa': '/resources/v1/app/assets/icon-circle-dashed-DIwSFCSO.svg',
    '.lottery-ticket-editor-cell_ticketCellGrey-vdEFa': '/resources/v1/app/assets/lottery-icon-ball-grey-61NgVNXa.png',
    '.lottery-ticket-editor-cell_ticketCellGold-vdEFa': '/resources/v1/app/assets/lottery-icon-ball-gold-ClpM5kRC.png',
    '.steps-card_done-GnWal': '/resources/v1/app/assets/step-card-done-E-QK7FNH.svg',
}
TICKET_SVG = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='169' height='34' fill='none'%3E%3Cg filter='url(%23a)'%3E%3Cpath fill='%23fff' fill-opacity='.3' fill-rule='evenodd' d='M0 10A10 10 0 0 1 10 0h35a10 10 0 0 1 9.97 9.18 3 3 0 0 0 .03 5.65v4.34a3 3 0 0 0-.03 5.65A10 10 0 0 1 45 34H10A10 10 0 0 1 0 24V10Zm59 12a3 3 0 0 1-1.97 2.82A10 10 0 0 0 67 34h35a10 10 0 0 0 9.97-9.18 3 3 0 0 1 .03-5.65v-4.34a3 3 0 0 1-.03-5.65A10 10 0 0 0 102 0H67a10 10 0 0 0-9.97 9.18 3 3 0 0 1-.03 5.65v4.34A3 3 0 0 1 59 22Zm55.03 2.82a3 3 0 0 0-.03-5.65v-4.34a3 3 0 0 0 .03-5.65A10 10 0 0 1 124 0h35a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10h-35a10 10 0 0 1-9.97-9.18Z' clip-rule='evenodd'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='a' width='169' height='34' x='0' y='0' color-interpolation-filters='sRGB' filterUnits='userSpaceOnUse'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeColorMatrix in='SourceAlpha' result='hardAlpha' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'/%3E%3CfeOffset dy='1'/%3E%3CfeComposite in2='hardAlpha' k2='-1' k3='1' operator='arithmetic'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3CfeBlend in2='shape' result='effect1_innerShadow_14382_12803'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E\")")
BROKEN_TICKET = re.compile(r'url\("data:image/svg\+xml,<svg xmlns=\'http://www\.w3\.org/2000/svg\' width=\'169\' height=\'34\'[\s\S]*?</svg>"\)')
EXTS = {'image/svg+xml': '.svg', 'image/png': '.png'}


def local_file(path, provenance, known):
    url = ORIGIN + path
    if url in known:
        return known[url]['file']
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': ORIGIN + '/'})
    with urllib.request.urlopen(req, timeout=30) as r:
        mime = (r.headers.get('content-type') or '').split(';')[0]
        content = r.read()
    name = 'audit-' + hashlib.sha256(content).hexdigest()[:20] + EXTS[mime]
    (ROOT / 'assets' / name).write_bytes(content)
    entry = {'url': url, 'file': 'assets/' + name, 'kind': 'image', 'type': mime, 'observed_on': 'one-vv3591.com', 'capture': '2026-10-14'}
    provenance.append(entry); known[url] = entry
    return entry['file']


def main():
    provenance_path = ROOT / 'qa/asset-provenance.json'
    provenance = json.loads(provenance_path.read_text(encoding='utf-8'))
    known = {a['url']: a for a in provenance}
    counts = {}
    for name in ['audit.css', 'styles.css']:
        path = ROOT / 'css' / name
        css = path.read_text(encoding='utf-8')
        n = 0
        for selector, asset in RULES.items():
            pattern = re.compile(re.escape(selector) + r'(\s*\{[^}]*?)url\("data:,"\)')
            css, k = pattern.subn(lambda m: selector + m[1] + 'url("../' + local_file(asset, provenance, known) + '")', css)
            n += k
        css, k = BROKEN_TICKET.subn(lambda m: TICKET_SVG, css)
        # Already-encoded copies only lost the in-SVG filter reference.
        k += css.count("filter='url(\"data:,\")'")
        css = css.replace("filter='url(\"data:,\")'", "filter='url(%23a)'")
        counts[name] = n + k
        path.write_text(css, encoding='utf-8')
    provenance_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(counts))


if __name__ == '__main__':
    main()

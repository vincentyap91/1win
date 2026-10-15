"""List image URLs in a capture that have no local asset, and why fetching them fails.

  python scripts/missing-capture-images.py captures/DIR/page-1440x900.json
"""
import json
import re
import sys
import urllib.request
from urllib.parse import urljoin

from capture_clean import ORIGIN, ROOT

cap = json.loads(open(sys.argv[1], encoding='utf-8').read())
known = {a['url'] for a in json.loads((ROOT / 'qa/asset-provenance.json').read_text(encoding='utf8'))}
urls = set()
for m in re.finditer(r'<(?:img|source)\b[^>]*?\s(?:src|srcset)="([^"]+)"', cap['body']):
    for part in m[1].split(','):
        u = part.strip().split(' ')[0]
        if u and not u.startswith(('data:', '#')):
            urls.add(urljoin(ORIGIN, u.replace('&amp;', '&')))
for u in sorted(urls):
    if u in known or u.split('?')[0] in known:
        continue
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0', 'Referer': ORIGIN})
        with urllib.request.urlopen(req, timeout=20) as r:
            print('OK?', r.status, r.headers.get('content-type'), u)
    except Exception as e:
        print('FAIL', str(e)[:80], u)

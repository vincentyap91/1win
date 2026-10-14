"""Fill @font-face rules whose source was captured as an empty placeholder (url("data:,")).

Unicode-range subsets (Cyrillic, Greek, Vietnamese, Latin-ext, Devanagari ...) were never fetched during
capture, so text such as the Cyrillic "М" in a tournament name fell back to another font. The list of
reference faces comes from the live site's CSSOM (qa/fonts-<date>/reference-font-faces.json).

Also removes byte-identical duplicate @font-face blocks (keeping the last one, so the cascade is unchanged).
Fonts are embedded as base64 like the existing faces so file:// previews need no font fetch.

  python scripts/fill-missing-fonts.py --date YYYY-MM-DD
"""
import argparse
import base64
import hashlib
import json
import re
import shutil
import urllib.request

from capture_clean import ROOT

FACE = re.compile(r'@font-face\s*\{[^}]*\}')


def prop(block, name):
    m = re.search(name + r'\s*:\s*([^;]+)', block)
    return re.sub(r'\s+', ' ', m[1].strip()) if m else ''


def key(family, weight, style, urange):
    return '|'.join([family.strip().strip('"\''), weight, style or 'normal', re.sub(r'\s*,\s*', ',', urange.upper())])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    evidence = ROOT / 'qa' / ('fonts-' + args.date)
    faces = json.loads((evidence / 'reference-font-faces.json').read_text(encoding='utf-8'))
    urls = {key(f['family'], f['weight'], f['style'], f['range']): f['url'] for f in faces if f.get('url')}
    provenance_path = ROOT / 'qa/asset-provenance.json'
    provenance = json.loads(provenance_path.read_text(encoding='utf-8'))
    known = {a['url']: a for a in provenance}
    cache, filled, unresolved = {}, 0, []

    def data_url(url):
        if url in cache:
            return cache[url]
        item = known.get(url)
        if item and (ROOT / item['file']).is_file():
            content = (ROOT / item['file']).read_bytes()
        else:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://one-vv3591.com/'})
            with urllib.request.urlopen(req, timeout=30) as r:
                content = r.read()
            name = 'audit-' + hashlib.sha256(content).hexdigest()[:20] + '.woff2'
            (ROOT / 'assets' / name).write_bytes(content)
            entry = {'url': url, 'file': 'assets/' + name, 'kind': 'font', 'type': 'font/woff2', 'observed_on': 'one-vv3591.com', 'capture': args.date}
            provenance.append(entry); known[url] = entry
        cache[url] = 'data:font/woff2;base64,' + base64.b64encode(content).decode('ascii')
        return cache[url]

    def fill(m):
        nonlocal filled
        block = m[0]
        if 'url("data:,")' not in block:
            return block
        k = key(prop(block, 'font-family'), prop(block, 'font-weight'), prop(block, 'font-style'), prop(block, 'unicode-range'))
        url = urls.get(k)
        if not url:
            unresolved.append(k)
            return block
        filled += 1
        return block.replace('url("data:,")', 'url("' + data_url(url) + '")')
    drop = []
    for name in ['audit.css', 'styles.css']:
        css_path = ROOT / 'css' / name
        css = css_path.read_text(encoding='utf-8')
        if not (evidence / (name + '.bak')).exists():
            shutil.copy2(css_path, evidence / (name + '.bak'))
        # 1. Drop earlier copies of identical @font-face blocks.
        blocks = [(m.start(), m.end(), m[0]) for m in FACE.finditer(css)]
        last = {}
        for start, end, text in blocks:
            last[text] = start
        dropped = [(s, e) for s, e, t in blocks if last[t] != s]
        for s, e in reversed(dropped):
            css = css[:s] + css[e:]
        drop += dropped
        # 2. Fill empty sources.
        css = FACE.sub(fill, css)
        css_path.write_text(css, encoding='utf-8')
    provenance_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=2), encoding='utf-8')
    report = {'duplicate_blocks_removed': len(drop), 'filled': filled, 'fonts_downloaded': len(cache), 'unresolved': sorted(set(unresolved))}
    (evidence / 'fill-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: (len(v) if isinstance(v, list) else v) for k, v in report.items()}))


if __name__ == '__main__':
    main()

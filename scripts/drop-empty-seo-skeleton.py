"""Remove the lazy SEO placeholder (<div type="casino|home"> with skeleton_content) on pages whose reference
renders nothing there once it loads.

Observed 2026-10-14 (guest, all sizes): /, /casino/slots, /casino/1win-games, /casino/bonus-buy,
/casino/bonus-wagering, /casino/fishing-games, /casino/jili-games, /casino/new, /casino/only-on-1win and
/casino/fast-games drop the block entirely; /casino and /casino/live-games show real SEO text instead
(handled by patch-lazy-sections.py captures).

  python scripts/drop-empty-seo-skeleton.py --date YYYY-MM-DD
"""
import argparse
import json
import shutil

from capture_clean import ROOT
from html_fragments import Fragments

PAGES = ['home', 'casino-slots', 'casino-1win', 'casino-bonus-buy', 'casino-bonus-wagering', 'casino-fishing',
         'casino-jili', 'casino-new', 'casino-only-1win', 'casino-quick']


def drop(source):
    tree = Fragments(source)
    targets = [n for n in tree.elements if n.tag == 'div' and n.attrs.get('type') in ('casino', 'home') and n.end
               and 'skeleton_content-' in source[n.start:n.end] and 'seo_root' not in source[n.start:n.end]]
    return tree.replace([(n, '') for n in targets]), len(targets)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    backup = ROOT / 'qa' / ('seo-skeleton-' + args.date) / 'backup'
    backup.mkdir(parents=True, exist_ok=True)
    report = {}
    for page in PAGES:
        files = [(ROOT / 'js' / (page + s + '.js'), p) for s, p in [('', 'window.PAGE_STATES='), ('-auth', 'window.AUTH_PAGE_STATES=')]]
        for file, prefix in files:
            if not file.exists():
                continue
            text = file.read_text(encoding='utf-8')
            states = json.loads(text[len(prefix):].rstrip().rstrip(';'))
            total = 0
            for state in states.values():
                state['html'], n = drop(state['html'])
                total += n
            if total:
                if not (backup / file.name).exists():
                    shutil.copy2(file, backup / file.name)
                file.write_text(prefix + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
                report[file.name] = total
        html_file = ROOT / ('index.html' if page == 'home' else page + '.html')
        text = html_file.read_text(encoding='utf-8')
        new, n = drop(text)
        if n:
            if not (backup / html_file.name).exists():
                shutil.copy2(html_file, backup / html_file.name)
            html_file.write_text(new, encoding='utf-8')
            report[html_file.name] = n
    (backup.parent / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()

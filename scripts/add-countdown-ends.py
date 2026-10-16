"""Give captured countdowns their real end time so local pages count to the same moment as the reference.

A captured countdown only holds the time left at capture ("1 : 08 : 19 : 53"); js/common.js used to count down from
that on every load. This adds data-local-ends="<ISO end>" (capture time + time left) to each countdown root in the
given pages' states; initCountdowns() then shows the time left until that moment, like the reference, which also drops
the days segment when less than a day remains.

  python scripts/add-countdown-ends.py --captures captures/cap-tour --pages tournament-816330 ...   (default: every
  page with a capture "<page>-<size>.json" in --captures)
"""
import argparse
import datetime as dt
import glob
import json
import re
from pathlib import Path

from capture_clean import ROOT

ROOT_RE = re.compile(r'(<div class=(\\?")[^"\\]*countdown_root-Uzn68[^"\\]*\2)([^>]*>)(.*?)(?=<div class=\2[^"\\]*countdown_root-Uzn68|$)', re.S)
TIME_RE = re.compile(r'countdown_time-Uzn68[^>]*>\s*(\d+)\s*<')


def capture_time(captures, page):
    for f in sorted(Path(captures).glob(f'{page}-*.json')):
        try:
            return dt.datetime.fromisoformat(json.load(open(f, encoding='utf-8'))['at'].replace('Z', '+00:00'))
        except Exception:
            continue
    return None


def tag(text, at):
    count = 0

    def one(m):
        nonlocal count
        head, q, rest, body = m[1], m[2], m[3], m[4]
        if 'data-local-ends' in rest:
            return m[0]
        nums = [int(x) for x in TIME_RE.findall(body[:1500])]
        if len(nums) < 3:
            return m[0]
        units = [86400, 3600, 60, 1][-min(len(nums), 4):]
        left = sum(n * u for n, u in zip(nums[:4], units))
        ends = (at + dt.timedelta(seconds=left)).isoformat().replace('+00:00', 'Z')
        count += 1
        return f'{head} data-local-ends={q}{ends}{q}{rest}{body}'
    return ROOT_RE.sub(one, text), count


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--captures', required=True)
    ap.add_argument('--pages', nargs='*')
    args = ap.parse_args()
    pages = args.pages or sorted({re.sub(r'-\d+x\d+$', '', Path(f).stem) for f in glob.glob(str(Path(args.captures) / '*-*x*.json'))})
    report = {}
    for page in pages:
        at = capture_time(args.captures, page)
        if not at:
            continue
        total = 0
        for f in [ROOT / f'{page}.html', ROOT / f'js/{page}.js', ROOT / f'js/{page}-auth.js']:
            if not f.exists():
                continue
            s = f.read_text(encoding='utf-8')
            new, n = tag(s, at)
            if n:
                f.write_text(new, encoding='utf-8'); total += n
        report[page] = total
    print(json.dumps(report))


if __name__ == '__main__':
    main()

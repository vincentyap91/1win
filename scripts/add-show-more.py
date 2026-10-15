"""Give a list page the reference "Show more" behaviour.

The page must already be built from the *expanded* capture (all cards present). For each size this script
takes the initial capture (cards before "Show more" + the progress block "… shown: 9 out of 12"), hides the
cards beyond the initial count (data-local-more, hidden) and puts the cleaned progress block back right after
the card list, as on the reference. js/common.js reveals the cards and removes the block on click.
Optional --groups JSON adds data-local-group to cards whose link id is listed (for filter tabs).

  python scripts/add-show-more.py --page tournaments --initial DIR --card-class tournament-card_card-BhLDd \
      --date YYYY-MM-DD [--groups groups.json] [--id-from-link /tournaments/]
"""
import argparse
import json
import pathlib
import re

from capture_clean import ROOT, Media, clean, parse
from html_fragments import Fragments
from local_mask_assets import embed_html_masks

BLOCK = 'variant-1_root-Rmfyv'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--page', required=True)
    ap.add_argument('--initial', required=True)
    ap.add_argument('--card-class', required=True)
    ap.add_argument('--date', required=True)
    ap.add_argument('--groups')
    ap.add_argument('--id-from-link')
    args = ap.parse_args()
    groups = json.load(open(args.groups, encoding='utf-8')) if args.groups else {}
    media = Media(args.date)
    report = {}
    for suffix, prefix in [('', 'window.PAGE_STATES='), ('-auth', 'window.AUTH_PAGE_STATES=')]:
        path = ROOT / 'js' / f'{args.page}{suffix}.js'
        states = json.loads(path.read_text(encoding='utf-8')[len(prefix):].rstrip().rstrip(';'))
        for key, state in states.items():
            size = key.rsplit('-', 1)[1]
            cap = pathlib.Path(args.initial) / f'{args.page}-{size}.json'
            if not cap.exists():
                continue
            body = json.loads(cap.read_text(encoding='utf-8'))['body']
            ti = Fragments(body)
            blk = next((n for n in ti.elements if BLOCK in n.classes and 'progress-button' in body[n.start:n.end]), None)
            initial = len([n for n in ti.elements if args.card_class in n.classes])
            if not blk:
                continue
            root = parse(body[blk.start:blk.end]); clean(root, media)
            block = embed_html_masks(root.render(), ROOT).replace('<div class="', '<div data-local-show-more="" class="', 1)
            html = state['html']
            t = Fragments(html)
            cards = [n for n in t.elements if args.card_class in n.classes]
            if not cards or len(cards) <= initial:
                continue
            replacements = []
            for i, card in enumerate(cards):
                open_tag = html[card.start:html.index('>', card.start) + 1]
                extra = ''
                if i >= initial:
                    extra += ' data-local-more="" hidden=""'
                if args.id_from_link:
                    m = re.search(r'href="[^"]*?' + re.escape(args.id_from_link) + r'(\d+)', html[card.start:card.end])
                    m = m or re.search(r'data-reference-href="' + re.escape(args.id_from_link) + r'(\d+)', html[card.start:card.end])
                    if m:
                        member = [g for g, ids in groups.items() if m[1] in ids]
                        extra += f' data-local-id="{m[1]}" data-local-group="{" ".join(member)}"'
                replacements.append((card, open_tag[:-1] + extra + '>' + html[card.start + len(open_tag):card.end]))
            html = t.replace(replacements)
            # the progress block sits right after the card list
            t = Fragments(html)
            lst = next(n for n in t.elements if args.card_class in n.classes).parent
            state['html'] = html[:lst.end] + block + html[lst.end:]
            report[f'{suffix or "guest"}:{key}'] = {'cards': len(cards), 'initial': initial}
        path.write_text(prefix + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
    # The HTML entry carries the 1440 state as initial body.
    page_html = ROOT / f'{args.page}.html'
    states = json.loads((ROOT / 'js' / f'{args.page}.js').read_text(encoding='utf-8')[len('window.PAGE_STATES='):].rstrip().rstrip(';'))
    first = states.get(f'{args.page}-1440x900')
    if first:
        text = page_html.read_text(encoding='utf-8')
        start = text.index('>', text.index('<body')) + 1
        end = text.index('<script src=')
        page_html.write_text(text[:start] + first['html'] + text[end:], encoding='utf-8')
    media.save()
    print(json.dumps(report))


if __name__ == '__main__':
    main()

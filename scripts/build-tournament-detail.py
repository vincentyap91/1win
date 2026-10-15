"""Build js/tournament-detail.js from the probed Rules dialogs, full leaderboard and full game list.

captures/tour-collect.json holds, per tournament and size, the rules dialog plus the rows and game cards that
"Show all" / "Show more" add. The cards already on the page come from js/tournament-<id>.js (1440 state).
A tournament whose games keep paginating (Spinoleague) may have captures/tour-788264.json with the whole list.

  python scripts/build-tournament-detail.py --date YYYY-MM-DD
"""
import json
import pathlib
import re

from capture_clean import ROOT, Media, clean_fragment, parse
from local_mask_assets import embed_html_masks

IDS = ['788264', '788267', '813699', '813768', '814264', '814607', '816330', '817708', '818243', '819055', '819462', '820166']


def walk_find(node, pred):
    for n in node.walk():
        if n.tag and pred(n):
            return n
    return None


def children_html(node, pred):
    return ''.join(c.render() for c in node.children if c.tag and pred(c)) if node else ''


def page_html(tournament_id):
    text = (ROOT / f'js/tournament-{tournament_id}.js').read_text(encoding='utf-8')
    states = json.loads(text[len('window.PAGE_STATES='):].rstrip().rstrip(';'))
    return states[f'tournament-{tournament_id}-1440x900']['html']


def href_of(html):
    m = re.search(r'data-reference-href="([^"]+)"', html)
    return m[1] if m else ''


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    collected = json.loads((ROOT / 'captures/tour-collect.json').read_text(encoding='utf-8'))
    spin = ROOT / 'captures/tour-788264.json'
    spin_games = ''
    if spin.exists():
        raw = json.loads(spin.read_text(encoding='utf-8'))['1440x900'].get('games', '')
        if raw:
            spin_games = raw
    media = Media(args.date)
    out = {}
    for tid in IDS:
        root = parse(page_html(tid))
        grid = walk_find(root, lambda n: 'games-list_games' in n.attrs.get('class', ''))
        table = walk_find(root, lambda n: 'leaderboard-table_root' in n.attrs.get('class', ''))
        page_games = children_html(grid, lambda c: c.tag == 'a')
        page_rows = children_html(table, lambda c: 'leaderboard-row-container_row' in c.attrs.get('class', '') and 'leaderboard_header' not in c.attrs.get('class', ''))
        block = collected['1440x900'][tid]
        extra_games = clean_fragment(block['extraGames'], media) if block['extraGames'] else ''
        extra_rows = clean_fragment(block['extraRows'], media) if block['extraRows'] else ''
        if tid == '788264' and spin_games:
            games_html = clean_fragment(spin_games, media)
        else:
            games_html = page_games + extra_games
        seen, games = set(), []
        for part in re.findall(r'<a\b.*?</a>', games_html, flags=re.S):
            href = href_of(part)
            if href and href not in seen:
                seen.add(href)
                games.append(part)
        rules = {}
        for size in ('1440x900', '390x844'):
            html = collected[size][tid]['rules']
            rules[size] = embed_html_masks(clean_fragment(html, media), ROOT) if html else ''
        out[tid] = {'rules': rules, 'rows': embed_html_masks(page_rows + extra_rows, ROOT), 'games': embed_html_masks(''.join(games), ROOT)}
        print(tid, 'games', len(games), 'rules', len(rules['1440x900']), len(rules['390x844']))
    (ROOT / 'js/tournament-detail.js').write_text('window.TOURNAMENT_DETAIL=' + json.dumps(out, ensure_ascii=False) + ';\n', encoding='utf-8')
    tag = '<script src="js/tournament-detail.js"></script>'
    for tid in IDS:
        path = ROOT / f'tournament-{tid}.html'
        html = path.read_text(encoding='utf-8')
        if tag not in html:
            html = html.replace('<script src="js/common.js"></script>', tag + '<script src="js/common.js"></script>')
            path.write_text(html, encoding='utf-8')
    media.save()
    print(json.dumps({'downloaded': len(media.downloaded), 'missing': len(media.missing)}))


if __name__ == '__main__':
    main()

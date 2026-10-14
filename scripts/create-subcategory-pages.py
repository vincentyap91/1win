"""Create the Live Casino and Quick games sub-category entries (/casino/live-games/<slug>,
/casino/fast-games/<slug>) by cloning their parent page, then register them in js/routes.js.

The clone only provides the shared shell and state keys; the lobby content is replaced afterwards with
reference captures by patch-lazy-sections.py. Existing pages are left untouched (idempotent).

  python scripts/create-subcategory-pages.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
GROUPS = {
    'casino-live': ('/casino/live-games', 'live-games', ['1win-live', 'emperors-collection', 'evolution', 'pragmatic-play', 'sa-gaming', 'ae-sexy',
                                                         'playtech-live', 'game-shows', 'baccarat', 'dragon-tiger', 'sic-bo', 'new-live-games',
                                                         'roulette', 'blackjack', 'poker']),
    'casino-quick': ('/casino/fast-games', 'quick-games', ['1win-games', 'crash-games', 'chicken-games', 'mines', 'plinko', 'sport', 'lotteries']),
}


def clone_states(parent, page, suffix, prefix):
    src = ROOT / 'js' / (parent + suffix + '.js')
    dst = ROOT / 'js' / (page + suffix + '.js')
    if dst.exists():
        return False
    states = json.loads(src.read_text(encoding='utf-8')[len(prefix):].rstrip().rstrip(';'))
    renamed = {page + key[len(parent):]: value for key, value in states.items()}
    dst.write_text(prefix + json.dumps(renamed, ensure_ascii=False) + ';\n', encoding='utf-8')
    return True


def main():
    routes_path = ROOT / 'js/routes.js'
    routes = json.loads(routes_path.read_text(encoding='utf-8-sig').split('=', 1)[1].strip().removesuffix(';'))
    sub = routes.setdefault('subcategories', {})
    created = []
    for parent, (base, first, slugs) in GROUPS.items():
        group = sub.setdefault(parent, {})
        group[first] = parent + '.html'
        for slug in slugs:
            page = parent + '-' + slug
            routes['pages'][base + '/' + slug] = page + '.html'
            group[slug] = page + '.html'
            if clone_states(parent, page, '', 'window.PAGE_STATES='):
                created.append(page)
            clone_states(parent, page, '-auth', 'window.AUTH_PAGE_STATES=')
            html = ROOT / (page + '.html')
            if not html.exists():
                text = (ROOT / (parent + '.html')).read_text(encoding='utf-8')
                title = ' '.join(w.capitalize() for w in page.replace('casino-', 'casino ').replace('-', ' ').split())
                text = text.replace('data-page="' + parent + '"', 'data-page="' + page + '"', 1)
                text = text.replace('data-state="' + parent + '-', 'data-state="' + page + '-', 1)
                text = re.sub(r'<title>[^<]*</title>', '<title>1win | ' + title + '</title>', text, count=1)
                text = text.replace('src="js/' + parent + '.js"', 'src="js/' + page + '.js"').replace('src="js/' + parent + '-auth.js"', 'src="js/' + page + '-auth.js"')
                html.write_text(text, encoding='utf-8')
    routes_path.write_text('window.PROJECT_ROUTES=' + json.dumps(routes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(json.dumps({'created': created, 'routes': len(routes['pages'])}))


if __name__ == '__main__':
    main()

"""Refresh only the compact sidebar from a settled, public browser capture."""
import html
import json
import pathlib
import re
from html.parser import HTMLParser
from urllib.parse import unquote, urljoin, urlparse
from local_mask_assets import embed_html_masks

ROOT = pathlib.Path(__file__).resolve().parent.parent
ORIGIN = 'https://one-vv3591.com/'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Node:
    def __init__(self, tag='', attrs=None, text=None):
        self.tag, self.attrs, self.text = tag, dict(attrs or []), text
        self.children = []

    def render(self):
        if self.text is not None:
            return self.text
        children = ''.join(n.render() for n in self.children)
        if not self.tag:
            return children
        attrs = ''.join(' ' + key + ('' if value is None else '="' + html.escape(str(value), quote=True) + '"') for key, value in self.attrs.items())
        return '<' + self.tag + attrs + '>' + ('' if self.tag in VOID else children + '</' + self.tag + '>')

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(Node(text=text))

    def handle_entityref(self, name):
        self.handle_data('&' + name + ';')

    def handle_charref(self, name):
        self.handle_data('&#' + name + ';')

def source_key(url):
    match = re.search(r'/plain/(https?://.+)', url)
    return unquote(re.sub(r'@(webp|avif|png|jpeg)$', '', match[1] if match else url))

def main():
    capture = ROOT / 'qa/sidebar-compact-2026-10-14/reference-compact.html'
    records = json.loads((ROOT / 'qa/asset-provenance.json').read_text(encoding='utf-8-sig'))
    known = {item['url']: item for item in records if (ROOT / item['file']).is_file()}
    variants = {source_key(url): item for url, item in known.items()}
    missing = set()
    media_count = 0

    def media(value):
        nonlocal media_count
        if value.startswith(('data:', '#')):
            return value
        url = urljoin(ORIGIN, value)
        item = known.get(url) or variants.get(source_key(url))
        if not item:
            missing.add(url)
            return value
        media_count += 1
        return item['file']

    def clean(node):
        if node.text is not None:
            return
        node.children = [child for child in node.children if child.tag not in ('script', 'iframe', 'noscript', 'style')]
        for key in list(node.attrs):
            if key.startswith('on') or key == 'nonce':
                node.attrs.pop(key)
        classes = node.attrs.get('class', '').split()
        if any(name.startswith(('v-enter', 'v-leave')) for name in classes):
            raise ValueError('Capture still contains a sidebar transition; wait for the settled state.')
        if node.tag in ('img', 'source'):
            if 'src' in node.attrs:
                node.attrs['src'] = media(node.attrs['src'])
            if 'srcset' in node.attrs:
                node.attrs['srcset'] = ','.join(media(parts[0]) + (' ' + parts[1] if len(parts) > 1 else '') for candidate in node.attrs['srcset'].split(',') if (parts := candidate.strip().split()))
        if 'style' in node.attrs:
            node.attrs['style'] = re.sub(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)', lambda match: 'url("' + media(match[1]) + '")', node.attrs['style'])
        if node.tag == 'a':
            raw = node.attrs.get('href', '')
            if raw and not raw.startswith('#'):
                url = urlparse(urljoin(ORIGIN, raw))
                node.attrs['href'] = '#'
                if url.hostname == 'one-vv3591.com':
                    node.attrs['data-reference-href'] = url.path + ('?' + url.query if url.query else '')
                else:
                    node.attrs['data-local-unavailable'] = 'external-link'
            node.attrs.pop('target', None)
        for child in node.children:
            clean(child)

    parser = Parser()
    parser.feed(capture.read_text(encoding='utf-8-sig'))
    clean(parser.root)
    if missing:
        raise ValueError('Unmapped observed assets: ' + ', '.join(sorted(missing)))
    markup = embed_html_masks(parser.root.render(), ROOT)
    if 'sidebar-social-buttons-with-preview' not in markup:
        raise ValueError('The settled compact social preview is missing.')
    path = ROOT / 'js/sidebar.js'
    states = json.loads(path.read_text(encoding='utf-8-sig').split('=', 1)[1].strip().removesuffix(';'))
    states['compact']['html'] = markup
    states['compact']['capture'] = 'qa/sidebar-compact-2026-10-14/reference-compact.html'
    social_capture = capture.with_name('reference-social-popover.html')
    if social_capture.is_file():
        social_parser = Parser()
        social_parser.feed(social_capture.read_text(encoding='utf-8-sig'))
        clean(social_parser.root)
        if missing:
            raise ValueError('Unmapped social assets: ' + ', '.join(sorted(missing)))
        states['compact-social'] = {'html': embed_html_masks(social_parser.root.render(), ROOT), 'capture': str(social_capture.relative_to(ROOT))}
    path.write_text('window.SIDEBAR_STATES=' + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
    (ROOT / 'qa/sidebar-compact-2026-10-14/template-update.json').write_text(json.dumps({'date': '2026-10-14', 'media_references_localized': media_count, 'unmapped_assets': [], 'source': str(capture.relative_to(ROOT)), 'updated': 'js/sidebar.js:compact'}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'updated': 'compact', 'media_references_localized': media_count}))

if __name__ == '__main__':
    main()

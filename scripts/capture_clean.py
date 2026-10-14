"""Clean live-DOM fragments captured from the reference site with the same rules as audit-update.py.

Used for targeted patches (lazy sections that a full capture missed) without re-running the
whole capture pipeline. Missing media is downloaded once into assets/ and recorded in
qa/asset-provenance.json.
"""
import hashlib
import html
import json
import pathlib
import re
import urllib.request
from html.parser import HTMLParser
from urllib.parse import unquote, urljoin, urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
ORIGIN = 'https://one-vv3591.com/'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
DENY = re.compile(r'doubleclick|googletag|analytics|adservice|facebook\.net|google\.|googlesyndication', re.I)
EXTS = {'image/avif': '.avif', 'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/svg+xml': '.svg', 'image/gif': '.gif'}
ROUTES = json.loads((ROOT / 'js/routes.js').read_text(encoding='utf-8-sig').split('=', 1)[1].strip().removesuffix(';'))['pages']


class Node:
    def __init__(self, tag='', attrs=None, parent=None, text=None):
        self.tag = tag; self.attrs = dict(attrs or []); self.parent = parent; self.children = []; self.text = text

    def walk(self):
        yield self
        for ch in self.children:
            yield from ch.walk()

    def render(self):
        if self.text is not None:
            return self.text
        if not self.tag:
            return ''.join(c.render() for c in self.children)
        attrs = ''.join(' ' + k + ('="' + html.escape(str(v), quote=True) + '"' if v is not None else '') for k, v in self.attrs.items())
        if self.tag in VOID:
            return '<' + self.tag + attrs + '>'
        return '<' + self.tag + attrs + '>' + ''.join(c.render() for c in self.children) + '</' + self.tag + '>'


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False); self.root = Node(); self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.stack[-1]); self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs); self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]; break

    def handle_data(self, data):
        self.stack[-1].children.append(Node(text=data, parent=self.stack[-1]))

    def handle_entityref(self, name):
        self.handle_data('&' + name + ';')

    def handle_charref(self, name):
        self.handle_data('&#' + name + ';')


def parse(s):
    p = Parser(); p.feed(s); return p.root


def source_key(u):
    m = re.search(r'/plain/(https?://.+)', u)
    return unquote(re.sub(r'@(webp|avif|png|jpeg)$', '', m[1] if m else u))


class Media:
    def __init__(self, capture_date):
        self.path = ROOT / 'qa/asset-provenance.json'
        self.records = json.loads(self.path.read_text(encoding='utf8'))
        self.known = {a['url']: a for a in self.records if (ROOT / a['file']).is_file()}
        self.variants = {source_key(u): a for u, a in self.known.items()}
        self.capture_date = capture_date
        self.downloaded = []
        self.missing = []

    def fetch(self, url):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': ORIGIN})
        with urllib.request.urlopen(req, timeout=30) as r:
            mime = (r.headers.get('content-type') or '').split(';')[0]
            content = r.read()
        if mime not in EXTS:
            raise ValueError('unexpected type ' + mime)
        name = 'audit-' + hashlib.sha256(content).hexdigest()[:20] + EXTS[mime]
        dest = ROOT / 'assets' / name
        if not dest.exists():
            dest.write_bytes(content)
        item = {'url': url, 'file': 'assets/' + name, 'kind': 'image', 'type': mime, 'observed_on': 'one-vv3591.com', 'capture': self.capture_date}
        self.records.append(item); self.known[url] = item; self.variants[source_key(url)] = item
        self.downloaded.append(url)
        return item

    def map(self, url):
        if url.startswith(('data:', '#')):
            return url
        u = urljoin(ORIGIN, url)
        if DENY.search(u):
            return 'data:,'
        item = self.known.get(u) or self.variants.get(source_key(u))
        if not item and u.startswith('http'):
            try:
                item = self.fetch(u)
            except Exception as e:  # keep the gap visible rather than substituting another image
                self.missing.append({'url': u.split('?')[0], 'reason': str(e)})
                return 'data:,'
        return item['file'] if item else url

    def save(self):
        self.path.write_text(json.dumps(self.records, ensure_ascii=False, indent=2), encoding='utf8')


def clean(n, media):
    if n.text is not None:
        return n
    n.children = [ch for ch in n.children if 'game-card-placeholder_root' not in ch.attrs.get('class', '') and ch.tag not in ['script', 'style', 'iframe', 'noscript', 'link']]
    for ch in n.children:
        clean(ch, media)
    for k in list(n.attrs):
        if k.startswith('on') or k == 'nonce':
            n.attrs.pop(k, None)
    if n.tag in ['img', 'source']:
        if 'src' in n.attrs:
            n.attrs['src'] = media.map(n.attrs['src'])
        if 'srcset' in n.attrs:
            candidates = []
            for src in n.attrs['srcset'].split(','):
                parts = src.strip().split()
                if not parts:
                    continue
                mapped = media.map(parts[0])
                if mapped != 'data:,':
                    candidates.append(mapped + (' ' + parts[1] if len(parts) > 1 else ''))
            n.attrs.pop('srcset', None)
            if candidates:
                # ", " matters: "a.avif,a.avif 2x" parses as one URL when the first candidate has no descriptor.
                n.attrs['srcset'] = ', '.join(candidates)
                if n.attrs.get('src') in [None, 'data:,']:
                    n.attrs['src'] = candidates[0].split()[0]
        n.attrs.pop('loading', None)
    if 'style' in n.attrs:
        n.attrs['style'] = re.sub(r'url\(\s*[\'"]?([^)\'"]+)[\'"]?\s*\)', lambda m: 'url("' + media.map(m[1]) + '")', n.attrs['style'])
        # url() inside a custom property resolves against the css/ file that reads it with var().
        n.attrs['style'] = re.sub(r'(--[\w-]+:\s*url\(")assets/', r'\1../assets/', n.attrs['style'])
    if n.tag in ['image', 'use']:
        for k in ['href', 'xlink:href']:
            if k in n.attrs:
                n.attrs[k] = media.map(n.attrs[k])
    if n.tag == 'a':
        raw = n.attrs.get('href', '')
        if raw and not raw.startswith('#'):
            try:
                u = urlparse(urljoin(ORIGIN, raw)); n.attrs['href'] = '#'
                if u.hostname == 'one-vv3591.com':
                    query = u.query if not re.search(r'auth|secret|session|user_id|access_token|cda_|token', u.query, re.I) else ''
                    n.attrs['data-reference-href'] = u.path + ('?' + query if query else '')
                    file = 'register.html' if 'sign-up' in query else ROUTES.get(u.path)
                    if file:
                        n.attrs['href'] = file
                else:
                    n.attrs['data-local-unavailable'] = 'external-link'
            except ValueError:
                n.attrs['href'] = '#'
            n.attrs.pop('target', None)
        if any(ch is not n and ch.tag == 'a' for ch in n.walk()):
            n.tag = 'div'; n.attrs.pop('href', None); n.attrs['role'] = 'link'; n.attrs['tabindex'] = '0'
            file = ROUTES.get(urlparse(n.attrs.get('data-reference-href', '')).path)
            if file:
                n.attrs['data-local-page'] = file
    return n


def signature(markup):
    """Structure + text fingerprint shared with the in-page probe: tags, class lists and text only."""
    s = re.sub(r'<!--[\s\S]*?-->', '', markup)
    s = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', s, flags=re.I)

    def tag(m):
        c = re.search(r'\sclass="([^"]*)"', m[2])
        return '<' + m[1].lower() + (' class="' + re.sub(r'\s+', ' ', c[1].strip()) + '"' if c else '') + '>'
    s = re.sub(r'<([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>', tag, s)
    s = re.sub(r'</([a-zA-Z0-9:-]+)>', lambda m: '</' + m[1].lower() + '>', s)
    s = re.sub(r'>\s+<', '><', re.sub(r'\s+', ' ', s)).strip()
    return hashlib.sha256(s.encode()).hexdigest()[:12]


def clean_fragment(markup, media):
    root = parse(markup)
    clean(root, media)
    return root.render()

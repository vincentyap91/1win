"""Locate HTML fragments without changing their original markup."""
from html.parser import HTMLParser

VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Element:
    def __init__(self, tag, attrs, start, parent=None):
        self.tag, self.attrs, self.start, self.parent = tag, dict(attrs), start, parent
        self.end = None
        self.children = []

    @property
    def classes(self):
        return self.attrs.get('class', '')

    def has_ancestor(self, predicate):
        node = self.parent
        while node:
            if predicate(node):
                return True
            node = node.parent
        return False

class Fragments(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.lines = [0]
        for index, value in enumerate(source):
            if value == '\n':
                self.lines.append(index + 1)
        self.elements, self.stack = [], []
        self.feed(source)

    def source_offset(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs, self.source_offset(), self.stack[-1] if self.stack else None)
        self.elements.append(node)
        if node.parent:
            node.parent.children.append(node)
        if tag in VOID:
            node.end = node.start + len(self.get_starttag_text())
        else:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack[-1].end = self.source_offset() + len(self.get_starttag_text())
            self.stack.pop()

    def handle_endtag(self, tag):
        end = self.source.find('>', self.source_offset()) + 1
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index].tag == tag:
                self.stack[index].end = end
                self.stack = self.stack[:index]
                break

    def markup(self, element):
        if element.end is None:
            raise ValueError('Unclosed fragment: ' + element.tag)
        return self.source[element.start:element.end]

    def shared_regions(self):
        candidates = []
        for node in self.elements:
            kind = None
            if 'sidebar_root-' in node.classes and not node.has_ancestor(lambda n: 'sidebar_root-' in n.classes):
                kind = 'sidebar'
            elif node.tag == 'header' and any(name.startswith(('variant-1_root-', 'variant-2_root-', 'header_root-')) for name in node.classes.split()):
                kind = 'header'
            elif 'footer-container_root-' in node.classes:
                kind = 'footer'
            elif node.tag == 'footer' and not node.has_ancestor(lambda n: 'footer-container_root-' in n.classes):
                kind = 'footer'
            if kind:
                candidates.append((kind, node))
        return [(kind, node) for kind, node in candidates if not any(other.start <= node.start and other.end >= node.end and other is not node for _, other in candidates if other.end)]

    def replace(self, replacements):
        result = self.source
        for node, value in sorted(replacements, key=lambda pair: pair[0].start, reverse=True):
            result = result[:node.start] + value + result[node.end:]
        return result

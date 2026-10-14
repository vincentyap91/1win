"""Give every standard page state the footer the reference site shows for that route and size.

Reads qa/footer-<date>/footer-signatures.json (route -> desktop/mobile footer signature, measured on the
reference) and components/footer.html. A state without a footer gets its empty lazy-mount container
filled with the visible trigger + shared template slot; a state pointing at the wrong variant is corrected.

  python scripts/apply-footers.py --date YYYY-MM-DD
"""
import argparse
import json
import re
import shutil

from capture_clean import ROOT, signature
from html_fragments import Fragments

SLOT = re.compile(r'<template data-shared-component="(footer\.[^"]+)"></template>')
SOURCE = re.compile(r'<template data-component="([^"]+)">\r?\n([\s\S]*?)\r?\n</template>')
WRAPPER = '<div style="position: relative;"><div class="footer-container_visibleTrigger-waXfw" data-testid="visible-trigger"></div><template data-shared-component="{}"></template></div>'


def size_group(size):
    return 'desktop' if int(size.split('x')[0]) >= 1024 else 'mobile'


def empty_container(source):
    tree = Fragments(source)
    for node in tree.elements:
        if node.tag == 'div' and node.attrs.get('style') == 'position: relative;' and node.parent and 'layout-main_main' in node.parent.classes:
            if node.end and source[node.start:node.end] == '<div style="position: relative;"></div>':
                return tree, node
    return tree, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    args = ap.parse_args()
    evidence = ROOT / 'qa' / ('footer-' + args.date)
    table = json.loads((evidence / 'footer-signatures.json').read_text(encoding='utf-8'))
    templates = {m[1]: m[2] for m in SOURCE.finditer((ROOT / 'components/footer.html').read_text(encoding='utf-8-sig'))}
    by_sig = {}
    for key, value in templates.items():
        if key.startswith('footer.standard.'):
            by_sig.setdefault(signature(value), []).append(key)
    report = {'added': [], 'corrected': [], 'ok': 0, 'unresolved': []}

    def choose(page, group):
        sig = table['routes'][table['pages'][page]][group]
        keys = by_sig.get(sig)
        if not keys:
            return sig, None
        return sig, next((k for k in keys if '.' + page + '-' in k), keys[0])

    def fix(source, page, size, label):
        sig, wanted = choose(page, size_group(size))
        if not wanted:
            report['unresolved'].append({label: 'no template with signature ' + sig})
            return source
        slots = SLOT.findall(source)
        if slots:
            current = slots[0]
            if signature(templates[current]) == sig:
                report['ok'] += 1
                return source
            report['corrected'].append({label: [current, wanted]})
            return source.replace('<template data-shared-component="' + current + '"></template>', '<template data-shared-component="' + wanted + '"></template>', 1)
        if 'footer-container_root' in source:
            report['unresolved'].append({label: 'inline footer'})
            return source
        tree, node = empty_container(source)
        if not node:
            report['unresolved'].append({label: 'no empty footer container'})
            return source
        report['added'].append({label: wanted})
        return tree.replace([(node, WRAPPER.format(wanted))])

    backup = evidence / 'backup'
    backup.mkdir(parents=True, exist_ok=True)
    for page in table['pages']:
        for suffix, prefix in [('', 'window.PAGE_STATES='), ('-auth', 'window.AUTH_PAGE_STATES=')]:
            file = ROOT / 'js' / (page + suffix + '.js')
            if not file.exists():
                continue
            text = file.read_text(encoding='utf-8')
            states = json.loads(text[len(prefix):].rstrip().rstrip(';'))
            changed = False
            for key, state in states.items():
                new = fix(state['html'], page, key.rsplit('-', 1)[1], file.name + ':' + key)
                if new != state['html']:
                    state['html'] = new; changed = True
            if changed:
                if not (backup / file.name).exists():
                    shutil.copy2(file, backup / file.name)
                file.write_text(prefix + json.dumps(states, ensure_ascii=False) + ';\n', encoding='utf-8')
        html_file = ROOT / ('index.html' if page == 'home' else page + '.html')
        if html_file.exists():
            text = html_file.read_text(encoding='utf-8')
            new = fix(text, page, '1440x900', html_file.name)
            if new != text:
                if not (backup / html_file.name).exists():
                    shutil.copy2(html_file, backup / html_file.name)
                html_file.write_text(new, encoding='utf-8')
    (evidence / 'apply-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'added': len(report['added']), 'corrected': len(report['corrected']), 'ok': report['ok'], 'unresolved': report['unresolved']}, ensure_ascii=False))


if __name__ == '__main__':
    main()

"""Factor byte-identical shell fragments into canonical shared HTML sources."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import shutil
from html_fragments import Fragments

ROOT = pathlib.Path(__file__).resolve().parent.parent
KINDS = ('header', 'sidebar', 'footer')
SLOT = re.compile(r'<template data-shared-component="([^"]+)"></template>')
SOURCE = re.compile(r'<template data-component="([^"]+)">\r?\n([\s\S]*?)\r?\n</template>')

def read_templates():
    values = {}
    for kind in KINDS:
        file = ROOT / 'components' / (kind + '.html')
        if file.exists():
            for match in SOURCE.finditer(file.read_text(encoding='utf-8-sig')):
                values[match[1]] = match[2]
    return values

def expand(value, values):
    def replace(match):
        if match[1] not in values:
            raise ValueError('Missing component: ' + match[1])
        return values[match[1]]
    return SLOT.sub(replace, value)

def main(audit_date=None):
    audit_date = datetime.date.fromisoformat(audit_date).isoformat() if audit_date else datetime.date.today().isoformat()
    evidence = ROOT / ('qa/shared-components-' + audit_date)
    evidence.mkdir(parents=True, exist_ok=True)
    backup = evidence / 'migration-backup'
    templates = read_templates()
    by_hash = {(key.split('.')[0], hashlib.sha256(value.encode()).hexdigest()): key for key, value in templates.items()}
    owners = collections.defaultdict(list)
    checks = []
    planned = {}
    repeated_bytes = 0

    def component(kind, value, owner, family):
        nonlocal repeated_bytes
        if '</template>' in value:
            raise ValueError('Nested template in shared source: ' + owner)
        digest = hashlib.sha256(value.encode()).hexdigest()
        key = by_hash.get((kind, digest))
        if not key:
            seed = re.sub(r'[^a-z0-9-]', '-', owner.split(':')[-1].lower())
            key = kind + '.' + family + '.' + seed + '.' + digest[:8]
            if key in templates and templates[key] != value:
                raise ValueError('Component collision: ' + key)
            templates[key] = value
            by_hash[kind, digest] = key
        owners[key].append(owner)
        repeated_bytes += len(value.encode())
        return '<template data-shared-component="' + key + '"></template>'

    def factor(value, owner, whole_sidebar=False):
        original = expand(value, templates)
        tree = Fragments(original)
        regions = tree.shared_regions()
        if whole_sidebar:
            root = next((n for n in tree.elements if n.start == 0 and n.end == len(original)), None)
            if root:
                regions = [('sidebar', root)]
        replacements = []
        for kind, node in regions:
            fragment = tree.markup(node)
            family = 'betwave' if 'sidebar_root-qgno1' in fragment[:160] or 'variant-1_root-tO84S' in fragment[:160] or 'footer_root-uMHlH' in fragment[:160] else 'standard'
            replacements.append((node, component(kind, fragment, owner, family)))
        output = tree.replace(replacements)
        restored = expand(output, templates)
        if restored != original:
            raise ValueError('Round-trip changed markup: ' + owner)
        checks.append({'owner': owner, 'components': len(replacements), 'sha256_before': hashlib.sha256(original.encode()).hexdigest(), 'sha256_restored': hashlib.sha256(restored.encode()).hexdigest(), 'equal': True})
        return output

    for file in sorted((ROOT / 'js').glob('*.js')):
        source = file.read_text(encoding='utf-8-sig')
        if not source.startswith(('window.PAGE_STATES=', 'window.AUTH_PAGE_STATES=', 'window.SIDEBAR_STATES=')):
            continue
        prefix, raw = source.split('=', 1)
        states = json.loads(raw.strip().removesuffix(';'))
        for name, state in states.items():
            state['html'] = factor(state['html'], str(file.relative_to(ROOT)) + ':' + name, prefix == 'window.SIDEBAR_STATES')
        planned[file] = prefix + '=' + json.dumps(states, ensure_ascii=False) + ';\n'

    shared_scripts = ''.join('<script src="js/' + name + '"></script>' for name in ['routes.js', 'shared-components.js', 'components/header.js', 'components/sidebar.js', 'components/footer.js'])
    for file in sorted(ROOT.glob('*.html')):
        source = file.read_text(encoding='utf-8-sig')
        tree = Fragments(source)
        body = next(n for n in tree.elements if n.tag == 'body')
        start = source.find('>', body.start) + 1
        end = source.rfind('</body>', start, body.end)
        content = source[start:end]
        content = re.sub(r'<script src="js/(?:routes|shared-components|components/header|components/sidebar|components/footer)\.js"></script>', '', content)
        output = factor(content, file.name)
        position = output.find('<script src=')
        if position < 0:
            raise ValueError('Missing runtime scripts: ' + file.name)
        output = output[:position] + shared_scripts + output[position:]
        doc = source[:start] + output + source[end:]
        if 'css/components.css' not in doc:
            doc = doc.replace('</head>', '<link rel="stylesheet" href="css/components.css"></head>', 1)
        doc = re.sub(r'(<html\b[^>]*?)(?:\sdata-shared-ui="[^"]*")?(>)', lambda m: re.sub(r'\sdata-shared-ui="[^"]*"', '', m[1]) + ' data-shared-ui="loading"' + m[2], doc, count=1)
        planned[file] = doc

    # Prove every state restores exactly before mutating any page or template.
    for file, value in planned.items():
        target = backup / file.relative_to(ROOT)
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file, target)
        file.write_text(value, encoding='utf-8')
    (ROOT / 'components').mkdir(exist_ok=True)
    for kind in KINDS:
        parts = ['<!-- Canonical shared ' + kind + ' variants. Build with node scripts/build-components.mjs. -->']
        for key, value in templates.items():
            if key.split('.')[0] == kind:
                parts.append('<template data-component="' + key + '">\n' + value + '\n</template>')
        (ROOT / 'components' / (kind + '.html')).write_text('\n\n'.join(parts) + '\n', encoding='utf-8')
    catalog = {'components': [{'id': key, 'source': 'components/' + key.split('.')[0] + '.html', 'uses': len(owners[key]), 'owners': owners[key]} for key in templates], 'note': 'Different markup is kept as a distinct variant. Edit a canonical template, then build the classic-script bundles; do not edit generated bundles.'}
    (ROOT / 'components/catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf-8')
    report = {'date': audit_date, 'checks': checks, 'byte_round_trip_failures': 0, 'shared_components': len(templates), 'shared_component_uses': sum(len(x) for x in owners.values()), 'repeated_fragment_bytes_before': repeated_bytes, 'unique_fragment_bytes_after': sum(len(x.encode()) for x in templates.values()), 'changed_files': [str(x.relative_to(ROOT)) for x in planned]}
    (evidence / 'migration-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key not in ('checks', 'changed_files')}, ensure_ascii=False))

if __name__ == '__main__':
    main()

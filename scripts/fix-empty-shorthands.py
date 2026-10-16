"""Restore CSS shorthands that were emptied when the reference stylesheets were copied through the CSSOM.

Chrome serialises a shorthand whose value contains var() as empty longhands, e.g.
  background: var(--title-gradient)          ->  background-image: ; background-position-x: ; ... ;
  grid-template: "a b" 1fr "c d" auto        ->  grid-template-rows: ; grid-template-areas: ;
so the copied rule loses its value (VIP numbers slider text invisible, tournament detail grid collapsed).

This finds every declaration block in css/*.css that contains "prop: ;", looks up the same selector (and the same
@media context when possible) in raw reference CSS (the <style>/<link> source text, captured with
reference-run-cdp.mjs into JSON files whose value is the CSS text), and replaces the emptied longhands with the
original shorthand declarations of that rule.

  python scripts/fix-empty-shorthands.py --raw DIR [--dry-run]
"""
import argparse
import glob
import json
import re
from pathlib import Path

from capture_clean import ROOT

EMPTY = re.compile(r'\s*([a-z-]+): ;')


def norm_sel(sel):
    return re.sub(r'\s+', ' ', sel.replace('>', ' > ').replace('+', ' + ').replace('~', ' ~ ')).strip()


def rules(text):
    """Yield (selector, body) for every innermost declaration block (any nesting depth)."""
    out, stack, start = [], [], 0
    for i, ch in enumerate(text):
        if ch == '{':
            stack.append((start, i)); start = i + 1
        elif ch == '}':
            if not stack:
                start = i + 1; continue
            s, b = stack.pop()
            head = text[s:b]
            body = text[b + 1:i]
            if '{' not in body:
                out.append((head.strip().split(';')[-1].strip(), body))
            start = i + 1
        elif ch == ';' and not stack:
            start = i + 1
    return out


def longhand_root(prop):
    for root in ['background', 'padding', 'margin', 'border', 'grid-template', 'grid-area', 'inset', 'gap', 'font',
                 'transition', 'animation', 'outline', 'mask', 'flex', 'overflow', 'place', 'list-style', 'text-decoration']:
        if prop == root or prop.startswith(root + '-'):
            return root
    return prop


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', required=True)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    raw = ''
    for f in glob.glob(str(Path(args.raw) / '*.json')):
        for v in json.load(open(f, encoding='utf-8')).values():
            if isinstance(v, str):
                raw += '\n' + v
    index = {}
    for sel, body in rules(raw):
        for one in sel.split(','):
            index.setdefault(norm_sel(one), []).append(body)
    report = {'fixed': 0, 'unresolved': []}
    for css in sorted(glob.glob(str(ROOT / 'css' / '*.css'))):
        text = open(css, encoding='utf-8').read()
        if ': ;' not in text:
            continue

        # Walk the emptied declarations from the end so earlier offsets stay valid.
        positions = [m.start() for m in re.finditer(r': ;', text)]
        done = set()
        for pos in reversed(positions):
            open_i = text.rfind('{', 0, pos); close_i = text.find('}', pos)
            if open_i in done or open_i < 0 or close_i < 0:
                continue
            done.add(open_i)
            head_start = max(text.rfind('}', 0, open_i), text.rfind('{', 0, open_i), text.rfind(';', 0, open_i)) + 1
            sel, body = text[head_start:open_i], text[open_i + 1:close_i]
            empties = EMPTY.findall(body)
            roots = {longhand_root(p) for p in empties}
            key = norm_sel(sel.strip().split(',')[0])
            found = {}
            for cand in index.get(key, []):
                for decl in cand.split(';'):
                    if ':' not in decl:
                        continue
                    p, v = decl.split(':', 1)
                    p = p.strip()
                    if (p in roots or longhand_root(p) in roots) and v.strip() and ('var(' in v or p in roots):
                        found.setdefault(p, v.strip())
                if found:
                    break
            if not found:
                report['unresolved'].append(f'{Path(css).name}: {key} -> {sorted(roots)}')
                continue
            add = ' '.join(f'{p}: {v};' for p, v in found.items())
            text = text[:open_i + 1] + ' ' + add + EMPTY.sub('', body) + text[close_i:]
            report['fixed'] += 1
        if not args.dry_run:
            open(css, 'w', encoding='utf-8').write(text)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()

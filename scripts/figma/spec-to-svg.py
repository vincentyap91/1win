"""Render a serialised page content tree (scripts/figma/serialize.js) as an SVG for Figma import.

Figma imports SVG <text> as editable text layers, <rect>/<path> as editable vectors and embedded <image> data as
image fills, so one upload (upload_assets, image/svg+xml) gives an editable content block without sending the layout
through the plugin API. Layer names come from the element ids.

  python scripts/figma/spec-to-svg.py qa/figma-pages-2026-10-15/<page>.json --size 1440x900 --out <file>.svg
"""
import argparse
import base64
import html
import io
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ids = {}


def uid(name):
    base = re.sub(r'[^A-Za-z0-9_-]+', '-', name or 'layer').strip('-')[:40] or 'layer'
    if base[0].isdigit():
        base = 'n-' + base
    ids[base] = ids.get(base, 0) + 1
    return base if ids[base] == 1 else f'{base}_{ids[base]}'


def color(v):
    if not v:
        return None, 1
    m = re.match(r'rgba?\(([^)]*)\)', v)
    if not m:
        return v, 1
    p = [x.strip() for x in m[1].replace('/', ',').split(',')]
    r, g, b = (int(float(x)) for x in p[:3])
    a = float(p[3]) if len(p) > 3 else 1
    return f'#{r:02x}{g:02x}{b:02x}', a


def paint(attr, v):
    c, a = color(v)
    if not c:
        return f'{attr}="none"'
    return f'{attr}="{c}"' + (f' {attr}-opacity="{a:g}"' if a < 1 else '')


defs = []


def stops_of(parts):
    stops = []
    for i, p in enumerate(parts):
        cm = re.search(r'rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}', p)
        if not cm:
            continue
        pm = re.search(r'([\d.]+)%', p[cm.end():])
        off = float(pm[1]) / 100 if pm else (i / max(1, len(parts) - 1))
        c, a = color(cm[0])
        stops.append(f'<stop offset="{off:g}" stop-color="{c}" stop-opacity="{a:g}"/>')
    return stops


def gradient(css, n):
    rm = re.search(r'radial-gradient\((.*)\)', css)
    if rm:
        parts = re.split(r',(?![^(]*\))', rm[1])
        shape = parts[0]
        size = [float(v) / 100 for v in re.findall(r'([\d.]+)%', shape.split(' at ')[0])] or [0.5]
        at = [float(v) / 100 for v in re.findall(r'([\d.]+)%', shape.split(' at ')[1])] if ' at ' in shape else [0.5, 0.5]
        stops = stops_of(parts[1:] if ('%' in shape or 'at' in shape or 'circle' in shape or 'ellipse' in shape) else parts)
        gid = uid('grad')
        r = sum(size) / len(size)
        defs.append(f'<radialGradient id="{gid}" cx="{at[0]:g}" cy="{at[-1]:g}" r="{r:g}">{"".join(stops)}</radialGradient>')
        return gid
    m = re.search(r'linear-gradient\((.*)\)', css)
    if not m:
        return None
    parts = re.split(r',(?![^(]*\))', m[1])
    angle = 180
    first = parts[0].strip()
    if first.endswith('deg'):
        angle = float(first[:-3]); parts = parts[1:]
    elif first.startswith('to '):
        angle = {'to bottom': 180, 'to top': 0, 'to right': 90, 'to left': 270}.get(first, 180); parts = parts[1:]
    stops = []
    for i, p in enumerate(parts):
        cm = re.search(r'rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}', p)
        if not cm:
            continue
        pm = re.search(r'([\d.]+)%', p[cm.end():])
        off = float(pm[1]) / 100 if pm else (i / max(1, len(parts) - 1))
        c, a = color(cm[0])
        stops.append(f'<stop offset="{off:g}" stop-color="{c}" stop-opacity="{a:g}"/>')
    import math
    rad = math.radians(angle)
    x1, y1 = 0.5 - math.sin(rad) / 2, 0.5 + math.cos(rad) / 2
    x2, y2 = 0.5 + math.sin(rad) / 2, 0.5 - math.cos(rad) / 2
    gid = uid('grad')
    defs.append(f'<linearGradient id="{gid}" x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}">{"".join(stops)}</linearGradient>')
    return gid


def rect_attrs(n):
    r = n.get('r')
    if isinstance(r, list):
        r = max(r)
    return f'x="{n["x"]}" y="{n["y"]}" width="{n["w"]}" height="{n["h"]}"' + (f' rx="{r}"' if r else '')


image_cache = {}


def image_data(src, w, h):
    """Embed an image at up to 2x its displayed size (keeps uploads under Figma's 10MB limit)."""
    key = (src, round(w), round(h))
    if key in image_cache:
        return image_cache[key]
    p = ROOT / src
    if not p.exists() or p.suffix == '.svg':
        image_cache[key] = None; return None
    im = Image.open(p)
    tw, th = max(1, round(w * 2)), max(1, round(h * 2))
    if im.width > tw and im.height > th:
        scale = max(tw / im.width, th / im.height)
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    buf = io.BytesIO()
    if im.mode in ('RGBA', 'LA', 'P') and im.convert('RGBA').getextrema()[3][0] < 255:
        im.convert('RGBA').save(buf, 'PNG', optimize=True); mime = 'image/png'
    else:
        im.convert('RGB').save(buf, 'JPEG', quality=85); mime = 'image/jpeg'
    image_cache[key] = f'data:{mime};base64,' + base64.b64encode(buf.getvalue()).decode()
    return image_cache[key]


def icon(n):
    svg = n['svg']
    svg = re.sub(r'<\?xml[^>]*>|<!DOCTYPE[^>]*>', '', svg).strip()
    m = re.match(r'<svg\b([^>]*)>(.*)</svg>\s*$', svg, re.S)
    if not m:
        return ''
    attrs, body = m[1], m[2]
    vb = re.search(r'viewBox="([^"]+)"', attrs)
    if not vb:
        w = re.search(r'\bwidth="([\d.]+)', attrs); h = re.search(r'\bheight="([\d.]+)', attrs)
        vb = f'0 0 {w[1] if w else n["w"]} {h[1] if h else n["h"]}'
    else:
        vb = vb[1]
    fill = ''
    if n.get('mask'):
        # A CSS mask paints the element colour through the SVG shape: recolour every painted part.
        c, a = color(n.get('c'))
        body = re.sub(r'\bfill="(?!none)[^"]*"', f'fill="{c}"', body)
        body = re.sub(r'fill:\s*(?!none)[^;"]+', f'fill:{c}', body)
        body = re.sub(r'\bstroke="(?!none)[^"]*"', f'stroke="{c}"', body)
        fill = f' fill="{c}"' + (f' fill-opacity="{a:g}"' if a < 1 else '')
    elif n.get('c') and not re.search(r'fill=', attrs):
        c, a = color(n['c'])
        fill = f' fill="{c}"' + (f' fill-opacity="{a:g}"' if a < 1 else '')
    # Ids inside embedded icons (clip paths "a", "clip0" …) repeat across icons: make them unique per icon.
    pre = uid('i')
    body = re.sub(r'id="([^"]+)"', lambda m: f'id="{pre}-{m[1]}"', body)
    body = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{pre}-{m[1]})', body)
    body = re.sub(r'(xlink:href|href)="#([^"]+)"', lambda m: f'{m[1]}="#{pre}-{m[2]}"', body)
    # CSS mask position/size → preserveAspectRatio (contain/auto keep the aspect; position picks the anchor).
    par = 'xMidYMid meet'
    if n.get('mask'):
        pos = (n.get('mp') or '50% 50%').split()
        ax = {'0%': 'xMin', 'left': 'xMin', '100%': 'xMax', 'right': 'xMax'}.get(pos[0], 'xMid')
        ay = {'0%': 'YMin', 'top': 'YMin', '100%': 'YMax', 'bottom': 'YMax'}.get(pos[1] if len(pos) > 1 else '50%', 'YMid')
        par = ax + ay + (' slice' if (n.get('ms') or '') == 'cover' else ' meet')
    op = f' opacity="{n["op"]}"' if n.get('op') else ''
    return f'<svg id="{uid("Icon " + str(n.get("n", "")))}" x="{n["x"]}" y="{n["y"]}" width="{n["w"]}" height="{n["h"]}" viewBox="{vb}" preserveAspectRatio="{par}"{fill}{op} overflow="hidden">{body}</svg>'


def text(n):
    c, a = color(n.get('c'))
    weight = n.get('fw', 400)
    style = [f'font-family="Inter"', f'font-size="{n["fs"]}"', f'font-weight="{weight}"', f'fill="{c}"']
    if a < 1:
        style.append(f'fill-opacity="{a:g}"')
    if n.get('ls'):
        style.append(f'letter-spacing="{n["ls"]}"')
    out = []
    lines = n.get('lines') or [{'t': n['txt'], 'x': n['x'], 'y': n['y'], 'w': n['w'], 'h': n['h']}]
    fs = n['fs']
    for ln in lines:
        t = ln['t'].upper() if n.get('tt') else ln['t']
        base = ln['y'] + (ln['h'] - 1.21 * fs) / 2 + 0.969 * fs
        out.append(f'<tspan x="{ln["x"]}" y="{base:.2f}">{html.escape(t)}</tspan>')
    # Figma maps SVG weights coarsely (600 → Bold); the weight rides in the layer name and is applied after import.
    ls_tag = f'__ls{round(n["ls"] * 100)}' if n.get('ls') else ''  # hundredths of a px (ids cannot hold '.')
    return f'<text id="{uid((n.get("n") or "Text") + "__w" + str(weight) + ls_tag)}" {" ".join(style)}>{"".join(out)}</text>'


def node(n):
    k = n['k']
    if k == 'T':
        return text(n)
    if k == 'V':
        return icon(n)
    if k == 'I':
        if n['src'].endswith('.svg') and (ROOT / n['src']).exists():
            return icon({**n, 'svg': (ROOT / n['src']).read_text(encoding='utf-8', errors='ignore')})
        data = image_data(n['src'], n['w'], n['h'])
        if not data:
            return ''
        fit = 'xMidYMid meet' if n.get('fit') == 'contain' else 'xMidYMid slice'
        img = f'<image id="{uid("Image " + str(n.get("n", "")))}" x="{n["x"]}" y="{n["y"]}" width="{n["w"]}" height="{n["h"]}" preserveAspectRatio="{fit}" href="{data}"' + (f' opacity="{n["op"]}"' if n.get('op') else '') + '/>'
        if n.get('r'):
            cid = uid('clip')
            defs.append(f'<clipPath id="{cid}"><rect {rect_attrs(n)}/></clipPath>')
            return f'<g clip-path="url(#{cid})">{img}</g>'
        return img
    parts = []
    if n.get('grad'):
        gid = gradient(n['grad'], n)
        if gid:
            parts.append(f'<rect id="{uid("Gradient")}" {rect_attrs(n)} fill="url(#{gid})"/>')
    if n.get('bg') or n.get('b'):
        stroke = ''
        if n.get('b'):
            stroke = ' ' + paint('stroke', n['b'][0]) + f' stroke-width="{n["b"][1]}"'
        parts.insert(0, f'<rect id="{uid("Background")}" {rect_attrs(n)} {paint("fill", n.get("bg"))}{stroke}/>')
    for c in n.get('ch', []):
        parts.append(node(c))
    clip = ''
    if n.get('clip'):
        cid = uid('clip')
        defs.append(f'<clipPath id="{cid}"><rect {rect_attrs(n)}/></clipPath>')
        clip = f' clip-path="url(#{cid})"'
    op = f' opacity="{n["op"]}"' if n.get('op') else ''
    return f'<g id="{uid(n.get("n"))}"{clip}{op}>{"".join(parts)}</g>'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec')
    ap.add_argument('--size', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--name', default='Content')
    args = ap.parse_args()
    d = json.load(open(args.spec, encoding='utf-8'))[args.size]
    body = node(d['tree'])
    w, h = d['contentW'], d['contentH']
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
           f'<defs>{"".join(defs)}</defs><g id="{uid(args.name)}"><rect id="Page-background" x="0" y="0" width="{w}" height="{h}" {paint("fill", d.get("pageBg") or "rgb(20, 20, 21)")}/>{body}</g></svg>')
    Path(args.out).write_text(svg, encoding='utf-8')
    print(json.dumps({'out': args.out, 'bytes': len(svg), 'images': len(image_cache)}))


if __name__ == '__main__':
    main()

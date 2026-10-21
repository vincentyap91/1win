"""Build css/dialogs.css: the rules the shared dialogs (login, registration, account panels, notices) need, for pages that
do not load the main stylesheets (betwave.html loads css/betwave.css instead).

Without it the login / registration dialog opened on betwave.html but had no layout (0px high, below the viewport).
Classes are collected from the dialog markup (js/dialogs.js, js/account-dialogs.js) plus the ones js/common.js adds
(field errors, phone mask, notices). A rule is kept when one of its selectors uses only those classes. @media / @supports
blocks are filtered the same way, and @keyframes used by kept rules are copied.

  python scripts/build-dialog-css.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ['css/styles.css', 'css/audit.css', 'css/local.css', 'css/components.css']
MARKUP = ['js/dialogs.js', 'js/account-dialogs.js', 'js/common.js']
# Stylesheets of the page that uses dialogs.css; design tokens they lack are copied (scoped to the dialogs).
HOST = ['css/betwave.css', 'css/betwave-local.css']
DIALOG_SCOPE = '[data-local-modal],[data-testid="modal-layout"],[data-local-notice]'
CLASS = re.compile(r'\.(-?[_a-zA-Z][\w-]*)')


def collect_classes():
    found = set()
    for f in MARKUP:
        text = (ROOT / f).read_text(encoding='utf-8')
        for attr in re.findall(r'class=\\?"([^"\\]*)', text):
            found.update(attr.split())
        # class names built in script (hint_root-SEpY1, field-wrapper_status-error-xSBJ6, local-notice …)
        found.update(re.findall(r"['\"`.]([a-z][\w-]*_[\w-]+-[A-Za-z0-9]{5})\b", text))
        found.update(re.findall(r"['\"]((?:local|bw)-[a-z-]+)['\"]", text))
    # seen in the live dialogs (index.html, 1440 / 768 / 390) but only built at runtime
    found.update(['field-wrapper_status-error-xSBJ6', 'hint_variant-error-SEpY1', 'snackbar-layout_position-rightTop-hWa6F', 'snackbar-layout_root-hWa6F'])
    # state variants common.js switches to (status-error / validated / default, hidden placeholder)
    for c in list(found):
        m = re.match(r'(.+?)_(?:status|variant)-[\w]+-(\w{5})$', c)
        if m:
            for st in ('default', 'error', 'validated', 'success'):
                found.add(f'{m.group(1)}_status-{st}-{m.group(2)}')
    return found


def blocks(css):
    """Yield (prelude, body) for each top-level block; body is the raw text between the braces."""
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            return
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            c = css[k]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            elif c in '"\'':
                k = css.find(c, k + 1)
            k += 1
        yield prelude, css[j + 1:k - 1]
        i = k


def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def split_selectors(prelude):
    out, depth, cur = [], 0, ''
    for ch in prelude:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    out.append(cur.strip())
    return [s for s in out if s]


# Attribute hooks the local dialog code sets (js/common.js, js/motion.js): [data-local-modal], [data-local-notice],
# [data-testid="modal-layout"] … Rules on them position the sheet / overlay, so they are kept too.
DIALOG_ATTR = re.compile(r'\[data-(?:local-[\w-]+|motion[\w-]*|testid[*^$]?="(?:modal|signIn|signUp|registration|userSettings|profile|balance|deposit|notification|recovery|currency|region)[^"]*")')
# Pure element / page selectors (body, button, #root …) would restyle the page, so a kept selector must name a dialog
# class or one of the hooks above, and every class it names must be a dialog class.


IS_GROUP = re.compile(r':(?:is|where)\(((?:[^()]|\([^()]*\))*)\)')


def keep_rule(prelude, classes):
    kept = []
    for sel in split_selectors(prelude):
        bare = re.sub(r'\[[^\]]*\]', '', sel)
        # classes inside :not(…) or attribute values do not have to be present on the dialog
        bare = re.sub(r':not\((?:[^()]|\([^()]*\))*\)', '', bare)
        # :is(.a, .b) / :where(…) needs one alternative whose classes are all dialog classes
        ok, grouped = True, False
        for group in IS_GROUP.findall(bare):
            alts = [CLASS.findall(alt) for alt in split_selectors(group)]
            if not any(all(n in classes for n in alt) for alt in alts):
                ok = False
            grouped = grouped or any(alts)
        names = CLASS.findall(IS_GROUP.sub('', bare))
        if ok and (names or grouped or DIALOG_ATTR.search(sel)) and all(n in classes for n in names) and '#' not in sel:
            kept.append(sel)
    return kept


def filter_css(css, classes, out, used_frames):
    for prelude, body in blocks(css):
        if prelude.startswith('@'):
            name = re.match(r'@[\w-]+', prelude).group(0).lower()  # '@media(max-width:639px)' has no space
            if name in ('@media', '@supports', '@container', '@layer'):
                inner = []
                filter_css(body, classes, inner, used_frames)
                if inner:
                    out.append(prelude + '{' + ''.join(inner) + '}')
            continue
        sels = keep_rule(prelude, classes)
        if sels:
            out.append(','.join(sels) + '{' + body + '}')
            for m in re.finditer(r'animation(?:-name)?\s*:\s*([^;}]+)', body):
                used_frames.update(re.findall(r'[\w-]+', m.group(1)))


def keyframes(css, wanted):
    out = []
    for prelude, body in blocks(css):
        if prelude.lower().startswith(('@keyframes', '@-webkit-keyframes')) and re.split(r'\s+', prelude.strip())[-1] in wanted:
            out.append(prelude + '{' + body + '}')
        elif prelude.lower().startswith(('@media', '@supports')):
            out.extend(keyframes(body, wanted))
    return out


def root_tokens(texts):
    """--name: value pairs declared on :root / html (outside @media) in the main stylesheets."""
    tokens = {}
    for text in texts:
        for prelude, body in blocks(text):
            if prelude.strip() in (':root', 'html'):
                for m in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+)', body):
                    tokens[m.group(1)] = m.group(2).strip()
    return tokens


def missing_tokens(css, texts):
    """Tokens the dialog rules use that neither the host page nor these rules define (e.g. --input-rounding)."""
    host = ''.join((ROOT / f).read_text(encoding='utf-8') for f in HOST)
    defined = set(re.findall(r'(--[\w-]+)\s*:', host)) | set(re.findall(r'(--[\w-]+)\s*:', css))
    tokens, add, todo = root_tokens(texts), {}, set(re.findall(r'var\((--[\w-]+)', css))
    while todo:
        name = todo.pop()
        if name in defined or name in add or name not in tokens:
            continue
        add[name] = tokens[name]
        todo.update(re.findall(r'var\((--[\w-]+)', tokens[name]))
    return DIALOG_SCOPE + '{' + ';'.join(f'{k}:{v}' for k, v in sorted(add.items())) + '}' if add else ''


def main():
    classes = collect_classes()
    out, frames = [], set()
    texts = [strip_comments((ROOT / f).read_text(encoding='utf-8')) for f in SOURCES]
    for text in texts:
        filter_css(text, classes, out, frames)
    for text in texts:
        out.extend(keyframes(text, frames))
    out.append(missing_tokens('\n'.join(out), texts))
    # styles.css and audit.css repeat many rules; keep the last copy of each so the cascade order is unchanged
    seen, kept = set(), []
    for rule in reversed(out):
        if rule and rule not in seen:
            seen.add(rule); kept.append(rule)
    out = kept[::-1]
    header = '/* Generated by scripts/build-dialog-css.py: dialog rules for pages without the main stylesheets (betwave.html). */\n'
    (ROOT / 'css/dialogs.css').write_text(header + '\n'.join(out) + '\n', encoding='utf-8')
    print({'classes': len(classes), 'rules': len(out), 'keyframes': len(frames), 'bytes': (ROOT / 'css/dialogs.css').stat().st_size})


if __name__ == '__main__':
    main()

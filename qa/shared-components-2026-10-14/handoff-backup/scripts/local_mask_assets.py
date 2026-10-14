"""Embed captured CSS mask images so standalone file previews need no CORS fetch."""
import base64,html,json,mimetypes,pathlib,re,sys

DECL=re.compile(r'((?<![\w-])(?:-webkit-)?mask(?:-image)?\s*:\s*)([^;{}]+)',re.I)
URL=re.compile(r'url\(\s*([\"\']?)([^\)\"\']+)\1\s*\)',re.I)
STYLE=re.compile(r'\bstyle=([\"\'])(.*?)\1',re.S)
CACHE={}
MASK_VARIABLES={}
VAR=re.compile(r'var\(\s*(--[\w-]+)')
CUSTOM=re.compile(r'(?<![\w-])(--[\w-]+)\s*:\s*([^;{}]+)')
COUNTS={'embedded_references':0,'missing_files':set()}

def embed_css_masks(css,root):
    # Native category icons put the URL in a variable, then use mask-image:var(...).
    # Embed that URL too; otherwise file:// still tries to fetch an opaque-origin mask.
    root=pathlib.Path(root)
    if root not in MASK_VARIABLES:
        all_css='\n'.join(p.read_text(encoding='utf-8-sig') for p in (root/'css').glob('*.css'))
        variables=set()
        for match in DECL.finditer(all_css):variables.update(VAR.findall(match[2]))
        dependencies={m[1]:set(VAR.findall(m[2])) for m in CUSTOM.finditer(all_css)}
        for _ in range(len(dependencies)):
            more=set().union(*(dependencies.get(name,set()) for name in variables)) if variables else set()
            if more.issubset(variables):break
            variables.update(more)
        MASK_VARIABLES[root]=variables
    variables=MASK_VARIABLES[root]
    for match in DECL.finditer(css):variables.update(VAR.findall(match[2]))
    def declaration_parts(prefix,value):
        def url(match):
            raw=match[2].strip()
            relative=raw[3:] if raw.startswith('../assets/') else raw
            if not relative.startswith('assets/'):return match[0]
            path=(root/relative).resolve()
            if not path.is_relative_to((root/'assets').resolve()):return match[0]
            if not path.is_file():COUNTS['missing_files'].add(relative);return match[0]
            if path not in CACHE:
                mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
                CACHE[path]='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
            COUNTS['embedded_references']+=1
            return 'url("'+CACHE[path]+'")'
        return prefix+URL.sub(url,value)
    def declaration(match):return declaration_parts(match[1],match[2])
    css=DECL.sub(declaration,css)
    def custom(match):
        if match[1] not in variables:return match[0]
        return declaration_parts(match[1]+': ',match[2])
    return CUSTOM.sub(custom,css)

def embed_html_masks(markup,root):
    def style(match):
        original=html.unescape(match[2]);embedded=embed_css_masks(original,root)
        if original==embedded:return match[0]
        return 'style="'+html.escape(embedded,quote=True)+'"'
    return STYLE.sub(style,markup)

def repair_project(root,apply=False):
    changed=[]
    def write(path,original,updated):
        if original==updated:return
        changed.append(str(path.relative_to(root)))
        if apply:path.write_text(updated,encoding='utf8')
    for path in root.glob('*.html'):
        source=path.read_text(encoding='utf-8-sig');write(path,source,embed_html_masks(source,root))
    for path in (root/'css').glob('*.css'):
        source=path.read_text(encoding='utf-8-sig');write(path,source,embed_css_masks(source,root))
    for path in (root/'js').glob('*.js'):
        source=path.read_text(encoding='utf-8-sig')
        if source.startswith(('window.PAGE_STATES=','window.AUTH_PAGE_STATES=','window.ACCOUNT_DIALOG_STATES=','window.SIDEBAR_STATES=')):
            prefix,data=source.split('=',1);states=json.loads(data.strip().removesuffix(';'))
            for state in states.values():state['html']=embed_html_masks(state['html'],root)
            updated=prefix+'='+json.dumps(states,ensure_ascii=False)+';\n'
        elif source.startswith('window.DIALOG_STATES='):
            first,second=source.split(';\nwindow.REFERENCE_SIDEBAR_ICONS=',1)
            dialogs=json.loads(first.removeprefix('window.DIALOG_STATES='));icons=json.loads(second.strip().removesuffix(';'))
            for state in dialogs.values():state['html']=embed_html_masks(state['html'],root)
            icons={k:embed_html_masks(v,root) for k,v in icons.items()}
            updated='window.DIALOG_STATES='+json.dumps(dialogs,ensure_ascii=False)+';\nwindow.REFERENCE_SIDEBAR_ICONS='+json.dumps(icons,ensure_ascii=False)+';\n'
        else:continue
        write(path,source,updated)
    for path in (root/'reference/audit').glob('*.json'):
        source=path.read_text(encoding='utf-8-sig');data=json.loads(source)
        if not data.get('htmlChunks'):continue
        old=''.join(data['htmlChunks']);new=embed_html_masks(old,root)
        if old!=new:
            data['htmlChunks']=[new];write(path,source,json.dumps(data,ensure_ascii=False),)
    report={'date':'2026-10-13','mode':'applied' if apply else 'dry-run','changed_files':changed,'embedded_references':COUNTS['embedded_references'],'unique_mask_assets':len(CACHE),'missing_files':sorted(COUNTS['missing_files']),'reason':'CSS mask assets are embedded as data URLs for standalone file previews. Ordinary images retain local paths.'}
    if apply:(root/'qa/mask-icon-repair.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({k:len(v) if isinstance(v,list) else v for k,v in report.items() if k!='reason'},ensure_ascii=False))

if __name__=='__main__':repair_project(pathlib.Path(sys.argv[1]) if len(sys.argv)>1 and sys.argv[1]!='--apply' else pathlib.Path(__file__).resolve().parent.parent,'--apply' in sys.argv)

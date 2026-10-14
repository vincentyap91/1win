import json, re, html, pathlib, shutil
from local_mask_assets import embed_css_masks
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
class Node:
    def __init__(self, tag='', attrs=None, parent=None, text=None):
        self.tag=tag; self.attrs=dict(attrs or []); self.parent=parent; self.children=[]; self.text=text
    def walk(self):
        yield self
        for ch in self.children: yield from ch.walk()
    def has(self,key,value): return self.attrs.get(key)==value
    def render(self):
        if self.text is not None: return self.text
        if not self.tag: return ''.join(c.render() for c in self.children)
        attrs=''.join(' '+k+('="'+html.escape(str(v),quote=True)+'"' if v is not None else '') for k,v in self.attrs.items())
        if self.tag in VOID: return '<'+self.tag+attrs+'>'
        return '<'+self.tag+attrs+'>'+''.join(c.render() for c in self.children)+'</'+self.tag+'>'
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False);self.root=Node();self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
        if tag not in VOID:self.stack.append(n)
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1].children.append(Node(text=data,parent=self.stack[-1]))
    def handle_entityref(self,name):self.handle_data('&'+name+';')
    def handle_charref(self,name):self.handle_data('&#'+name+';')

def parse(s):
    p=Parser();p.feed(s);return p.root
def load(name):return json.loads((ROOT/'reference'/f'{name}.json').read_text(encoding='utf8'))
def body(d):return next(n for n in parse(''.join(d['htmlChunks'])).walk() if n.tag=='body')


import hashlib,base64,sys,collections
ROOT=pathlib.Path(__file__).resolve().parent.parent
STAGING=pathlib.Path(sys.argv[1])
OLD=pathlib.Path(sys.argv[2])
ORIGIN='https://one-vv3591.com/'
DENY=re.compile(r'doubleclick|googletag|analytics|adservice|facebook\.net|google\.|googlesyndication',re.I)
ROUTES=json.loads((ROOT/'js/routes.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().removesuffix(';'))['pages']
records=json.loads((ROOT/'qa/asset-provenance.json').read_text(encoding='utf8')) if (ROOT/'qa/asset-provenance.json').exists() else json.loads((OLD/'assets/manifest.json').read_text(encoding='utf8'))
known={a['url']:a for a in records if not DENY.search(a['url']) and (ROOT/a['file']).is_file()}
exts={'image/avif':'.avif','image/webp':'.webp','image/png':'.png','image/jpeg':'.jpg','image/svg+xml':'.svg','image/vnd.microsoft.icon':'.ico','font/woff2':'.woff2','font/woff':'.woff'}
failures=[]
for path in STAGING.glob('assets-*.json'):
 bundle=json.loads(path.read_text(encoding='utf8'))
 for a in bundle.get('assets',[]):
  if a.get('kind') not in ['font','image'] or DENY.search(a.get('url','')) or not a.get('path'):continue
  source=pathlib.Path(a['path']);mime=(a.get('contentType') or '').split(';')[0]
  if not source.is_file() or mime not in exts:continue
  content=source.read_bytes();filename='audit-'+hashlib.sha256(content).hexdigest()[:20]+exts[mime]
  destination=ROOT/'assets'/filename
  if not destination.exists():destination.write_bytes(content)
  known[a['url']]={'url':a['url'],'file':'assets/'+filename,'kind':a['kind'],'type':mime,'observed_on':'one-vv3591.com','capture':'2026-10-13'}
 for a in bundle.get('failures',[]):
  if not DENY.search(a.get('url','')):failures.append({'url':a.get('url','').split('?')[0],'reason':a.get('reason','').splitlines()[0],'capture':path.stem})
(ROOT/'qa/asset-provenance.json').write_text(json.dumps(list(known.values()),ensure_ascii=False,indent=2),encoding='utf8')
def source_key(u):
 m=re.search(r'/plain/(https?://.+)',u);return unquote(re.sub(r'@(webp|avif|png|jpeg)$','',m[1] if m else u))
variants={source_key(u):a for u,a in known.items()}
missing=set()
def media(url,css=False):
 if url.startswith(('data:','#')):return url
 u=urljoin(ORIGIN,url);item=known.get(u) or variants.get(source_key(u))
 if item:return ('../' if css else '')+item['file']
 if u.startswith('http'):missing.add(u.split('?')[0]);return 'data:,'
 return url
def rewrite_css(css):
 def replace(m):
  url=m[1];mapped=media(url,True)
  item=known.get(urljoin(ORIGIN,url))
  if item and item.get('kind')=='font':mapped='data:'+item.get('type','font/woff2')+';base64,'+base64.b64encode((ROOT/item['file']).read_bytes()).decode()
  return 'url("'+mapped+'")'
 return embed_css_masks(re.sub(r'url\(\s*[\'\"]?([^\)\'\"]+)[\'\"]?\s*\)',replace,css),ROOT)
def clean(n):
 if n.text is not None:return
 n.children=[ch for ch in n.children if 'game-card-placeholder_root' not in ch.attrs.get('class','') and ch.attrs.get('data-testid')!='footer-skeleton' and ch.tag not in ['script','style','iframe','noscript','w3m-modal','link'] and 'geetest' not in ch.attrs.get('class','') and 'codex-agent-overlay' not in ch.attrs.get('id','')]
 for ch in n.children:clean(ch)
 n.children=[ch for ch in n.children if not(ch.has('data-testid','modal-layout') and not any(x.tag for x in ch.walk() if x is not ch))]
 for k in list(n.attrs):
  if k.startswith('on') or k in ['nonce']:n.attrs.pop(k,None)
 if n.tag in ['img','source']:
  if 'src' in n.attrs:n.attrs['src']=media(n.attrs['src'])
  if 'srcset' in n.attrs:
   candidates=[]
   for src in n.attrs['srcset'].split(','):
    parts=src.strip().split()
    if not parts:continue
    mapped=media(parts[0])
    if mapped!='data:,':candidates.append(mapped+(' '+parts[1] if len(parts)>1 else ''))
   n.attrs.pop('srcset',None)
   if candidates:n.attrs['srcset']=', '.join(candidates);n.attrs['src']=candidates[0].split()[0] if n.attrs.get('src') in [None,'data:,'] else n.attrs['src']
  n.attrs.pop('loading',None)
 if 'style' in n.attrs:n.attrs['style']=rewrite_css(n.attrs['style']).replace('../assets/','assets/')
 if n.tag in ['image','use']:
  for k in ['href','xlink:href']:
   if k in n.attrs:n.attrs[k]=media(n.attrs[k])
 if n.tag=='form':n.attrs.pop('action',None)
 if n.tag=='input' and n.attrs.get('data-testid')!='casino-search-input':
  n.attrs.pop('value',None);n.attrs['autocomplete']='off'
  if n.attrs.get('type') not in ['checkbox','radio','hidden']:n.attrs['value']=''
 if n.attrs.get('data-testid')=='header-balance-sum':
  for ch in n.walk():
   if ch.text is not None and re.search(r'\d',ch.text):ch.text='0.00'
 if n.attrs.get('data-testid')=='sidebar-profile-button':
  content=next((ch for ch in n.walk() if 'horizontal_content' in ch.attrs.get('class','')),None)
  if content and not re.fullmatch(r'\s*(Log in|Login)\s*',html.unescape(re.sub('<[^>]+>','',content.render())),re.I):
   leaves=[ch for ch in content.walk() if ch.text is not None and ch.text.strip()]
   for i,ch in enumerate(leaves):ch.text='Demo user' if i==0 else 'ID 00000000'
 if n.tag=='a':
  raw=n.attrs.get('href','')
  if raw and not raw.startswith('#'):
   try:
    u=urlparse(urljoin(ORIGIN,raw));n.attrs['href']='#'
    if u.hostname=='one-vv3591.com':
     query=u.query if not re.search(r'auth|secret|session|user_id|access_token',u.query,re.I) else ''
     n.attrs['data-reference-href']=u.path+('?' + query if query else '')
     file='register.html' if 'sign-up' in query else ROUTES.get(u.path)
     if file:n.attrs['href']=file
    else:n.attrs['data-local-unavailable']='external-link'
   except ValueError:n.attrs['href']='#'
   n.attrs.pop('target',None)
  if any(ch is not n and ch.tag=='a' for ch in n.walk()):
   n.tag='div';n.attrs.pop('href',None);n.attrs['role']='link';n.attrs['tabindex']='0'
   raw=n.attrs.get('data-reference-href','');file=ROUTES.get(urlparse(raw).path)
   if file:n.attrs['data-local-page']=file
 return n
captures={}
for path in STAGING.glob('*.json'):
 match=re.fullmatch(r'(.+?)(-auth)?-(\d+)x(\d+)',path.stem)
 if not match:continue
 d=json.loads(path.read_text(encoding='utf8'));p,auth,w,h=match.groups()
 if p.endswith('-sticky'):continue
 if d.get('metrics',{}).get('width')!=int(w) or d.get('metrics',{}).get('height')!=int(h):continue
 if not d.get('htmlChunks'):continue
 if '[Truncated]' in ''.join(d['htmlChunks']):continue
 captures[path.stem]=(p,bool(auth),d)
 route=urlparse(d['url']).path
 if route not in ROUTES:ROUTES[route]=p+'.html'
# Every snapshot and link stays within the local project.
ref=ROOT/'reference/audit';ref.mkdir(exist_ok=True,parents=True)
css=[];seen=set();pages=collections.defaultdict(dict);authpages=collections.defaultdict(dict);report=[]
for name,(p,auth,d) in captures.items():
 raw=''.join(d['htmlChunks']);tree=parse(raw);b=next((n for n in tree.walk() if n.tag=='body'),None)
 if not b:continue
 # Drop account data even in archived DOM references.
 raw=re.sub(r'<(script|iframe|noscript)\b[^>]*>[\s\S]*?</\1\s*>','',raw,flags=re.I)
 clean(b);b.attrs.pop('inert',None)
 d['htmlChunks']=[b.render()];(ref/(name+'.json')).write_text(json.dumps(d,ensure_ascii=False),encoding='utf8')
 size=name.rsplit('-',1)[1];key=p+'-'+size
 state={'html':''.join(ch.render() for ch in b.children),'attrs':b.attrs}
 (authpages if auth else pages)[p][key]=state
 for style in d.get('styles',[]):
  text=''.join(style.get('chunks') or [])
  digest=hashlib.sha256(text.encode()).hexdigest()
  if text and digest not in seen:seen.add(digest);css.append(rewrite_css(text))
 report.append({'capture':name,'page':p,'auth':auth,'metrics':d.get('metrics'),'missing_images':[n.attrs.get('alt','') for n in b.walk() if n.tag=='img' and n.attrs.get('src')=='data:,']})
# Include previously observed search/dialog states; refresh their original media maps.
for p in ['casino-search','casino-search-results','casino-providers']:
 if not pages[p]:
  path=OLD/'reference'/(p+'-1440x900.json');d=json.loads(path.read_text(encoding='utf8'));b=body(d);clean(b)
  pages[p][p+'-1440x900']={'html':''.join(ch.render() for ch in b.children),'attrs':b.attrs}
# Auth layout for newly added categories: observed header/profile only, unchanged guest content.
for p,states in pages.items():
 if authpages[p]:continue
 for key,state in states.items():
  size=key.rsplit('-',1)[1];template=authpages.get('sports' if p.startswith('sports') else 'casino',{}).get(('sports' if p.startswith('sports') else 'casino')+'-'+size)
  if not template:continue
  tree=parse(state['html']);authTree=parse(template['html'])
  for ident in ['header-balance-button','sidebar-profile-button']:pass
  oldHeader=next((n for n in tree.walk() if n.tag=='header'),None);newHeader=next((n for n in authTree.walk() if n.tag=='header'),None)
  oldProfile=next((n for n in tree.walk() if n.has('data-testid','sidebar-profile-button')),None);newProfile=next((n for n in authTree.walk() if n.has('data-testid','sidebar-profile-button')),None)
  for old,new in [(oldHeader,newHeader),(oldProfile,newProfile)]:
   if old and new and old.parent:old.parent.children[old.parent.children.index(old)]=new
  authpages[p][key]={'html':tree.render(),'attrs':state['attrs'],'coverage':'observed shared authenticated header/profile; guest page content'}
for p,states in pages.items():
 (ROOT/'js'/f'{p}.js').write_text('window.PAGE_STATES='+json.dumps(states,ensure_ascii=False)+';\n',encoding='utf8')
 (ROOT/'js'/f'{p}-auth.js').write_text('window.AUTH_PAGE_STATES='+json.dumps(authpages[p],ensure_ascii=False)+';\n',encoding='utf8')
# Refresh reference dialogs and original SVG icons with the expanded asset map.
source=(ROOT/'js/dialogs.js').read_text(encoding='utf8');dialogs=json.loads(source.split(';\nwindow.REFERENCE_SIDEBAR_ICONS=')[0].removeprefix('window.DIALOG_STATES='));icons=json.loads(source.split(';\nwindow.REFERENCE_SIDEBAR_ICONS=')[1].strip().removesuffix(';'))
for name,state in dialogs.items():
 path=OLD/'reference'/(name+'.json')
 if not path.exists():continue
 b=body(json.loads(path.read_text(encoding='utf8')));clean(b)
 modal=next((n for n in b.walk() if n.has('data-testid','modal-layout')),None) if not name.startswith('language') else next((n for n in b.walk() if 'language-picker_tooltip' in n.attrs.get('class','')),None)
 if modal:state['html']=modal.render()
(ROOT/'js/dialogs.js').write_text('window.DIALOG_STATES='+json.dumps(dialogs,ensure_ascii=False)+';\nwindow.REFERENCE_SIDEBAR_ICONS='+json.dumps(icons,ensure_ascii=False)+';\n',encoding='utf8')
(ROOT/'css/audit.css').write_text('\n'.join(css),encoding='utf8')
# File protocol fonts use embedded original bytes, avoiding opaque-origin font checks.
styles=(ROOT/'css/styles.css').read_text(encoding='utf8')
def embed_font(m):
 source=(ROOT/'css'/m[1]).resolve()
 if source.suffix in ['.woff','.woff2'] and source.is_file():return 'url("data:font/'+('woff2' if source.suffix=='.woff2' else 'woff')+';base64,'+base64.b64encode(source.read_bytes()).decode()+'")'
 return m[0]
styles=re.sub(r'url\([\'\"]?(\.\./assets/[^\)\'\"]+)[\'\"]?\)',embed_font,styles)
(ROOT/'css/styles.css').write_text(styles,encoding='utf8')
CSP="default-src 'self' data: file:; script-src 'self' file:; style-src 'self' file: 'unsafe-inline'; img-src 'self' file: data:; font-src 'self' file: data:; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'"
for p,states in pages.items():
 if not states:continue
 key=p+'-1440x900' if p+'-1440x900' in states else next(iter(states));s=states[key]
 battrs=dict(s['attrs']);battrs.pop('inert',None);battrs.update({'data-page':p,'data-state':key,'data-asset-prefix':''});bodyattrs=''.join(' '+k+'="'+html.escape(v or '',quote=True)+'"' for k,v in battrs.items())
 filename='index.html' if p=='home' else p+'.html'
 doc='<!doctype html>\n<html lang="en" class="colorScheme-dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="'+CSP+'"><title>1win | '+p.replace('-',' ').title()+'</title><link rel="stylesheet" href="css/styles.css"><link rel="stylesheet" href="css/audit.css"><link rel="stylesheet" href="css/local.css"><link rel="stylesheet" href="css/account.css"><link rel="stylesheet" href="css/motion.css"></head><body'+bodyattrs+'>'+s['html']
 doc+=''.join('<script src="js/'+src+'"></script>' for src in ['dialogs.js',p+'.js',p+'-auth.js','account-dialogs.js','sidebar.js','motion.js','common.js'])+'</body></html>'
 (ROOT/filename).write_text(doc,encoding='utf8')
# Keep the independent auth-entry documents and add local resources there too.
for name in ['login','register','recovery']:
 doc=(ROOT/'index.html').read_text(encoding='utf8')
 modal={'login':'login','register':'registration','recovery':'recovery'}[name]
 doc=re.sub(r'(<body\b[^>]*)(>)',lambda m:m[1]+' data-initial-modal="'+modal+'"'+m[2],doc,count=1)
 doc=re.sub(r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*',lambda m:m[1]+CSP,doc)
 if 'css/audit.css' not in doc:doc=doc.replace('<link rel="stylesheet" href="css/local.css">','<link rel="stylesheet" href="css/audit.css"><link rel="stylesheet" href="css/local.css">')
 if 'js/home-auth.js' not in doc:doc=doc.replace('<script src="js/common.js">','<script src="js/home-auth.js"></script><script src="js/common.js">')
 (ROOT/(name+'.html')).write_text(doc,encoding='utf8')
(ROOT/'qa/audit-routes.json').write_text(json.dumps(ROUTES,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'qa/audit-capture-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'qa/audit-resource-gaps.json').write_text(json.dumps({'missing_urls':sorted(missing),'bundle_failures':failures},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'pages':len(pages),'captures':len(report),'css_blocks':len(css),'assets':len(known),'missing_urls':len(missing)},ensure_ascii=False))
from shared_components import main as migrate_shared_ui
migrate_shared_ui()
# The preview server builds the browser bundles at startup; for file previews run build-components.mjs first.




import pathlib,json,re,hashlib,base64,sys,html
from urllib.parse import urljoin,unquote
root=pathlib.Path(__file__).resolve().parent.parent
stage=pathlib.Path(sys.argv[1])
sys.path.insert(0,str(root/'scripts'))
from local_mask_assets import embed_css_masks
records=json.loads((root/'qa/asset-provenance.json').read_text(encoding='utf8'))
def source_key(u):
 m=re.search(r'/plain/(https?://.+)',u);return unquote(re.sub(r'@(webp|avif|png|jpeg)$','',m[1] if m else u))
known={r['url']:r for r in records};variants={source_key(u):r for u,r in known.items()}
def media(u,css=False):
 if u.startswith(('data:','#')):return u
 u=urljoin('https://one-vv3591.com/',u);r=known.get(u) or variants.get(source_key(u))
 if not r:return 'data:,'
 if css and r.get('kind')=='font':return 'data:'+r['type']+';base64,'+base64.b64encode((root/r['file']).read_bytes()).decode()
 return ('../' if css else '')+r['file']
def css(s):
 return embed_css_masks(re.sub(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)',lambda m:'url("'+media(m[1],True)+'")',s),root)
seen=set()
for path in stage.glob('*.json'):
 if not re.fullmatch(r'.+(?:-auth)?-\d+x\d+',path.stem) or path.stem.startswith('account-dialog-'):continue
 d=json.loads(path.read_text(encoding='utf8'))
 if not any('<body' in h for h in d.get('htmlChunks',[])):continue
 for style in d.get('styles',[]):seen.add(hashlib.sha256(''.join(style.get('chunks',[])).encode()).hexdigest())
states={};styles=[]
for path in stage.glob('account-dialog-*.json'):
 d=json.loads(path.read_text(encoding='utf8'));s=''.join(d['htmlChunks'])
 s=re.sub(r'<(script|iframe|noscript)\b[^>]*>[\s\S]*?</\1\s*>','',s,flags=re.I)
 s=re.sub(r'\s+on\w+="[^"]*"','',s)
 s=re.sub(r'(?:src|xlink:href)="([^"]+)"',lambda m:m[0].split('=')[0]+'="'+media(m[1])+'"',s)
 s=re.sub(r'\s+srcset="[^"]*"','',s)
 s=re.sub(r'style="([^"]*)"',lambda m:'style="'+html.escape(css(html.unescape(m[1])).replace('../assets/','assets/'),quote=True)+'"',s)
 s=re.sub(r'href="(?:https?://|//)[^"]*"','href="#"',s)
 s=re.sub(r'\bvalue="[^"]*"','value=""',s)
 key=path.stem.replace('account-dialog-','');states[key]={'html':s,'coverage':'Observed original profile/settings; anonymized local demonstration.'}
 clean=dict(d);clean['htmlChunks']=[s];clean['styles']=[];clean['url']='https://one-vv3591.com/';clean['anonymized']=True
 (root/'reference/audit'/(path.stem+'.json')).write_text(json.dumps(clean,ensure_ascii=False),encoding='utf8')
 for style in d.get('styles',[]):
  text=''.join(style.get('chunks',[]));digest=hashlib.sha256(text.encode()).hexdigest()
  if text and digest not in seen:seen.add(digest);styles.append(css(text))
(root/'js/account-dialogs.js').write_text('window.ACCOUNT_DIALOG_STATES='+json.dumps(states,ensure_ascii=False)+';\n',encoding='utf8')
(root/'css/account.css').write_text('\n'.join(styles),encoding='utf8')
(root/'qa/account-dialog-coverage.json').write_text(json.dumps({'states':list(states),'styles':len(styles),'private_data':'Demo values only; no credentials or connection.'},indent=2),encoding='utf8')
print(json.dumps({'account_dialogs':len(states),'css_blocks':len(styles)}))

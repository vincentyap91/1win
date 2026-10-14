import pathlib,json,re,argparse,datetime
from html.parser import HTMLParser
from shared_components import read_templates,expand
root=pathlib.Path(__file__).resolve().parent.parent
templates=read_templates()
missing=set();external=[]
class Inspect(HTMLParser):
    def __init__(self,name):super().__init__();self.name=name
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        for key in ['src','href','xlink:href']:
            value=a.get(key,'')
            if not value or value.startswith(('#','data:')):continue
            if value.startswith(('http:','https:','//')):
                external.append({'file':self.name,'tag':tag,'attribute':key,'url':value.split('?')[0]});continue
            value=value.split('?')[0].split('#')[0]
            if value and not (root/value).is_file():missing.add((self.name,value))
for f in root.glob('*.html'):Inspect(f.name).feed(expand(f.read_text(encoding='utf-8-sig'),templates))
for key,markup in templates.items():Inspect('shared:'+key).feed(markup)
for f in (root/'js').glob('*.js'):
    if not f.name.endswith('-auth.js') and f.name in ['common.js','dialogs.js']:continue
    source=f.read_text(encoding='utf-8-sig')
    if source.startswith(('window.PAGE_STATES=','window.AUTH_PAGE_STATES=','window.ACCOUNT_DIALOG_STATES=','window.SIDEBAR_STATES=')):
        states=json.loads(source.split('=',1)[1].strip().removesuffix(';'))
        for key,state in states.items():Inspect(f.name+':'+key).feed(expand(state['html'],templates))
source=(root/'js/dialogs.js').read_text(encoding='utf-8-sig')
first,second=source.split(';\nwindow.REFERENCE_SIDEBAR_ICONS=',1)
for key,state in json.loads(first.removeprefix('window.DIALOG_STATES=')).items():Inspect('dialogs:'+key).feed(state['html'])
for key,markup in json.loads(second.strip().removesuffix(';')).items():Inspect('sidebar-icon:'+key).feed(markup)
for f in (root/'css').glob('*.css'):
    for value in re.findall(r'url\(\s*[\'"]?([^\)\'"]+)[\'"]?\s*\)',f.read_text(encoding='utf-8-sig')):
        # '%23id' is an in-SVG fragment reference inside a data URI, not a file.
        if value.startswith(('data:','#','%23')):continue
        if value.startswith(('http:','https:','//')):external.append({'file':f.name,'attribute':'css-url','url':value.split('?')[0]});continue
        if not (f.parent/value.split('?')[0].split('#')[0]).is_file():missing.add((f.name,value))
parser=argparse.ArgumentParser()
parser.add_argument('--date',default=datetime.date.today().isoformat(),help='Audit date in the user timezone, YYYY-MM-DD')
args=parser.parse_args()
report={'date':args.date,'html_pages':len(list(root.glob('*.html'))),'missing_local_files':[{'file':a,'reference':b} for a,b in sorted(missing)],'active_external_references':external,'note':'Checks HTML, captured states, dialogs, sidebar icons and stylesheet URLs; data:, denotes separately tracked uncaptured media, not a missing local file.'}
(root/'qa/expanded-static-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:len(v) if isinstance(v,list) else v for k,v in report.items() if k!='note'},ensure_ascii=False))

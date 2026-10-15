import json, pathlib, re, hashlib, xml.etree.ElementTree as ET
root=pathlib.Path(__file__).resolve().parent
project=root.parent.parent
provenance=json.loads((project/'qa/asset-provenance.json').read_text(encoding='utf8'))
assets={x['url']:x['file'] for x in provenance}
social={x['icon']:x['nodes'] for x in json.loads((root/'auth-social-svg-style.json').read_text(encoding='utf8'))}
def clean(n, parent=None):
    if 'modal-header_overlayHeader' in n.get('name',''): return []
    children=[]
    for c in n.get('children',[]): children.extend(clean(c,n))
    n={k:v for k,v in n.items() if k in ['tag','name','text','x','y','w','h','bg','fg','radius','stroke','strokeWidth','opacity','display','direction','size','weight','line','src','svg']}
    if n.get('name'):n['name']=n['name'].split(' ')[0]
    n['children']=children
    if n.get('svg'):
        icon=re.search(r'data-icon="([^"]+)',n['svg'])
        if icon and icon[1] in social:
            el=ET.fromstring(n['svg']);parts=list(el.iter());styles=social[icon[1]]
            if len(parts)!=len(styles):raise ValueError('SVG source mismatch')
            for part,style in zip(parts,styles):
                part.set('style',';'.join(k.replace('fillOpacity','fill-opacity').replace('strokeWidth','stroke-width')+':'+v for k,v in style.items()))
                for k in ['fill','stroke','opacity']:part.set(k,style[k])
            ET.register_namespace('','http://www.w3.org/2000/svg');n['svg']=ET.tostring(el,encoding='unicode')
    if n['tag']=='INPUT': return []
    if n['tag']=='IMG':
        asset=assets.get(n.get('src'))
        if not asset and 'flag_img' in n.get('name',''): asset='assets/fa7482d44e640459.svg'
        if asset and (project/asset).suffix=='.svg': n['svg']=(project/asset).read_text(encoding='utf8')
        else: raise ValueError('Unresolved image '+str(n.get('src')))
    if n['tag']=='#text':
        if n['fg'].endswith(', 0)'):
            if n['text']=='+60':n['fg']='rgb(20, 20, 21)'
            else:return []
        if parent and abs(parent['h']-n['line'])<.1:
            n['y']=parent['y'];n['h']=parent['h']
        else:
            n['y']+=(n['h']-n['line'])/2;n['h']=n['line']
    if n['w']<=0 or n['h']<=0 or n.get('display')=='contents': return children
    # Collapse layout-neutral wrappers while preserving source-defined flex containers.
    if len(children)==1 and n.get('bg')=='rgba(0, 0, 0, 0)' and n.get('display')!='flex' and not any(float(v or 0) for v in re.findall(r'[\d.]+',n.get('strokeWidth','0'))):
        c=children[0]
        if all(abs(n[k]-c[k])<.01 for k in ['x','y','w','h']): return [c]
    return [n]
bundle=[]
for p in sorted(root.glob('auth-original-*.json')):
    state=p.stem.replace('auth-original-','')
    d=json.loads(p.read_text(encoding='utf8'));tree=clean(d['tree'])[0]
    bundle.append({'state':state,'tree':tree,'viewport':d['viewport']})
(root/'auth-native-specs.json').write_text(json.dumps(bundle,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps({'states':[d['state'] for d in bundle],'bytes':(root/'auth-native-specs.json').stat().st_size}))

// Source-observed modal layers only. Does not touch existing page frames.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('7:3'));
const created=[],reused=[],newVariables=[];
for(const style of ['Regular','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style});
const page=figma.currentPage;
const completedAuthIds={login:'196:244',email:'199:239',recovery:'199:310','recovery-email':'199:365',registration:'199:515',promo:'199:682','login-mobile':'199:867','recovery-mobile':'199:965','registration-mobile':'199:1115'};
const completedAuth=completedAuthIds[SPEC.state]?await figma.getNodeByIdAsync(completedAuthIds[SPEC.state]):null;
if(completedAuth)return {state:SPEC.state,rootId:completedAuth.id,createdNodeIds:[],reusedNodeIds:[completedAuth.id],alreadyExists:true};
const existing=page.children.find(n=>n.name==='Auth panel / '+SPEC.state);
if(existing)return {state:SPEC.state,rootId:existing.id,createdNodeIds:[],reusedNodeIds:[existing.id],alreadyExists:true};
const colors=await figma.variables.getLocalVariablesAsync('COLOR');
const collections=await figma.variables.getLocalVariableCollectionsAsync();
const primitive=collections.find(c=>c.id==='VariableCollectionId:7:7');
const semantic=collections.find(c=>c.id==='VariableCollectionId:7:8');
const colorMap=new Map();
function resolved(v){let x=Object.values(v.valuesByMode)[0];if(x&&x.type==='VARIABLE_ALIAS'){const a=colors.find(z=>z.id===x.id);return a?resolved(a):null;}return x;}
function key(c){return [c.r,c.g,c.b,c.a??1].map(x=>Math.round(x*10000)).join(',');}
for(const v of colors){const c=resolved(v);if(c&&v.scopes.length)colorMap.set(key(c),v);}
function rgba(css){const m=String(css).match(/[\d.]+/g);if(!m||m.length<3)return null;return {r:+m[0]/255,g:+m[1]/255,b:+m[2]/255,a:m.length>3?+m[3]:1};}
function paint(css){const c=rgba(css);if(!c||!c.a)return [];const k=key(c);let v=colorMap.get(k);if(!v){const name='auth/'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')+(c.a<1?'-'+Math.round(c.a*100):'');let p=colors.find(z=>z.name===name&&z.variableCollectionId===primitive.id);if(!p){p=figma.variables.createVariable(name,primitive,'COLOR');p.scopes=[];p.setValueForMode(primitive.defaultModeId,c);p.setVariableCodeSyntax('WEB','var(--'+name.replaceAll('/','-')+')');newVariables.push(p.id);colors.push(p);}v=figma.variables.createVariable(name,semantic,'COLOR');v.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];v.setValueForMode(semantic.defaultModeId,{type:'VARIABLE_ALIAS',id:p.id});v.setVariableCodeSyntax('WEB','var(--'+name.replaceAll('/','-')+')');newVariables.push(v.id);colors.push(v);colorMap.set(k,v);}return [figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a},'color',v)];}
const styles=await figma.getLocalTextStylesAsync();
function tr(n){let weight=n.weight>=700?'Bold':n.weight>=600?'Semi Bold':'Regular';return {family:'Inter',style:weight};}
function canonical(n,ox=n.x,oy=n.y){let o={};for(const k of ['tag','text','svg','bg','fg','radius','stroke','strokeWidth','size','weight','line','w','h'])if(n[k]!==undefined)o[k]=n[k];o.x=Math.round((n.x-ox)*100)/100;o.y=Math.round((n.y-oy)*100)/100;o.children=(n.children||[]).map(c=>canonical(c,ox,oy));return o;}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(16);}
function role(n){if((n.name||'').startsWith('field-wrapper_root'))return 'Input';if((n.name||'').startsWith('segment-control_root'))return 'Method switch';if(n.tag==='BUTTON'&&(n.name||'').startsWith('base_root-ZOkD4'))return 'Submit';if((n.name||'').startsWith('oauth-buttons-container_root'))return 'Social login';return null;}
const shared=[];
async function build(n,skipShared=false){
 const kind=!skipShared&&role(n);
 if(kind){const name='Auth shared / '+kind+' / '+hash(JSON.stringify(canonical(n)));let master=page.children.find(x=>x.name===name&&x.type==='COMPONENT');if(!master){const raw=await build(n,true);master=figma.createComponentFromNode(raw);master.name=name;master.description='Observed original '+kind+'. Reused by auth panels; editable text, vectors and variable-bound colors. Source: https://one-vv3591.com/';master.x=3400+(shared.length%5)*430;master.y=8500+Math.floor(shared.length/5)*260;created.push(master.id);}else reused.push(master.id);shared.push({id:master.id,name:master.name});const i=master.createInstance();created.push(i.id);return i;}
 let node;
 if(n.svg){let svg=n.svg;if(!/^<svg[^>]*\sfill=/.test(svg))svg=svg.replace('<svg','<svg fill="'+(n.fg||'#141415')+'"');node=figma.createNodeFromSvg(svg);node.resize(n.w,n.h);}
 else if(n.tag==='#text'){node=figma.createText();node.fontName=tr(n);node.fontSize=n.size;node.lineHeight={unit:'PIXELS',value:n.line};node.characters=n.text;node.textAutoResize='HEIGHT';node.resize(Math.max(n.w+.02,1),n.h);node.fills=paint(n.fg);const sty=styles.find(s=>s.fontSize===n.size&&s.fontName.style===node.fontName.style&&Math.abs((s.lineHeight.value||0)-n.line)<.1);if(sty)await node.setTextStyleIdAsync(sty.id);}
 else{
  node=figma.createFrame();node.resize(Math.max(n.w,.01),Math.max(n.h,.01));node.fills=paint(n.bg);node.clipsContent=false;
  const rs=String(n.radius||'0').split(' ').map(Number.parseFloat);if(rs.length===1)node.cornerRadius=rs[0]||0;else{node.topLeftRadius=rs[0]||0;node.topRightRadius=rs[1]||0;node.bottomRightRadius=rs[2]??rs[0]??0;node.bottomLeftRadius=rs[3]??rs[1]??0;}
  const bw=Number.parseFloat(n.strokeWidth)||0;if(bw){node.strokes=paint(n.stroke);node.strokeWeight=bw;node.strokeAlign='INSIDE';}
  for(const c of n.children||[]){const child=await build(c);node.appendChild(child);child.x=c.x-n.x;child.y=c.y-n.y;}
  // Promote measured one-dimensional relationships to auto layout, keeping overlays absolute.
  const cs=n.children||[];
  if(cs.length&&n.display==='flex'){
   const vertical=n.direction==='column',axis=vertical?'y':'x',extent=vertical?'h':'w',cross=vertical?'x':'y',crossExtent=vertical?'w':'h';
   const ordered=cs.every((c,i)=>!i||c[axis]>=cs[i-1][axis]+cs[i-1][extent]-.1);
   if(ordered){
    const gaps=cs.slice(1).map((c,i)=>c[axis]-cs[i][axis]-cs[i][extent]);
    const uniform=!gaps.length||Math.max(...gaps)-Math.min(...gaps)<.1;
    const crossCenters=cs.map(c=>c[cross]+c[crossExtent]/2);
    const centered=Math.max(...crossCenters)-Math.min(...crossCenters)<.1;
    if(uniform&&centered){
      node.layoutMode=vertical?'VERTICAL':'HORIZONTAL';node.primaryAxisSizingMode='FIXED';node.counterAxisSizingMode='FIXED';node.primaryAxisAlignItems='MIN';node.counterAxisAlignItems='CENTER';node.itemSpacing=gaps[0]||0;
      const first=cs[0],last=cs[cs.length-1],start=first[axis]-n[axis],end=n[axis]+n[extent]-last[axis]-last[extent];
      const mid=crossCenters[0]-n[cross],max=Math.max(...cs.map(c=>c[crossExtent]));
      if(vertical){node.paddingTop=Math.max(0,start);node.paddingBottom=Math.max(0,end);node.paddingLeft=Math.max(0,mid-max/2);node.paddingRight=Math.max(0,n.w-mid-max/2);}else{node.paddingLeft=Math.max(0,start);node.paddingRight=Math.max(0,end);node.paddingTop=Math.max(0,mid-max/2);node.paddingBottom=Math.max(0,n.h-mid-max/2);}
    }
   }
  }
  if(/^(sign-in_line|united-form_line)/.test(n.name||'')){
   node.layoutMode='NONE';const t=node.children.find(c=>c.type==='TEXT');if(t){t.x=(n.w-t.width)/2;t.y=(n.h-t.height)/2;const width=(n.w-t.width-16)/2;for(const x of [0,n.w-width]){const line=figma.createRectangle();line.name='Divider';line.resize(width,1);line.fills=paint('rgba(179, 182, 189, 0.16)');node.appendChild(line);line.x=x;line.y=n.h/2-.5;created.push(line.id);}}
  }
 }
 node.opacity=n.opacity??1;
 if(n.tag==='#text')node.textAutoResize='WIDTH_AND_HEIGHT';else node.resize(n.w,n.h);
 node.name=n.tag==='#text'?n.text.trim():n.tag==='svg'?'Icon · '+((n.svg.match(/data-icon="([^"]+)/)||[])[1]||'Original'):n.name?.split(' ')[0]||n.tag;
 created.push(node.id);return node;
}
const raw=await build(SPEC.tree,true);const panel=figma.createComponentFromNode(raw);created.push(panel.id);panel.name='Auth panel / '+SPEC.state;panel.description='Original guest '+SPEC.state+' panel. Native editable layers; no whole-page raster. Reference measured at '+SPEC.viewport.w+'×'+SPEC.viewport.h+'. Preserve completed screens.';panel.x=100+INDEX*470;panel.y=9300;
const texts=[];function collect(n){if(n.type==='TEXT')texts.push(n);if('children'in n)for(const c of n.children)collect(c);}collect(panel);
return {state:SPEC.state,rootId:panel.id,width:panel.width,height:panel.height,createdNodeIds:created,reusedNodeIds:reused,newVariableIds:newVariables,sharedComponents:shared,textCount:texts.length,autoLayoutCount:panel.findAll(n=>'layoutMode'in n&&n.layoutMode!=='NONE').length};

/* Betwave guest presentation. Local UI data only; no analytics, advertising or production APIs. */
(() => {
  'use strict';
  const data = window.BETWAVE_DATA;
  const query = new URLSearchParams(location.search);
  let view = query.get('view') || 'home';
  if (view === 'profile') view = ({finance:'profile',profit:'profit',subscribers:'subscribers',comments:'comments'})[query.get('tab')] || 'profile';
  if (view === 'home' && ['all','ai','community','subscriptions'].includes(query.get('authors'))) view = 'home-' + query.get('authors');
  if (!data.views[view+'-1440'] && !data.views[view+'-390']) view = 'home';
  const expand = html => html.replace(/<!--BW:([^>]+)-->/g, (_, key) => data.parts[key] || '');
  const select = width => data.views[view+'-'+width] || data.views[view+(width<1024?'-390':'-1440')] || data.views[view+'-1440'] || data.views[view+'-390'];
  window.PAGE_STATES = {};
  for (const [width,height] of [[1440,900],[1920,1080],[390,844],[430,932],[768,1024]]) {
    const state=select(width);
    window.PAGE_STATES['betwave-'+width+'x'+height]={html:expand(state.html),attrs:state.attrs};
  }
  const rootState=select(innerWidth);
  for (const [name,value] of Object.entries(rootState.htmlAttrs || {})) {
    if (!name.startsWith('on') && name !== 'data-shared-ui') document.documentElement.setAttribute(name,value);
  }
  document.body.dataset.page='betwave';
  document.body.dataset.state='';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const go=(params={})=>{const q=new URLSearchParams(params);location.href='betwave.html'+(q.size?'?'+q:'');};
  let returnFocus=null;
  function closePanel(){
    $('[data-bw-overlay]')?.remove();
    document.body.style.overflow='';
    returnFocus?.focus({preventScroll:true});
  }
  function panel(kind,trigger){
    closePanel();returnFocus=trigger;
    const mobile=innerWidth<640;
    const record=data.panels[kind+(mobile?'-390':'-1440')] || data.panels[kind+'-1440'];
    if(!record)return;
    const overlay=document.createElement('div');overlay.dataset.bwOverlay=kind;
    overlay.className='bw-overlay colorScheme-light';
    overlay.innerHTML=record.html;
    const card=overlay.firstElementChild;card.style.transform='';card.style.transition='none';
    if(kind==='sort'||kind==='period'){
      overlay.classList.add('bw-dropdown');
      const r=trigger.getBoundingClientRect();
      Object.assign(card.style,{position:'fixed',left:Math.max(8,Math.min(r.left,innerWidth-180))+'px',top:Math.min(r.bottom+6,innerHeight-180)+'px',transform:'none',visibility:'visible',opacity:'1'});
    }else{
      overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',kind);
      if(kind==='menu')overlay.classList.add('bw-menu-overlay');
      else if(mobile)overlay.classList.add('bw-mobile-overlay');
      document.body.style.overflow='hidden';
    }
    document.body.append(overlay);
    if(kind==='share'){
      const input=$('input',card);if(input)input.value=trigger.closest('article')?.querySelector('[data-bw-route*="/prediction/"]')?.dataset.bwRoute || rootState.source;
    }
    $('[data-testid="modal-header-button-close"],button',card)?.focus({preventScroll:true});
  }
  function chooseTab(button){
    const parent=button.parentElement;
    for(const peer of parent.querySelectorAll('button')){
      for(const token of [...peer.classList])if(/(?:tab|segment-control)_selected-/.test(token))peer.classList.remove(token);
      peer.setAttribute('aria-selected',String(peer===button));
    }
    for(const token of [...button.classList])if(/^(tab|segment-control)_(root|tab)-/.test(token))button.classList.add(token.replace(/_(root|tab)-/,'_selected-'));
  }
  function applySearch(){
    const value=$('input[type="search"]')?.value.trim().toLowerCase()||'';
    $$('main article').forEach(card=>{card.hidden=!!value&&!card.textContent.toLowerCase().includes(value);});
    const clear=$('[class*="clear-button_root-"]');if(clear)clear.disabled=!value;
  }
  document.addEventListener('input',e=>{
    if(e.target.matches('input[type="search"]'))applySearch();
    const overlay=e.target.closest('[data-bw-overlay="filters"]');
    if(overlay){const apply=$$('button',overlay).find(b=>b.textContent.trim()==='Apply');if(apply)apply.disabled=false;}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('[data-bw-overlay]')){e.stopImmediatePropagation();closePanel();}},true);
  document.addEventListener('click',e=>{
    const button=e.target.closest('button,a');
    const overlay=e.target.closest('[data-bw-overlay]');
    if(e.target.matches('[data-bw-overlay]')){e.preventDefault();e.stopImmediatePropagation();closePanel();return;}
    if(!button)return;
    const text=button.textContent.replace(/\s+/g,' ').trim();
    const stop=()=>{e.preventDefault();e.stopImmediatePropagation();};
    if(overlay){
      const kind=overlay.dataset.bwOverlay;
      if(button.dataset.testid==='modal-header-button-close'||kind==='menu'&&button.className.includes('common-layout_close')){stop();closePanel();return;}
      if(kind==='period'&&['Today','Tomorrow','7 days'].includes(text)){stop();const q=Object.fromEntries(query);q.period=({'Today':'today','Tomorrow':'tomorrow','7 days':'week'})[text];go(q);return;}
      if(kind==='sort'&&['Popular','Newest first','Oldest first'].includes(text)){
        stop();const trigger=returnFocus;closePanel();const content=trigger?.querySelector('[class*="base_content-"]');if(content)content.firstChild.textContent=text+' ';
        const cards=$$('main article');if(text==='Oldest first')cards.reverse().forEach(card=>card.parentElement.append(card));
        return;
      }
      if(kind==='filters'){
        const input=$('input[type="checkbox"]',button);
        if(input&&e.target!==input){stop();input.checked=!input.checked;input.dispatchEvent(new Event('input',{bubbles:true}));return;}
        if(text==='Apply'){stop();closePanel();applySearch();return;}
      }
      if(kind==='share'&&text==='Copy'){
        stop();const input=$('input',overlay);if(input){input.disabled=false;input.readOnly=true;input.select();document.execCommand('copy');}return;
      }
      if(kind==='share'&&button.tagName==='A'){stop();return;}
      if((kind==='authorization'||kind==='menu')&&/^(Login|Log in|Register|Registration)$/.test(text))closePanel();
    }
    if(button.dataset.bwRoute){stop();location.href=button.getAttribute('href');return;}
    if(button.dataset.bwExternal){stop();return;}
    if(button.dataset.testid==='tabbar-navigation-menu'){stop();panel('menu',button);return;}
    if(/^(To home page|Back)$/.test(text)){stop();go();return;}
    if(text==='Become author'||text==='Create prediction'||text==='Subscribe'||text==='Bet'){
      stop();panel('authorization',button);return;
    }
    if(text==='Share'){stop();panel('share',button);return;}
    if(text==='Filters'){stop();panel('filters',button);return;}
    if(/^(Popular|Newest first|Oldest first)$/.test(text)){stop();panel('sort',button);return;}
    if(button.className.includes('SelectPeriodFilter_searchFiltersButton')){stop();panel('period',button);return;}
    if(button.matches('[class*="clear-button_root-"]')){stop();const input=$('input[type="search"]');if(input)input.value='';applySearch();return;}
    if(button.className.includes('tab_root-')&&button.closest('main')&&['All','PRO','Community','NEW AI','NEWAI','AI','Subscriptions'].includes(text)&&view.startsWith('home')){
      stop();go(text==='PRO'?{}:{authors:text.includes('AI')?'ai':text.toLowerCase()});return;
    }
    if(button.className.includes('BWChipsTab_root-')&&!$('a',button)){
      stop();chooseTab(button);const label=$('img',button)?.alt||'';
      if(view.startsWith('home'))go({view:'feed',sport:label||'all'});
      else{query.set('sport',label||'all');history.replaceState(null,'','?'+query);}
      return;
    }
    if(button.className.includes('ForecastCardExpressContent_toggle')){
      stop();const card=button.closest('article');const link=card?.querySelector('[data-bw-route*="/prediction/express-"]');if(link)location.href=link.href;return;
    }
    if(button.className.includes('ForecastCardFooter_iconButtons')){
      stop();const card=button.closest('article');const link=card?.querySelector('[data-bw-route*="/prediction/"]');if(link)location.href=link.href;return;
    }
    if(button.className.includes('TopMatchCard_forecastButton')){stop();go({view:'event',event:'sl-benfica-fc-vs-celtic-40200295'});return;}
    if(button.className.includes('TopMatchCard_oddButton')){stop();panel('authorization',button);return;}
  },true);
  window.BETWAVE_UI={view,openPanel:panel,closePanel,expand};
})();

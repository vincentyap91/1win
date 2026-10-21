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
  // Signed-in header when this browser has a login session (js/common.js: Demo state or a local account).
  const authPreview = (() => { try { const id = localStorage.getItem('1win-local-session'); return id === 'demo' || Boolean(id && JSON.parse(localStorage.getItem('1win-local-accounts') || '[]').some(a => a.id === id)); } catch { return false; } })();
  const sign = html => {
    if (!authPreview || !window.SHARED_UI) return html;
    const signed = window.SHARED_UI.expand('<template data-shared-component="header.betwave.betwave-1440x900.2de49e42"></template>');
    const doc = new DOMParser().parseFromString('<div id="root">'+signed+'</div>', 'text/html');
    const src = doc.querySelector('[class*="variant-1_leading"]');
    const page = new DOMParser().parseFromString('<div id="root">'+html+'</div>', 'text/html');
    const dst = page.querySelector('[class*="variant-1_leading"]');
    if (!src || !dst) return html;
    dst.innerHTML = src.innerHTML.replace(
      '<div class="skeleton_root-ADZg6 balance-sum-skeleton_root-qg2Ip"></div>',
      '<div class="variant-1_sum-qboqn" data-testid="header-balance-sum">0.00</div>'
    );
    return page.getElementById('root').innerHTML;
  };
  window.PAGE_STATES = {};
  for (const [width,height] of [[1440,900],[1920,1080],[390,844],[430,932],[768,1024]]) {
    const state=select(width);
    window.PAGE_STATES['betwave-'+width+'x'+height]={html:sign(expand(state.html)),attrs:state.attrs};
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
    // The menu drawer was only captured at phone width; tablets (Menu in the tab bar up to 1023px) use the same one.
    const record=data.panels[kind+(mobile?'-390':'-1440')] || data.panels[kind+'-1440'] || data.panels[kind+'-390'];
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
    // The captured menu is the guest one; signed in, its "Log in" row becomes the account profile (opens Profile / Log out).
    if(kind==='menu'&&window.LOCAL_AUTH?.signed()){
      const login=$('[data-testid="sidebar-profile-button"] [class*="view_login-"]',overlay);
      if(login){const hash=login.className.match(/view_login-(\w+)/)[1],acc=window.LOCAL_AUTH.profile(),name=document.createElement('div'),id=document.createElement('div');
        name.className='view_name-'+hash;name.textContent=acc.name;id.className='view_id-'+hash;id.textContent='ID '+acc.id;login.replaceWith(name,id);}
    }
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
      // Log in / Register in Betwave's own panels open the shared login / registration dialog (js/common.js),
      // which creates or checks the local account like on every other page.
      if(kind==='menu'&&button.dataset.testid==='sidebar-profile-button'&&window.LOCAL_AUTH?.signed()){closePanel();return;}
      if((kind==='authorization'||kind==='menu')&&/^(Login|Log in|Register|Registration)$/.test(text)){
        stop();closePanel();
        const kindOpen=/^Log/.test(text)?'login':'registration';
        setTimeout(()=>window.LOCAL_AUTH?.open(kindOpen),0);
        return;
      }
    }
    if(button.dataset.bwRoute){stop();location.href=button.getAttribute('href');return;}
    if(button.dataset.bwExternal){stop();return;}
    if(button.dataset.testid==='tabbar-navigation-menu'){stop();panel('menu',button);return;}
    if(/^(To home page|Back)$/.test(text)){stop();go();return;}
    // Signed in (local account or Demo): no "please log in" panel; bets and predictions stay outside this copy.
    const needsAccount=()=>{if(window.LOCAL_AUTH?.signed()){window.LOCAL_AUTH.notice('Betwave bets and predictions are not available in this local copy.');return true;}return false;};
    if(text==='Become author'||text==='Create prediction'||text==='Subscribe'||text==='Bet'){
      stop();if(!needsAccount())panel('authorization',button);return;
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
    if(button.className.includes('TopMatchCard_oddButton')||button.className.includes('MatchOutcomeBlock_root')){stop();if(!needsAccount())panel('authorization',button);return;}
  },true);
  window.BETWAVE_UI={view,openPanel:panel,closePanel,expand};
})();

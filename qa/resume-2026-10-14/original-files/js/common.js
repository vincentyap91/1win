/* Local presentation of observed one-vv3591.com states. No network or account APIs. */
(() => {
  'use strict';
  const guestStates=window.PAGE_STATES||{},authStates=window.AUTH_PAGE_STATES||{};
  let signedPreview=new URLSearchParams(location.search).get('preview')==='auth';
  const states={...window.DIALOG_STATES,...guestStates,...(signedPreview?authStates:{})};
  const pageName = document.body.dataset.page;
  const assetPrefix = document.body.dataset.assetPrefix || '';
  const markup = value => assetPrefix ? value.replaceAll('assets/',assetPrefix+'assets/') : value;
  const go = filename => { location.href = filename+(signedPreview?'?preview=auth':''); };
  const pages = {"/": "index.html", "/casino": "casino.html", "/freemoney": "freemoney.html", "/about-token": "freemoney.html", "/bonuses": "bonuses.html", "/loyalty-program": "loyalty-program.html", "/vip-club": "vip-club.html", "/promotions": "promotions.html", "/tournaments": "tournaments.html", "/blog": "blog.html", "/betwave": "betwave.html", "/en/betwave": "betwave.html", "/casino/1win-games": "casino-1win.html", "/casino/bonus-buy": "casino-bonus-buy.html", "/casino/bonus-wagering": "casino-bonus-wagering.html", "/casino/fishing-games": "casino-fishing.html", "/casino/jili-games": "casino-jili.html", "/casino/live-games": "casino-live.html", "/casino/new": "casino-new.html", "/casino/only-on-1win": "casino-only-1win.html", "/casino/fast-games": "casino-quick.html", "/casino/slots": "casino-slots.html", "/betting": "sports.html", "/betting/esport": "sports-esports.html", "/betting/live": "sports-live.html", "/betting/prematch": "sports-upcoming.html", "/casino/ai-recommendations": "casino-recommended.html"};
  let currentPage = pageName, currentKey = document.body.dataset.state, modal = null, returnFocus = null;
  let resizeTimer, autoTimer, noticeTimer, noticeVersion=0, menuVersion=0;
  const motion=window.PREVIEW_MOTION;
  const scrollBehavior=()=>motion?.reduced()||motion?.instant()?'auto':'smooth';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const test = id => $('[data-testid="'+id+'"]');
  const mobile = () => innerWidth < 640;
  function keyFor(page) {
    const sizes = innerWidth < 410 ? ['390x844'] : innerWidth < 640 ? ['430x932','390x844'] : innerWidth < 1024 ? ['768x1024'] : innerWidth >= 1680 ? ['1920x1080','1440x900'] : ['1440x900'];
    return [...sizes,'1440x900','390x844'].map(v=>page+'-'+v).find(k=>states[k]);
  }
  let sidebarCollapsed=false,expandedSidebarHTML=null;
  try{sidebarCollapsed=localStorage.getItem('1win-preview-sidebar')==='compact';}catch{}
  function sidebarLinks(root,labels={}) {
    $$('a[data-reference-href]',root).forEach(a=>{
      const route=new URL(a.dataset.referenceHref,'https://one-vv3591.com/').pathname,file=pages[route];
      if(file)a.href=file+(signedPreview?'?preview=auth':'');
      const label=labels[a.dataset.testid];if(label){a.setAttribute('aria-label',label);a.title=label;}
    });
  }
  function replaceSidebar(value,current) {
    const template=document.createElement('template');template.innerHTML=markup(value);
    const next=template.content.querySelector('[class*="sidebar_root"]');if(!next)return current;
    const oldProfile=test('sidebar-profile-button'),newProfile=$('[data-testid="sidebar-profile-button"]',next);
    if(oldProfile&&newProfile){const profile=oldProfile.cloneNode(true);profile.className=newProfile.className;newProfile.replaceWith(profile);}
    current.replaceWith(next);return next;
  }
  function applySidebar() {
    const desktop=innerWidth>=1024;let root=$('[class*="sidebar_root"]');if(!root)return;
    if(!desktop){document.body.classList.remove('local-sidebar-collapsed');return;}
    if(currentPage==='casino'&&!root.dataset.localSidebarTemplate&&!$('[class*="common-layout_compact"]',root)&&window.SIDEBAR_STATES?.['expanded-casino']){
      root=replaceSidebar(window.SIDEBAR_STATES['expanded-casino'].html,root);root.dataset.localSidebarTemplate='expanded-casino';
    }
    const compact=!!$('[class*="common-layout_compact"]',root);
    if(sidebarCollapsed&&!compact&&window.SIDEBAR_STATES?.compact){
      expandedSidebarHTML=root.outerHTML;
      const labels={},active=new Set();
      $$('a[data-testid^="sidebar-navigation"]',root).forEach(a=>{labels[a.dataset.testid]=a.textContent.trim();if(a.matches('.router-link-active,[aria-current="page"]'))active.add(a.dataset.testid);});
      root=replaceSidebar(window.SIDEBAR_STATES.compact.html,root);
      $$('a[data-testid^="sidebar-navigation"]',root).forEach(a=>{
        const selected=active.has(a.dataset.testid);
        a.classList.toggle('router-link-active',selected);a.classList.toggle('router-link-exact-active',selected);
        if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      });
      sidebarLinks(root,labels);
    }else if(!sidebarCollapsed&&compact&&expandedSidebarHTML){root=replaceSidebar(expandedSidebarHTML,root);expandedSidebarHTML=null;}
    document.body.classList.toggle('local-sidebar-collapsed',sidebarCollapsed);
    sidebarLinks(root);
    const toggle=$('[data-testid="sidebar-expand-button"]',root);
    if(toggle){toggle.setAttribute('aria-expanded',String(!sidebarCollapsed));toggle.setAttribute('aria-label',sidebarCollapsed?'Expand sidebar':'Collapse sidebar');}
  }
  function toggleSidebar() {
    if(innerWidth<1024)return;
    sidebarCollapsed=!sidebarCollapsed;
    try{localStorage.setItem('1win-preview-sidebar',sidebarCollapsed?'compact':'expanded');}catch{}
    applySidebar();fitBanners();test('sidebar-expand-button')?.focus({preventScroll:true});
  }
  function hydrate() {
    applySidebar();
    // Both hrefs and media are local. Third-party destinations have no navigation handler.
    $$('a[data-reference-href]').forEach(a => {
      const u = new URL(a.dataset.referenceHref,'https://one-vv3591.com/');
      const file=u.searchParams.get('x')?.includes('sign-up')?'register.html':pages[u.pathname];
      if(file)a.setAttribute('href',file+(signedPreview?'?preview=auth':''));
    });
    $$('input[type="password"]').forEach(i=>{ i.setAttribute('autocomplete','new-password'); });
    $$('input[type="tel"][data-testid$="form-phone"]').forEach(i=>{if(!i.value)i.value='+60';});
    $$('input').forEach(input=>updateFieldAppearance(input));
    const consent=test('signUpFast-form-agree');if(consent)consent.checked=true;
    $$('[data-testid="modal-layout"]').forEach(n=>{n.setAttribute('role','dialog');n.setAttribute('aria-modal','true');});
    $$('[class*="games-grid_carousel"]').forEach(n=>{n.style.scrollBehavior=scrollBehavior();});
    $$('a[data-testid^="sidebar-navigation"]').forEach(a=>{
      const icon=$('[class*="menu-icon_iconContainer"]',a),original=window.REFERENCE_SIDEBAR_ICONS?.[a.dataset.testid];
      if(icon?.querySelector('[data-icon="plug"]')&&original)icon.outerHTML=markup(original);
    });
    addPreviewControl();
    fitBanners();
    initFreeMoneyNavigation();
    $$('[class*="games-grid_carousel"]').forEach(grid=>grid.addEventListener('scroll',()=>{
      const section=grid.closest('[class*="games-section_root"]');if(!section)return;
      const previous=$('button:has([data-icon="arrow-back"])',section),next=$('button:has([data-icon="arrow-forward"])',section);
      if(previous)previous.disabled=grid.scrollLeft<2;
      if(next)next.disabled=grid.scrollLeft+grid.clientWidth>=grid.scrollWidth-2;
    },{passive:true}));
    clearInterval(autoTimer);
    if (!new URLSearchParams(location.search).has('qa') && !matchMedia('(prefers-reduced-motion: reduce)').matches) autoTimer=setInterval(()=>{const banner=test('banner-main-container');if(!modal&&!document.hidden&&!motion?.reduced()&&!banner?.matches(':hover')&&!banner?.contains(document.activeElement))slide(1);},6500);
  }
  function render(page=currentPage, stateKey=null, keepScroll=false) {
    const key=stateKey||keyFor(page);
    if (!key || !states[key]) return false;
    const y=scrollY, state=states[key];
    document.body.innerHTML=markup(state.html);
    [...document.body.attributes].forEach(a=>document.body.removeAttribute(a.name));
    Object.entries(state.attrs||{}).forEach(([k,v])=>document.body.setAttribute(k,v||''));
    document.body.removeAttribute('inert');
    document.body.dataset.page=pageName;document.body.dataset.assetPrefix=assetPrefix;document.body.dataset.state=key;
    currentPage=page;currentKey=key;modal=null;expandedSidebarHTML=null;
    hydrate();
    if ($('[data-testid="modal-layout"]')) {modal='search';document.body.style.overflow='hidden';const root=$('[data-testid="modal-layout"]');root.dataset.localModal='search';motion?.modal(root);}
    scrollTo(0,keepScroll?y:0);
    return true;
  }
  function addPreviewControl(){
    if($('[data-preview-controls]'))return;
    const container=$('[class*="footer-container_root"]')||test('layout-content');
    if(!container)return;
    const control=document.createElement('div');control.dataset.previewControls='';control.className='local-preview-controls';
    const label=document.createElement('span');label.textContent=signedPreview?'本地预览：登录后（示例账户）':'本地预览：未登录';
    const button=document.createElement('button');button.type='button';button.dataset.testid='local-preview-toggle';button.textContent=signedPreview?'切回未登录':'登录后预览';
    control.append(label,button);container.append(control);
  }
  function togglePreview(){
    const next=!signedPreview;
    if(next&&!Object.keys(authStates).length)return notice('This view does not have a signed-in capture.');
    signedPreview=next;Object.assign(states,guestStates,signedPreview?authStates:{});
    const u=new URL(location.href);signedPreview?u.searchParams.set('preview','auth'):u.searchParams.delete('preview');
    history.replaceState(null,'',u);render(currentPage,null,true);
  }
  function closeModal(immediate=false) {
    const nodes=$$('[data-local-modal], [data-testid="modal-layout"], [class*="language-picker_tooltip"]');
    modal=null;
    const finish=()=>{
      nodes.forEach(n=>n.remove());
      if(!modal){document.body.style.overflow=$('[class*="common-layout_root"][data-local-open="true"]')?'hidden':'';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
    };
    nodes.forEach(n=>n.style.pointerEvents='none');
    if(immediate||!nodes.length||motion?.instant())finish();
    else Promise.all(nodes.map(n=>motion?.modal(n,true))).then(finish);
  }
  function openModal(kind, source=null) {
    const focus=source||document.activeElement;
    closeModal(true);returnFocus=focus;
    let value;
    if(kind.startsWith('account-')) {
      const page=kind.replace('account-',''),set=window.ACCOUNT_DIALOG_STATES||{};
      const size=innerWidth<410?'390x844':innerWidth<640?'430x932':innerWidth<1024?'768x1024':innerWidth>=1680?'1920x1080':'1440x900';
      value=set[page+'-'+size]?.html;
    } else {
      const key=kind==='registration'? (mobile()?'registration-390x844':'registration-1440x900') : kind==='promo'?'registration-promo-1440x900':kind==='email'?'login-email-1440x900':kind==='recovery'?'recovery-1440x900':'login-1440x900';
      value=states[key]?.html;
    }
    if(!value)return notice('This dialog has not been captured yet.');
    const fragment=document.createElement('template');fragment.innerHTML=markup(value);
    document.body.append(fragment.content.cloneNode(true));
    modal=kind; document.body.style.overflow='hidden';
    const root=$('[data-testid="modal-layout"]');
    if(root){root.dataset.localModal=kind;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');}
    hydrate();motion?.modal(root);
    ($('input[type="tel"],input[type="email"]',root)||$('button',root))?.focus({preventScroll:true});
  }
  function notice(text) {
    clearTimeout(noticeTimer);const version=++noticeVersion;
    let n=$('[data-local-notice]');
    if(!n){n=document.createElement('div');n.dataset.localNotice='';n.className='local-feedback';n.setAttribute('role','status');document.body.append(n);}
    n.textContent=text;motion?.toast(n);
    noticeTimer=setTimeout(()=>{motion?.toast(n,true).then(()=>{if(version===noticeVersion)n.remove();});},3500);
  }
  function navigate(raw) {
    const u=new URL(raw,'https://one-vv3591.com/');
    if(u.hostname!=='one-vv3591.com')return;
    if(u.searchParams.get('x')?.includes('sign-up')){openModal('registration');return;}
    if(u.pathname.startsWith('/casino/play/')){notice('Game launch requires the original service.');return;}
    const file=pages[u.pathname];
    if(file){go(file);return;}
    notice('This page has not been captured yet.');
  }
  function slide(direction) {
    const container=test('banner-main-container');if(!container)return;
    const wrapper=$('.swiper-wrapper',container);if(!wrapper)return;
    const slides=$$('.swiper-slide',wrapper);if(!slides.length)return;
    let index=slides.findIndex(s=>s.classList.contains('swiper-slide-active'));if(index<0)index=0;
    index=(index+direction+slides.length)%slides.length;
    slides.forEach((s,i)=>{s.classList.toggle('swiper-slide-active',i===index);s.classList.toggle('swiper-slide-prev',i===index-1);s.classList.toggle('swiper-slide-next',i===index+1);});
    const width=parseFloat(slides[0].style.width)||slides[0].offsetWidth;
    const gap=parseFloat(slides[0].style.marginRight)||0;
    wrapper.style.transitionDuration=motion?.reduced()||motion?.instant()?'0ms':'250ms';
    wrapper.style.transitionTimingFunction=motion?.easing('out')||'ease-out';
    wrapper.style.transform='translate3d('+(-(width+gap)*index)+'px, 0, 0)';
    $$('[class*="pagination"] [class*="bullet"]',container).forEach((s,i)=>s.classList.toggle('swiper-pagination-bullet-active',i===index));
  }
  function fitBanners(){
    const banner=test('banner-main-container'),wrapper=banner&&$('.swiper-wrapper',banner);
    if(wrapper){const slides=$$('.swiper-slide',wrapper),index=Math.max(0,slides.findIndex(s=>s.classList.contains('swiper-slide-active')));slides.forEach(s=>s.style.width=banner.clientWidth+'px');const gap=parseFloat(slides[0]?.style.marginRight)||0;wrapper.style.transform='translate3d('+(-(banner.clientWidth+gap)*index)+'px,0,0)';}
    $$('[class*="banners-carousel_root"]').forEach(root=>{
      const scaler=$('[class*="scaler_item"]',root);if(!scaler)return;
      const designWidth=parseFloat(scaler.style.width);if(!designWidth)return;
      const scale=root.clientWidth/designWidth,previous=parseFloat(scaler.style.transform.replace('scale(',''));
      if(Math.abs(previous-scale)>.001)scaler.style.transform='scale('+scale+')';
    });
  }
  function toggleMenu(force) {
    const root=$('[class*="common-layout_root"][class*="variant-1_root"]');if(!root)return;
    const opened=root.dataset.localOpen==='true',next=typeof force==='boolean'?force:!opened;
    if(opened===next)return;
    const version=++menuVersion;
    const drawer=$('[class*="common-layout_sleave"]',root)||root;
    const nodes=[root,...$$('[class*="common-layout_hidden"],[class*="common-layout_offscreen"]',root)];
    nodes.forEach(n=>{if(!n.dataset.closedClass)n.dataset.closedClass=n.className;});
    const shell=root.closest('[class*="sidebar_root"]');
    root.dataset.localOpen=String(next);if(shell)shell.inert=!next;
    $$('[class*="sidebar_root"],[class*="common-layout_close"]',root).forEach(n=>{n.inert=!next;});
    if(next) {
      nodes.forEach(n=>{n.className=n.dataset.closedClass.split(' ').filter(c=>!c.includes('_hidden-')).join(' ');});
      document.body.style.overflow='hidden';motion?.drawer(drawer,true);
    } else {
      const finish=()=>{if(version!==menuVersion)return;nodes.forEach(n=>{n.className=n.dataset.closedClass;});document.body.style.overflow='';};
      if(motion?.instant())finish();else Promise.resolve(motion?.drawer(drawer,false)).then(finish);
    }
  }
  let freeNavController;
  function initFreeMoneyNavigation() {
    freeNavController?.abort();
    const nav=$('[class*="chips-section-floating_root"]');
    if(currentPage!=='freemoney'||!nav)return;
    nav.classList.toggle('chips-section-floating_desktopSticky-fGMfA',innerWidth>=1024);
    const items=$$('button[data-testid^="freemoneyNavigation-"]',nav).map(button=>({button,section:document.getElementById(button.dataset.testid.replace('freemoneyNavigation-',''))})).filter(item=>item.section);
    const select=()=>{
      const line=nav.getBoundingClientRect().bottom+40;
      let active=items[0];
      items.forEach(item=>{if(item.section.getBoundingClientRect().top<=line)active=item;});
      items.forEach(item=>{const selected=item===active;item.button.classList.toggle('tab_selected-gcHAi',selected);item.button.setAttribute('aria-pressed',String(selected));});
    };
    freeNavController=new AbortController();
    addEventListener('scroll',select,{passive:true,signal:freeNavController.signal});
    select();
  }
  function searchResults(query) {
    // Filter observed game cards. No replacement data or remote search endpoint.
    const root=$('[data-testid="modal-layout"]')||document;
    $$('a[data-reference-href*="/casino/play/"]',root).forEach(a=>{
      const label=$('img',a)?.alt||a.textContent;
      a.hidden=!label.toLowerCase().includes(query.trim().toLowerCase());
    });
  }
  document.addEventListener('click',e=>{
    const groupToggle=e.target.closest('[data-testid="casino-group-toggle"]');
    if(groupToggle){
      e.preventDefault();
      const parent=groupToggle.closest('[class*="tooltip_root"]')?.parentElement;
      const content=parent&&$('[class*="expanded-view_expandable"]',parent);
      const base=content?.className.split(' ').find(c=>c.includes('expanded-view_expandable'));
      if(base){const height=content.getBoundingClientRect().height;const opened=content.classList.toggle(base.replace('_expandable-','_isOpened-'));groupToggle.setAttribute('aria-expanded',String(opened));motion?.accordion(content,opened,height);const icon=$('svg',groupToggle);if(icon)icon.style.transform=opened?'':'rotate(180deg)';}
      return;
    }
    const el=e.target.closest('button,a,[data-reference-href],[class*="accordion-heading_root"],[class*="common-layout_close"],[class*="common-layout_backdrop"],[class*="desktop-modal_backdrop"],[class*="mobile-modal_backdrop"]');
    if(!el)return;
    const id=el.dataset.testid||'', text=el.textContent.trim();
    const footerSection=el.closest('[class*="navigation-section_root"]');
    if(footerSection&&el.closest('[class*="accordion-heading_root"]')){
      const content=$('[class*="navigation-section_expandable"]',footerSection);
      const cls=content?.className.split(' ').find(c=>c.includes('navigation-section_expandable'));
      if(cls){const previousHeight=content.getBoundingClientRect().height;const opened=content.classList.toggle(cls.replace('_expandable-','_isOpened-'));el.setAttribute('aria-expanded',String(opened));motion?.accordion(content,opened,previousHeight);const icon=$('[data-icon="arrow-bottom"]',footerSection);if(icon)icon.style.transform=opened?'rotate(180deg)':'';}
      return;
    }
    if(el.matches('a,[data-reference-href]')){
      if(el.tagName==='A'&&el.getAttribute('href')?.split('?')[0].endsWith('.html'))return;
      e.preventDefault();
      if(el.dataset.localPage)go(el.dataset.localPage);
      else if(el.dataset.referenceHref)navigate(el.dataset.referenceHref);
      return;
    }
    if(id==='sidebar-profile-button'&&signedPreview)return openModal('account-profile',el);
    if(id==='profile-settingsButton')return openModal('account-settings',el);
    if(id==='modal-back-button'&&modal?.startsWith('account-'))return openModal('account-profile',el);
    if(id==='userSettings-logoutButton'){closeModal(true);if(signedPreview)togglePreview();return;}
    if(id==='profile-copyIdButton'){navigator.clipboard?.writeText('00000000').then(()=>notice('Copied demo ID')).catch(()=>notice('Demo ID: 00000000'));return;}
    if(id.startsWith('profile-')||id.startsWith('userSettings-'))return notice('Local account design preview. This action has no account connection.');
    if(id==='header-balance-deposit-button'||id==='header-notification-button')return notice('Local design preview. No account connection.');
    if(id==='local-preview-toggle')return togglePreview();
    if(id==='header-auth-button'||id==='sidebar-profile-button'||id.endsWith('form-signInButton'))return openModal('login',el);
    if(id==='header-registration-button'||id.endsWith('form-signUpButton'))return openModal('registration',el);
    if(id==='modal-header-button-close'||el.className.includes('modal_backdrop'))return closeModal();
    if(id==='modal-back-button')return openModal('login',el);
    if(id.endsWith('form-tab-email')&&id.startsWith('signIn'))return openModal('email',el);
    if(id.endsWith('form-tab-phone')&&id.startsWith('signIn'))return openModal('login',el);
    if(id.endsWith('form-recoveryPassword'))return openModal('recovery',el);
    if(id.endsWith('form-promocode-showButton'))return openModal('promo',el);
    if(id==='banner-main-prev-button')return slide(-1);
    if(id==='banner-main-next-button')return slide(1);
    if(id==='scroll-top-button')return scrollTo({top:0,behavior:scrollBehavior()});
    if(id==='tabbar-navigation-menu'||el.className.includes('common-layout_close')||el.className.includes('common-layout_backdrop'))return toggleMenu();
    if(id==='sidebar-expand-button')return toggleSidebar();
    if(id==='language-picker-button'){
      const existing=$('[class*="language-picker_tooltip"]');if(existing){existing.remove();return;}
      const t=document.createElement('template');t.innerHTML=markup(states['language-1440x900'].html);document.body.append(t.content.cloneNode(true));
      const pop=$('[class*="language-picker_tooltip"]');if(mobile())pop.classList.add('local-language-mobile');
      return;
    }
    if(el.closest('[class*="language-picker_tooltip"]')){
      if(el.className.includes('base_control'))notice('The captured language is English (International).');
      $('[class*="language-picker_tooltip"]')?.remove();return;
    }
    if(id.startsWith('freemoneyNavigation-')){
      const section=document.getElementById(id.replace('freemoneyNavigation-',''));
      const nav=el.closest('[class*="chips-section-floating_root"]');
      if(section){const offset=(innerWidth>=1024?16:0)+(nav?.offsetHeight||60)+16;scrollTo({top:scrollY+section.getBoundingClientRect().top-offset,behavior:scrollBehavior()});}
      return;
    }
    if(id==='casino-search-input-button')return go('casino-search.html');
    if(id==='casino-search-providers-button')return go('casino-providers.html');
    if(id==='casino-search-tabs-providers')return go('casino-providers.html');
    if(id==='casino-search-tabs-games')return go('casino-search.html');
    if(id==='casino-search-input-clear'){const input=test('casino-search-input');if(input){input.value='';searchResults('');input.focus();}return;}
    if(id.startsWith('categories-qabs-qab-')){
      const categories={"casino": "casino.html", "slots": "casino-slots.html", "1win-games": "casino-1win.html", "fishing-games": "casino-fishing.html", "live-casino": "casino-live.html", "bonus-buy": "casino-bonus-buy.html", "bonus-wagering": "casino-bonus-wagering.html", "jili-games": "casino-jili.html", "new": "casino-new.html", "only-on-1win": "casino-only-1win.html", "quick-games": "casino-quick.html", "ai-recommendations": "casino-recommended.html"};
      const file=categories[id.replace('categories-qabs-qab-','')];
      if(file)return go(file);
      const label=text.toLowerCase(),section=$$('[class*="games-section_root"]').find(n=>n.textContent.toLowerCase().includes(label));
      if(section){section.scrollIntoView({behavior:scrollBehavior(),block:'start'});return;}
      notice('This category has not been captured yet.');return;
    }
    if(el.querySelector('[data-icon="arrow-back"],[data-icon="arrow-forward"]')){
      const section=el.closest('[class*="games-section_root"]');const grid=section&&$('[class*="games-grid_carousel"],[class*="tournaments"]',section);
      if(grid){grid.scrollBy({left:(el.querySelector('[data-icon="arrow-back"]')?-1:1)*grid.clientWidth*.8,behavior:scrollBehavior()});return;}
    }
    if(el.className.includes('game-slider-see-more')){go('casino.html');return;}
    if(text==='All'&&el.closest('[class*="games-section"]')){go('tournaments.html');return;}
    if(id==='footer-partners-links-commercial-copy'){const contact=$$('[class*="footer-partners"] a').find(a=>a.textContent.includes('@'))?.textContent.trim()||'business@1win.social';navigator.clipboard?.writeText(contact).then(()=>notice('Copied')).catch(()=>{});return;}
    if(id.includes('datePickerButton')){const input=$('input[type="date"]',el.closest('form'));if(input?.showPicker)input.showPicker();return;}
    if(id.includes('socialButton')||id.includes('chooseRegion')||id.includes('currency')||id.includes('app-')||id.includes('support')||text==='Install'||text==='Contact support')notice('Available in the original service.');
  });
  function updateFieldAppearance(input,focused=document.activeElement===input) {
    const root=input.closest('[class*="base-field_root"]');if(!root)return;
    const rootClass=root.className.split(' ').find(c=>c.startsWith('base-field_root-'));if(!rootClass)return;
    root.classList.toggle(rootClass.replace('_root-','_filled-'),Boolean(input.value));
    root.classList.toggle(rootClass.replace('_root-','_focused-'),focused);
  }
  function updateForm(input) {
    updateFieldAppearance(input);
    const form=input.closest('form');if(!form)return;
    const submit=$('[data-testid$="form-submit"]',form);if(!submit)return;
    const email=$('input[type="email"]',form),phone=$('input[type="tel"]',form),password=$('input[type="password"]',form),agree=$('[data-testid$="form-agree"]',form);
    const valid=(!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))&&(!phone||phone.value.replace(/\D/g,'').length>=8)&&(!password||password.value.length>=8)&&(!agree||agree.checked);
    submit.disabled=!valid;
  }
  document.addEventListener('input',e=>{if(e.target.dataset.testid==='casino-search-input')searchResults(e.target.value);updateForm(e.target);});
  document.addEventListener('change',e=>updateForm(e.target));
  document.addEventListener('focusin',e=>{if(e.target.matches('input'))updateFieldAppearance(e.target,true);});
  document.addEventListener('focusout',e=>{if(e.target.matches('input'))updateFieldAppearance(e.target,false);});
  document.addEventListener('submit',e=>{
    e.preventDefault();
    const inputs=$$('input',e.target).filter(n=>!['checkbox','radio','hidden','date'].includes(n.type));
    const first=inputs.find(n=>!n.value.trim());
    if(first){first.setCustomValidity('Please complete this field.');first.reportValidity();first.addEventListener('input',()=>first.setCustomValidity(''),{once:true});return;}
    notice('This local design preview does not submit account details.');
  });
  document.addEventListener('keydown',e=>{
    if(e.altKey&&e.key.toLowerCase()==='p'){e.preventDefault();togglePreview();return;}
    if(e.key==='Escape'){closeModal();toggleMenu(false);}
    if(e.key==='Tab'&&modal){const root=$('[data-testid="modal-layout"]');const items=root&&$$('button:not(:disabled),input:not([type="hidden"]),a',root).filter(n=>n.getClientRects().length);if(items?.length){const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
  });
  let swipeX=null;
  document.addEventListener('touchstart',e=>{if(e.target.closest('[data-testid="banner-main-container"]'))swipeX=e.touches[0].clientX;},{passive:true});
  document.addEventListener('touchend',e=>{if(swipeX!==null){const d=e.changedTouches[0].clientX-swipeX;if(Math.abs(d)>45)slide(d<0?1:-1);swipeX=null;}},{passive:true});
  function adaptToViewport() {
    const key=keyFor(currentPage);
    if(key===currentKey){fitBanners();return;}
    const kind=modal,dialog=$('[data-testid="modal-layout"]');
    const fields=dialog?$$('input',dialog).map((input,index)=>({id:input.dataset.testid,index,type:input.type,value:input.value,checked:input.checked})):[];
    const focusedId=document.activeElement?.dataset.testid;
    render(currentPage,null,true);
    if(kind&&kind!=='search'){
      openModal(kind);
      const inputs=$$('input',$('[data-testid="modal-layout"]'));
      fields.forEach(field=>{
        const input=inputs.find(i=>field.id&&i.dataset.testid===field.id)||(inputs[field.index]?.type===field.type?inputs[field.index]:null);
        if(input){input.value=field.value;input.checked=field.checked;updateForm(input);}
      });
      inputs.find(i=>focusedId&&i.dataset.testid===focusedId)?.focus({preventScroll:true});
    }
  }
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(adaptToViewport,150);});
  const initialModal=document.body.dataset.initialModal;
  if(signedPreview||keyFor(currentPage)!==currentKey)render(currentPage);else hydrate();
  if(initialModal)openModal(initialModal);
  else if($('[data-testid="modal-layout"]')){modal='search';document.body.style.overflow='hidden';const root=$('[data-testid="modal-layout"]');root.dataset.localModal='search';motion?.modal(root);}
})();

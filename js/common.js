/* Local presentation of observed one-vv3591.com states. No network APIs; accounts live in this browser (localStorage). */
(() => {
  'use strict';
  const guestStates=window.PAGE_STATES||{},authStates=window.AUTH_PAGE_STATES||{};
  // Local accounts (no server): Registration stores the account in this browser's localStorage with a salted SHA-256
  // password hash, Log in checks it, and a session switches every page to its signed-in view (the captured Demo
  // states, shown with the account's own name and ID). Log out ends the session.
  const ACCOUNTS_KEY='1win-local-accounts',SESSION_KEY='1win-local-session';
  const readAccounts=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'[]');}catch{return [];}};
  const writeAccounts=list=>{try{localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(list));return true;}catch{return false;}};
  const sessionAccount=()=>{try{const id=localStorage.getItem(SESSION_KEY);return id?readAccounts().find(a=>a.id===id)||null:null;}catch{return null;}};
  const setSession=id=>{try{if(id)localStorage.setItem(SESSION_KEY,id);else localStorage.removeItem(SESSION_KEY);}catch{}};
  async function hashPassword(password,salt){
    const text=salt+':'+password;
    if(window.crypto?.subtle){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');}
    let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return 'fnv-'+(h>>>0).toString(16);
  }
  const escapeHtml=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const accountName=a=>a.email||('+'+a.phone);
  let signedPreview=new URLSearchParams(location.search).get('preview')==='auth'||Boolean(sessionAccount());
  const states={...window.DIALOG_STATES,...guestStates,...(signedPreview?authStates:{})};
  const pageName = document.body.dataset.page;
  const assetPrefix = document.body.dataset.assetPrefix || '';
  // Inline-style custom properties hold url("../assets/…") for css/audit.css. Chrome resolves those against the stylesheet,
  // Firefox/Safari against the page (one folder too high on file://), so they are made absolute before use.
  const assetBase=new URL(assetPrefix+'assets/',document.baseURI).href;
  const absoluteAssets = html => html.replace(/url\((&quot;|"|')?\.\.\/assets\//g,(m,q)=>'url('+(q||'')+assetBase);
  const personalize = html => {const a=signedPreview&&sessionAccount();if(!a)return html;return html.replaceAll('Demo user',escapeHtml(accountName(a))).replaceAll('ID 00000000','ID '+a.id).replaceAll('demo@example.com',escapeHtml(a.email||''));};
  const markup = value => {const expanded=window.SHARED_UI?window.SHARED_UI.expand(value):value;return personalize(absoluteAssets(assetPrefix?expanded.replaceAll('assets/',assetPrefix+'assets/'):expanded));};
  function absoluteAssetVars(root=document){root.querySelectorAll('[style*="../assets/"]').forEach(n=>n.setAttribute('style',absoluteAssets(n.getAttribute('style'))));}
  const go = filename => { location.href = filename+(signedPreview?'?preview=auth':''); };
  const pages = window.PROJECT_ROUTES?.pages||{};
  // Betwave events, predictions and profiles have per-record IDs; one of each was captured, the rest open that sample.
  const routeFile = path => {
    path=path.replace(/(.)\/$/,'$1').replace(/^\/betwave(?=\/|$)/,'/en/betwave');
    if(pages[path])return pages[path];
    // The sports app picks the sport by its numeric ID; older links use other slugs (soccer-18 shows football-18).
    const sport=path.match(/^(\/betting\/[^/]+\/)[^/]+-(\d+)$/);
    if(sport){const key=Object.keys(pages).find(k=>k.startsWith(sport[1])&&k.endsWith('-'+sport[2])&&!k.slice(sport[1].length).includes('/'));if(key)return pages[key];}
    const bw=path.match(/^\/en\/betwave\/(?:(event|prediction)\/[^/]+|bw-\d+(?:\/[^/]*)?)$/);
    return bw?pages[{event:'/en/betwave/event/real-betis-vs-barcelona-fc-40343761',prediction:'/en/betwave/prediction/express-88928408-48a3'}[bw[1]]||'/en/betwave/bw-2099184/finance']:undefined;
  };
  let currentPage = pageName, currentKey = document.body.dataset.state, modal = null, returnFocus = null;
  let resizeTimer, autoTimer, lastWinsTimer, noticeTimer, noticeVersion=0, menuVersion=0;
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
  let sidebarCollapsed=false,expandedSidebarHTML=null,socialReturnFocus=null;
  try{sidebarCollapsed=localStorage.getItem('1win-preview-sidebar')==='compact';}catch{}
  function sidebarLinks(root,labels={}) {
    $$('a[data-reference-href]',root).forEach(a=>{
      const route=new URL(a.dataset.referenceHref,'https://one-vv3591.com/').pathname,file=routeFile(route);
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
    if(!desktop){document.body.classList.remove('local-sidebar-collapsed');initSidebarSocial();return;}
    if(currentPage==='casino'&&!root.dataset.localSidebarTemplate&&!$('[class*="common-layout_compact"]',root)&&window.SIDEBAR_STATES?.['expanded-casino']){
      root=replaceSidebar(window.SIDEBAR_STATES['expanded-casino'].html,root);root.dataset.localSidebarTemplate='expanded-casino';
    }
    const compact=!!$('[class*="common-layout_compact"]',root)||root.hasAttribute('data-local-compact');
    // Betwave has its own sidebar family (sidebar_root-qgno1) with its own collapsed markup.
    const compactState=window.SIDEBAR_STATES?.[root.className.includes('sidebar_root-qgno1')?'compact-betwave':'compact'];
    if(sidebarCollapsed&&!compact&&compactState){
      expandedSidebarHTML=root.outerHTML;
      const labels={},active=new Set();
      $$('a[data-testid^="sidebar-navigation"]',root).forEach(a=>{labels[a.dataset.testid]=a.textContent.trim();if(a.matches('.router-link-active,[aria-current="page"]'))active.add(a.dataset.testid);});
      root=replaceSidebar(compactState.html,root);root.setAttribute('data-local-compact','');
      $$('a[data-testid^="sidebar-navigation"]',root).forEach(a=>{
        const selected=active.has(a.dataset.testid);
        a.classList.toggle('router-link-active',selected);a.classList.toggle('router-link-exact-active',selected);
        const base=a.className.split(' ').find(c=>c.startsWith('base_root-'));
        if(base)a.classList.toggle(base.replace('_root-','_selected-'),selected);
        if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      });
      sidebarLinks(root,labels);
    }else if(!sidebarCollapsed&&compact&&expandedSidebarHTML){root=replaceSidebar(expandedSidebarHTML,root);expandedSidebarHTML=null;}
    document.body.classList.toggle('local-sidebar-collapsed',sidebarCollapsed);
    sidebarLinks(root);
    const toggle=$('[data-testid="sidebar-expand-button"]',root);
    if(toggle){toggle.setAttribute('aria-expanded',String(!sidebarCollapsed));toggle.setAttribute('aria-label',sidebarCollapsed?'Expand sidebar':'Collapse sidebar');}
    $$('[data-testid="casino-group-toggle"],[data-testid="betting-group-toggle"],[data-testid="markets-toggle"],[data-testid="betwave-toggle"],[data-testid="casino-lobby-toggle"],[data-testid="casino-live-toggle"],[data-testid="casino-fast-toggle"],[data-testid="casino-brand-toggle"]',root).forEach(btn=>{
      const parent=btn.closest('[class*="tooltip_root"]')?.parentElement;
      const content=parent&&$('[class*="expanded-view_expandable"]',parent);
      const opened=!!content&&[...content.classList].some(c=>c.includes('expanded-view_isOpened'));
      btn.setAttribute('role','button');
      btn.setAttribute('tabindex','0');
      btn.setAttribute('aria-expanded',String(opened));
      const icon=$('svg',btn);if(icon)icon.style.transform=opened?'rotate(180deg)':'';
    });
    initSidebarSocial();
  }
  function initSidebarSocial() {
    // Signed home sidebars keep the more button as a bare icon; only the compact capture has the preview testid.
    $$('[class*="sidebar-social-and-lang"] button:has([data-icon="more-vertical"]), [class*="sidebar_root"] button:has([data-icon="more-vertical"])').forEach(btn=>{
      if(!btn.closest('[data-testid="sidebar-social-buttons-with-preview"]')&&!btn.dataset.testid)btn.dataset.testid='sidebar-social-buttons-with-preview';
    });
    const trigger=test('sidebar-social-buttons-with-preview');
    if(trigger){trigger.setAttribute('role','button');trigger.tabIndex=0;trigger.setAttribute('aria-label','Social media');trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded',String(!!$('[data-sidebar-social-popover]')));}
  }
  function clearLanguageOpen() {
    $$('[data-testid="language-picker-button"]').forEach(btn=>{
      btn.classList.remove('language-picker_open-eiLTD','language-picker_open-p6ZZU');
      $('[class*="language-picker_arrowIcon"]',btn)?.classList.remove('language-picker_opened-eiLTD','language-picker_opened-p6ZZU');
    });
  }
  function closeLanguagePicker() {
    $('[data-local-language-popover]')?.remove();
    $$('[class*="language-picker_tooltip"]').forEach(n=>n.remove());
    clearLanguageOpen();
  }
  function ensurePopoverArrow(wrap) {
    let arrow=$('[class*="tooltip_arrow"]',wrap);
    if(!arrow){
      arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');
      arrow.setAttribute('class','tooltip_arrow-2Fdac');
      arrow.setAttribute('viewBox','0 0 10 8');
      arrow.setAttribute('preserveAspectRatio','none');
      arrow.setAttribute('aria-hidden','true');
      arrow.innerHTML='<path d="M5 0C6.5 0 8 4 10 4V6H0V4C2 4 3.5 0 5 0Z" fill="var(--tooltip-color-bg)"></path><path class="tooltip_arrowBorder-2Fdac" d="M10 4C8 4 6.5 0 5 0C3.5 0 2 4 0 4" fill="none" stroke="var(--tooltip-color-border)" stroke-width="2"></path>';
    }
    if(arrow.parentElement!==wrap)wrap.append(arrow);
    const tip=$('[class*="tooltip_tooltip"]',wrap);
    if(tip){
      const cs=getComputedStyle(tip);
      wrap.style.setProperty('--tooltip-color-bg', cs.getPropertyValue('--tooltip-color-bg'));
      wrap.style.setProperty('--tooltip-color-border', cs.getPropertyValue('--tooltip-color-border'));
    }
    return arrow;
  }
  // Desktop: right-end, arrow on the left at the trigger. Mobile sidemenu: above the trigger, arrow down.
  function positionAnchoredPopover(wrap, anchor) {
    if(!wrap||!anchor)return;
    const pop=$('[class*="tooltip_tooltip"]',wrap)||wrap;
    wrap.style.position='fixed';wrap.style.zIndex='var(--z-index-tooltip)';wrap.style.visibility='hidden';
    wrap.style.left='0';wrap.style.top='0';
    const width=pop.offsetWidth||wrap.offsetWidth||308,height=pop.offsetHeight||wrap.offsetHeight||420;
    const r=anchor.getBoundingClientRect(),margin=8,gap=5;
    const desktop=innerWidth>=1024;
    let left,top,placement;
    if(desktop){
      placement='right';
      left=Math.round(r.right+gap);
      top=Math.round(r.bottom+gap-height);
      if(left+width>innerWidth-margin){placement='left';left=Math.round(r.left-gap-width);}
      top=Math.max(margin,Math.min(top,innerHeight-height-margin));
      left=Math.max(margin,Math.min(left,innerWidth-width-margin));
    }else{
      placement='top';
      left=Math.round(r.left+r.width/2-width/2);
      top=Math.round(r.top-gap-height);
      left=Math.max(margin,Math.min(left,innerWidth-width-margin));
      if(top<margin){placement='bottom';top=Math.round(r.bottom+gap);}
      top=Math.max(margin,Math.min(top,innerHeight-height-margin));
    }
    wrap.style.left=left+'px';wrap.style.top=top+'px';wrap.style.visibility='visible';
    const arrow=ensurePopoverArrow(wrap);
    arrow.style.position='absolute';arrow.style.width='10px';arrow.style.height='8px';
    arrow.style.right='auto';arrow.style.bottom='auto';
    if(placement==='right'||placement==='left'){
      const ay=Math.max(12,Math.min(r.top+r.height/2-top-4,height-20));
      arrow.style.top=ay+'px';
      if(placement==='right'){arrow.style.left='-5px';arrow.style.transform='rotateZ(270deg)';}
      else{arrow.style.left=(width-5)+'px';arrow.style.transform='rotateZ(90deg)';}
    }else{
      const ax=Math.max(12,Math.min(r.left+r.width/2-left-5,width-22));
      arrow.style.left=ax+'px';
      if(placement==='top'){arrow.style.top=(height-4)+'px';arrow.style.transform='rotate(180deg)';}
      else{arrow.style.top='-4px';arrow.style.transform='none';}
    }
  }
  function openLanguagePicker(el) {
    closeLanguagePicker();
    const raw=window.DIALOG_STATES?.['language-1440x900']?.html;if(!raw)return;
    const wrap=document.createElement('div');
    wrap.className='tooltip_wrapper-2Fdac';
    wrap.dataset.localLanguagePopover='';
    wrap.innerHTML='<div class="color-scheme_root-jGMem colorScheme-light">'+markup(raw)+'</div>';
    document.body.append(wrap);
    positionAnchoredPopover(wrap,el);
    el.classList.add('language-picker_open-eiLTD');
    $('[class*="language-picker_arrowIcon"]',el)?.classList.add('language-picker_opened-eiLTD');
  }
  function toggleSidebar() {
    if(innerWidth<1024)return;
    closeSidebarSocial();
    sidebarCollapsed=!sidebarCollapsed;
    try{localStorage.setItem('1win-preview-sidebar',sidebarCollapsed?'compact':'expanded');}catch{}
    applySidebar();fitBanners();test('sidebar-expand-button')?.focus({preventScroll:true});
  }
  function closeSidebarSocial(restoreFocus=false) {
    $('[data-sidebar-social-popover]')?.remove();
    test('sidebar-social-buttons-with-preview')?.setAttribute('aria-expanded','false');
    if(restoreFocus&&socialReturnFocus?.isConnected)socialReturnFocus.focus({preventScroll:true});
    socialReturnFocus=null;
  }
  function positionSidebarSocial() {
    const popover=$('[data-sidebar-social-popover]'),trigger=test('sidebar-social-buttons-with-preview');
    if(!popover||!trigger)return;
    positionAnchoredPopover(popover,trigger);
  }
  function toggleSidebarSocial(trigger) {
    if($('[data-sidebar-social-popover]'))return closeSidebarSocial(true);
    const value=window.SIDEBAR_STATES?.['compact-social']?.html;if(!value)return;
    const template=document.createElement('template');template.innerHTML=markup(value);
    const popover=template.content.firstElementChild;if(!popover)return;
    socialReturnFocus=trigger;popover.dataset.sidebarSocialPopover='';popover.setAttribute('role','dialog');popover.setAttribute('aria-label','Social media');
    const close=$('button:has([data-icon="close"])',popover);if(close){close.dataset.testid='local-sidebar-social-close';close.setAttribute('aria-label','Close social media');}
    document.body.append(popover);trigger.setAttribute('aria-expanded','true');positionSidebarSocial();close?.focus({preventScroll:true});
  }
  function hydrate() {
    absoluteAssetVars();
    window.SHARED_UI?.mount(document.body);
    applySidebar();
    // Both hrefs and media are local. Third-party destinations have no navigation handler.
    $$('a[data-reference-href]').forEach(a => {
      const u = new URL(a.dataset.referenceHref,'https://one-vv3591.com/');
      const file=u.searchParams.get('x')?.includes('sign-up')?'register.html':routeFile(u.pathname);
      if(file)a.setAttribute('href',file+(signedPreview?'?preview=auth':''));
    });
    $$('input[type="password"]').forEach(i=>{ i.setAttribute('autocomplete','new-password'); });
    $$('input[type="tel"][data-testid$="form-phone"]').forEach(i=>{if(!i.value)i.value='+60';});
    $$('input').forEach(input=>updateFieldAppearance(input));
    const consent=test('signUpFast-form-agree');if(consent)consent.checked=true;
    initPhoneFields();
    $$('[data-testid="modal-layout"]').forEach(n=>{n.setAttribute('role','dialog');n.setAttribute('aria-modal','true');});
    $$('[class*="games-grid_carousel"]').forEach(n=>{n.style.scrollBehavior=scrollBehavior();});
    $$('a[data-testid^="sidebar-navigation"]').forEach(a=>{
      const icon=$('[class*="menu-icon_iconContainer"]',a),original=window.REFERENCE_SIDEBAR_ICONS?.[a.dataset.testid];
      if(icon?.querySelector('[data-icon="plug"]')&&original)icon.outerHTML=markup(original);
    });
    addPreviewControl();
    fitBanners();
    initFreeMoneyNavigation();
    initFaqAccordions();
    $$('[class*="seo_root-"] [class*="seo_button-"]').forEach(button=>button.setAttribute('aria-expanded',String(button.closest('[class*="seo_root-"]').className.includes('seo_expanded-'))));
    initSidebarSocial();
    $$('[class*="games-grid_carousel"]').forEach(grid=>grid.addEventListener('scroll',()=>{
      const section=grid.closest('[class*="games-section_root"]');if(!section)return;
      const previous=$('button:has([data-icon="arrow-back"])',section),next=$('button:has([data-icon="arrow-forward"])',section);
      if(previous)previous.disabled=grid.scrollLeft<2;
      if(next)next.disabled=grid.scrollLeft+grid.clientWidth>=grid.scrollWidth-2;
    },{passive:true}));
    clearInterval(autoTimer);
    if (!new URLSearchParams(location.search).has('qa') && !matchMedia('(prefers-reduced-motion: reduce)').matches) autoTimer=setInterval(()=>{const banner=test('banner-main-container');if(!modal&&!document.hidden&&!motion?.reduced()&&!banner?.matches(':hover')&&!banner?.contains(document.activeElement))slide(1);},6500);
    initLastWins();
    initCountdowns();
    initScrollViews();
    initVipLanding();
    initMoreCards();
    initReveal();
    initMagneticSliders();
    initCardStacks();
    if(window.BETSLIP_TEMPLATES&&$('[class*="_odd_ro0me_"]'))renderBetslip();
  }
  // VIP Club: captured blocks keep block-wrapper_hidden / cardHidden until the reference's
  // IntersectionObserver reveals them; horizontal card rows use grab-drag + prev/next.
  let vipRevealObserver=null;
  function initVipLanding() {
    vipRevealObserver?.disconnect();vipRevealObserver=null;
    const hiddenBlocks=$$('[class*="block-wrapper_hidden-"]');
    const revealBlock=block=>{
      const hidden=[...block.classList].find(c=>c.includes('block-wrapper_hidden-'));
      if(hidden)block.classList.remove(hidden);
      $$('[class*="cardHidden"]',block).forEach(card=>{
        const ch=[...card.classList].find(c=>c.includes('cardHidden'));
        if(!ch)return;
        card.classList.remove(ch);
        card.classList.add(ch.replace('cardHidden','cardReveal'));
      });
    };
    if(hiddenBlocks.length){
      vipRevealObserver=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(!e.isIntersecting)return;revealBlock(e.target);vipRevealObserver.unobserve(e.target);});
      },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      hiddenBlocks.forEach(b=>vipRevealObserver.observe(b));
    }
    $$('[class*="cardsSection-"]').forEach(initGrabScroll);
    $$('[class*="cards-swiper-mobile_root-"]').forEach(initVipGiftsSwiper);
    $$('[class*="magnetic-slider_root-"]').forEach(initVipMagneticSlider);
    // Statistics titles use background-clip:text with a gradient the SPA sets; capture left the rule empty.
    $$('[class*="variant-2_title-DZfmV"]').forEach(title=>{
      if(!getComputedStyle(title).backgroundImage||getComputedStyle(title).backgroundImage==='none'){
        title.style.backgroundImage='var(--title-gradient,linear-gradient(76.89deg,#000 19.76%,#7b8792 90.86%))';
      }
    });
  }
  function initGrabScroll(section) {
    if(!section||section.dataset.localGrab)return;
    section.dataset.localGrab='1';
    if(getComputedStyle(section).cursor==='auto')section.style.cursor='grab';
    const indicator=section.parentElement?.querySelector('[class*="slider-indicator_root"]');
    const thumb=indicator&&$('[class*="slider-indicator_slider"]',indicator);
    const suffix=thumb?[...thumb.classList].find(c=>c.startsWith('slider-indicator_slider-'))?.replace('slider-indicator_slider',''):'';
    const noTrans=suffix?'slider-indicator_noTransition'+suffix:'';
    const placeThumb=()=>{
      if(!thumb||!indicator)return;
      const maxScroll=section.scrollWidth-section.clientWidth;
      const track=indicator.clientWidth||parseFloat(getComputedStyle(indicator).width)||0;
      const thumbW=thumb.clientWidth||parseFloat(getComputedStyle(thumb).width)||0;
      const maxInset=Math.max(0,track-thumbW);
      const p=maxScroll>0?Math.min(1,Math.max(0,section.scrollLeft/maxScroll)):0;
      thumb.style.insetInlineStart=(p*maxInset)+'px';
    };
    let drag=null,moved=false;
    section.addEventListener('pointerdown',e=>{
      if(e.button||e.target.closest('button,a,input'))return;
      // Touch uses native pan-x so the row sticks to the finger. Mouse has no native drag-scroll.
      const touch=e.pointerType==='touch';
      drag=touch?{touch:true,id:e.pointerId}:{x:e.clientX,left:section.scrollLeft,id:e.pointerId};
      moved=false;
      if(!touch){try{section.setPointerCapture(e.pointerId);}catch{}section.style.cursor='grabbing';}
      if(noTrans)thumb?.classList.add(noTrans);
    });
    section.addEventListener('pointermove',e=>{
      if(!drag||drag.touch||drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x;
      if(Math.abs(dx)>4)moved=true;
      section.scrollLeft=drag.left-dx;
      placeThumb();
    });
    const end=e=>{
      if(!drag||(e&&drag.id!==e.pointerId))return;
      drag=null;section.style.cursor='grab';
      if(noTrans)thumb?.classList.remove(noTrans);
      placeThumb();
    };
    section.addEventListener('pointerup',end);
    section.addEventListener('pointercancel',end);
    section.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    placeThumb();
    // Center duplicated card strips like the reference's infinite row.
    if(section.scrollWidth>section.clientWidth*2.2)section.scrollLeft=Math.max(0,(section.scrollWidth-section.clientWidth)/2);
    placeThumb();
    const block=section.closest('[id], [class*="variant-2_block"], [class*="variant-2_root"]')||section.parentElement;
    const prev=$('[data-testid$="-prev"]',block),next=$('[data-testid$="-next"]',block);
    const step=()=>{
      const container=$('[class*="cardsContainer"]',section);
      const card=container?.firstElementChild||section.firstElementChild;
      const gap=parseFloat(getComputedStyle(container||section).columnGap)||12;
      return (card?.getBoundingClientRect().width||section.clientWidth*.7)+gap;
    };
    prev?.addEventListener('click',e=>{e.preventDefault();section.scrollBy({left:-step(),behavior:scrollBehavior()});});
    next?.addEventListener('click',e=>{e.preventDefault();section.scrollBy({left:step(),behavior:scrollBehavior()});});
    const updateArrows=()=>{
      if(!prev&&!next)return;
      const start=section.scrollLeft<=2,end=section.scrollLeft+section.clientWidth>=section.scrollWidth-2;
      if(prev)prev.disabled=start;if(next)next.disabled=end;
    };
    section.addEventListener('scroll',()=>{updateArrows();placeThumb();},{passive:true});
    updateArrows();
  }
  function initVipGiftsSwiper(root) {
    if(!root||root.dataset.localSwiper)return;
    const wrappers=$$('[class*="cards-swiper-mobile_cardWrapper"]',root);
    if(wrappers.length<2)return;
    root.dataset.localSwiper='1';
    const cardEl=w=>$('[class*="cards-swiper-mobile_card-"]',w);
    const suffix=([...cardEl(wrappers[0])?.classList||[]].find(c=>/^cards-swiper-mobile_card-\w+$/.test(c)&&!/Current|Next|Out|Second/.test(c))||'').match(/cards-swiper-mobile_card(-\w+)$/)?.[1];
    if(!suffix)return;
    const role=(name)=>`cards-swiper-mobile_${name}${suffix}`;
    const roles=['cardCurrent','cardNext','cardSecondNext'];
    let index=Math.max(0,wrappers.findIndex(w=>cardEl(w)?.classList.contains(role('cardCurrent'))));
    const paint=()=>{
      wrappers.forEach((w,i)=>{
        const card=cardEl(w);if(!card)return;
        roles.concat(['cardOut']).forEach(r=>card.classList.remove(role(r)));
        const rel=(i-index+wrappers.length)%wrappers.length;
        if(rel<roles.length)card.classList.add(role(roles[rel]));
        w.style.zIndex=String(wrappers.length-rel);
      });
      const block=root.closest('[id], [class*="variant-2_root"]')||root.parentElement;
      const thumb=$('[class*="slider-indicator_slider-"]',block);
      if(thumb){
        const track=thumb.parentElement,max=Math.max(0,(track?.clientWidth||0)-thumb.clientWidth);
        thumb.style.insetInlineStart=`${wrappers.length>1?(index/(wrappers.length-1))*max:0}px`;
      }
    };
    const go=dir=>{index=(index+dir+wrappers.length)%wrappers.length;paint();};
    const block=root.closest('[id], [class*="variant-2_root"]')||root.parentElement;
    $('[data-testid$="-prev"]',block)?.addEventListener('click',e=>{e.preventDefault();go(-1);});
    $('[data-testid$="-next"]',block)?.addEventListener('click',e=>{e.preventDefault();go(1);});
    let drag=null;
    root.addEventListener('pointerdown',e=>{
      if(e.button||e.target.closest('button'))return;
      drag={x:e.clientX,id:e.pointerId};try{root.setPointerCapture(e.pointerId);}catch{}
    });
    root.addEventListener('pointerup',e=>{
      if(!drag||drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x;drag=null;
      if(Math.abs(dx)>40)go(dx<0?1:-1);
    });
    paint();
  }
  function initVipMagneticSlider(root) {
    if(!root||root.dataset.localMagnetic)return;
    const card=$('[data-testid="vipLanding-statisticsBlock"], [class*="variant-2_card-DZfmV"]',root);
    const items=card&&$$('[class*="variant-2_item-"]',card);
    if(!items?.length)return;
    root.dataset.localMagnetic='1';
    const suffix=([...items[0].classList].find(c=>c.includes('variant-2_item-'))||'').match(/variant-2_item(-\w+)$/)?.[1];
    if(!suffix)return;
    const roleNames=['current','next','farNext','hiddenBelow','hiddenAbove','farPrev','prev'];
    const role=name=>`variant-2_${name}${suffix}`;
    let index=Math.max(0,items.findIndex(n=>n.classList.contains(role('current'))));
    let viewport=$('[class*="magnetic-slider_viewport-"]',root);
    if(viewport&&!$('[class*="magnetic-slider_interaction-"]',viewport)){
      const layer=document.createElement('div');
      const vs=[...viewport.classList].find(c=>c.includes('magnetic-slider_viewport-'))?.match(/magnetic-slider_viewport(-\w+)$/)?.[1]||suffix;
      layer.className=`magnetic-slider_interaction${vs}`;
      viewport.append(layer);
    }
    // Below 576px the reference zeroes --slider-interaction-* so the overlay must not steal swipes.
    const layer=$('[class*="magnetic-slider_interaction-"]',root);
    if(layer&&(innerWidth<576||layer.clientWidth<8||layer.clientHeight<8))layer.style.pointerEvents='none';
    const paint=()=>{
      items.forEach((el,i)=>{
        roleNames.forEach(r=>el.classList.remove(role(r)));
        const rel=(i-index+items.length)%items.length;
        const name=roleNames[rel]||'hiddenBelow';
        el.classList.add(role(name));
        el.setAttribute('aria-hidden',name==='current'?'false':'true');
      });
      const thumb=$('[class*="slider-indicator_slider-"]',root);
      if(thumb){
        const track=thumb.parentElement,max=Math.max(0,(track?.clientWidth||0)-thumb.clientWidth);
        thumb.style.insetInlineStart=`${items.length>1?(index/(items.length-1))*max:0}px`;
      }
    };
    const go=dir=>{index=(index+dir+items.length)%items.length;paint();};
    $('[data-testid="vipLanding-statisticsBlock-prev"]',root)?.addEventListener('click',e=>{e.preventDefault();go(-1);});
    $('[data-testid="vipLanding-statisticsBlock-next"]',root)?.addEventListener('click',e=>{e.preventDefault();go(1);});
    // Desktop uses a grab layer (horizontal); below 576px the reference zeroes that layer and stacks slides vertically.
    const surfaces=[card,$('[class*="magnetic-slider_interaction-"]',root)].filter(Boolean);
    let drag=null;
    const onDown=e=>{
      if(e.button||e.target.closest('button')||drag)return;
      drag={x:e.clientX,y:e.clientY,id:e.pointerId};try{e.currentTarget.setPointerCapture?.(e.pointerId);}catch{}
    };
    const onUp=e=>{
      if(!drag||drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;
      const vertical=innerWidth<576;
      if(vertical){if(Math.abs(dy)>40&&Math.abs(dy)>Math.abs(dx))go(dy<0?1:-1);}
      else if(Math.abs(dx)>40)go(dx<0?1:-1);
    };
    surfaces.forEach(surface=>{
      surface.addEventListener('pointerdown',onDown);
      surface.addEventListener('pointerup',onUp);
    });
    paint();
  }
  // Category chips and other arrows-scroll-view rows: the back arrow hides at the start, the forward
  // arrow at the end (reference toggles arrows-scroll-view_hidden-*), and each click pages one width.
  function scrollViewList(root) {
    const content=root&&$('[class*="arrows-scroll-view_content-"]',root);
    if(!content)return null;
    return [content.firstElementChild,content].find(n=>n&&n.scrollWidth>n.clientWidth+8)||content.firstElementChild||content;
  }
  function updateScrollView(root) {
    const list=scrollViewList(root);if(!list)return;
    const back=$('[class*="arrows-scroll-view_scrollBackButton-"]',root),forward=$('[class*="arrows-scroll-view_scrollForwardButton-"]',root);
    const suffix=(back||forward)?.className.match(/arrows-scroll-view_scroll\w+Button(-\w+)/)?.[1];if(!suffix)return;
    const hidden='arrows-scroll-view_hidden'+suffix,start=Math.abs(list.scrollLeft)<=1,end=Math.abs(list.scrollLeft)+list.clientWidth>=list.scrollWidth-1;
    back?.classList.toggle(hidden,start);forward?.classList.toggle(hidden,end);
  }
  function initScrollViews() {
    $$('[class*="arrows-scroll-view_root-"]').forEach(root=>{
      const list=scrollViewList(root);if(!list)return;
      list.addEventListener('scroll',()=>updateScrollView(root),{passive:true});
      updateScrollView(root);
    });
  }
  addEventListener('resize',()=>$$('[class*="arrows-scroll-view_root-"]').forEach(updateScrollView),{passive:true});
  // ---- Betslip (local display only; no bet is ever placed) ----------------------------------------
  // Reference behaviour (guest, 2026-10-15): clicking an odd toggles _selected_ on it and adds/removes the
  // selection; desktop shows it in the right-column [data-scope="Betslip"], phones update the floating coupon
  // counter and open a bottom sheet; 2+ selections switch to "Multiple" with Final odds and the express-bonus
  // hint ("Add N more events to get a 7% win bonus"). Selections persist like the reference's localStorage.
  const BETSLIP_KEY='1win-preview-betslip';
  let betslip=[];
  try{betslip=JSON.parse(localStorage.getItem(BETSLIP_KEY)||'[]');}catch{}
  const saveBetslip=()=>{try{localStorage.setItem(BETSLIP_KEY,JSON.stringify(betslip));}catch{}};
  function oddInfo(odd) {
    let card=odd.closest('[data-qa="match-card"]');
    if(!card||!$('[data-scope="TeamNames"]',card)){card=odd;while(card&&!$('[data-scope="TeamNames"]',card))card=card.parentElement;}
    const teams=card?$$('[class*="_name_1q73p_"]',card).map(n=>n.textContent.trim()):[];
    const scores=card?$$('[class*="_score_wqc75_"]',card).map(n=>n.textContent.trim()):[];
    const market=odd.closest('[data-scope="BaseOdds"]')?.querySelector('[class*="_name_lwfci_"]')?.textContent.trim()||'';
    const name=$('[class*="_name_1wfym_"]',odd)?.textContent.trim()||'';
    const label=name==='1'?teams[0]:name==='2'?teams[1]:/^x$/i.test(name)?'Draw':name;
    const value=$('[class*="_cf_17if8_"]',odd)?.textContent.trim()||'';
    return {key:[teams.join('|'),market,name].join('#'),teams,score:scores.length===2?scores.join(' : '):'',live:!!card?.querySelector('[class*="_liveIcon_"]'),market,label,value};
  }
  function fillCoupon(node,s) {
    const set=(sel,text)=>{const n=$(sel,node);if(n)n.textContent=text;};
    const score=$('[class*="_score_126cr_"]',node);
    if(score){if(s.score){[...score.childNodes].filter(c=>c.nodeType===3).forEach(c=>c.remove());score.append(' '+s.score);}else score.remove();}
    set('[class*="_competitors_1ijea_"]',s.teams.join(' - '));
    set('[class*="_outcome_1ijea_"]',[s.market,s.label].filter(Boolean).join(', '));
    set('[data-scope="SelectionCfBadge"] span',s.value);
    node.dataset.betslipKey=s.key;
  }
  function betslipMarkup() {
    const t=window.BETSLIP_TEMPLATES;if(!t)return null;
    const tpl=document.createElement('template');
    tpl.innerHTML=markup(betslip.length===0?t.empty:betslip.length===1?t.single:t.multi);
    const root=tpl.content.firstElementChild;if(!betslip.length)return root;
    const items=$$('[data-scope="SelectionInfo"]',root);const proto=items[0];
    items.slice(1).forEach(c=>c.remove());
    let last=proto;
    betslip.forEach((s,i)=>{const node=i?proto.cloneNode(true):proto;fillCoupon(node,s);if(i){last.after(node);last=node;}});
    // One selection opens on "Single", two or more switch to "Multiple" (reference behaviour).
    const tabs=$$('button',root).filter(b=>/^(Single|Multiple|Series)$/.test(b.textContent.trim()));
    const selected=[...new Set(tabs.flatMap(b=>[...b.classList].filter(c=>c.includes('_selected_'))))];
    tabs.forEach(b=>{const on=b.textContent.trim()===(betslip.length===1?'Single':'Multiple');selected.forEach(c=>b.classList.toggle(c,on));});
    const total=betslip.reduce((p,s)=>p*(parseFloat(s.value)||1),1);
    const final=$('[class*="_totalCf_h0m60_"] [data-scope="SelectionCfBadge"] span',root);if(final)final.textContent=total.toFixed(2);
    const left=Math.max(0,5-betslip.length),hint=$('[class*="_nextMilestoneHint_"]',root);
    if(hint)hint.textContent=left?`Add ${left} more event${left>1?'s':''} to get a 7% win bonus`:hint.textContent;
    $$('[class*="_segmentBar_1fw5j_"]',root).forEach((bar,i)=>{bar.style.backgroundColor=i<betslip.length?'rgb(2, 203, 208)':'var(--neutral-primary)';});
    return root;
  }
  function renderBetslip(openSheet=false) {
    const keys=new Set(betslip.map(s=>s.key));
    $$('[class*="_odd_ro0me_"]').forEach(odd=>{const sel=[...odd.classList].find(c=>c.startsWith('_root_1hyjt_'))?.replace('_root_','_selected_');if(sel)odd.classList.toggle(sel,keys.has(oddInfo(odd).key));});
    const inline=$('[data-scope="Betslip"]:not([data-local-sheet] *)');
    if(inline){const next=betslipMarkup();if(next)inline.replaceWith(next);}
    const count=$('[class*="_count_c60tj_"]');if(count)count.textContent=String(betslip.length);
    const sheet=$('[data-local-sheet]');
    if(sheet&&!betslip.length){sheet.remove();return;}
    if(sheet){const body=$('[data-scope="Betslip"]',sheet),next=betslipMarkup();if(body&&next)body.replaceWith(next);}
    else if(openSheet&&!inline)openBetslipSheet();
  }
  // The sheet lives in the sports module's own ModalLayout wrapper so it inherits the light theme variables.
  function openBetslipSheet() {
    if($('[data-local-sheet]')||!window.BETSLIP_TEMPLATES)return;
    const tpl=document.createElement('template');tpl.innerHTML=markup(window.BETSLIP_TEMPLATES.sheet);
    const wrapper=tpl.content.firstElementChild,target=$('[class*="_wrapper_lvq60_"]');
    const node=target?wrapper.firstElementChild:wrapper;node.dataset.localSheet='';
    const body=$('[data-scope="Betslip"]',node),next=betslipMarkup();if(body&&next)body.replaceWith(next);
    (target||document.body).append(node);
  }
  function toggleOdd(odd) {
    const info=oddInfo(odd);const i=betslip.findIndex(s=>s.key===info.key);
    if(i>=0)betslip.splice(i,1);else betslip.push(info);
    saveBetslip();renderBetslip(i<0);
  }
  function sportSection() {
    return [['sports-live','/betting/live'],['sports-upcoming','/betting/prematch'],['sports-esports','/betting/esport']].find(([p])=>pageName===p||pageName.startsWith(p+'-'))?.[1];
  }
  // Live Casino and Quick games pages carry their own chip set (e.g. "1win-games" means
  // /casino/fast-games/1win-games there), so resolve within the current page's group first.
  function categoryFile(key) {
    const routes=window.PROJECT_ROUTES||{};
    const group=Object.keys(routes.subcategories||{}).find(parent=>pageName===parent||pageName.startsWith(parent+'-'));
    return (group&&routes.subcategories[group][key])||(routes.categories||{})[key];
  }
  // A lobby row's "View all" / title opens the category whose chip carries the same label.
  function rowCategory(el) {
    const title=$('[class*="title_title"]',el.closest('[class*="games-section_root"]')||document)?.textContent.trim().toLowerCase();
    const chip=title&&$$('[data-testid^="categories-qabs-qab-"]').find(b=>b.textContent.trim().toLowerCase()===title);
    return chip&&categoryFile(chip.dataset.testid.replace('categories-qabs-qab-',''));
  }
  // Tournament timers tick once a second like the reference ("D:HH:MM:SS", days unpadded).
  let countdownTimer;
  function initCountdowns() {
    clearInterval(countdownTimer);
    const timers=$$('[class*="countdown_root-"]').map(root=>({root,parts:$$('[class*="countdown_time-"]',root)})).filter(t=>t.parts.length>=3&&t.parts.every(p=>/^\d+$/.test(p.textContent.trim())));
    if(!timers.length||new URLSearchParams(location.search).has('qa'))return;
    const units=[86400,3600,60,1];
    // data-local-ends (scripts/add-countdown-ends.py) is the reference end time: count to it like the reference does;
    // without it, count down from the captured value. The days segment disappears once less than a day is left.
    timers.forEach(t=>{const u=units.slice(-t.parts.length);t.units=u;const ends=Date.parse(t.root.dataset.localEnds||'');
      t.ends=Number.isNaN(ends)?Date.now()+t.parts.reduce((sum,p,i)=>sum+Number(p.textContent)*u[i],0)*1000:ends;});
    const tick=()=>{
      if(!timers[0].root.isConnected){clearInterval(countdownTimer);return;}
      timers.forEach(t=>{
        let rest=Math.max(0,Math.floor((t.ends-Date.now())/1000));
        t.parts.forEach((p,i)=>{const v=Math.floor(rest/t.units[i]);rest-=v*t.units[i];
          if(i===0&&t.units[0]===86400){const hide=v===0;p.style.display=hide?'none':'';const sep=p.nextElementSibling;if(sep&&/countdown_separator/.test(sep.className))sep.style.display=hide?'none':'';p.textContent=String(v);}
          else p.textContent=String(v).padStart(2,'0');});
      });
    };
    tick();countdownTimer=setInterval(tick,1000);
  }
  // Original Last wins feed: every 3s a card enters at the start (translateX(-100%) -> 0), the rest
  // shift with a 1s transform move and the last one leaves. Locally the captured cards rotate.
  // Casino category grids show the reference's first page of cards and load one more page of the same size each time
  // the empty marker right after the grid reaches the viewport bottom, repeating while it stays visible (probed
  // 2026-10-15, captures/more-steps-slots.json). Pages come from js/<page>-more.js; cards already in the captured grid
  // are hidden first and revealed in order, captured extras are appended without duplicates.
  let moreObserver=null,moreShown={page:null,count:0};
  function initMoreCards(){
    moreObserver?.disconnect();moreObserver=null;
    const data=window.CASINO_MORE_CARDS?.[(currentKey||'').split('-').pop()];
    const grid=$$('[class*="games-grid_list"]').find(g=>!g.closest('[data-index]')&&$('[data-testid^="game-card-"]',g));
    if(!data||!grid||grid.dataset.localMore)return;
    // Tables from different providers can share a name (and so a testid); the game link is the unique key.
    const cardKey=c=>(c.matches('[data-reference-href]')?c:$('[data-reference-href]',c))?.dataset.referenceHref||$('[data-testid^="game-card-"]',c)?.dataset.testid||c.dataset.testid;
    const have=new Set([...grid.children].map(cardKey));
    [...grid.children].slice(data.start).forEach(c=>{c.hidden=true;c.dataset.localMoreCard='';});
    const t=document.createElement('template');t.innerHTML=markup(data.batches.join(''));
    [...t.content.children].forEach(c=>{const id=cardKey(c);if(id&&have.has(id))return;have.add(id);c.hidden=true;c.dataset.localMoreCard='';grid.append(c);});
    const step=data.step||data.start;
    const reveal=n=>$$('[data-local-more-card][hidden]',grid).slice(0,n).forEach(c=>c.hidden=false);
    // A resize re-renders the page from its state; keep the cards the visitor already loaded, like the reference.
    if(moreShown.page===currentPage&&moreShown.count>data.start)reveal(moreShown.count-data.start);
    moreShown={page:currentPage,count:Math.max(data.start,grid.children.length-$$('[data-local-more-card][hidden]',grid).length)};
    grid.dataset.localMore=String(Math.max(0,Math.ceil((moreShown.count-data.start)/step)));
    if(!$('[data-local-more-card][hidden]',grid))return;
    // The reference marker is a 0px element after the grid (some captures hold its empty loading grid inside it).
    let marker=grid.nextElementSibling;
    if(!marker||marker.getBoundingClientRect().height>1){marker=document.createElement('div');marker.dataset.localMoreMarker='';grid.after(marker);}
    const visible=()=>marker.getBoundingClientRect().top<=innerHeight;
    let frame=0;
    const load=()=>{
      cancelAnimationFrame(frame);
      if(!grid.isConnected||!$('[data-local-more-card][hidden]',grid)){moreObserver?.disconnect();return;}
      if(!visible())return;
      reveal(step);
      moreShown.count=grid.children.length-$$('[data-local-more-card][hidden]',grid).length;
      grid.dataset.localMore=String(+grid.dataset.localMore+1);
      frame=requestAnimationFrame(load);
    };
    const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))load();});
    io.observe(marker);
    moreObserver={disconnect:()=>{io.disconnect();cancelAnimationFrame(frame);}};
  }
  // VIP Club (and other promo pages) wrap sections in block-wrapper: the reference removes block-wrapper_hidden when a
  // block scrolls into view and .block-wrapper_reveal fades it in. Captures froze them hidden (opacity 0).
  let revealObserver=null;
  function initReveal(){
    revealObserver?.disconnect();
    // Cards inside them (VIP "A personal approach") were captured as *_cardHidden-* and get *_cardReveal-* (slide-in).
    const blocks=$$('[class*="block-wrapper_hidden-"],[class*="_cardHidden-"]');if(!blocks.length)return;
    const show=el=>{[...el.classList].forEach(c=>{if(c.startsWith('block-wrapper_hidden-'))el.classList.remove(c);else if(/_cardHidden-/.test(c))el.classList.replace(c,c.replace('_cardHidden-','_cardReveal-'));});};
    if(!('IntersectionObserver' in window)||motion?.reduced?.()){blocks.forEach(show);return;}
    // A row of cards reveals together (staggered by --card-index), including cards scrolled off to the side.
    revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;
      const group=/_cardHidden-/.test(e.target.className)?[...e.target.parentElement.children].filter(c=>/_cardHidden-/.test(c.className)):[e.target];
      group.forEach(el=>{show(el);revealObserver.unobserve(el);});}),{threshold:0.15});
    blocks.forEach(b=>revealObserver.observe(b));
  }
  // Indicator under a carousel: thumb offset = step × (track − thumb) / (count − 1), like the reference.
  function setIndicator(root,index,count){
    const track=root&&$('[class*="slider-indicator_slider-"]',root);if(!track)return;
    const w=parseFloat(root.style.getPropertyValue('--v36307ce1'))||root.offsetWidth,t=parseFloat(root.style.getPropertyValue('--v2ec3163c'))||track.offsetWidth;
    track.style.insetInlineStart=(count>1?index*(w-t)/(count-1):0)+'px';
  }
  // VIP Club "by the numbers" (magnetic slider): one step every 3s (probed 2026-10-16), arrows step back/forward,
  // clicking a side item moves to it. Item states by offset from the current one; the CSS animates the change (0.6s).
  let magneticTimers=[];
  function initMagneticSliders(){
    magneticTimers.forEach(clearInterval);magneticTimers=[];
    $$('[class*="magnetic-slider_root"]').forEach(root=>{
      const items=$$('[class*="_item-"]',root).filter(e=>/_(current|next|farNext|hiddenBelow|hiddenAbove|farPrev|prev)-/.test(e.className));
      if(items.length<3)return;
      const hash=(items[0].className.match(/_item-([A-Za-z0-9]{5})/)||[])[1],base=(items[0].className.match(/(\S+)_item-/)||[])[1];if(!hash)return;
      const names=['current','next','farNext','hiddenBelow','hiddenAbove','farPrev','prev'].map(n=>`${base}_${n}-${hash}`);
      let index=items.findIndex(e=>e.classList.contains(`${base}_current-${hash}`));if(index<0)index=0;
      const n=items.length;
      const state=off=>off===0?'current':off===1?'next':off===2?'farNext':off===-1?'prev':off===-2?'farPrev':off>0?'hiddenBelow':'hiddenAbove';
      const show=i=>{index=(i+n)%n;items.forEach((e,k)=>{let off=((k-index)%n+n)%n;if(off>n/2)off-=n;e.classList.remove(...names);e.classList.add(`${base}_${state(off)}-${hash}`);e.setAttribute('aria-hidden',off===0?'false':'true');});
        setIndicator($('[class*="magnetic-slider_sliderIndicator"]',root),index,n);};
      show(index);
      const buttons=$$('[class*="_arrows-"] button',root);
      const restart=()=>{clearInterval(root._magTimer);if(!motion?.reduced?.()&&!new URLSearchParams(location.search).has('qa'))root._magTimer=setInterval(()=>{if(!root.isConnected){clearInterval(root._magTimer);return;}if(!document.hidden)show(index+1);},3000);magneticTimers.push(root._magTimer);};
      if(!root.dataset.localMagnetic){root.dataset.localMagnetic='1';
        buttons[0]?.addEventListener('click',e=>{e.stopPropagation();show(index-1);restart();});
        buttons[1]?.addEventListener('click',e=>{e.stopPropagation();show(index+1);restart();});
        items.forEach((e,k)=>e.addEventListener('click',()=>{if(k!==index){show(k);restart();}}));}
      restart();
    });
  }
  // VIP Club "Exclusive gifts" (cards swiper): a stack — current card on top, the next two peek below (CSS cardNext /
  // cardSecondNext). Arrows, a click on the card or a swipe move the stack; the leaving card slides away (0.3s).
  function initCardStacks(){
    $$('[class*="cards-swiper-mobile_root"]').forEach(root=>{
      if(root.dataset.localStack)return;root.dataset.localStack='1';
      const wrappers=$$('[class*="cards-swiper-mobile_cardWrapper"]',root);if(wrappers.length<2)return;
      const cards=wrappers.map(w=>w.firstElementChild);
      const hash=(cards[0].className.match(/cards-swiper-mobile_card-([A-Za-z0-9]{5})/)||[])[1];if(!hash)return;
      const cls=n=>`cards-swiper-mobile_${n}-${hash}`,states=['cardCurrent','cardNext','cardSecondNext','cardOut'].map(cls);
      const n=cards.length;let index=Math.max(0,cards.findIndex(c=>c.classList.contains(cls('cardCurrent'))));
      const block=root.closest('[class*="_block-"],[class*="variant-2_root"]')||root.parentElement;
      const indicator=$('[class*="cards-swiper-mobile_indicator"]',root)||$('[class*="slider-indicator_root"]',block);
      const show=(i,dir)=>{
        const old=index;index=(i+n)%n;
        cards.forEach((c,k)=>{const off=((k-index)%n+n)%n;c.classList.remove(...states);if(off===0)c.classList.add(cls('cardCurrent'));else if(off===1)c.classList.add(cls('cardNext'));else if(off===2)c.classList.add(cls('cardSecondNext'));wrappers[k].style.zIndex=String(n-off);});
        if(dir&&old!==index&&!motion?.reduced?.()){const w=wrappers[dir>0?old:index],c=cards[dir>0?old:index];
          if(dir>0){c.classList.add(cls('cardOut'));w.style.zIndex=String(n+1);w.style.transition='transform .3s';w.style.transform='translateX(-110%) rotate(-8deg)';
            setTimeout(()=>{c.classList.remove(cls('cardOut'));w.style.transform='';w.style.zIndex=String(n-(((dir>0?old:index)-index)%n+n)%n);setTimeout(()=>{w.style.transition='';},300);},300);}
          else{w.style.transition='none';w.style.transform='translateX(-110%) rotate(-8deg)';requestAnimationFrame(()=>{w.style.transition='transform .3s';w.style.transform='';});}}
        setIndicator(indicator,index,n);
      };
      show(index);
      const arrows=$$('[class*="_arrows-"] button',block);
      arrows[0]?.addEventListener('click',()=>show(index-1,-1));
      arrows[1]?.addEventListener('click',()=>show(index+1,1));
      root.addEventListener('click',e=>{if(e.target.closest('[class*="cards-swiper-mobile_cardWrapper"]'))show(index+1,1);});
      let sx=null;root.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
      root.addEventListener('touchend',e=>{if(sx===null)return;const d=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(d)>40)show(index+(d<0?1:-1),d<0?1:-1);},{passive:true});
    });
  }
  function initLastWins() {
    clearInterval(lastWinsTimer);
    const list=$('[data-testid="casino-last-wins"] [class*="last-wins_list-"]');
    if(!list||list.children.length<2||new URLSearchParams(location.search).has('qa'))return;
    lastWinsTimer=setInterval(()=>{
      if(!list.isConnected){clearInterval(lastWinsTimer);return;}
      if(document.hidden||modal)return;
      const items=[...list.children],last=items[items.length-1],card=last.cloneNode(true);
      const before=items.map(n=>n.getBoundingClientRect().left);
      list.prepend(card);
      if(motion?.reduced()||motion?.instant()){last.remove();return;}
      items.forEach((n,i)=>{n.style.transition='none';n.style.transform=`translateX(${before[i]-n.getBoundingClientRect().left}px)`;});
      card.style.transition='none';card.style.transform='translateX(-100%)';
      list.getBoundingClientRect();
      [card,...items].forEach(n=>{n.style.transition='transform 1s';n.style.transform='';});
      setTimeout(()=>{last.remove();[card,...items].forEach(n=>{n.style.transition='';});},1000);
    },3000);
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
    hydrate();fillGamePage();
    if (openLayout()) {modal='search';document.body.style.overflow='hidden';const root=openLayout();root.dataset.localModal='search';motion?.modal(root);focusSearch();}
    scrollTo(0,keepScroll?y:0);
    return true;
  }
  // Not part of the reference UI: it changed every footer's height, so it only renders with ?controls=1.
  // Alt+P and ?preview=auth switch the Demo state without it.
  function addPreviewControl(){
    if($('[data-preview-controls]')||!new URLSearchParams(location.search).has('controls'))return;
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
    if(!next)setSession(null);
    signedPreview=next;Object.assign(states,guestStates,signedPreview?authStates:{});
    const u=new URL(location.href);signedPreview?u.searchParams.set('preview','auth'):u.searchParams.delete('preview');
    // Some browsers refuse history changes on file:// pages (SecurityError); the view still switches.
    try{history.replaceState(null,'',u);}catch{}render(currentPage,null,true);
  }
  // The app shell always holds an empty modal-layout wrapper; only a wrapper with content is an open dialog.
  function openLayout(){return $$('[data-testid="modal-layout"]').find(n=>n.firstElementChild)||null;}
  // The reference focuses the Casino search field when the layer opens from 768px up, not on phones.
  function focusSearch(){if(innerWidth>=768)test('casino-search-input')?.focus({preventScroll:true});}
  function closeModal(immediate=false) {
    closeSidebarSocial();
    closeLanguagePicker();
    const nodes=$$('[data-local-modal], [data-testid="modal-layout"], [class*="language-picker_tooltip"]').filter(n=>n.dataset.localModal||n.firstElementChild||!n.matches('[data-testid="modal-layout"]'));
    modal=null;
    const finish=()=>{
      nodes.forEach(n=>n.remove());
      // Pages captured with a dialog already open (e.g. guest Bet history -> Registration) keep the app inert.
      if(!openLayout())$$('[inert]').forEach(n=>n.removeAttribute('inert'));
      if(!modal){document.body.style.overflow=$('[class*="common-layout_root"][data-local-open="true"]')?'hidden':'';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
    };
    nodes.forEach(n=>n.style.pointerEvents='none');
    if(immediate||!nodes.length||motion?.instant())finish();
    else Promise.all(nodes.map(n=>motion?.modal(n,true))).then(finish);
  }
  let depositRail='fiat', depositMethod='', depositAmount='', depositBonus=true, showInstructions=false;
  let depositCoin='USDT', coinOpen=false, netOpen=false;
  let withdrawStep='warn', withdrawKind='banks';
  const FIAT=[
    {id:'fpx',name:'Malaysian banks',icon:'assets/pay/fpx-clear.png',min:20,max:'5,000'},
    {id:'tng',name:'Touch n Go',icon:'assets/pay/tng-clear.png',min:20,max:'5,000'},
    {id:'duit',name:'DuitNow',icon:'assets/pay/duitnow.png',min:20,max:'5,000'},
    {id:'grab',name:'GrabPay',icon:'assets/pay/grabpay.png',min:20,max:'5,000'}
  ];
  const COIN_CHOICES=[['USDT','USDT','assets/pay/usdt-clear.png'],['Ethereum','ETH','assets/pay/ethereum-clear.png'],['Solana','SOL','assets/pay/solana-clear.png']];
  const WITHDRAW_BANKS=['Affin Bank','Alliance Bank','Ambank Malaysia','Bank Islam Malaysia','Bank Rakyat','Bank Simpanan Nasional','CIMB Bank','Citibank Malaysia','Hong Leong Bank','HSBC Bank Malaysia','Maybank Malaysia','OCBC Bank Malaysia','Public Bank','RHB Bank','Standard Chartered Bank','UOB Bank Malaysia'];
  const payTabs=()=>'<div class="local-seg"><button type="button" data-testid="local-deposit-fiat"'+(depositRail==='fiat'?' class="is-on"':'')+'><i class="local-ico local-ico-fiat"></i>Fiat</button><button type="button" data-testid="local-deposit-crypto"'+(depositRail==='crypto'?' class="is-on"':'')+'><i class="local-ico local-ico-crypto"></i>Crypto</button></div>';
  const fiatMethod=id=>FIAT.find(m=>m.id===id)||FIAT[0];
  const CLOSE_SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M3.364 3.364a.9.9 0 0 1 1.272 0L8 6.727l3.364-3.363a.9.9 0 0 1 1.272 1.272L9.274 8l3.364 3.364a.9.9 0 1 1-1.273 1.272L8 9.274l-3.364 3.364a.9.9 0 1 1-1.272-1.273L6.727 8 3.364 4.636a.9.9 0 0 1 0-1.272"/></svg>';
  const COINS=[
    ['Bitcoin','BTC','assets/pay/balance-btc.png'],
    ['Ethereum','ETH','assets/pay/balance-eth.svg'],
    ['Litecoin','LTC','assets/pay/balance-ltc.svg'],
    ['Tether USD','USDT','assets/pay/balance-usdt.png'],
    ['TRON','TRX','assets/pay/balance-trx.svg'],
    ['Toncoin','TON','assets/pay/balance-ton.png']
  ];
  const wideBtn=(id,label,accent)=>'<button class="base_root-ZOkD4 base_size-m-ZOkD4 '+(accent?'base_variant-accent-ZOkD4':'base_variant-neutral-ZOkD4')+' local-wide" data-testid="'+id+'" type="button"><div class="base_view-ZOkD4"><div class="base_content-ZOkD4">'+label+'</div></div></button>';
  const depositBtn='<button class="base_root-ZOkD4 base_size-m-ZOkD4 base_variant-accent-ZOkD4 local-wide local-deposit-btn" data-testid="local-open-deposit" type="button"><div class="base_view-ZOkD4"><div class="base_content-ZOkD4"><span class="local-plus">+</span>Deposit</div></div></button>';
  function accountSheet(title, body, back, headless) {
    const closeBtn='<button class="base_root-AENvm base_size-m-semibold-AENvm base_variant-tertiary-AENvm modal-header_button-9Ka9l" data-testid="modal-header-button-close" type="button"><div class="base_view-AENvm"><div class="base_content-AENvm">'+CLOSE_SVG+'</div></div></button>';
    const backBtn=back&&!headless?'<button class="base_root-AENvm base_size-m-semibold-AENvm base_variant-tertiary-AENvm modal-header_button-9Ka9l" data-testid="modal-back-button" type="button"><div class="base_view-AENvm"><div class="base_content-AENvm">‹</div></div></button>':'';
    const header=headless
      ?'<div class="local-pay-head"><button class="local-back" data-testid="modal-back-button" type="button">‹ Back</button>'+closeBtn+'</div>'
      :'<div class="modal-header_root-9Ka9l" style="--e18cc120: var(--modal-color-bg); --v873b5fe6: balance;"><div class="modal-header_primaryHeader-9Ka9l">'+backBtn+'<div class="modal-header_info-9Ka9l"><div class="modal-header_title-9Ka9l" data-testid="modal-header-title">'+title+'</div></div><div class="modal-header_buttons-9Ka9l">'+closeBtn+'</div></div></div>';
    const inner='<div class="profile_content-OUEX2">'+header+'<div class="local-account">'+body+'</div></div>';
    // Same stacking and card color as the captured profile sheet. Without them the page paints through the card.
    const shell=' style="z-index: var(--z-index-modal-layout);"';
    if(mobile())return '<div class="modal-layout_wrapper-C9j8A" data-testid="modal-layout"'+shell+'><div class="color-scheme_root-jGMem colorScheme-light"><div class="mobile-modal_root-IMcp4" data-testid="mobile-modal" size="small" style="inset:0; --v6578d6c9: var(--modal-color-bg); --v5133b3f9: 820;"><div class="mobile-modal_backdrop-IMcp4" style="opacity:1"></div><div class="mobile-modal_holder-IMcp4" style="inset:auto 0 0 0;"><div class="mobile-modal_modal-IMcp4 mobile-modal_detent-expanded-IMcp4 mobile-modal_scrollable-IMcp4">'+inner+'</div></div></div></div></div>';
    return '<div class="modal-layout_wrapper-C9j8A" data-testid="modal-layout"'+shell+'><div class="color-scheme_root-jGMem colorScheme-light"><div class="desktop-modal_root-CaHFb" data-testid="desktop-modal" style="--v547cda05: 300; --v6edd6d02: 200; --v378956dc: var(--modal-color-bg);"><div class="desktop-modal_backdrop-CaHFb desktop-modal_open-CaHFb"></div><div class="desktop-modal_holder-CaHFb desktop-modal_open-CaHFb"><div class="desktop-modal_card-CaHFb desktop-modal_detent-expanded-CaHFb desktop-modal_size-small-CaHFb desktop-modal_scrollable-CaHFb">'+inner+'</div></div></div></div></div>';
  }
  function accountPanel(kind) {
    if(kind==='account-deposit'){
      const fiat='<button type="button" class="local-currency" data-testid="local-currency"><span class="local-rm">RM</span><span>Malaysian ringgit</span><span class="local-chevron">▾</span></button><div class="local-methods">'+FIAT.map(m=>'<button type="button" class="local-method" data-testid="local-pay-method" data-method="'+m.id+'"><img src="'+m.icon+'" alt=""><b>'+m.name+'</b></button>').join('')+'</div>';
      const coin=COIN_CHOICES.find(c=>c[0]===depositCoin)||COIN_CHOICES[0];
      const net=depositCoin==='Ethereum'?'Ethereum':depositCoin==='Solana'?'Solana':'Tron (TRC-20)';
      const coinMenu=coinOpen?'<div class="local-menu"><label class="local-search"><input data-testid="local-coin-search" placeholder="Search" aria-label="Search"></label>'+COIN_CHOICES.map(([name,code,icon])=>'<button type="button" data-testid="local-coin" data-coin="'+name+'"><img src="'+icon+'" alt=""><span><b>'+name+'</b><small>'+code+'</small></span>'+(name===depositCoin?'<i class="local-check"></i>':'')+'</button>').join('')+'</div>':'';
      const crypto='<div class="local-pick"><button type="button" class="local-currency" data-testid="local-coin-toggle"><img src="'+coin[2]+'" alt=""><span>'+coin[1]+'</span><span class="local-chevron">'+(coinOpen?'▴':'▾')+'</span></button>'+coinMenu+'</div><button type="button" class="local-currency" data-testid="local-net-toggle"><span>'+net+'</span><span class="local-chevron">▾</span></button>'+(netOpen?'<div class="local-menu"><button type="button" data-testid="local-net" data-net="'+net+'">'+net+'</button></div>':'')+'<p class="local-min">Minimum <b>5 '+coin[1]+'</b><br>Amounts below this will not be credited.</p><div class="local-address"><div class="local-qr" aria-hidden="true"></div><div><b>Deposit address</b><p>Preview only</p><button type="button" class="local-copy" data-testid="local-copy-address">Copy</button></div></div><button type="button" class="local-wallet" data-testid="local-connect"><span>Connect wallet</span><span class="local-wallet-icons"><img src="assets/pay/MetaMask_Fox.svg" alt=""><img src="assets/pay/walletconnect.svg" alt=""><img src="assets/pay/trust.svg" alt=""></span></button>';
      return accountSheet('Deposit',payTabs()+(depositRail==='fiat'?fiat:crypto));
    }
    if(kind==='account-deposit-method'){
      const m=fiatMethod(depositMethod);
      return accountSheet('','<div class="local-pay-title"><img src="'+m.icon+'" alt=""><b>'+m.name+'</b></div>'+payTabs()+'<label class="local-amount"><span>Amount</span><b>RM</b><input data-testid="local-amount" inputmode="decimal" aria-label="Amount" value="'+depositAmount+'"><button type="button" data-testid="local-bonus"'+(depositBonus?' class="is-on"':'')+'>Bonus 100</button></label><p class="local-range">from RM '+m.min+' to RM '+m.max+'</p><div class="local-chips">'+[80,150,400,600].map(n=>'<button type="button" data-testid="local-amount-chip" data-amount="'+n+'">RM '+n+'</button>').join('')+'</div>'+wideBtn('local-pay','Deposit',true)+'<button type="button" class="local-instructions" data-testid="local-instructions">Detailed instructions</button>'+(showInstructions?'<p class="local-hint">Pay the amount in your bank or wallet app. This preview does not create a payment.</p>':'')+'<h3 class="local-sub">Bonuses</h3><button type="button" class="local-bonus" data-testid="local-bonus-card"><span><b>100% casino bonus</b><small>'+(depositBonus?'Selected':'Tap to select')+'</small></span><span class="local-chevron">›</span></button>',false,true);
    }
    if(kind==='account-balance')return accountSheet('Balance','<p class="local-hint">Account • Malaysian ringgit</p><p class="local-sum">RM 0.00</p>'+depositBtn+'<button type="button" class="local-points" data-testid="local-points"><img src="assets/pay/balance-points.png" alt=""><span>1win Points</span><em>0</em><img class="local-info" src="assets/pay/balance-info.svg" alt=""></button><div class="local-split"><b>Other accounts</b><button type="button" data-testid="local-add-account"><i class="local-add">+</i>Add</button></div><div class="local-rows">'+COINS.map(([name,code,icon])=>'<div class="local-row"><img class="local-coin" src="'+icon+'" alt=""><span><b>'+name+'</b><small>'+code+'</small></span><span class="local-zero">0.00000000</span></div>').join('')+'</div><label class="local-switch"><span class="local-toggle" aria-hidden="true"></span><input type="checkbox" data-testid="local-balance-currency" hidden> Balance in currency <span class="local-chevron">▾</span></label>');
    if(kind==='account-withdraw'){
      if(withdrawStep==='warn')return accountSheet('Withdrawal','<p class="local-forfeit">The following bonuses will be forfeited when you exchange currency:</p><ul class="local-forfeit-list"><li>all active bonuses</li><li>all available no-deposit bonuses</li></ul>'+wideBtn('local-withdraw-save','Save bonuses',true)+'<button type="button" class="local-funds" data-testid="local-withdraw-go">Withdraw funds</button>');
      if(withdrawStep==='methods')return accountSheet('Withdrawal','<div class="local-methods"><button type="button" class="local-method" data-testid="local-withdraw-method" data-method="banks"><img src="assets/pay/malaysia.svg" alt=""><b>Malaysian banks</b></button><button type="button" class="local-method" data-testid="local-withdraw-method" data-method="tng"><img src="assets/pay/tng-clear.png" alt=""><b>Touch n Go</b></button></div>');
      const banks=withdrawKind==='banks';
      const title=banks?'Malaysian banks':'Touch n Go';
      const icon=banks?'assets/pay/malaysia.svg':'assets/pay/tng-clear.png';
      const fields=banks
        ?'<select class="local-field" data-testid="local-bank" aria-label="Bank"><option value="">Bank</option>'+WITHDRAW_BANKS.map(n=>'<option>'+n+'</option>').join('')+'</select><input class="local-field" data-testid="local-full-name" placeholder="Full name" aria-label="Full name"><input class="local-field" data-testid="local-account-no" inputmode="numeric" placeholder="Bank account number" aria-label="Bank account number">'
        :'<input class="local-field" data-testid="local-phone" inputmode="tel" placeholder="Phone number" aria-label="Phone number"><input class="local-field" data-testid="local-full-name" placeholder="Full name" aria-label="Full name">';
      return accountSheet('', '<div class="local-pay-title"><img src="'+icon+'" alt=""><b>'+title+'</b></div>'+fields+'<label class="local-amount"><span>Amount</span><b>RM</b><input data-testid="local-amount" inputmode="decimal" aria-label="Amount" value="'+depositAmount+'"></label><p class="local-range">from RM 100 to RM 15,000</p><label class="local-checkline"><input type="checkbox" data-testid="local-withdraw-save" checked> Save for future withdrawals</label><button type="button" class="local-blue" data-testid="local-withdraw">Withdraw</button>', false, true);
    }
    if(kind==='account-voucher')return accountSheet('Bonus codes','<p class="local-hint">Code activation</p><input class="local-field" data-testid="local-voucher" placeholder="Enter code" aria-label="Bonus code">'+wideBtn('local-activate','Activate',true),true);
    if(kind==='account-history-bets')return accountSheet('Bet history','<p class="local-empty">No open or settled bets.</p>'+wideBtn('local-go-sports','Go to Sports',true),true);
    if(kind==='account-history-tx')return accountSheet('Transaction history','<p class="local-empty">No deposits or withdrawals.</p>',true);
    if(kind==='account-support')return accountSheet('24/7 support','<p class="local-hint">All contact info</p>'+wideBtn('local-chat','Chat',true)+'<p class="local-hint">Live chat is not connected in this preview.</p>',true);
    if(kind==='account-app')return accountSheet('1win for Windows','<p class="local-hint">Instant access to the platform with our app</p>'+wideBtn('local-download','Download',true)+'<p class="local-hint">The installer is not part of this preview.</p>');
    if(kind==='account-settings-name')return accountSheet('Name','<input class="local-field" value="Demo user" aria-label="Name">'+wideBtn('local-save-demo','Save',true),true);
    if(kind==='account-settings-birthday')return accountSheet('Date of birth','<input class="local-field" type="date" aria-label="Date of birth">'+wideBtn('local-save-demo','Save',true),true);
    if(kind==='account-settings-phone')return accountSheet('Phone number','<p class="local-hint">Verification required</p><input class="local-field" inputmode="tel" placeholder="+60" aria-label="Phone">'+wideBtn('local-save-demo','Save',true),true);
    if(kind==='account-settings-email')return accountSheet('Email','<input class="local-field" value="demo@example.com" aria-label="Email">'+wideBtn('local-save-demo','Save',true),true);
    if(kind==='account-settings-password')return accountSheet('Password','<input class="local-field" type="password" placeholder="Current password" aria-label="Current password"><input class="local-field" type="password" placeholder="New password" aria-label="New password">'+wideBtn('local-save-demo','Save',true)+'<p class="local-hint">Password is not changed in this preview.</p>',true);
    if(kind==='account-settings-sessions')return accountSheet('Active sessions','<p class="local-empty">No other devices are signed in.</p>',true);
    return '';
  }
  function openNotes(anchor) {
    $('[data-local-notes]')?.remove();
    const items=[
      ['16/10/2026','1win Token Sale','You can now buy 1win’s cryptocurrency—and grow with us','View token','freemoney.html'],
      ['15/10/2026','High-level poker','Ryan Garcia, Jon Jones, Nina Drama, Gable Steveson and Diplo—that’s poker with 1win, baby','See how it went','poker-app.html'],
      ['14/10/2026','Scarily exciting','Who will share the 500k usdt prize pool in the Halloween tournament?','Participate','tournament-817472.html']
    ];
    const pop=document.createElement('div');
    pop.dataset.localNotes='all';
    pop.className='local-notes colorScheme-light';
    pop.setAttribute('role','dialog');
    pop.innerHTML='<div class="local-notes-head"><b>Notifications</b><button type="button" data-testid="modal-header-button-close">'+CLOSE_SVG+'</button></div><div class="local-seg"><button type="button" class="is-on" data-testid="local-note-tab" data-tab="all">All</button><button type="button" data-testid="local-note-tab" data-tab="personal">Personal</button><button type="button" data-testid="local-note-tab" data-tab="general">General</button></div><div data-note-list="all">'+items.map(([date,title,text,cta,file])=>'<article class="local-note"><div><span>'+date+'</span><em>New</em></div><h3>'+title+'</h3><p>'+text+'</p><button type="button" data-testid="local-note-go" data-file="'+file+'">'+cta+'</button></article>').join('')+'</div><p class="local-empty" data-note-list="personal" hidden>No personal notifications.</p><div data-note-list="general" hidden>'+items.map(([date,title,text,cta,file])=>'<article class="local-note"><div><span>'+date+'</span></div><h3>'+title+'</h3><p>'+text+'</p><button type="button" data-testid="local-note-go" data-file="'+file+'">'+cta+'</button></article>').join('')+'</div>';
    document.body.append(pop);
    const r=anchor.getBoundingClientRect();
    const width=Math.min(360, innerWidth-16);
    pop.style.width=width+'px';
    pop.style.top=Math.round(r.bottom+8)+'px';
    pop.style.left=Math.max(8, Math.min(r.right-width, innerWidth-width-8))+'px';
  }
  const SIGNUP_CURRENCIES=[
    {name:'Bitcoin Cash',code:'BCH',icon:'assets/pay/signup-bch.svg'},
    {name:'Binance coin',code:'BNB',icon:'assets/pay/signup-bnb.svg'},
    {name:'Bitcoin',code:'BTC',icon:'assets/pay/balance-btc.png'},
    {name:'Dash',code:'DASH',icon:'assets/pay/signup-dash.svg'},
    {name:'Dogecoin',code:'DOGE',icon:'assets/pay/signup-doge.svg'},
    {name:'Ethereum',code:'ETH',icon:'assets/pay/balance-eth.svg'},
    {name:'Litecoin',code:'LTC',icon:'assets/pay/signup-ltc.svg'},
    {name:'Solana',code:'SOL',icon:'assets/pay/solana-clear.png'},
    {name:'Toncoin',code:'TON',icon:'assets/pay/toncoin.png'},
    {name:'TRON',code:'TRX',icon:'assets/pay/balance-trx.svg'},
    {name:'USD Coin',code:'USDC',icon:'assets/pay/signup-usdc.svg'},
    {name:'Tether',code:'USDT',icon:'assets/pay/usdt-2.png'}
  ];
  let signupCurrencyCode='';
  const SEARCH_ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.2 10.2 13.2 13.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function signupCurrencyBody(){
    const rows=SIGNUP_CURRENCIES.map(c=>'<button type="button" class="local-ccy-row" data-testid="local-signup-currency" data-code="'+c.code+'"><img src="'+c.icon+'" alt=""><span><b>'+c.name+'</b><small>'+c.code+'</small></span></button>').join('');
    return '<div class="local-ccy"><label class="local-ccy-search">'+SEARCH_ICON+'<input data-testid="local-signup-currency-search" placeholder="Search" aria-label="Search" autocomplete="off"></label><div class="local-ccy-list">'+rows+'</div><p class="local-ccy-empty" data-testid="local-signup-currency-empty" hidden>No results</p></div>';
  }
  function registrationCurrencyButton(){
    return $$('[data-testid="signUpFast-form-currency"]').find(n=>n.closest('[data-local-modal="registration"]'))||null;
  }
  function paintSignupCurrency(){
    if(!signupCurrencyCode)return;
    const coin=SIGNUP_CURRENCIES.find(c=>c.code===signupCurrencyCode);
    const reg=registrationCurrencyButton();
    if(!coin||!reg)return;
    const label=$('[class*="currency-dropdown_content"]',reg);
    const img=$('img',reg);
    if(label)label.textContent=coin.name;
    if(img)img.src=new URL((assetPrefix||'')+coin.icon,document.baseURI).href;
  }
  function closeSignupCurrency(){
    const node=$('[data-local-modal="signup-currency"]');
    if(!node)return;
    node.style.pointerEvents='none';
    const finish=()=>node.remove();
    if(motion?.instant())finish();
    else Promise.resolve(motion?.modal(node,true)).then(finish);
    registrationCurrencyButton()?.focus({preventScroll:true});
  }
  function openSignupCurrency(){
    if($('[data-local-modal="signup-currency"]')||modal!=='registration')return;
    const key=mobile()?'registration-390x844':'registration-1440x900';
    const html=states[key]?.html;
    if(!html)return;
    const template=document.createElement('template');
    template.innerHTML=markup(html);
    const root=template.content.firstElementChild;
    if(!root)return;
    root.dataset.localModal='signup-currency';
    root.style.zIndex='1002';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','Choose currency');
    $$('[class*="modal-header_title"]',root).forEach(n=>{if(n.textContent.trim()==='Registration')n.textContent='Choose currency';});
    const content=$('[data-testid="recoveryPassword-content-sign-up"]',root);
    if(!content)return;
    content.innerHTML=markup(signupCurrencyBody());
    document.body.append(root);
    motion?.modal(root);
    $('[data-testid="local-signup-currency-search"]',root)?.focus({preventScroll:true});
  }
  function chooseSignupCurrency(button){
    signupCurrencyCode=button.dataset.code||'';
    const reg=registrationCurrencyButton();
    const label=reg&&$('[class*="currency-dropdown_content"]',reg);
    const img=reg&&$('img',reg);
    const picked=$('img',button);
    if(label)label.textContent=$('b',button)?.textContent||label.textContent;
    if(img&&picked)img.src=picked.currentSrc||picked.src;
    closeSignupCurrency();
  }
  function filterSignupCurrencies(input){
    const root=input.closest('[data-local-modal="signup-currency"]');
    if(!root)return;
    const q=input.value.trim().toLowerCase();
    let shown=0;
    $$('[data-testid="local-signup-currency"]',root).forEach(btn=>{
      const name=$('b',btn).textContent.toLowerCase();
      const hit=!q||btn.dataset.code.toLowerCase().startsWith(q)||name.split(/\s+/).some(word=>word.startsWith(q));
      btn.hidden=!hit;
      if(hit)shown++;
    });
    const empty=$('[data-testid="local-signup-currency-empty"]',root);
    if(empty)empty.hidden=shown>0;
  }
  function openModal(kind, source=null) {
    const focus=source||document.activeElement;
    closeModal(true);$('[data-local-notes]')?.remove();returnFocus=focus;
    let value;
    if(kind.startsWith('account-')) {
      value=accountPanel(kind);
      if(!value){
        const page=kind.replace('account-',''),set=window.ACCOUNT_DIALOG_STATES||{};
        const size=innerWidth<410?'390x844':innerWidth<640?'430x932':innerWidth<1024?'768x1024':innerWidth>=1680?'1920x1080':'1440x900';
        value=set[page+'-'+size]?.html;
      }
    } else {
      const key=kind==='registration'? (mobile()?'registration-390x844':'registration-1440x900') : kind==='promo'?'registration-promo-1440x900':kind==='email'?'login-email-1440x900':kind==='recovery'?'recovery-1440x900':'login-1440x900';
      value=states[key]?.html;
    }
    if(!value)return notice('This dialog has not been captured yet.');
    const fragment=document.createElement('template');fragment.innerHTML=markup(value);
    document.body.append(fragment.content.cloneNode(true));
    modal=kind; document.body.style.overflow='hidden';
    const root=openLayout();
    if(root){root.dataset.localModal=kind;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');}
    // Some wide and phone captures omit the open class, so the card stays at opacity 0.
    root?.querySelectorAll('[class*="desktop-modal_backdrop"],[class*="desktop-modal_holder"]').forEach(node=>{
      for(const cls of node.classList){
        const match=cls.match(/^desktop-modal_(?:backdrop|holder)-(.+)$/);
        if(match)node.classList.add('desktop-modal_open-'+match[1]);
      }
    });
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
  const PROMO_TARGETS={'Halloween & 500K USDT':'/tournaments/817472','Welcome Bonus up to 600% and 500 FS':'/bonuses','Lucky Drive':'/freemoney','Multiple bet bonus':'/betting','Popular bets in TOP Bets':'/betting/topbets','1:0 Early Payout':'/betting/prematch/football-18/uefa-champions-league-39437','Up to 200,000 USDT in crypto tournaments':'/tournaments','Evoplay: Crystal Rush':'/casino/category/crystal-rush','Rakeback up to 50% in poker':'/casino/play/poker'};
  // Casino game page: one captured guest page (Majestic King) shows whichever card was clicked.
  const GAME_KEY='1win-preview-game';
  function rememberGame(card,href){
    const img=card&&$('img',card);
    const data={href:href||card.dataset.referenceHref,name:card?.dataset.testid?.replace(/^game-card-/,'')||card?.textContent.trim()||'',img:img?img.src:''};
    try{sessionStorage.setItem(GAME_KEY,JSON.stringify(data));}catch{}
  }
  function fillGamePage(){
    if(pageName!=='casino-play')return;
    let game={};try{game=JSON.parse(sessionStorage.getItem(GAME_KEY)||'{}');}catch{}
    if(!game.href||game.href==='/casino/play/v_spinomenal:majesticking')return;
    if(game.img)$$('img[class*="play-game_gameCoverImage"],img[class*="play-game_image"]').forEach(img=>{img.closest('picture')?.querySelectorAll('source').forEach(n=>n.remove());img.src=game.img;});
    const name=test('game-info-card-game-name');if(name)name.textContent=game.name||'';
    // The card does not say which provider it belongs to, so the provider row is hidden for other games.
    $$('[data-testid="game-info-card-provider-icon"],[data-testid="game-info-card-provider-name"]').forEach(n=>n.hidden=true);
  }
  function navigate(raw) {
    const u=new URL(raw,'https://one-vv3591.com/');
    if(u.hostname!=='one-vv3591.com')return;
    if(u.searchParams.get('x')?.includes('sign-up')){openModal('registration');return;}
    if(u.pathname.startsWith('/casino/play/')){let stored={};try{stored=JSON.parse(sessionStorage.getItem(GAME_KEY)||'{}');}catch{}if(stored.href!==u.pathname)rememberGame(null,u.pathname);go('casino-play.html');return;}
    // /forum is the local copy of the public forum (forum/index.html), including ?preview=auth via go().
    // League listings (/betting/<section>/<sport>/<league>) change with the live schedule; only sport filters were captured.
    if(/^\/betting\/[^/]+\/[^/]+\/[^/]+$/.test(u.pathname)&&!routeFile(u.pathname)){notice('League pages follow the live schedule and are not part of this preview.');return;}
    const file=routeFile(u.pathname);
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
    $$('[class*="banners-carousel_root"]').forEach(root=>{
      const scaler=$('[class*="scaler_item"]',root);if(!scaler)return;
      const designWidth=parseFloat(scaler.style.width);if(!designWidth)return;
      const scale=root.clientWidth/designWidth,previous=parseFloat(scaler.style.transform.replace('scale(',''));
      if(Math.abs(previous-scale)>.001)scaler.style.transform='scale('+scale+')';
    });
    const banner=test('banner-main-container'),wrapper=banner&&$('.swiper-wrapper',banner);
    if(wrapper){
      // Swiper positions slides inside the unscaled design canvas. Using the visible banner width here scales each slide twice.
      const width=wrapper.clientWidth||banner.clientWidth;
      const slides=$$('.swiper-slide',wrapper),index=Math.max(0,slides.findIndex(s=>s.classList.contains('swiper-slide-active')));
      slides.forEach(s=>s.style.width=width+'px');
      const gap=parseFloat(slides[0]?.style.marginRight)||0;
      wrapper.style.transform='translate3d('+(-(width+gap)*index)+'px,0,0)';
    }
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
    const root=openLayout()||document;
    $$('a[data-reference-href*="/casino/play/"]',root).forEach(a=>{
      const label=$('img',a)?.alt||a.textContent;
      a.hidden=!label.toLowerCase().includes(query.trim().toLowerCase());
    });
  }
  function pageAccordionHeading(el){
    if(!el?.matches?.('[class*="accordion-heading_root-"]'))return null;
    if(el.closest('[class*="navigation-section_root"]'))return null;
    const root=el.closest('[class*="accordion_root-"]');
    if(!root||!$('[class*="accordion-body_root-"]',root))return null;
    return el;
  }
  function initFaqAccordions() {
    $$('[class*="accordion_root-"]').forEach((root,index)=>{
      if(root.closest('[class*="navigation-section_root"]'))return;
      const heading=$('[class*="accordion-heading_root-"]',root),body=$('[class*="accordion-body_root-"]',root);
      if(!heading||!body)return;
      body.id='local-faq-answer-'+index;
      heading.setAttribute('role','button');heading.tabIndex=0;
      heading.setAttribute('aria-controls',body.id);
      const opened=root.className.includes('accordion_isOpen-');
      heading.setAttribute('aria-expanded',String(opened));body.setAttribute('aria-hidden',String(!opened));
    });
  }
  function toggleFaq(heading) {
    const root=heading.closest('[class*="accordion_root-"]');
    const body=root&&$('[class*="accordion-body_root-"]',root);
    if(!body)return;
    const rootClass=root.className.split(' ').find(c=>c.startsWith('accordion_root-'));
    const headingClass=heading.className.split(' ').find(c=>c.startsWith('accordion-heading_root-'));
    const bodyClass=body.className.split(' ').find(c=>c.startsWith('accordion-body_root-'));
    if(!rootClass||!headingClass||!bodyClass)return;
    // These are the observed reference open-state classes; the saved CSS animates the grid and arrow.
    const opened=root.classList.toggle(rootClass.replace('_root-','_isOpen-'));
    heading.classList.toggle(headingClass.replace('_root-','_isOpen-'),opened);
    body.classList.toggle(bodyClass.replace('_root-','_isOpen-'),opened);
    heading.setAttribute('aria-expanded',String(opened));body.setAttribute('aria-hidden',String(!opened));
  }
  function toggleSeo(button) {
    const root=button.closest('[class*="seo_root-"]');
    const rootClass=root?.className.split(' ').find(c=>c.startsWith('seo_root-'));
    const content=$('[class*="base_content-"]',button),icon=$('svg',button);
    if(!rootClass||!content||!icon)return;
    const opened=root.classList.toggle(rootClass.replace('_root-','_expanded-'));
    // Label and arrow paths are from the observed reference states.
    content.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.textContent='';});
    content.prepend(document.createTextNode(opened?'Collapse ':'Read more '));
    icon.dataset.icon=opened?'arrow-top':'arrow-bottom';
    $('path',icon)?.setAttribute('d',opened?'M13.303 10.97a.9.9 0 0 1-1.273 0L8 6.94l-4.03 4.03a.9.9 0 1 1-1.273-1.273L7.363 5.03a.9.9 0 0 1 1.273 0l4.667 4.667a.9.9 0 0 1 0 1.273':'M2.697 5.03a.9.9 0 0 1 1.273 0L8 9.06l4.03-4.03a.9.9 0 1 1 1.273 1.273L8.637 10.97a.9.9 0 0 1-1.273 0L2.697 6.303a.9.9 0 0 1 0-1.273');
    button.setAttribute('aria-expanded',String(opened));
  }
  // Tournament detail (probed 2026-10-15, captures/tour-actions.json, captures/tour-collect.json): "Rules" opens the
  // tournament-rules dialog; the leaderboard "Show all" reveals the remaining rows once and stays; each games
  // "Show more" reveals one more page of the size the grid started with, then the progress block goes away.
  function tournamentData(){return pageName.startsWith('tournament-')?window.TOURNAMENT_DETAIL?.[pageName.slice(11)]:null;}
  function tournamentNodes(html){const t=document.createElement('template');t.innerHTML=markup(html||'');return [...t.content.children];}
  function openTournamentDialog(html,kind){
    if(!html)return;
    closeModal(true);
    const node=tournamentNodes(html)[0];if(!node)return;
    node.dataset.localModal=kind;node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');
    document.body.append(node);modal=kind;document.body.style.overflow='hidden';motion?.modal(node);
    ($('[data-testid="modal-header-button-close"]',node)||$('button',node))?.focus({preventScroll:true});
  }
  function tournamentDialog(group){
    const data=tournamentData();if(!data?.[group])return'';
    const wide=Number((currentKey||'').match(/(\d+)x\d+$/)?.[1])>=1024;
    return data[group][wide?'1440x900':'390x844']||data[group]['1440x900']||'';
  }
  function openTournamentRules(){openTournamentDialog(tournamentDialog('rules'),'tournament-rules');}
  // Markets: Yes / No puts an inline bet form at the top of the card and keeps the card in a display:none wrapper.
  const money=n=>'MYR\u00a0'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const escapeText=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function closeBetForm(){
    const form=$('[data-local-bet-form]');if(!form)return;
    const wrapper=form.nextElementSibling;
    if(wrapper?.hasAttribute('data-local-bet-card'))wrapper.replaceWith(...wrapper.childNodes);
    form.remove();
  }
  function setBetAmount(form,amount,typed){
    amount=Math.max(0,Math.round(amount*100)/100);form.dataset.amount=String(amount);
    const input=$('input',form),[minus]=$$('[class*="_field_ruqaw_"] button',form);
    if(typed===undefined)input.value=money(amount);
    input.classList.toggle(form.dataset.emptyClass,!amount);
    minus.disabled=!amount;
    // The reference prices with live coefficients; the snapshot only keeps the rounded percentage.
    const percent=+form.dataset.percent;
    $('[class*="_profitAmount_"]',form).textContent=money(percent?amount/(percent/100):0);
  }
  function openBetForm(button,amount=0){
    const card=button.closest('[class*="_root_saz1a_"]');if(!card||!window.MARKETS_BET_FORM)return null;
    closeBetForm();
    const side=$('[class*="_name_5xqiy_"]',button)?.textContent.trim()||'',cf=$('[class*="_cf_17if8_"]',button)?.textContent.trim()||'';
    const question=$('[class*="_clamp_ftmva_"]',button.closest('[class*="_root_ftmva_"]')||card)?.textContent.trim()||'';
    const fill={logo:$('img[class*="_logo_1ih13_"]',card)?.getAttribute('src')||'',title:$('[class*="_title_1cufa_"]',card)?.textContent||'',question,outcome:`${side} ${cf}`};
    const t=document.createElement('template');
    t.innerHTML=window.MARKETS_BET_FORM.replace(/\{\{(logo|title|question|outcome)\}\}/g,(_,k)=>escapeText(fill[k]));
    const form=t.content.firstElementChild,wrapper=document.createElement('div');
    form.dataset.localBetForm='';form.dataset.question=question;form.dataset.side=side;form.dataset.percent=String(parseFloat(cf)||0);
    form.dataset.emptyClass=[...$('input',form).classList].find(c=>c.startsWith('_inputEmpty_'))||'';
    wrapper.style.display='none';wrapper.dataset.localBetCard='';
    card.before(form,wrapper);wrapper.append(card);
    setBetAmount(form,amount);
    return form;
  }
  function typeBetAmount(input){
    const form=input.closest('[data-local-bet-form]'),raw=input.value.replace(/^\s*MYR/i,'').replace(/[\s,\u00a0]/g,'');
    if(raw==='')setBetAmount(form,0,raw);
    else if(/^\d+(\.\d{0,2})?$/.test(raw))setBetAmount(form,+raw,raw);
  }
  document.addEventListener('click',e=>{
    const notes=$('[data-local-notes]');
    if(notes&&!notes.contains(e.target)&&!e.target.closest('[data-testid="header-notification-button"]'))notes.remove();
    const socialTrigger=e.target.closest('[data-testid="sidebar-social-buttons-with-preview"]');
    if(socialTrigger){toggleSidebarSocial(socialTrigger);return;}
    const socialPopover=$('[data-sidebar-social-popover]');
    if(socialPopover&&!socialPopover.contains(e.target))closeSidebarSocial();
    if(e.target.closest('[data-testid="local-sidebar-social-close"]')){closeSidebarSocial(true);return;}
    const langPopover=$('[data-local-language-popover]');
    if(langPopover&&!langPopover.contains(e.target)&&!e.target.closest('[data-testid="language-picker-button"]'))closeLanguagePicker();
    const groupToggle=e.target.closest('[data-testid="casino-group-toggle"],[data-testid="betting-group-toggle"],[data-testid="markets-toggle"],[data-testid="betwave-toggle"],[data-testid="casino-lobby-toggle"],[data-testid="casino-live-toggle"],[data-testid="casino-fast-toggle"],[data-testid="casino-brand-toggle"]');
    if(groupToggle){
      e.preventDefault();
      e.stopPropagation();
      const parent=groupToggle.closest('[class*="tooltip_root"]')?.parentElement;
      const content=parent&&$('[class*="expanded-view_expandable"]',parent);
      const base=content?.className.split(' ').find(c=>c.includes('expanded-view_expandable'));
      if(base){
        const opened=content.classList.toggle(base.replace('_expandable-','_isOpened-'));
        content.toggleAttribute('inert',!opened);
        groupToggle.setAttribute('aria-expanded',String(opened));
        // CSS grid-template-rows on expanded-view_expandable owns the open/close motion.
        const icon=$('svg',groupToggle);
        if(icon)icon.style.transform=opened?'rotate(180deg)':'';
      }
      return;
    }
    const el=e.target.closest('button,a,[data-testid="userSettings-emailButton"],[data-reference-href],[class*="accordion-heading_root"],[class*="common-layout_close"],[class*="common-layout_backdrop"],[class*="desktop-modal_backdrop"],[class*="mobile-modal_backdrop"]');
    const removeSel=e.target.closest('[class*="_removeSelection_1ijea_"]');
    if(removeSel){const key=removeSel.closest('[data-betslip-key]')?.dataset.betslipKey;betslip=betslip.filter(s=>s.key!==key);saveBetslip();renderBetslip();return;}
    const sheet=e.target.closest('[data-local-sheet]');
    if(sheet&&(e.target.closest('[class*="_backdrop_1cqdp_"]')||e.target.closest('[data-scope="ContentButton"]'))){sheet.remove();return;}
    if(e.target.closest('[class*="_trigger_1b67u_"] [role="button"]')){openBetslipSheet();return;}
    if(e.target.closest('[data-local-bet-form] [class*="_icon_1cufa_"]')){closeBetForm();return;}
    // Promotion dialog: header buttons are share / close; the CTA goes where the reference sends a guest (probed 2026-10-15).
    const promo=e.target.closest('[data-local-modal="promo"]');
    if(promo){
      const header=e.target.closest('[class*="modal-header_button-9Ka9l"]'),cta=e.target.closest('[class*="hero_button-"],[class*="base_variant-staticPrimary-AENvm"]');
      if(header){const all=$$('[class*="modal-header_button-9Ka9l"]',promo);if(header===all.at(-1))closeModal();else{navigator.clipboard?.writeText(location.href).catch(()=>{});notice('Link copied.');}return;}
      if(cta){const to=PROMO_TARGETS[promo.dataset.localTitle];closeModal(true);if(to)navigate(to);return;}
    }
    // Promotions: a card title/picture opens the promotion dialog on the same page (reference keeps the URL).
    const promoCard=e.target.closest('[class*="variant-1_titleBlock-i8wf0"],[class*="variant-1_picture-i8wf0"]');
    if(promoCard&&!e.target.closest('button')){
      const title=$('[class*="variant-1_title-i8wf0"]',promoCard.closest('[class*="variant-1_root-i8wf0"]'))?.textContent.replace(/ /g,' ').trim();
      const size=(currentKey||'').split('-').pop(),html=window.PROMO_MODALS?.[size]?.[title]||window.PROMO_MODALS?.['1440x900']?.[title];
      if(html){const t=document.createElement('template');t.innerHTML=markup(html);const node=t.content.firstElementChild;node.dataset.localModal='promo';node.dataset.localTitle=title;document.body.append(node);modal='promo';returnFocus=promoCard;document.body.style.overflow='hidden';motion?.modal(node);}
      return;
    }
    if(e.target.closest('[class*="modal-promo-desktop_backdrop"]'))return closeModal();
    const rowTitle=!el&&e.target.closest('[class*="game-slider_title"]');
    if(rowTitle){const file=rowCategory(rowTitle);if(file)go(file);return;}
    if(signedPreview){
      const balance=e.target.closest('[data-testid="header-balance-button"]');
      if(balance&&!e.target.closest('[data-testid="header-balance-deposit-button"]'))return openModal('account-balance',balance);
    }
    if(!el)return;
    const id=el.dataset.testid||'', text=el.textContent.trim();
    if(el.matches('[class*="seo_button-"]')&&el.closest('[class*="seo_root-"]')){toggleSeo(el);return;}
    if(pageAccordionHeading(el)){
      toggleFaq(el);return;
    }
    const footerSection=el.closest('[class*="navigation-section_root"]');
    if(footerSection&&el.closest('[class*="accordion-heading_root"]')){
      const content=$('[class*="navigation-section_expandable"]',footerSection);
      const cls=content?.className.split(' ').find(c=>c.includes('navigation-section_expandable'));
      if(cls){const opened=content.classList.toggle(cls.replace('_expandable-','_isOpened-'));el.setAttribute('aria-expanded',String(opened));const icon=$('[data-icon="arrow-bottom"]',footerSection);if(icon)icon.style.transform=opened?'rotate(180deg)':'';}
      return;
    }
    if(el.matches('a,[data-reference-href]')){
      if(el.dataset.localUnavailable){e.preventDefault();return notice('This external link is not part of the preview.');}
      const href=el.getAttribute('href')||'';
      if(href.split('?')[0].endsWith('sports-bets-history.html')){e.preventDefault();return openModal('account-history-bets',el);}
      if(el.tagName==='A'&&href.split('?')[0].endsWith('.html'))return;
      e.preventDefault();
      if(el.dataset.referenceHref?.startsWith('/casino/play/'))rememberGame(el);
      if(el.dataset.localPage)go(el.dataset.localPage);
      else if(el.dataset.referenceHref)navigate(el.dataset.referenceHref);
      return;
    }
    if(id==='sidebar-profile-button'&&signedPreview)return openModal('account-profile',el);
    if(id==='profile-settingsButton')return openModal('account-settings',el);
    if(id==='profile-depositButton'||id==='local-open-deposit'){depositRail='fiat';return openModal('account-deposit',el);}
    if(id==='profile-withdrawButton'){withdrawStep='warn';return openModal('account-withdraw',el);}
    if(id==='profile-bonusesButton'){closeModal(true);return go('bonuses.html');}
    if(id==='profile-voucherButton')return openModal('account-voucher',el);
    if(id==='profile-loyaltyProgramButton'){closeModal(true);return go('loyalty-program.html');}
    if(id==='profile-betsHistoryButton')return openModal('account-history-bets',el);
    if(id==='profile-transactionHistoryButton')return openModal('account-history-tx',el);
    if(id==='profile-supportButton'||id==='sidebar-support-button-chat')return openModal('account-support',el);
    if(id==='sidebar-app-banner-button')return openModal('account-app',el);
    if(id==='userSettings-nameButton')return openModal('account-settings-name',el);
    if(id==='userSettings-birthdayButton')return openModal('account-settings-birthday',el);
    if(id==='userSettings-phoneButton')return openModal('account-settings-phone',el);
    if(id==='userSettings-emailButton')return openModal('account-settings-email',el);
    if(id==='userSettings-passwordButton')return openModal('account-settings-password',el);
    if(id==='userSettings-sessionButton')return openModal('account-settings-sessions',el);
    if(id==='modal-back-button'&&modal?.startsWith('account-')){
      if(modal==='account-deposit-method'){depositMethod='';return openModal('account-deposit',el);}
      if(modal==='account-withdraw'){withdrawStep=withdrawStep==='form'?'methods':'warn';return openModal('account-withdraw',el);}
      if(modal.startsWith('account-settings-'))return openModal('account-settings',el);
      return openModal('account-profile',el);
    }
    if(id==='userSettings-logoutButton'){closeModal(true);if(signedPreview)togglePreview();else setSession(null);notice('You are logged out.');return;}
    if(id==='profile-copyIdButton'){const accId=sessionAccount()?.id||'00000000';navigator.clipboard?.writeText(accId).then(()=>notice('ID copied')).catch(()=>notice('ID: '+accId));return;}
    if(id==='local-deposit-fiat'||id==='local-deposit-crypto'){depositRail=id.endsWith('crypto')?'crypto':'fiat';coinOpen=false;netOpen=false;depositMethod='';return openModal('account-deposit',el);}
    if(id==='local-pay-method'){depositMethod=el.dataset.method||'fpx';depositAmount='';return openModal('account-deposit-method',el);}
    if(id==='local-amount-chip'){depositAmount=el.dataset.amount||'';return openModal('account-deposit-method',el);}
    if(id==='local-bonus'||id==='local-bonus-card'){const typed=$('[data-testid="local-amount"]');if(typed)depositAmount=typed.value;depositBonus=!depositBonus;return openModal(modal,el);}
    if(id==='local-instructions'){const typed=$('[data-testid="local-amount"]');if(typed)depositAmount=typed.value;showInstructions=!showInstructions;return openModal('account-deposit-method',el);}
    if(id==='local-coin-toggle'){coinOpen=!coinOpen;netOpen=false;return openModal('account-deposit',el);}
    if(id==='local-coin'){depositCoin=el.dataset.coin||'USDT';coinOpen=false;return openModal('account-deposit',el);}
    if(id==='local-net-toggle'||id==='local-net'){netOpen=!netOpen;coinOpen=false;return openModal('account-deposit',el);}
    if(id==='local-copy-address')return notice('No deposit address in this preview.');
    if(id==='local-connect')return notice('Wallets are not connected in this preview.');
    if(id==='local-pay')return notice('Local preview. No payment is sent.');
    if(id==='local-withdraw-save'){closeModal(true);return openModal('account-profile',el);}
    if(id==='local-withdraw-go'){withdrawStep='methods';return openModal('account-withdraw',el);}
    if(id==='local-withdraw-method'){withdrawKind=el.dataset.method||'banks';withdrawStep='form';depositAmount='';return openModal('account-withdraw',el);}
    if(id==='local-withdraw')return notice('Balance is RM 0.00. Nothing is withdrawn.');
    if(id==='local-activate')return notice('This code is not part of the preview.');
    if(id==='local-save-demo')return notice('Saved for this preview only. Demo details stay in place.');
    if(id==='local-currency')return notice('Malaysian ringgit is the account currency in this preview.');
    if(id==='local-add-account'){depositRail='crypto';return openModal('account-deposit',el);}
    if(id==='local-chat')return notice('Live chat is not connected in this preview.');
    if(id==='local-download')return notice('The installer is not part of this preview.');
    if(id==='local-go-sports'){closeModal(true);return go('sports.html');}
    if(id==='local-note-tab'){
      const pop=el.closest('[data-local-notes]');if(!pop)return;
      pop.dataset.localNotes=el.dataset.tab;
      $$('[data-testid="local-note-tab"]',pop).forEach(b=>b.classList.toggle('is-on',b===el));
      $$('[data-note-list]',pop).forEach(n=>n.hidden=n.dataset.noteList!==el.dataset.tab);
      return;
    }
    if(id==='local-note-go'){$('[data-local-notes]')?.remove();return go(el.dataset.file);}
    if(id.startsWith('profile-')||id.startsWith('userSettings-'))return notice('Local account design preview. This action has no account connection.');
    if(signedPreview&&(id==='header-balance-button'||id==='header-balance-currency-text'))return openModal('account-balance',el);
    if(signedPreview&&id==='header-balance-deposit-button'){depositRail='fiat';return openModal('account-deposit',el);}
    if(signedPreview&&id==='header-notification-button')return openNotes(el);
    if(id==='local-preview-toggle')return togglePreview();
    if(id==='header-auth-button'||id==='sidebar-profile-button'||id==='game-play-card-auth-button'||id.endsWith('form-signInButton'))return openModal('login',el);
    if(id==='header-registration-button'||id.endsWith('form-signUpButton'))return openModal('registration',el);
    if(id==='modal-header-button-close'||el.className.includes('modal_backdrop')){
      if(el.closest('[data-local-modal="signup-currency"]'))return closeSignupCurrency();
      const note=el.closest('[data-local-notes]');
      if(note){note.remove();return;}
      return closeModal();
    }
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
      if($('[data-local-language-popover], [class*="language-picker_tooltip"]')){closeLanguagePicker();return;}
      openLanguagePicker(el);return;
    }
    if(el.closest('[data-local-language-popover], [class*="language-picker_tooltip"]')){
      if(el.className.includes('base_control'))notice('The captured language is English (International).');
      closeLanguagePicker();return;
    }
    if(id.startsWith('freemoneyNavigation-')){
      const section=document.getElementById(id.replace('freemoneyNavigation-',''));
      const nav=el.closest('[class*="chips-section-floating_root"]');
      if(section){const offset=(innerWidth>=1024?16:0)+(nav?.offsetHeight||60)+16;scrollTo({top:scrollY+section.getBoundingClientRect().top-offset,behavior:scrollBehavior()});}
      return;
    }
    if(id==='play-game-header-back-button'){if(history.length>1)history.back();else go('casino.html');return;}
    if(id==='play-game-header-share-button'){navigator.clipboard?.writeText(location.href).catch(()=>{});return notice('Link copied.');}
    if(id==='play-game-header-fullscreen-button'){const box=$('[class*="play-game_game"]')||document.documentElement;box.requestFullscreen?.().catch(()=>{});return;}
    if(id==='game-play-card-demo-button')return notice('Demo games are served by the game provider and are not part of this preview.');
    if(id==='casino-search-input-button')return go('casino-search.html');
    if(id==='casino-search-providers-button')return go('casino-providers.html');
    if(id==='casino-search-tabs-providers')return go('casino-providers.html');
    if(id==='casino-search-tabs-games')return go('casino-search.html');
    if(id==='casino-search-input-clear'){const input=test('casino-search-input');if(input){input.value='';searchResults('');input.focus();}return;}
    if(el.matches('button[class*="_odd_ro0me_"]')){toggleOdd(el);return;}
    const betForm=el.closest('[data-local-bet-form]');
    if(betForm){
      const [minus,plus,max]=$$('[class*="_field_ruqaw_"] button',betForm),amount=+betForm.dataset.amount||0;
      if(el===minus)return setBetAmount(betForm,amount-1);
      if(el===plus)return setBetAmount(betForm,amount+1);
      // MAX stakes the balance; guest and Demo balances are 0.00, so the stake stays as it is (as on the reference).
      if(el===max)return;
      if(text==='Place a bet'){e.preventDefault();return openModal('login',el);}
      return;
    }
    if(el.matches('button[class*="_root_5xqiy_"]')&&el.closest('[class*="_root_saz1a_"]')){openBetForm(el);return;}
    // Crypto-live Up / Down open the event page of a 5-minute market, which rotates and is not captured.
    if(el.matches('button[class*="_root_14bu9_"]')){notice('This page has not been captured yet.');return;}
    // "Show more" on list pages: reveal the cards the reference loads next, then drop the progress block.
    const more=el.closest('[data-local-show-more]');
    if(more&&id==='progress-button'){$$('[data-local-more]').forEach(n=>n.removeAttribute('hidden'));more.remove();document.body.dataset.localExpanded='';return;}
    if(pageName.startsWith('tournament-')&&tournamentData()){
      if(text==='Rules'){openTournamentRules();return;}
      if(text.startsWith('Show all')&&el.closest('[class*="leaderboard"]')){openTournamentDialog(tournamentDialog('leaderboard'),'tournament-leaderboard');return;}
      if(id==='progress-button'&&el.closest('[class*="games-list_root"]')){
        const grid=$('[class*="games-list_games"]',el.closest('[class*="games-list_root"]'));
        if(grid){
          const step=Number(grid.dataset.localGameStep||grid.querySelectorAll(':scope > a').length)||1;
          grid.dataset.localGameStep=String(step);
          const have=new Set([...grid.querySelectorAll(':scope > a')].map(a=>a.dataset.referenceHref));
          const fresh=tournamentNodes(tournamentData().games).filter(a=>a.dataset.referenceHref&&!have.has(a.dataset.referenceHref));
          fresh.slice(0,step).forEach(a=>grid.append(a));
          const progress=el.closest('[class*="games-list_progress"]');
          if(fresh.length<=step)progress?.remove();
          else{const label=$('[data-testid="progress-text"]',progress);if(label)label.textContent='Games shown: '+grid.querySelectorAll(':scope > a').length+' out of '+(have.size+fresh.length);}
        }
        return;
      }
    }
    // Tournaments: All / Exclusive / From providers filter the cards in place (URL unchanged on the reference).
    if(pageName==='tournaments'&&/^(All|Exclusive|From providers)$/.test(text)&&$('[data-local-group]')){
      const tabs=$$('button[class*="tab_root-"]').filter(b=>/^(All|Exclusive|From providers)$/.test(b.textContent.trim()));
      const selected=[...new Set(tabs.flatMap(b=>[...b.classList].filter(c=>c.includes('_selected'))))];
      tabs.forEach(b=>selected.forEach(c=>b.classList.toggle(c,b===el)));
      const group=text==='Exclusive'?'exclusive':text==='From providers'?'providers':'';
      const expanded=document.body.hasAttribute('data-local-expanded');
      $$('[data-local-group]').forEach(card=>{const show=group?card.dataset.localGroup.split(' ').includes(group):(expanded||!card.hasAttribute('data-local-more'));card.hidden=!show;});
      const block=$('[data-local-show-more]');if(block)block.hidden=!!group;
      return;
    }
    const slip=el.closest('[data-scope="Betslip"]');
    if(slip){
      const label=el.textContent.trim();
      if(/^(Single|Multiple|Series)$/.test(label)){
        const tabs=$$('button',el.parentElement),current=tabs.find(b=>[...b.classList].some(c=>c.includes('_selected_')));
        const selected=[...(current?.classList||[])].filter(c=>c.includes('_selected_'));
        tabs.forEach(b=>selected.forEach(c=>b.classList.remove(c)));selected.forEach(c=>el.classList.add(c));
        return;
      }
      if(!label&&el.closest('[class*="_header_103u2_"]')){betslip=[];saveBetslip();renderBetslip();return;}
      if(label==='Place a bet'||label==='View bet'){e.preventDefault();return openModal('login',el);}
      if(label==='MAX')return;
    }
    // Sports filter chips (Top, Football, CS2 …) are routes on the reference: /betting/live/football-18 etc.
    if(el.matches('button[class*="_button_1xp0b_"]')){
      const routes=window.PROJECT_ROUTES||{},section=sportSection();
      const label=$('[class*="_text_1xp0b_"]',el)?.textContent.trim();
      const route=section&&label&&routes.sportFilters?.[section]?.[label];
      if(route){const file=pages[route];if(file&&file!==pageName+'.html')go(file);else if(!file)notice('This filter has not been captured yet.');}
      return;
    }
    const presetNav=el.closest('[class*="casino-preset-navigation_root"]');
    if(presetNav&&el.matches('button')){
      // Lobby / Live Casino / Quick games -> /casino, /casino/live-games, /casino/fast-games.
      const target=['casino.html','casino-live.html','casino-quick.html'][$$('button',presetNav).indexOf(el)];
      if(target&&target!==pageName+'.html')go(target);
      return;
    }
    if(id.startsWith('categories-qabs-qab-')){
      const file=categoryFile(id.replace('categories-qabs-qab-',''));
      if(file)return go(file);
      const label=text.toLowerCase(),section=$$('[class*="games-section_root"]').find(n=>n.textContent.toLowerCase().includes(label));
      if(section){section.scrollIntoView({behavior:scrollBehavior(),block:'start'});return;}
      notice('This category has not been captured yet.');return;
    }
    const scrollArrow=el.closest('[class*="arrows-scroll-view_scrollBackButton"],[class*="arrows-scroll-view_scrollForwardButton"]');
    if(scrollArrow){
      const list=scrollViewList(scrollArrow.parentElement);
      if(list)list.scrollBy({left:(scrollArrow.className.includes('scrollBackButton')?-1:1)*list.clientWidth,behavior:scrollBehavior()});
      return;
    }
    if(el.querySelector('[data-icon="arrow-back"],[data-icon="arrow-forward"]')){
      const section=el.closest('[class*="games-section_root"]');const grid=section&&$('[class*="games-grid_carousel"],[class*="tournaments"]',section);
      // Reference sliders page three cards per click (401px at 1440: 3 x (129.5 card + 4 gap)).
      const card=grid?.firstElementChild,gap=grid&&parseFloat(getComputedStyle(grid).columnGap)||0;
      const step=card?3*(card.getBoundingClientRect().width+gap):grid?.clientWidth*.8;
      if(grid){grid.scrollBy({left:(el.querySelector('[data-icon="arrow-back"]')?-1:1)*step,behavior:scrollBehavior()});return;}
    }
    if(el.className.includes('game-slider-see-more')){go(rowCategory(el)||'casino.html');return;}
    if(text==='All'&&el.closest('[class*="games-section"]')){go('tournaments.html');return;}
    if(id==='footer-partners-links-commercial-copy'){const contact=$$('[class*="footer-partners"] a').find(a=>a.textContent.includes('@'))?.textContent.trim()||'business@1win.social';navigator.clipboard?.writeText(contact).then(()=>notice('Copied')).catch(()=>{});return;}
    if(id==='signUpFast-form-currency')return openSignupCurrency();
    if(id==='local-signup-currency')return chooseSignupCurrency(el);
    if(id.includes('datePickerButton')){const input=$('input[type="date"]',el.closest('form'));if(input?.showPicker)input.showPicker();return;}
    if(id.includes('socialButton')||id.includes('chooseRegion')||id.includes('currency')||id.includes('app-')||id.includes('support')||text==='Install'||text==='Contact support')notice('Available in the original service.');
  });
  function updateFieldAppearance(input,focused=document.activeElement===input) {
    const root=input.closest('[class*="base-field_root"]');if(!root)return;
    const rootClass=root.className.split(' ').find(c=>c.startsWith('base-field_root-'));if(!rootClass)return;
    root.classList.toggle(rootClass.replace('_root-','_filled-'),Boolean(input.value));
    root.classList.toggle(rootClass.replace('_root-','_focused-'),focused);
  }
  // Phone fields work like the reference mask: the value starts as "+60", digits are grouped as typed
  // ("+60 12 345 6789") and the placeholder only shows the zeros still missing (typed part kept invisible).
  const isPhone=n=>n?.matches?.('input.mask-input_input-GDetI[type="tel"]');
  function phoneMask(input){
    if(input.dataset.localMask)return input.dataset.localMask;
    const ph=input.parentElement?.querySelector('[class*="control_placeholder"]');
    const mask=(ph?.textContent||'+60 00 000 0000').replace(/\u00a0/g,' ').trim();
    input.dataset.localMask=mask;return mask;
  }
  const phoneCode=input=>(phoneMask(input).match(/^\+\d+/)||['+60'])[0];
  const phoneSlots=input=>(phoneMask(input).replace(/^\+\d+/,'').match(/0/g)||[]).length;
  const phoneNational=input=>{const code=phoneCode(input).slice(1);let d=input.value.replace(/\D/g,'');
    if(input.value.trim().startsWith('+')&&d.startsWith(code))d=d.slice(code.length);
    // Typing or pasting the country code again ("+60 12…" into "+60") would push the number past the mask.
    if(d.length>phoneSlots(input)&&d.startsWith(code))d=d.slice(code.length);
    return d;};
  const phoneComplete=input=>phoneNational(input).length>=phoneSlots(input);
  // A "+" typed after the prefix starts the number again: the country code digits that follow are held back
  // (dataset.localRetype) instead of landing in the number, so "+60123…" typed into "+60" gives "+60 12 3…".
  function retypePhone(input,code){
    const raw=input.value,digitsOf=t=>t.replace(/\D/g,''),cd=code.slice(1);
    const plus=raw.indexOf('+',1);
    if(plus>0){
      const seg=raw.slice(raw.lastIndexOf('+')),sd=digitsOf(seg);
      if(sd.length<cd.length&&cd.startsWith(sd)){input.dataset.localRetype=sd;input.value=code;return;}
      delete input.dataset.localRetype;input.value=seg;return;
    }
    if(input.dataset.localRetype===undefined)return;
    const typed=digitsOf(raw.startsWith(code)?raw.slice(code.length):raw),all=input.dataset.localRetype+typed;
    if(all.length<cd.length&&cd.startsWith(all)){input.dataset.localRetype=all;input.value=code;return;}
    delete input.dataset.localRetype;
    input.value=all.startsWith(cd)?code+all.slice(cd.length):code+typed;
  }
  function formatPhone(input){
    const mask=phoneMask(input),code=phoneCode(input);
    retypePhone(input,code);
    const digits=phoneNational(input).slice(0,phoneSlots(input));
    let out=code,k=0;
    for(const ch of mask.slice(code.length)){if(k>=digits.length)break;out+=ch==='0'?digits[k++]:ch;}
    input.value=out;
    const ph=input.parentElement?.querySelector('[class*="control_placeholder"]');
    if(ph){const hidden=document.createElement('span');hidden.className=[...(ph.querySelector('span')?.classList||['control_hiddenPlaceholder-5SZBQ'])].join(' ');hidden.textContent=out.replace(/ /g,'\u00a0');ph.replaceChildren(hidden,document.createTextNode(mask.slice(out.length).replace(/ /g,'\u00a0')));}
    try{input.setSelectionRange(out.length,out.length);}catch{}
  }
  function initPhoneFields(root=document){$$('input.mask-input_input-GDetI[type="tel"]',root).forEach(input=>{phoneMask(input);if(!input.value)formatPhone(input);});}
  // Field errors as on the reference: shown when the field is left with an invalid value, cleared once it is valid.
  const FIELD_ERRORS={tel:'Make sure your phone number is correct',email:'Make sure your email is correct'};
  const fieldValid=input=>input.type==='tel'?phoneComplete(input):input.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()):input.type==='password'?input.value.length>=8:true;
  function showFieldState(input,showError){
    const wrap=input.closest('[class*="field-wrapper_root"]');if(!wrap)return;
    const rootCls=[...wrap.classList].find(c=>c.startsWith('field-wrapper_root-'));if(!rootCls)return;
    const errCls=rootCls.replace('_root-','_status-error-');
    const empty=input.type==='tel'?!phoneNational(input):!input.value;
    const bad=showError&&!empty&&!fieldValid(input);
    wrap.classList.toggle(errCls,bad);
    if(input.type==='password'){
      const req=$('[class*="password-requirements_item"]',wrap);
      if(req){const base=[...req.classList].find(c=>c.startsWith('password-requirements_item-'));const hash=base?.split('-').pop();
        ['default','error','validated'].forEach(st=>req.classList.remove('password-requirements_status-'+st+'-'+hash));
        req.classList.add('password-requirements_status-'+(fieldValid(input)?'validated':bad?'error':'default')+'-'+hash);}
      return;
    }
    const id=(input.dataset.testid||'field')+'-error';let hint=wrap.querySelector('[data-testid="'+id+'"]');
    if(bad&&!hint&&FIELD_ERRORS[input.type]){hint=document.createElement('div');hint.className='hint_root-SEpY1 hint_variant-error-SEpY1';hint.dataset.testid=id;hint.innerHTML='<div class="custom-html_root-jGMem">'+FIELD_ERRORS[input.type]+'</div>';wrap.append(hint);}
    if(!bad)hint?.remove();
  }
  function updateForm(input) {
    updateFieldAppearance(input);
    const form=input.closest('form');if(!form)return;
    const submit=$('[data-testid$="form-submit"]',form);if(!submit)return;
    const email=$('input[type="email"]',form),phone=$('input[type="tel"]',form),password=$('input[type="password"]',form),agree=$('[data-testid$="form-agree"]',form);
    const valid=(!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))&&(!phone||phoneComplete(phone))&&(!password||password.value.length>=8)&&(!agree||agree.checked);
    submit.disabled=!valid;
  }
  const betInput=n=>n.matches?.('[data-local-bet-form] input');
  document.addEventListener('input',e=>{if(isPhone(e.target))formatPhone(e.target);if(e.target.closest?.('form')&&e.target.matches('input[type="tel"],input[type="email"],input[type="password"]'))showFieldState(e.target,e.target.closest('[class*="field-wrapper_root"]')?.className.includes('_status-error-'));});
  document.addEventListener('focusout',e=>{if(e.target.closest?.('form')&&e.target.matches('input[type="tel"],input[type="email"],input[type="password"]'))showFieldState(e.target,true);});
  document.addEventListener('keydown',e=>{if(isPhone(e.target)&&e.key==='Backspace'&&e.target.value.length<=phoneCode(e.target).length)e.preventDefault();});
  document.addEventListener('input',e=>{if(e.target.dataset.testid==='local-signup-currency-search')filterSignupCurrencies(e.target);if(e.target.dataset.testid==='casino-search-input')searchResults(e.target.value);if(betInput(e.target))typeBetAmount(e.target);updateForm(e.target);});
  document.addEventListener('change',e=>updateForm(e.target));
  document.addEventListener('focusin',e=>{if(betInput(e.target)&&!+e.target.closest('[data-local-bet-form]').dataset.amount)e.target.value='';if(e.target.matches('input'))updateFieldAppearance(e.target,true);});
  document.addEventListener('focusout',e=>{if(betInput(e.target)){const form=e.target.closest('[data-local-bet-form]');setBetAmount(form,+form.dataset.amount||0);}if(e.target.matches('input'))updateFieldAppearance(e.target,false);});
  function fieldError(input,message){
    if(!input){notice(message);return;}
    input.setCustomValidity(message);input.reportValidity();input.focus({preventScroll:true});
    input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});
    if(input.type==='checkbox')input.addEventListener('change',()=>input.setCustomValidity(''),{once:true});
  }
  const regionCode=form=>(($('[data-testid$="chooseRegionButton"]',form)?.textContent||'').match(/\+\d+/)||['+60'])[0].slice(1);
  function startSession(account,message){
    setSession(account.id);closeModal(true);
    if(!signedPreview)togglePreview();else render(currentPage,null,true);
    notice(message);
  }
  async function registerAccount(form){
    const phoneIn=$('input[type="tel"]',form),emailIn=$('input[type="email"]',form),passIn=$('input[type="password"]',form),agree=$('[data-testid$="form-agree"]',form);
    const digits=phoneIn?phoneNational(phoneIn):'',email=(emailIn?.value||'').trim().toLowerCase(),password=passIn?.value||'';
    if(phoneIn&&!phoneComplete(phoneIn))return fieldError(phoneIn,'Make sure your phone number is correct');
    if(emailIn&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fieldError(emailIn,'Enter a valid email.');
    if(password.length<8)return fieldError(passIn,'At least 8 characters.');
    if(agree&&!agree.checked)return fieldError(agree,'Accept the User Agreement to continue.');
    const phone=digits?regionCode(form)+digits:'',list=readAccounts();
    if(email&&list.some(a=>a.email===email))return fieldError(emailIn,'An account with this email already exists. Log in instead.');
    if(phone&&list.some(a=>a.phone===phone))return fieldError(phoneIn,'An account with this phone number already exists. Log in instead.');
    let id;do{id=String(10000000+Math.floor(Math.random()*90000000));}while(list.some(a=>a.id===id));
    const salt=[...crypto.getRandomValues(new Uint8Array(12))].map(b=>b.toString(16).padStart(2,'0')).join('');
    const promo=$('[data-testid="signUpFast-form-promocode"]',form)?.value.trim()||'';
    const currency=(registrationCurrencyButton()?.textContent||'Malaysian ringgit').trim();
    const account={id,phone,email,currency,promo,salt,hash:await hashPassword(password,salt),createdAt:new Date().toISOString()};
    list.push(account);
    if(!writeAccounts(list))return notice('This browser blocked saving the account (site storage is turned off).');
    startSession(account,'Account created. You are logged in.');
  }
  async function loginAccount(form){
    const phoneIn=$('input[type="tel"]',form),emailIn=$('input[type="email"]',form),passIn=$('input[type="password"]',form);
    const list=readAccounts(),login=emailIn||phoneIn;let account=null;
    if(emailIn){const email=emailIn.value.trim().toLowerCase();account=list.find(a=>a.email===email);}
    else if(phoneIn){const digits=phoneNational(phoneIn),full=regionCode(form)+digits;account=list.find(a=>a.phone===full)||(digits.length>=8?list.find(a=>a.phone.endsWith(digits)):null);}
    if(!account)return fieldError(login,'No account found. Register first.');
    if(account.hash!==await hashPassword(passIn?.value||'',account.salt))return fieldError(passIn,'Incorrect password.');
    startSession(account,'You are logged in.');
  }
  document.addEventListener('submit',e=>{
    e.preventDefault();
    const inputs=$$('input',e.target).filter(n=>!['checkbox','radio','hidden','date'].includes(n.type)&&n.getClientRects().length&&n.dataset.testid!=='signUpFast-form-promocode');
    const first=inputs.find(n=>!n.value.trim());
    if(first){first.setCustomValidity('Please complete this field.');first.reportValidity();first.addEventListener('input',()=>first.setCustomValidity(''),{once:true});return;}
    const kind=($('[data-testid$="form-submit"]',e.target)?.dataset.testid||'');
    if(kind.startsWith('signUpFast'))return void registerAccount(e.target);
    if(kind.startsWith('signIn'))return void loginAccount(e.target);
    notice('Password recovery is not available in this local copy.');
  });
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-testid="sidebar-social-buttons-with-preview"]')){
      e.preventDefault();toggleSidebarSocial(e.target);return;
    }
    if(e.key==='Escape'&&$('[data-sidebar-social-popover]')){closeSidebarSocial(true);return;}
    if(e.key==='Escape'&&$('[data-local-language-popover]')){closeLanguagePicker();return;}
    if((e.key==='Enter'||e.key===' ')&&pageAccordionHeading(e.target)){
      e.preventDefault();toggleFaq(e.target);return;
    }
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-testid="casino-group-toggle"],[data-testid="betting-group-toggle"],[data-testid="markets-toggle"],[data-testid="betwave-toggle"],[data-testid="casino-lobby-toggle"],[data-testid="casino-live-toggle"],[data-testid="casino-fast-toggle"],[data-testid="casino-brand-toggle"]')){
      e.preventDefault();e.target.click();return;
    }
    if(e.altKey&&e.key.toLowerCase()==='p'){e.preventDefault();togglePreview();return;}
    if(e.key==='Escape'&&$('[data-local-modal="signup-currency"]')){closeSignupCurrency();return;}
    if(e.key==='Escape'){closeModal();toggleMenu(false);}
    if(e.key==='Tab'&&(modal||$('[data-local-modal="signup-currency"]'))){const root=$('[data-local-modal="signup-currency"]')||openLayout();const items=root&&$$('button:not(:disabled),input:not([type="hidden"]),a',root).filter(n=>n.getClientRects().length);if(items?.length){const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
  });
  let swipeX=null;
  document.addEventListener('touchstart',e=>{if(e.target.closest('[data-testid="banner-main-container"]'))swipeX=e.touches[0].clientX;},{passive:true});
  document.addEventListener('touchend',e=>{if(swipeX!==null){const d=e.changedTouches[0].clientX-swipeX;if(Math.abs(d)>45)slide(d<0?1:-1);swipeX=null;}},{passive:true});
  function adaptToViewport() {
    const key=keyFor(currentPage);
    if(key===currentKey){fitBanners();positionSidebarSocial();const langBtn=test('language-picker-button');if($('[data-local-language-popover]')&&langBtn)positionAnchoredPopover($('[data-local-language-popover]'),langBtn);return;}
    const kind=modal,dialog=openLayout(),currencyOpen=!!$('[data-local-modal="signup-currency"]');
    const fields=dialog?$$('input',dialog).map((input,index)=>({id:input.dataset.testid,index,type:input.type,value:input.value,checked:input.checked})):[];
    const focusedId=document.activeElement?.dataset.testid;
    const faqOpen=$$('[class*="accordion-heading_root-"][aria-expanded="true"]').filter(pageAccordionHeading).map(n=>n.textContent.trim());
    const faqFocused=pageAccordionHeading(document.activeElement)?document.activeElement.textContent.trim():null;
    const seoOpen=$$('[class*="seo_root-"]').map(root=>root.className.includes('seo_expanded-'));
    const seoFocused=document.activeElement?.matches('[class*="seo_button-"]')?$$('[class*="seo_button-"]').indexOf(document.activeElement):-1;
    const bet=$('[data-local-bet-form]'),betOpen=bet&&{question:bet.dataset.question,side:bet.dataset.side,amount:+bet.dataset.amount||0};
    render(currentPage,null,true);
    if(betOpen){
      const button=$$('[class*="_root_saz1a_"] button[class*="_root_5xqiy_"]').find(b=>$('[class*="_name_5xqiy_"]',b)?.textContent.trim()===betOpen.side&&$('[class*="_clamp_ftmva_"]',b.closest('[class*="_root_ftmva_"]')||b)?.textContent.trim()===betOpen.question);
      if(button)openBetForm(button,betOpen.amount);
    }
    $$('[class*="seo_root-"] [class*="seo_button-"]').forEach((button,index)=>{
      if(seoOpen[index]&&button.getAttribute('aria-expanded')!=='true')toggleSeo(button);
      if(seoFocused===index)button.focus({preventScroll:true});
    });
    $$('[class*="accordion-heading_root-"]').filter(pageAccordionHeading).forEach(heading=>{
      if(faqOpen.includes(heading.textContent.trim())&&heading.getAttribute('aria-expanded')!=='true')toggleFaq(heading);
      if(faqFocused===heading.textContent.trim())heading.focus({preventScroll:true});
    });
    if(kind==='tournament-rules'||kind==='tournament-leaderboard'){openTournamentDialog(tournamentDialog(kind==='tournament-rules'?'rules':'leaderboard'),kind);return;}
    if(kind&&kind!=='search'){
      openModal(kind);
      const inputs=$$('input',openLayout());
      fields.forEach(field=>{
        const input=inputs.find(i=>field.id&&i.dataset.testid===field.id)||(inputs[field.index]?.type===field.type?inputs[field.index]:null);
        if(input){input.value=field.value;input.checked=field.checked;updateForm(input);}
      });
      inputs.find(i=>focusedId&&i.dataset.testid===focusedId)?.focus({preventScroll:true});
      paintSignupCurrency();
      if(currencyOpen)openSignupCurrency();
    }
  }
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(adaptToViewport,150);});
  const initialModal=document.body.dataset.initialModal;
  if(signedPreview||keyFor(currentPage)!==currentKey)render(currentPage);else{hydrate();fillGamePage();}
  if(initialModal)openModal(initialModal);
  else if(openLayout()){modal='search';document.body.style.overflow='hidden';const root=openLayout();root.dataset.localModal='search';motion?.modal(root);}
  window.SHARED_UI?.ready();
  if(modal==='search')focusSearch();
})();

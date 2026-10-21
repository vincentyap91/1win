/* Local forum preview. No accounts, posts, or requests to the live forum. */
(() => {
  'use strict';

  let noteTimer = 0;

  function note(text) {
    let el = document.querySelector('[data-forum-note]');
    if (!el) {
      el = document.createElement('p');
      el.dataset.forumNote = '';
      el.className = 'forum-preview-note';
      el.setAttribute('role', 'status');
      document.body.append(el);
    }
    el.textContent = text;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => el.remove(), 3200);
  }

  function closeMenus(except) {
    if (except !== 'signin') document.getElementById('elUserSignIn_menu')?.classList.add('ipsHide');
    if (except !== 'signin') document.getElementById('elUserSignIn_menu')?.classList.remove('forum-open');
    if (except !== 'more') {
      document.getElementById('elNavigationMore_more_dropdown_menu')?.classList.remove('forum-open');
      document.querySelector('#elNavigationMore .ipsNavBar_secondary')?.classList.remove('forum-open');
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('elMobileDrawer');
    drawer?.classList.add('ipsHide');
    drawer?.classList.remove('forum-open');
    document.body.classList.remove('forum-drawer-open');
  }

  document.querySelector('[data-ipsdrawer], [data-ipsDrawer]')?.addEventListener('click', event => {
    event.preventDefault();
    const drawer = document.getElementById('elMobileDrawer');
    if (!drawer) return;
    drawer.classList.remove('ipsHide');
    drawer.classList.add('forum-open');
    document.body.classList.add('forum-drawer-open');
  });

  document.querySelector('#elMobileDrawer [data-action="close"]')?.addEventListener('click', event => {
    event.preventDefault();
    closeDrawer();
  });

  document.getElementById('elMobileDrawer')?.addEventListener('click', event => {
    if (event.target.id === 'elMobileDrawer') closeDrawer();
  });

  const signIn = document.getElementById('elUserSignIn');
  const signMenu = document.getElementById('elUserSignIn_menu');
  signIn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const open = signMenu.classList.contains('ipsHide');
    closeMenus();
    signMenu.classList.toggle('ipsHide', !open);
    signMenu.classList.toggle('forum-open', open);
  });

  document.querySelectorAll('[data-action="toggleCategory"]').forEach(toggle => {
    toggle.addEventListener('click', event => {
      event.preventDefault();
      toggle.closest('.cForumRow, li')?.classList.toggle('forum-collapsed');
    });
  });

  function fitMore() {
    const bar = document.getElementById('yt__acme_nav__primary');
    const more = document.getElementById('elNavigationMore');
    const menu = document.getElementById('elNavigationMore_more_dropdown_menu');
    if (!bar || !more || !menu || bar.clientWidth === 0) return;
    [...menu.children].forEach(node => {
      if (node.matches?.('li[data-role="navBarItem"]')) bar.insertBefore(node, more);
    });
    more.classList.add('ipsHide');
    menu.classList.remove('forum-open');
    const items = [...bar.querySelectorAll(':scope > li[data-role="navBarItem"]')];
    while (bar.scrollWidth > bar.clientWidth + 1 && items.length > 1) {
      menu.prepend(items.pop());
      more.classList.remove('ipsHide');
    }
  }

  document.getElementById('elNavigationMore_dropdown')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById('elNavigationMore_more_dropdown_menu');
    const wrap = document.querySelector('#elNavigationMore .ipsNavBar_secondary');
    const open = !menu.classList.contains('forum-open');
    closeMenus();
    menu.classList.toggle('forum-open', open);
    wrap?.classList.toggle('ipsHide', !open);
    wrap?.classList.toggle('forum-open', open);
  });

  document.querySelectorAll('.ipsCarousel').forEach(carousel => {
    const items = [...carousel.querySelectorAll('.ipsCarousel_item')];
    if (items.length < 2) return;
    carousel.classList.add('forum-ready');
    let index = 0;
    const show = next => {
      index = (next + items.length) % items.length;
      items.forEach((item, i) => item.classList.toggle('forum-active', i === index));
    };
    show(0);
    carousel.querySelectorAll('.ipsCarousel_nav').forEach(nav => {
      nav.classList.remove('ipsHide');
      nav.addEventListener('click', event => {
        event.preventDefault();
        show(index + (nav.dataset.action === 'prev' ? -1 : 1));
      });
    });
  });

  document.querySelectorAll('.navigation-section_root').forEach(root => {
    root.querySelector('.accordion-heading_root')?.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      root.classList.toggle('active');
    });
  });

  document.querySelectorAll('.tooltip_root').forEach(root => {
    root.querySelector('.tooltip_trigger')?.addEventListener('click', event => {
      event.stopPropagation();
      const on = root.classList.toggle('tooltip_root--active');
      if (on) document.querySelectorAll('.tooltip_root--active').forEach(other => { if (other !== root) other.classList.remove('tooltip_root--active'); });
    });
    root.querySelector('.tooltip__close')?.addEventListener('click', event => {
      event.stopPropagation();
      root.classList.remove('tooltip_root--active');
    });
  });

  const up = document.getElementById('yt__acme_goup');
  if (up) {
    const sync = () => up.classList.toggle('show', scrollY > 300);
    addEventListener('scroll', sync, {passive: true});
    sync();
    up.addEventListener('click', () => scrollTo({top: 0, behavior: 'smooth'}));
  }

  document.addEventListener('click', event => {
    const skipped = event.target.closest('a[data-local-skip]');
    if (skipped) {
      event.preventDefault();
      const kind = skipped.dataset.localSkip;
      note(kind === 'profile' ? 'Member profiles are not part of this preview.'
        : kind === 'page' ? 'Later pages are not part of this preview.'
        : 'That page is not part of this preview.');
      return;
    }
    if (!event.target.closest('#elSignInLink, #elNavigationMore, .tooltip_root')) closeMenus();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeMenus();
    closeDrawer();
    document.querySelectorAll('.tooltip_root--active').forEach(n => n.classList.remove('tooltip_root--active'));
  });

  document.addEventListener('submit', event => {
    event.preventDefault();
    const search = event.target.querySelector('input[type="search"], #elSearchField');
    note(search ? 'Search stays in this preview and does not query the live forum.' : 'This preview does not sign in, register, or post.');
  }, true);

  fitMore();
  addEventListener('resize', fitMore);
})();

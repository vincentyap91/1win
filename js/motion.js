/* Motion for the local design preview. No network, account or payment actions. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const curves = {
    out: 'cubic-bezier(0.23, 1, 0.32, 1)',
    move: 'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)'
  };
  const playing = new WeakMap(), active = new Set();
  let keyboard = false;
  document.addEventListener('pointerdown', () => {
    keyboard = false; root.dataset.inputMode = 'pointer';
  }, {capture: true, passive: true});
  document.addEventListener('keydown', () => {
    keyboard = true; root.dataset.inputMode = 'keyboard';
  }, {capture: true});
  const easing = name => getComputedStyle(root).getPropertyValue(
    name === 'move' ? '--ease-in-out' : name === 'drawer' ? '--ease-drawer' : '--ease-out'
  ).trim() || curves[name];
  function run(element, frames, duration, curve, label) {
    if (!element || !element.animate) return Promise.resolve();
    const previous = playing.get(element);
    if (keyboard) { previous?.cancel(); return Promise.resolve(); }
    if (previous) {
      const current = getComputedStyle(element);
      frames[0] = {...frames[0], opacity: current.opacity, transform: current.transform};
      previous.cancel();
    }
    if (reduce.matches) {
      frames = frames.map(frame => ({opacity: frame.opacity ?? 1}));
      duration = 125;
    }
    const animation = element.animate(frames, {duration, easing: easing(curve), fill: 'none'});
    playing.set(element, animation); active.add(animation);
    document.body.dataset.lastMotion = label;
    document.body.dataset.motionDuration = String(duration);
    document.body.dataset.motionCount = String(Number(document.body.dataset.motionCount || 0) + 1);
    return animation.finished.catch(() => {}).then(() => {
      active.delete(animation);
      if (playing.get(element) === animation) playing.delete(element);
    });
  }
  function modalElements(container) {
    const sheet = innerWidth < 640;
    const visible = selector => [...(container?.querySelectorAll(selector) || [])].find(n=>n.getBoundingClientRect().width>0 && n.getBoundingClientRect().height>0);
    return {
      card: visible(sheet?'[class*="mobile-modal_modal"],[class*="mobile-modal_card"],[class*="mobile-modal_content"]':'[class*="desktop-modal_card"]') || visible('[class*="desktop-modal_card"]'),
      backdrop: visible(sheet?'[class*="mobile-modal_backdrop"]':'[class*="desktop-modal_backdrop"]') || visible('[class*="desktop-modal_backdrop"]')
    };
  }
  function modal(container, closing = false) {
    const {card, backdrop} = modalElements(container);
    const base = card ? card.dataset.motionBase || getComputedStyle(card).transform : 'none';
    if (card) card.dataset.motionBase = base;
    const transform = base === 'none' ? '' : base;
    const sheet = innerWidth < 640;
    const hidden = sheet ? `${transform} translateY(100%)` : `${transform} scale(0.96)`;
    const shown = transform || 'none';
    const ends = [{opacity: 0, transform: hidden}, {opacity: 1, transform: shown}];
    const fade = [{opacity: 0}, {opacity: 1}];
    if (closing) {ends.reverse(); fade.reverse();}
    return Promise.all([
      run(card, ends, 250, sheet ? 'drawer' : 'out', closing ? 'modal-exit' : 'modal-enter'),
      run(backdrop, fade, 250, 'out', closing ? 'backdrop-exit' : 'backdrop-enter')
    ]);
  }
  function drawer(element, opening, interrupted = false) {
    if (!element) return Promise.resolve();
    const current = getComputedStyle(element).transform;
    const from = interrupted ? current : opening ? 'translateX(-100%)' : 'translateX(0)';
    return run(element, [{transform: from, opacity: 1},
      {transform: opening ? 'translateX(0)' : 'translateX(-100%)', opacity: 1}],
    250, 'drawer', opening ? 'drawer-enter' : 'drawer-exit');
  }
  function accordion(element, opened, previousHeight) {
    if (!element || keyboard || reduce.matches || !element.animate) return;
    const current = previousHeight ?? element.getBoundingClientRect().height;
    const end = opened ? element.scrollHeight : 0;
    playing.get(element)?.cancel();
    const animation = element.animate([{height: `${current}px`, opacity: opened ? 0 : 1},
      {height: `${end}px`, opacity: opened ? 1 : 0}],
    {duration: 200, easing: easing('out')});
    playing.set(element, animation); active.add(animation);
    animation.finished.catch(() => {}).then(() => {
      active.delete(animation);
      if (playing.get(element) === animation) playing.delete(element);
    });
  }
  function toast(element, closing = false) {
    if (!element) return Promise.resolve();
    if (closing) element.dataset.noticeState = 'closing';
    else {
      if (!element.dataset.noticeState) element.dataset.noticeState = 'preparing';
      requestAnimationFrame(() => {if (element.isConnected) element.dataset.noticeState = 'open';});
    }
    if (keyboard) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, reduce.matches ? 125 : 200));
  }
  reduce.addEventListener('change', () => {
    if (reduce.matches) for (const animation of active) animation.cancel();
  });
  window.PREVIEW_MOTION = {
    modal, drawer, accordion, toast,
    reduced: () => reduce.matches,
    instant: () => keyboard,
    easing
  };
})();

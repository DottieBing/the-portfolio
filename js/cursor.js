/* ============================================================
   cursor.js — Custom cursor with lag, stretch & squash
   ============================================================ */
(function () {
  'use strict';

  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth  / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let isVisible = false;

  /* ── MOVE DOT (instant) ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  });

  /* ── RING LOOP (lagged + stretch) ── */
  function ringLoop() {
    const dx = mx - rx;
    const dy = my - ry;

    rx += dx * 0.1;
    ry += dy * 0.1;

    const dist    = Math.sqrt(dx * dx + dy * dy);
    const stretch = Math.min(1 + dist * 0.022, 2.4);
    const angle   = Math.atan2(dy, dx) * (180 / Math.PI);

    ring.style.left      = rx + 'px';
    ring.style.top       = ry + 'px';
    ring.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${stretch}) scaleY(${(1 / stretch) * 0.86})`;

    requestAnimationFrame(ringLoop);
  }
  requestAnimationFrame(ringLoop);

  /* Hide until first mousemove */
  dot.style.opacity  = '0';
  ring.style.opacity = '0';

  /* ── HOVER STATE on interactive elements ── */
  function onEnter() { document.body.classList.add('cursor-hover'); }
  function onLeave() { document.body.classList.remove('cursor-hover'); }

  function bindHover(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
  }
  bindHover('a, button, .proj-card, .nav-logo, .hero-cta');

  /* Re-bind when new elements are added (work cards injected later) */
  const observer = new MutationObserver(() => {
    bindHover('a, button, .proj-card, .nav-logo, .hero-cta');
  });
  observer.observe(document.body, { childList: true, subtree: true });

  /* ── TEXT CURSOR state ── */
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
  });

  /* ── DRAG STATE (exposed globally for work.js) ── */
  window.setCursorDrag  = () => document.body.classList.add('cursor-drag');
  window.unsetCursorDrag = () => document.body.classList.remove('cursor-drag');

})();
/* ============================================================
   lenis.js — Smooth scroll, nav state, shared scroll observer
   ============================================================ */
(function () {
  'use strict';

  /* ── LENIS INIT ── */
  const lenis = new Lenis({
    duration:        1.3,
    easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction:       'vertical',
    gestureDirection:'vertical',
    smooth:          true,
    smoothTouch:     false,
    touchMultiplier: 2,
  });

  /* Expose globally for other modules */
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ── NAV SCROLL STATE ── */
  const nav = document.getElementById('main-nav');
  lenis.on('scroll', ({ scroll }) => {
    if (nav) {
      nav.classList.toggle('scrolled', scroll > 60);
    }
  });

  /* ── ANCHOR LINK SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      }
    });
  });

  /* ── SHARED INTERSECTION OBSERVER ── */
  /* Any element with class .reveal gets .in when it enters viewport */
  const revealObs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  /* Called by each section's JS after injecting its elements */
  window.observeReveal = function (el) {
    if (el) revealObs.observe(el);
  };

  /* ── SITE REVEAL ORCHESTRATION ── */
  /* Called by preloader.js after slam reveal completes */
  window.revealSite = function () {
    /* Nav */
    setTimeout(() => {
      document.querySelector('.nav-logo')?.classList.add('in');
      document.querySelector('.nav-links')?.classList.add('in');
      document.querySelector('.nav-availability')?.classList.add('in');
    }, 100);

    /* Hero elements are fired by hero.js listening for 'site:ready' */
    setTimeout(() => {
      document.dispatchEvent(new Event('site:ready'));
    }, 200);
  };

})();
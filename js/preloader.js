/* ============================================================
   preloader.js — Letter assembly → progress bar → slam reveal
   ============================================================ */
(function () {
  'use strict';

  /* ── CONFIG — change this to your actual name ── */
  const DISPLAY_NAME = 'AYOBAMI BOLADE';

  const preloader   = document.getElementById('preloader');
  const nameWrap    = document.getElementById('name-wrap');
  const loaderFill  = document.getElementById('loader-fill');
  const loaderPct   = document.getElementById('loader-percent');
  const roleEl      = document.getElementById('preloader-role');
  const slamBar     = document.getElementById('slam-bar');
  const site        = document.getElementById('site');

  if (!preloader || !nameWrap) return;

  /* ── BUILD LETTERS ── */
  DISPLAY_NAME.split('').forEach(ch => {
    if (ch === ' ') {
      const sp = document.createElement('span');
      sp.className = 'loader-space';
      nameWrap.appendChild(sp);
    } else {
      const s = document.createElement('span');
      s.className = 'loader-letter';
      s.textContent = ch;
      nameWrap.appendChild(s);
    }
  });

  const letters = nameWrap.querySelectorAll('.loader-letter');

  /* ── STEP 1: Letters animate in (staggered) ── */
  letters.forEach((l, i) => {
    setTimeout(() => {
      l.style.transition = `transform 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.65s cubic-bezier(0.16,1,0.3,1)`;
      l.style.transform  = 'translateY(0) rotateX(0deg)';
      l.style.opacity    = '1';
    }, 180 + i * 65);
  });

  /* ── STEP 2: Role tagline + progress bar ── */
  const taglineDelay = 180 + letters.length * 65 + 200;
  setTimeout(() => {
    roleEl.classList.add('visible');
    runProgressBar();
  }, taglineDelay);

  /* ── PROGRESS BAR ── */
  let progress  = 0;
  let barInterval = null;

  function runProgressBar() {
    barInterval = setInterval(() => {
      const increment = Math.random() * 3.5 + 0.8;
      progress = Math.min(progress + increment, 100);

      loaderFill.style.width    = progress + '%';
      loaderPct.textContent     = Math.floor(progress) + '%';

      if (progress >= 100) {
        clearInterval(barInterval);
        loaderPct.textContent = '100%';
        setTimeout(beginReveal, 380);
      }
    }, 38);
  }

  /* ── STEP 3: SLAM REVEAL ── */
  function beginReveal() {
    preloader.classList.add('is-leaving');

    /* Letters collapse */
    letters.forEach((l, i) => {
      setTimeout(() => {
        l.style.transition = 'transform 0.32s cubic-bezier(0.77,0,0.18,1), opacity 0.32s';
        l.style.transform  = 'scaleY(0) translateY(8px)';
        l.style.opacity    = '0.2';
      }, i * 16);
    });

    const collapseTime = letters.length * 16 + 200;

    setTimeout(() => {
      /* Slam bar scales in horizontally */
      slamBar.style.opacity    = '1';
      slamBar.style.transition = 'transform 0.5s cubic-bezier(0.77,0,0.18,1)';
      slamBar.style.transform  = 'scaleX(1)';

      setTimeout(() => {
        /* Bar floods upward — fills entire viewport */
        slamBar.style.transition = 'height 0.48s cubic-bezier(0.77,0,0.18,1), top 0.48s cubic-bezier(0.77,0,0.18,1)';
        slamBar.style.height     = '100vh';
        slamBar.style.top        = '0';

        setTimeout(() => {
          /* Fade out preloader, reveal site */
          preloader.style.transition = 'opacity 0.35s';
          preloader.style.opacity    = '0';

          site.classList.add('is-ready');

          slamBar.style.transition = 'opacity 0.4s';
          slamBar.style.opacity    = '0';

          setTimeout(() => {
            preloader.classList.add('is-gone');
            slamBar.style.display = 'none';

            /* Fire the site reveal sequence */
            if (typeof window.revealSite === 'function') {
              window.revealSite();
            }
          }, 500);
        }, 480);
      }, 520);
    }, collapseTime);
  }

})();
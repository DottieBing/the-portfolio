/* ============================================================
   contact.js — Gravity headline, ambient canvas, form micro-anim,
                submit charge effect, live clock
   ============================================================ */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     AMBIENT CANVAS — time-of-day color temperature
  ────────────────────────────────────────────────────────── */
  const ambCanvas = document.getElementById('ambient-canvas');
  const ambCtx    = ambCanvas?.getContext('2d');

  function resizeAmb() {
    if (!ambCanvas) return;
    ambCanvas.width  = ambCanvas.offsetWidth  || window.innerWidth;
    ambCanvas.height = ambCanvas.offsetHeight || window.innerHeight;
  }
  resizeAmb();
  window.addEventListener('resize', resizeAmb);

  /* Color temperature mapped to hour of day */
  function getAmbientColor() {
    const h = new Date().getHours();
    if (h >= 0  && h <  5) return { r: 12,  g: 9,  b: 5,  label: 'Night'       };
    if (h >= 5  && h < 10) return { r: 18,  g: 11, b: 6,  label: 'Dawn'        };
    if (h >= 10 && h < 16) return { r: 8,   g: 10, b: 14, label: 'Day'         };
    if (h >= 16 && h < 20) return { r: 22,  g: 14, b: 5,  label: 'Golden Hour' };
    return                         { r: 16,  g: 10, b: 4,  label: 'Evening'     };
  }

  let ambT = 0;
  (function ambLoop() {
    if (!ambCtx || !ambCanvas) { requestAnimationFrame(ambLoop); return; }

    ambT += 0.003;
    const { r, g, b } = getAmbientColor();
    const w = ambCanvas.width;
    const h = ambCanvas.height;

    ambCtx.clearRect(0, 0, w, h);

    /* Slowly drifting radial gradient */
    const cx = w * 0.5 + Math.sin(ambT * 0.28) * w * 0.14;
    const cy = h * 0.42 + Math.cos(ambT * 0.22) * h * 0.08;

    const grad = ambCtx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.72);
    grad.addColorStop(0,   `rgba(${r + 10}, ${g + 7}, ${b + 2}, 0.14)`);
    grad.addColorStop(0.5, `rgba(${r},      ${g},     ${b},     0.06)`);
    grad.addColorStop(1,   'rgba(0, 0, 0, 0)');

    ambCtx.fillStyle = grad;
    ambCtx.fillRect(0, 0, w, h);

    requestAnimationFrame(ambLoop);
  })();

  /* ──────────────────────────────────────────────────────────
     GRAVITY HEADLINE — words physically warp toward cursor
  ────────────────────────────────────────────────────────── */
  const headlineWrap = document.getElementById('contact-headline-wrap');
  const gWords       = document.querySelectorAll('.gword');

  let gravMx = window.innerWidth  / 2;
  let gravMy = window.innerHeight / 2;

  document.addEventListener('mousemove', e => {
    gravMx = e.clientX;
    gravMy = e.clientY;
  });

  (function gravLoop() {
    if (!headlineWrap) { requestAnimationFrame(gravLoop); return; }

    const rect = headlineWrap.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = gravMx - cx;
    const dy   = gravMy - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 700;
    const force   = Math.max(0, 1 - dist / maxDist);

    gWords.forEach((word, i) => {
      const wr  = word.getBoundingClientRect();
      const wx  = wr.left + wr.width  / 2 - cx;
      const wy  = wr.top  + wr.height / 2 - cy;
      const depth = 0.055 + i * 0.022;
      const tx  = (dx - wx) * force * depth;
      const ty  = (dy - wy) * force * depth;
      word.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    requestAnimationFrame(gravLoop);
  })();

  /* Scroll-reveal for contact section */
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    const contactObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        /* Eyebrow */
        setTimeout(() => {
          document.querySelector('.contact-eyebrow')?.classList.add('in');
        }, 100);

        /* Gravity words */
        gWords.forEach((w, i) => {
          setTimeout(() => w.classList.add('in'), 250 + i * 130);
        });

        /* Availability row */
        setTimeout(() => {
          document.querySelector('.contact-avail')?.classList.add('in');
        }, 700);

        /* Form */
        setTimeout(() => {
          document.querySelector('.contact-form')?.classList.add('in');
        }, 500);

        contactObs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    contactObs.observe(contactSection);
  }

  /* ──────────────────────────────────────────────────────────
     FORM MICRO-ANIMATIONS
  ────────────────────────────────────────────────────────── */
  const formFields = document.querySelectorAll('.form-field');

  formFields.forEach(field => {
    const input = field.querySelector('.field-input');
    if (!input) return;

    input.addEventListener('focus', () => {
      field.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      field.classList.remove('focused');
      field.classList.toggle('filled', input.value.trim().length > 0);
    });

    input.addEventListener('input', () => {
      field.classList.toggle('filled', input.value.trim().length > 0);
    });
  });

  /* Character counter for textarea */
  const textarea  = document.getElementById('f-message');
  const charCount = document.getElementById('field-charcount');

  textarea?.addEventListener('input', () => {
    if (charCount) {
      charCount.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
    }
  });

  /* ──────────────────────────────────────────────────────────
     SUBMIT BUTTON — CHARGE EFFECT
     Hold mouse over button → it charges like a battery
     Release on mouseup → fires
  ────────────────────────────────────────────────────────── */
  const submitBtn  = document.getElementById('submit-btn');
  const submitFill = document.getElementById('submit-fill');
  const submitText = document.getElementById('submit-text');
  const form       = document.getElementById('contact-form');

  let chargeTimer = null;
  let charged     = false;

  if (submitBtn) {
    submitBtn.addEventListener('mouseenter', () => {
      if (submitBtn.classList.contains('sent')) return;
      chargeTimer = setTimeout(() => {
        submitBtn.classList.add('charging');
        charged = true;
      }, 60);
    });

    submitBtn.addEventListener('mouseleave', () => {
      clearTimeout(chargeTimer);
      if (!submitBtn.classList.contains('sent')) {
        submitBtn.classList.remove('charging');
        charged = false;
      }
    });
  }

  form?.addEventListener('submit', e => {
  e.preventDefault();

  const name    = document.getElementById('f-name')?.value.trim();
  const email   = document.getElementById('f-email')?.value.trim();
  const type    = document.getElementById('f-type')?.value.trim();
  const message = document.getElementById('f-message')?.value.trim();

  if (!name || !email || !type || !message) {
    // Shake empty fields
    [['f-name', name], ['f-email', email], ['f-type', type], ['f-message', message]].forEach(([id, val]) => {
      if (!val) {
        const field = document.getElementById(id)?.closest('.form-field');
        if (field) {
          field.style.transition = 'transform 0.1s';
          field.style.transform  = 'translateX(10px)';
          setTimeout(() => field.style.transform = 'translateX(-6px)', 100);
          setTimeout(() => field.style.transform = 'translateX(4px)',  200);
          setTimeout(() => field.style.transform = 'translateX(0)',    300);
          // Flash the underline red
          const underline = field.querySelector('.field-underline');
          if (underline) {
            underline.style.setProperty('--underline-color', '#ff4444');
            setTimeout(() => underline.style.removeProperty('--underline-color'), 1500);
          }
        }
      }
    });
    return;
  }

  fireSend();
});

  function fireSend() {
  const formData = new FormData(document.getElementById('contact-form'));

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      submitBtn?.classList.add('sent');
      if (submitText) {
        submitText.textContent = 'Sent ✓';
        setTimeout(() => { submitText.textContent = 'Message received'; }, 700);
      }
      /* Clear the form so the typed text no longer shows */
      document.getElementById('contact-form')?.reset();
      formFields.forEach(field => field.classList.remove('filled', 'focused'));
      if (charCount && textarea) {
        charCount.textContent = `0 / ${textarea.maxLength}`;
      }
    } else {
      if (submitText) submitText.textContent = 'Something went wrong. Try again.';
    }
  })
  .catch(() => {
    if (submitText) submitText.textContent = 'Network error. Try again.';
  });
}

  /* ──────────────────────────────────────────────────────────
     FOOTER — staggered link reveal
  ────────────────────────────────────────────────────────── */
  const footer = document.getElementById('site-footer');
  if (footer) {
    const footerObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.footer-link').forEach((link, i) => {
          setTimeout(() => {
            link.style.transition = `opacity 0.6s ${i * 0.06}s, color 0.3s, padding-left 0.35s`;
            link.style.opacity = '0.4';
          }, i * 60);
        });
        footerObs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    footerObs.observe(footer);
  }

})();
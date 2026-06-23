'use strict';
// Pin height — gives scroll distance for all cards
const workEl = document.getElementById('work');
if (workEl) workEl.style.height = `calc(100vh + ${5 * 180}px)`;

/* ============================================================
   work.js — Horizontal drag showcase, card canvases, expand overlay
   ============================================================ */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     PROJECT DATA — replace with your real work
  ────────────────────────────────────────────────────────── */
  const PROJECTS = [
    {
      id:       'obra',
      num:      '01',
      title:    'OBRA',
      image: 'assets/images/obra.jpeg',
      imageFull: 'assets/images/obra-full.jpeg',
      subtitle: 'Brand & Digital',
      tags:     ['Branding', 'Web Design', 'Development', 'Motion'],
      featured: true,
      desc:     'A boutique design studio identity - rebuilt to position Obra as a premium creative agency. Every interaction designed to make potential clients feel they\'ve already found the right partner.',
      year:     '2024',
      role:     'Web Designer + Developer',
      client:   'Obra Studios',
      type:     'Brand + Web',
      palette:  ['#0d0a04', '#1c1500', '#c9a84c'],
      shape:    'diamond',
    },
    {
      id:       'vesper',
      num:      '02',
      title:    'VESPER',
      image: 'assets/images/vesper.jpeg',
      imageFull: 'assets/images/vesper-full.jpeg',
      subtitle: 'Editorial Platform',
      tags:     ['UI/UX', 'Development'],
      featured: true,
      desc:     'An editorial platform redesigned around reading as a ritual. Dark mode first, brutalist typography, scroll-driven narrative - readership up 340% in three months.',
      year:     '2023',
      role:     'Creative Developer',
      client:   'Vesper Magazine',
      type:     'Portfolio + Web',
      palette:  ['#080808', '#1a0808', '#cc4433'],
      shape:    'rings',
    },
    {
      id:       'noor',
      num:      '03',
      title:    'NOOR',
      image: 'assets/images/noor.jpeg',
      imageFull: 'assets/images/noor-full.jpeg',
      subtitle: 'WebGL Experience',
      tags:     ['WebGL', 'Creative Dev', '3D'],
      featured: true,
      desc:     'My own previous portfolio - built to get me in the room. Cinematic scroll animations, GSAP-driven interactions, Three.js neural network hero, and a full project showcase. The site that landed my first international clients.',
      year:     '2024',
      role:     'Creative Developer',
      client:   'Ayobami Bolade',
      type:     'Portfolio + WebGL',
      palette:  ['#04080d', '#001220', '#3399cc'],
      shape:    'fluid',
    },
    {
      id:       'kota',
      num:      '04',
      title:    'KXK',
      image: 'assets/images/kxk.jpeg',
      imageFull: 'assets/images/kxk-full.jpeg',
      subtitle: 'Brand & Digital',
      tags:     ['Development', 'Brand', 'UI'],
      featured: true,
      desc:     '30 years of artisanal landscape expertise for Hamptons and Long Island estates - and a website that finally matched it. Luxury positioning, rich imagery treatment, and a seamless lead capture flow built for high-net-worth clientele.',
      year:     '2025',
      role:     'Web Designer + Developer',
      client:   'KXK Design',
      type:     'Business Identity',
      palette:  ['#080808', '#141414', '#888888'],
      shape:    'grid',
    },
    {
      id:       'dami',
      num:      '05',
      title:    'DAMI',
      image: 'assets/images/dami.jpeg',
      imageFull: 'assets/images/dami-full.jpeg',
      subtitle: 'Personal Brand & NGO',
      tags:     ['Wordpress', 'Custom Theme', 'UI', 'Design System'],
      featured: true,
      desc:     'A fully custom WordPress theme built from scratch - no Elementor, no page builders. Cormorant Garamond editorial typography, infinite testimonials slider, WooCommerce book store, and a GLC sub-site built as a world within the world. Every pixel hand-coded for a client who had been let down by developers before.',
      year:     '2026',
      role:     'Wordpress Developer',
      client:   'Damilola Ife-Bolade',
      type:     'Personal Brand + NGO',
      palette:  ['#04080d', '#080d14', '#4488ff'],
      shape:    'dots',
    },
    {
      id:       'amgi',
      num:      '06',
      title:    'AMGI',
      image: 'assets/images/amgi.jpeg',
      imageFull: 'assets/images/amgi-full.jpeg',
      subtitle: 'Brand & NGO',
      tags:     ['Wordpress', 'Custom Theme', 'UI', 'Design System'],
      featured: true,
      desc:     'A custom WordPress theme for a UK based NGO — built to inspire trust and drive action. Donation integration, programme showcases, volunteer sign-up flows, and a content system the team could manage themselves. Built to make the organisation look as serious as its mission.',
      year:     '2025',
      role:     'Wordpress Developer',
      client:   'AMGI',
      type:     'NGO',
      palette:  ['#04080d', '#080d14', '#4488ff'],
      shape:    'dots',
    },
    {
      id:       'karios',
      num:      '07',
      title:    'KARIOS',
      image: 'assets/images/karios.jpeg',
      imageFull: 'assets/images/karios-full.jpeg',
      subtitle: 'Business & Digital',
      tags:     ['Business', 'UI', 'Development', 'Design System'],
      featured: true,
      desc:     'A local landscaping business in Middletown, DE that had zero online presence. Built a fast, mobile-first site that communicates trust and professionalism instantly - the kind of site that makes a phone ring. Deployed and live within the week.',
      year:     '2024',
      role:     'Web Designer + Developer',
      client:   'Karios Landscaping',
      type:     'Business + Web',
      palette:  ['#04080d', '#080d14', '#4488ff'],
      shape:    'dots',
    },
    {
      id:       'as-hvac',
      num:      '08',
      title:    'AS HVAC',
      image: 'assets/images/as-hvac.jpeg',
      imageFull: 'assets/images/as-hvac-full.jpeg',
      subtitle: 'Business & Digital',
      tags:     ['Business', 'UI', 'Development', 'Design System'],
      featured: true,
      desc:     'A local HVAC company in Gainesville, Georgia that needed a site as reliable as their service. Built to rank locally and convert fast — clear service listings, trust signals upfront, and a click-to-call flow that works on the first tap. No fluff, just results.',
      year:     '2025',
      role:     'Web Designer + Developer',
      client:   'All Season HVAC',
      type:     'Business + Web',
      palette:  ['#04080d', '#080d14', '#4488ff'],
      shape:    'dots',
    },
  ];

  /* ──────────────────────────────────────────────────────────
     CANVAS VISUAL GENERATOR
     Each project gets its own animated canvas visual
  ────────────────────────────────────────────────────────── */
  function makeVisualCanvas(proj) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;';

  const img = document.createElement('img');
  img.src = proj.image || '';
  img.alt = proj.title;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transition:transform 8s linear;filter:grayscale(15%) contrast(1.05);';

  // Ken Burns slow drift on load
  img.addEventListener('load', () => {
    setTimeout(() => { img.style.transform = 'scale(1.08)'; }, 100);
  });

  // Fallback if no image yet — dark gradient placeholder
  img.addEventListener('error', () => {
    wrap.style.background = `linear-gradient(135deg, ${proj.palette[0]} 0%, ${proj.palette[1]} 100%)`;
    img.style.display = 'none';
  });

  wrap.appendChild(img);
  wrap._stop = () => {}; // compatibility
  return wrap;
}

  /* ──────────────────────────────────────────────────────────
     BUILD CARDS
  ────────────────────────────────────────────────────────── */
  const track = document.getElementById('cards-track');
  if (!track) return;

  PROJECTS.forEach((proj, idx) => {
    const card = document.createElement('article');
    card.className = 'proj-card' + (proj.featured ? ' featured' : '');
    card.dataset.idx = idx;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View ${proj.title} project`);

    /* Canvas wrap */
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'card-canvas-wrap';
    const cv = makeVisualCanvas(proj);
    canvasWrap.appendChild(cv);

    /* Bloom */
    const bloom = document.createElement('div');
    bloom.className = 'card-bloom';
    bloom.style.background = `radial-gradient(circle at 50% 80%, ${proj.palette[2]}22 0%, transparent 68%)`;

    /* Gradient */
    const grad = document.createElement('div');
    grad.className = 'card-grad';

    /* Info */
    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
      <p class="card-num">${proj.num} — ${proj.subtitle}</p>
      <h3 class="card-title">${proj.title}</h3>
      <div class="card-tags">
        ${proj.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
      </div>
      <div class="card-view">
        <span class="card-view-line"></span>
        View project
      </div>
    `;

    card.appendChild(canvasWrap);
    card.appendChild(bloom);
    card.appendChild(grad);
    card.appendChild(info);
    track.appendChild(card);

    card.addEventListener('click',  () => openProject(idx));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openProject(idx); });
  });

  /* ──────────────────────────────────────────────────────────
     HORIZONTAL DRAG SCROLL
  ────────────────────────────────────────────────────────── */
  const viewport    = document.getElementById('cards-viewport');
  const workIndex   = document.getElementById('work-index');
  const counterEl   = document.getElementById('work-counter');
  const idxLines    = workIndex ? workIndex.querySelectorAll('.idx-line') : [];

  let trackX    = 0;
  let targetX   = 0;
  let isDragging = false;
  let startX    = 0;
  let startTrack = 0;

  const PAD = 48 + 60; /* padding + index width */

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - window.innerWidth + PAD);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  if (viewport) {
    viewport.addEventListener('mousedown', e => {
      isDragging  = true;
      startX      = e.clientX;
      startTrack  = targetX;
      window.setCursorDrag?.();
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      targetX = clamp(startTrack - (e.clientX - startX), 0, getMaxScroll());
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      window.unsetCursorDrag?.();
    });

    function syncToScroll() {
      const rect = document.getElementById('work').getBoundingClientRect();
      const scrolled = -rect.top;
      const total = document.getElementById('work').offsetHeight - window.innerHeight;
      const prog = Math.max(0, Math.min(1, scrolled / total));
      targetX = prog * getMaxScroll();
    }
    window.addEventListener('scroll', syncToScroll, { passive: true });
  }

  /* Lerp render loop */
  (function loop() {
    trackX += (targetX - trackX) * 0.09;
    track.style.transform = `translateX(${-trackX}px)`;
    updateIndex();
    requestAnimationFrame(loop);
  })();

  function updateIndex() {
    const first = track.querySelector('.proj-card');
    if (!first) return;
    const cardW = first.offsetWidth + 20; /* gap */
    const idx   = clamp(Math.round(trackX / cardW), 0, PROJECTS.length - 1);

    if (counterEl) {
      counterEl.textContent = `0${idx + 1} / 0${PROJECTS.length}`;
    }
    idxLines.forEach((line, i) => {
      line.classList.toggle('active', i === idx);
    });
  }

  /* ──────────────────────────────────────────────────────────
     EXPAND OVERLAY
  ────────────────────────────────────────────────────────── */
  /* Inject overlay HTML */
  const overlayEl = document.createElement('div');
  overlayEl.id    = 'expand-overlay';
  overlayEl.innerHTML = `
    <div id="expand-bg"></div>
    <button id="expand-close" aria-label="Close project">Close project</button>
    <div id="expand-content">
      <div class="exp-visual" id="exp-visual"></div>
      <div class="exp-body">
        <p class="exp-eyebrow" id="exp-eyebrow"></p>
        <h2 class="exp-title"  id="exp-title"></h2>
        <p class="exp-desc"    id="exp-desc"></p>
        <div class="exp-meta"  id="exp-meta"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  const overlay    = document.getElementById('expand-overlay');
  const expandBg   = document.getElementById('expand-bg');
  const expVisual  = document.getElementById('exp-visual');
  const expEyebrow = document.getElementById('exp-eyebrow');
  const expTitle   = document.getElementById('exp-title');
  const expDesc    = document.getElementById('exp-desc');
  const expMeta    = document.getElementById('exp-meta');

  let activeCanvas = null;

  function openProject(idx) {
    const proj = PROJECTS[idx];
    if (!proj) return;

    /* Populate text */
    expEyebrow.textContent = proj.subtitle;
    expTitle.textContent   = proj.title;
    expDesc.textContent    = proj.desc;
    expMeta.innerHTML = `
      <div><p class="exp-meta-label">Year</p>  <p class="exp-meta-val">${proj.year}</p></div>
      <div><p class="exp-meta-label">Role</p>  <p class="exp-meta-val">${proj.role}</p></div>
      <div><p class="exp-meta-label">Client</p><p class="exp-meta-val">${proj.client}</p></div>
      <div><p class="exp-meta-label">Type</p>  <p class="exp-meta-val">${proj.type}</p></div>
    `;

    /* Build large canvas for overlay */
    expVisual.innerHTML = '';
    activeCanvas?._stop?.();
    expVisual.innerHTML = '';
    if (proj.imageFull || proj.image) {
      const img = document.createElement('img');
      img.src = proj.imageFull || proj.image;
      img.alt = proj.title;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      expVisual.appendChild(img);
    }

    /* Get card's screen position for clip-path origin */
    const card = track.querySelectorAll('.proj-card')[idx];
    const r    = card?.getBoundingClientRect();
    const ox   = r ? ((r.left + r.width  / 2) / window.innerWidth  * 100).toFixed(1) : '50';
    const oy   = r ? ((r.top  + r.height / 2) / window.innerHeight * 100).toFixed(1) : '50';

    expandBg.style.transition = 'none';
    expandBg.style.clipPath   = `circle(0% at ${ox}% ${oy}%)`;

    overlay.style.opacity = '1';
    overlay.classList.add('open');

    window.lenis?.stop?.();

    requestAnimationFrame(() => {
      expandBg.style.transition = 'clip-path 0.72s cubic-bezier(0.77,0,0.18,1)';
      expandBg.style.clipPath   = `circle(150% at ${ox}% ${oy}%)`;
    });
  }

  function closeProject() {
    overlay.classList.remove('open');
    overlay.classList.add('closing');
    window.lenis?.start?.();

    setTimeout(() => {
      overlay.classList.remove('closing');
      overlay.style.opacity = '0';
      expandBg.style.transition = 'none';
      expandBg.style.clipPath   = 'circle(0% at 50% 50%)';
      activeCanvas?._stop?.();
      activeCanvas = null;
    }, 580);
  }

  document.getElementById('expand-close')?.addEventListener('click', closeProject);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeProject();
  });

})();
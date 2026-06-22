/* ============================================================
   about.js — Interactive particle orb + scroll-driven story
   Drag to rotate · move the cursor to part the field
   ============================================================ */
(function () {
  'use strict';

  /* ── SCRUB TEXTS ── */
  const SCRUB_TEXTS = {
    0: "I started not with a degree but with a question — what if a screen could make someone feel something real? That obsession became years of craft, code, and relentless iteration.",
    2: "Motion is my language. Code is my instrument. Every project begins as a question about human attention — what earns it, what holds it, what makes it impossible to look away.",
  };
  const AMBER_WORDS = { 0: [0,1,2,3,4], 2: [0,1,2,3,4] };

  /* ── DOM ── */
  const pinContainer = document.getElementById('about-pin-container');
  const progressFill = document.getElementById('about-progress-fill');
  const panelNum     = document.getElementById('about-panel-num');
  const stageDots    = document.querySelectorAll('.sdot');
  const stageEls     = document.querySelectorAll('.about-stage');
  const stageLbls    = document.querySelectorAll('.stage-lbl');
  const aboutCanvas  = document.getElementById('about-canvas');
  const visualPanel  = document.getElementById('about-visual-panel');

  if (!pinContainer) return;

  /* ── SCRUB TEXT ── */
  function buildScrub(id, text, amberIdx) {
    const el = document.getElementById('scrub-text-' + id);
    if (!el) return;
    el.innerHTML = '';
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word' + (amberIdx?.includes(i) ? ' amber' : '');
      span.textContent = word + ' ';
      el.appendChild(span);
    });
  }
  buildScrub(0, SCRUB_TEXTS[0], AMBER_WORDS[0]);
  buildScrub(2, SCRUB_TEXTS[2], AMBER_WORDS[2]);

  /* ── PIN HEIGHT ── */
  const STAGES = 4;
  const VH_PER_STAGE = 1.1;
  function setPinHeight() {
    pinContainer.style.height = (STAGES * VH_PER_STAGE * 100) + 'vh';
  }
  setPinHeight();
  window.addEventListener('resize', setPinHeight);

  /* ══════════════════════════════════════════
     THREE.JS SETUP
  ══════════════════════════════════════════ */
  if (!window.THREE || !aboutCanvas) return;

  function getSize() {
    return {
      w: visualPanel?.offsetWidth  || aboutCanvas.offsetWidth  || 600,
      h: visualPanel?.offsetHeight || aboutCanvas.offsetHeight || 900
    };
  }

  const { w: initW, h: initH } = getSize();

  const renderer = new THREE.WebGLRenderer({ canvas: aboutCanvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(initW, initH);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, initW / initH, 0.1, 1000);
  camera.position.z = 4.8;

  window.addEventListener('resize', () => {
    const { w, h } = getSize();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  /* Cyan accent */
  const CYAN        = 0x2DE2E6;
  const baseR = 45/255, baseG = 226/255, baseB = 230/255;

  /* ══════════════════════════════════════════
     INTERACTIVE PARTICLE ORB
     A fibonacci-sphere of particles. The cursor repels nearby
     points (they spring back); drag orbits the whole field.
  ══════════════════════════════════════════ */
  const COUNT  = window.innerWidth <= 768 ? 900 : 1600;
  const RADIUS = 1.7;
  const golden = Math.PI * (3 - Math.sqrt(5));

  /* Deterministic jitter — organic but stable across frames */
  function jit(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  /* ── SHAPE GENERATORS — each fills `out` with COUNT xyz targets ── */
  function shapeSphere(out) {
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y*y));
      const th = golden * i;
      out[i*3]   = Math.cos(th) * r * RADIUS;
      out[i*3+1] = y * RADIUS;
      out[i*3+2] = Math.sin(th) * r * RADIUS;
    }
  }
  function shapeTorus(out) {
    const R = 1.3, tr = 0.55;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2;   /* around the ring */
      const b = golden * i;                  /* around the tube */
      const rr = R + tr * Math.cos(b);
      out[i*3]   = Math.cos(a) * rr;
      out[i*3+1] = tr * Math.sin(b);
      out[i*3+2] = Math.sin(a) * rr;
    }
  }
  function shapeHelix(out) {
    const turns = 3, H = 3.6, rad = 0.8, half = Math.floor(COUNT / 2);
    for (let i = 0; i < COUNT; i++) {
      const onA = i < half;
      const idx = onA ? i : i - half;
      const n   = onA ? half : (COUNT - half);
      const frac = idx / (n - 1 || 1);
      const ang  = frac * Math.PI * 2 * turns + (onA ? 0 : Math.PI);
      out[i*3]   = Math.cos(ang) * rad;
      out[i*3+1] = (frac - 0.5) * H;
      out[i*3+2] = Math.sin(ang) * rad;
    }
  }
  function shapeGalaxy(out) {
    const arms = 3, spin = 3.2, rmax = 2.05;
    for (let i = 0; i < COUNT; i++) {
      const frac = i / COUNT;
      const dist = Math.pow(frac, 0.6) * rmax;
      const arm  = (i % arms) / arms * Math.PI * 2;
      const ang  = dist * spin + arm + jit(i) * 0.5;
      const thick = (1 - frac) * 0.35;
      out[i*3]   = Math.cos(ang) * dist + (jit(i+1) - 0.5) * 0.15;
      out[i*3+1] = (jit(i+2) - 0.5) * thick;
      out[i*3+2] = Math.sin(ang) * dist + (jit(i+3) - 0.5) * 0.15;
    }
  }

  /* One target buffer per stage */
  const shapes = [0,1,2,3].map(() => new Float32Array(COUNT * 3));
  shapeSphere(shapes[0]);
  shapeTorus(shapes[1]);
  shapeHelix(shapes[2]);
  shapeGalaxy(shapes[3]);

  const home = new Float32Array(COUNT * 3);
  const pos  = new Float32Array(COUNT * 3);
  const vel  = new Float32Array(COUNT * 3);
  const col  = new Float32Array(COUNT * 3);
  home.set(shapes[0]);
  pos.set(shapes[0]);
  let activeShape = shapes[0];

  const orbGeo = new THREE.BufferGeometry();
  orbGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  orbGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const orbMat = new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.95,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const orb = new THREE.Points(orbGeo, orbMat);

  const orbGroup = new THREE.Group();
  orbGroup.add(orb);
  scene.add(orbGroup);

  /* ══════════════════════════════════════════
     INTERACTION — drag to rotate, cursor to part the field
  ══════════════════════════════════════════ */
  let dragging = false;
  let lastX = 0, lastY = 0;
  let spinX = 0, spinY = 0;          /* rotational inertia */
  let mClientX = -9999, mClientY = -9999;
  let repelActive = false;
  const pointerWorld = new THREE.Vector3();
  const localPointer = new THREE.Vector3();

  const REPEL_R = 0.95;
  const REPEL_F = 0.06;

  function onDown(e) {
    if (e.pointerType === 'touch') return;   /* leave touch for page scroll */
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    document.body.classList.add('cursor-drag');
  }
  function onMove(e) {
    mClientX = e.clientX; mClientY = e.clientY;
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      spinY = dx * 0.006;
      spinX = dy * 0.006;
      orbGroup.rotation.y += spinY;
      orbGroup.rotation.x += spinX;
      lastX = e.clientX; lastY = e.clientY;
    }
  }
  function onUp() {
    dragging = false;
    document.body.classList.remove('cursor-drag');
  }

  if (visualPanel) visualPanel.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  /* Project the cursor onto the z=0 plane in world space */
  function updatePointer() {
    const rect = aboutCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) { repelActive = false; return; }
    const inside = mClientX >= rect.left && mClientX <= rect.right &&
                   mClientY >= rect.top  && mClientY <= rect.bottom;
    repelActive = inside;
    if (!inside) return;
    const nx =  ((mClientX - rect.left) / rect.width)  * 2 - 1;
    const ny = -(((mClientY - rect.top) / rect.height) * 2 - 1);
    pointerWorld.set(nx, ny, 0.5).unproject(camera);
    pointerWorld.sub(camera.position).normalize();
    const dist = -camera.position.z / pointerWorld.z;
    pointerWorld.multiplyScalar(dist).add(camera.position);
  }

  /* ── per-stage form: morph the field into a new shape ── */
  function switchToStage(idx) {
    activeShape = shapes[idx] || shapes[0];
  }

  /* ── ANIMATE ── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    updatePointer();

    /* Rotation: drag inertia + gentle idle spin */
    if (!dragging) {
      orbGroup.rotation.y += spinY;
      orbGroup.rotation.x += spinX;
      spinY *= 0.94; spinX *= 0.94;
      orbGroup.rotation.y += 0.0016;
    }
    orbGroup.updateMatrixWorld();

    /* Cursor in the orb's local space (group only rotates) */
    if (repelActive) localPointer.copy(pointerWorld).applyMatrix4(
      new THREE.Matrix4().copy(orbGroup.matrixWorld).invert()
    );

    const lx = localPointer.x, ly = localPointer.y, lz = localPointer.z;
    const r2 = REPEL_R * REPEL_R;
    const ms = 0.05;   /* shape-morph speed */

    for (let i = 0; i < COUNT; i++) {
      /* Morph each home point toward the active stage's shape */
      home[i*3]   += (activeShape[i*3]   - home[i*3])   * ms;
      home[i*3+1] += (activeShape[i*3+1] - home[i*3+1]) * ms;
      home[i*3+2] += (activeShape[i*3+2] - home[i*3+2]) * ms;

      let px = pos[i*3], py = pos[i*3+1], pz = pos[i*3+2];

      /* Repel away from the cursor */
      if (repelActive) {
        const dx = px - lx, dy = py - ly, dz = pz - lz;
        const d2 = dx*dx + dy*dy + dz*dz;
        if (d2 < r2) {
          const d = Math.sqrt(d2) + 1e-4;
          const f = (1 - d / REPEL_R) * REPEL_F;
          vel[i*3]   += (dx / d) * f;
          vel[i*3+1] += (dy / d) * f;
          vel[i*3+2] += (dz / d) * f;
        }
      }

      /* Spring toward home + subtle breathe */
      const breathe = 1 + Math.sin(t * 0.8 + i * 0.05) * 0.01;
      vel[i*3]   += (home[i*3]   * breathe - px) * 0.06;
      vel[i*3+1] += (home[i*3+1] * breathe - py) * 0.06;
      vel[i*3+2] += (home[i*3+2] * breathe - pz) * 0.06;

      /* Damp */
      vel[i*3] *= 0.85; vel[i*3+1] *= 0.85; vel[i*3+2] *= 0.85;

      px += vel[i*3]; py += vel[i*3+1]; pz += vel[i*3+2];
      pos[i*3] = px; pos[i*3+1] = py; pos[i*3+2] = pz;

      /* Brightness rises with displacement from home */
      const hx = px - home[i*3], hy = py - home[i*3+1], hz = pz - home[i*3+2];
      const disp = Math.sqrt(hx*hx + hy*hy + hz*hz);
      const b = 0.45 + Math.min(disp * 1.6, 1) * 0.55;
      col[i*3] = baseR * b; col[i*3+1] = baseG * b; col[i*3+2] = baseB * b;
    }

    orbGeo.attributes.position.needsUpdate = true;
    orbGeo.attributes.color.needsUpdate    = true;

    renderer.render(scene, camera);
  }
  animate();

  /* ══════════════════════════════════════════
     SCROLL DRIVER
  ══════════════════════════════════════════ */
  const panelNums   = ['01', '02', '03', '04'];
  let prevStageIdx  = -1;
  let statsAnimated = false;

  function onScroll() {
    if (!pinContainer) return;

    const rect     = pinContainer.getBoundingClientRect();
    const scrolled = -rect.top;
    const total    = pinContainer.offsetHeight - window.innerHeight;
    const prog     = Math.max(0, Math.min(1, scrolled / total));

    if (progressFill) progressFill.style.height = (prog * 100) + '%';

    const stageF     = prog * STAGES;
    const stageIdx   = Math.min(Math.floor(stageF), STAGES - 1);
    const stageLocal = stageF - stageIdx;

    if (panelNum) panelNum.textContent = panelNums[stageIdx];
    stageDots.forEach((d, i) => d.classList.toggle('active', i === stageIdx));
    stageLbls.forEach((l, i) => l.classList.toggle('active', i === stageIdx));

    if (stageIdx !== prevStageIdx) {
      stageEls.forEach((el, i) => {
        el.classList.toggle('active', i === stageIdx);
        el.setAttribute('aria-hidden', i !== stageIdx ? 'true' : 'false');
      });
      switchToStage(stageIdx);
      prevStageIdx = stageIdx;
    }

    if (stageIdx === 0) {
      const words = document.querySelectorAll('#scrub-text-0 .word');
      words.forEach((w, i) => w.classList.toggle('lit', stageLocal >= i / words.length));
      const stats = document.getElementById('stage-stats-0');
      if (stats && stageLocal > 0.6 && !statsAnimated) {
        statsAnimated = true;
        stats.classList.add('visible');
        animateCounters(stats);
      }
    }
    if (stageIdx === 2) {
      const words = document.querySelectorAll('#scrub-text-2 .word');
      words.forEach((w, i) => w.classList.toggle('lit', stageLocal >= i / words.length));
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.lenis?.on('scroll', onScroll);
  onScroll();

  /* ── COUNTERS ── */
  function animateCounters(container) {
    container.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target || 0);
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = Math.ceil(target / 45);
      const iv     = setInterval(() => {
        current = Math.min(current + step, target);
        el.innerHTML = current + '<span>' + suffix + '</span>';
        if (current >= target) clearInterval(iv);
      }, 28);
    });
  }

  /* ── STAGE DOT CLICK ── */
  stageDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.stage || 0);
      if (window.innerWidth <= 768) {
        stageEls.forEach((s, i) => {
          s.classList.toggle('active', i === idx);
          s.setAttribute('aria-hidden', i !== idx ? 'true' : 'false');
        });
        stageDots.forEach((d, i) => d.classList.toggle('active', i === idx));
        switchToStage(idx);
        return;
      }
      const rect   = pinContainer.getBoundingClientRect();
      const total  = pinContainer.offsetHeight - window.innerHeight;
      const target = window.scrollY + rect.top + (idx / STAGES) * total;
      window.lenis?.scrollTo(target, { duration: 1.2 });
    });
  });

  /* ── ABOUT CSS: remove dividing border on desktop too ── */
  const visualPanelEl = document.getElementById('about-visual-panel');
  if (visualPanelEl) {
    visualPanelEl.style.borderRight = 'none';
    visualPanelEl.style.overflow = 'visible';
  }

})();

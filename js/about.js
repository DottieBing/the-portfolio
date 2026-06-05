/* ============================================================
   about.js — Organic living 3D objects per stage
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
  camera.position.z = 4.5;

  window.addEventListener('resize', () => {
    const { w, h } = getSize();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  /* Shared color */
  const GREEN = 0xAAFF4D;
  const GREEN_BRIGHT = 0xCCFF88;

  /* ══════════════════════════════════════════
     STAGE 0 — BREATHING MORPHING BLOB
     A sphere whose vertices breathe with noise
  ══════════════════════════════════════════ */
  function makeBlob() {
    const group = new THREE.Group();
    const geo   = new THREE.SphereGeometry(1.4, 64, 64);
    const posAttr = geo.attributes.position;
    const count   = posAttr.count;

    /* Store original positions */
    const origins = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) origins[i] = posAttr.array[i];

    const mat = new THREE.MeshBasicMaterial({
      color:     GREEN,
      wireframe: true,
      transparent: true,
      opacity:   0.45,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    /* Inner solid glow sphere */
    const innerGeo = new THREE.SphereGeometry(1.35, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: GREEN,
      transparent: true,
      opacity: 0.04,
    });
    group.add(new THREE.Mesh(innerGeo, innerMat));

    /* Noise helper */
    function noise(x, y, z, t) {
      return Math.sin(x * 2.1 + t) * Math.cos(y * 1.8 + t * 0.7) * Math.sin(z * 2.3 + t * 1.1);
    }

    group._update = function(t) {
      for (let i = 0; i < count; i++) {
        const ox = origins[i*3], oy = origins[i*3+1], oz = origins[i*3+2];
        const n  = noise(ox, oy, oz, t * 0.6) * 0.28;
        posAttr.array[i*3]   = ox + ox * n;
        posAttr.array[i*3+1] = oy + oy * n;
        posAttr.array[i*3+2] = oz + oz * n;
      }
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
    };

    return group;
  }

  /* ══════════════════════════════════════════
     STAGE 1 — DNA DOUBLE HELIX
     Two strands rotating and unravelling
  ══════════════════════════════════════════ */
  function makeDNA() {
    const group  = new THREE.Group();
    const POINTS = 120;
    const HEIGHT = 4;
    const RADIUS = 0.7;
    const TURNS  = 3;

    /* Strand points — updated every frame */
    const strandA = [], strandB = [];
    for (let i = 0; i < POINTS; i++) {
      strandA.push(new THREE.Vector3());
      strandB.push(new THREE.Vector3());
    }

    /* Strand A geometry */
    const geoA = new THREE.BufferGeometry().setFromPoints(strandA);
    const matA = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9 });
    const lineA = new THREE.Line(geoA, matA);
    group.add(lineA);

    /* Strand B geometry */
    const geoB = new THREE.BufferGeometry().setFromPoints(strandB);
    const matB = new THREE.LineBasicMaterial({ color: GREEN_BRIGHT, transparent: true, opacity: 0.7 });
    const lineB = new THREE.Line(geoB, matB);
    group.add(lineB);

    /* Rungs between strands */
    const rungGroup = new THREE.Group();
    group.add(rungGroup);

    /* Dots on each strand */
    const dotMatA = new THREE.PointsMaterial({ color: GREEN,       size: 0.06, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const dotMatB = new THREE.PointsMaterial({ color: GREEN_BRIGHT, size: 0.06, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const dotGeoA = new THREE.BufferGeometry().setFromPoints(strandA);
    const dotGeoB = new THREE.BufferGeometry().setFromPoints(strandB);
    group.add(new THREE.Points(dotGeoA, dotMatA));
    group.add(new THREE.Points(dotGeoB, dotMatB));

    group._update = function(t) {
      /* Update strand positions */
      for (let i = 0; i < POINTS; i++) {
        const frac  = i / (POINTS - 1);
        const y     = (frac - 0.5) * HEIGHT;
        const angle = frac * Math.PI * 2 * TURNS + t * 0.4;
        strandA[i].set(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS);
        strandB[i].set(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS);
      }

      geoA.setFromPoints(strandA);
      geoB.setFromPoints(strandB);
      dotGeoA.setFromPoints(strandA);
      dotGeoB.setFromPoints(strandB);

      /* Rebuild rungs every frame */
      while (rungGroup.children.length) rungGroup.remove(rungGroup.children[0]);
      for (let i = 0; i < POINTS; i += 6) {
        const rungGeo = new THREE.BufferGeometry().setFromPoints([strandA[i], strandB[i]]);
        const rung    = new THREE.Line(rungGeo, new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.25 }));
        rungGroup.add(rung);
      }
    };

    return group;
  }

  /* ══════════════════════════════════════════
     STAGE 2 — MURMURATION
     Particles flocking like birds
  ══════════════════════════════════════════ */
  function makeMurmuration() {
    const group = new THREE.Group();
    const COUNT = window.innerWidth <= 768 ? 300 : 600;
    const pos   = new Float32Array(COUNT * 3);
    const vel   = [];

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 4;
      pos[i*3+1] = (Math.random() - 0.5) * 3;
      pos[i*3+2] = (Math.random() - 0.5) * 2;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01
      ));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));

    const mat = new THREE.PointsMaterial({
      color: GREEN, size: 0.04,
      transparent: true, opacity: 0.85, sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);

    /* Centre attractor that moves */
    let cx = 0, cy = 0, cz = 0;

    group._update = function(t) {
      /* Move attractor in a figure-8 */
      cx = Math.sin(t * 0.3) * 1.2;
      cy = Math.sin(t * 0.2) * 0.8;
      cz = Math.cos(t * 0.25) * 0.5;

      for (let i = 0; i < COUNT; i++) {
        const px = pos[i*3], py = pos[i*3+1], pz = pos[i*3+2];

        /* Attraction toward centre */
        const dx = cx - px, dy = cy - py, dz = cz - pz;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;
        const force = 0.0006 / dist;
        vel[i].x += dx * force;
        vel[i].y += dy * force;
        vel[i].z += dz * force;

        /* Noise turbulence */
        vel[i].x += (Math.sin(px * 3 + t) * 0.0008);
        vel[i].y += (Math.cos(py * 2.5 + t * 0.8) * 0.0008);
        vel[i].z += (Math.sin(pz * 2 + t * 0.6) * 0.0005);

        /* Speed limit */
        const speed = vel[i].length();
        if (speed > 0.025) vel[i].multiplyScalar(0.025 / speed);

        pos[i*3]   += vel[i].x;
        pos[i*3+1] += vel[i].y;
        pos[i*3+2] += vel[i].z;

        /* Soft boundary */
        if (Math.abs(pos[i*3])   > 2.8) vel[i].x *= -0.6;
        if (Math.abs(pos[i*3+1]) > 2.2) vel[i].y *= -0.6;
        if (Math.abs(pos[i*3+2]) > 1.5) vel[i].z *= -0.6;
      }
      geo.attributes.position.needsUpdate = true;
    };

    return group;
  }

  /* ══════════════════════════════════════════
     STAGE 3 — GROWING TREE / BRANCHES
     L-system style branching that grows live
  ══════════════════════════════════════════ */
  function makeTree() {
    const group    = new THREE.Group();
    const MAX_SEGS = window.innerWidth <= 768 ? 300 : 600;
    const positions = new Float32Array(MAX_SEGS * 6);
    let   segCount  = 0;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.7 });
    const lines = new THREE.LineSegments(geo, mat);
    group.add(lines);

    /* Dot at each branch tip */
    const tipPositions = new Float32Array(MAX_SEGS * 3);
    const tipGeo = new THREE.BufferGeometry();
    tipGeo.setAttribute('position', new THREE.BufferAttribute(tipPositions, 3).setUsage(THREE.DynamicDrawUsage));
    const tipMat = new THREE.PointsMaterial({ color: GREEN_BRIGHT, size: 0.05, transparent: true, opacity: 0.9, sizeAttenuation: true });
    group.add(new THREE.Points(tipGeo, tipMat));

    /* Branch structure */
    let branches = [{
      x: 0, y: -2, z: 0,
      dx: 0, dy: 0.04, dz: 0,
      life: 1, depth: 0
    }];
    let grown = false;
    let growT  = 0;

    group._update = function(t) {
      growT += 0.016;
      if (growT < 0.5) return; /* wait half second before growing */

      segCount = 0;
      let tipCount = 0;

      /* Spawn new branches */
      if (!grown && branches.length < MAX_SEGS * 0.3) {
        const newBranches = [];
        branches.forEach(b => {
          if (Math.random() < 0.015 && b.depth < 6) {
            const angle  = (Math.random() - 0.5) * 1.2;
            const angle2 = (Math.random() - 0.5) * 0.8;
            const speed  = 0.03 + Math.random() * 0.02;
            newBranches.push({
              x: b.x, y: b.y, z: b.z,
              dx: Math.sin(angle) * speed,
              dy: Math.cos(angle) * speed * 0.8,
              dz: Math.sin(angle2) * speed * 0.5,
              life: 1,
              depth: b.depth + 1
            });
          }
        });
        branches.push(...newBranches);
        if (branches.length >= MAX_SEGS * 0.3) grown = true;
      }

      /* Update and draw branches */
      branches.forEach(b => {
        if (segCount >= MAX_SEGS - 1) return;
        const ox = b.x, oy = b.y, oz = b.z;

        /* Sway with noise */
        b.dx += (Math.random() - 0.5) * 0.003;
        b.dy += 0.0005; /* gravity resistance — grow up */
        b.dz += (Math.random() - 0.5) * 0.002;

        /* Speed limit per branch */
        const spd = Math.sqrt(b.dx*b.dx + b.dy*b.dy + b.dz*b.dz);
        if (spd > 0.05) { b.dx *= 0.05/spd; b.dy *= 0.05/spd; b.dz *= 0.05/spd; }

        b.x += b.dx; b.y += b.dy; b.z += b.dz;
        b.life -= 0.0008;

        /* Draw segment */
        positions[segCount*6]   = ox; positions[segCount*6+1] = oy; positions[segCount*6+2] = oz;
        positions[segCount*6+3] = b.x; positions[segCount*6+4] = b.y; positions[segCount*6+5] = b.z;
        segCount++;

        /* Tip dot */
        if (tipCount < MAX_SEGS) {
          tipPositions[tipCount*3]   = b.x;
          tipPositions[tipCount*3+1] = b.y;
          tipPositions[tipCount*3+2] = b.z;
          tipCount++;
        }

        /* Reset dead branches */
        if (b.life <= 0 || Math.abs(b.y) > 2.5 || Math.abs(b.x) > 2.5) {
          b.x = (Math.random()-0.5)*0.3; b.y = -2; b.z = (Math.random()-0.5)*0.3;
          b.dx = (Math.random()-0.5)*0.02; b.dy = 0.03+Math.random()*0.02; b.dz = (Math.random()-0.5)*0.015;
          b.life = 1; b.depth = 0;
          grown = false;
        }
      });

      geo.setDrawRange(0, segCount * 2);
      geo.attributes.position.needsUpdate = true;
      tipGeo.setDrawRange(0, tipCount);
      tipGeo.attributes.position.needsUpdate = true;
    };

    return group;
  }

  /* ══════════════════════════════════════════
     SCENE ASSEMBLY
  ══════════════════════════════════════════ */
  const stageObjects = [makeBlob(), makeDNA(), makeMurmuration(), makeTree()];
  stageObjects.forEach((obj, i) => {
    obj.visible = (i === 0);
    scene.add(obj);
  });

  let currentStage  = 0;
  let targetStage   = 0;
  let morphProgress = 1;

  function switchToStage(idx) {
    if (idx === currentStage && morphProgress >= 1) return;
    targetStage   = idx;
    morphProgress = 0;
    stageObjects[idx].visible = true;
  }

  /* ── MOUSE ── */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* ── ANIMATE ── */
  const clock = new THREE.Clock();

  function setOpacity(group, opacity) {
    group.traverse(child => {
      if (!child.material) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => {
        if (!m._base) m._base = m.opacity;
        m.opacity = Math.max(0, Math.min(1, opacity * m._base));
      });
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Morph transition */
    if (morphProgress < 1) {
      morphProgress = Math.min(morphProgress + 0.03, 1);
      const e = morphProgress < 0.5
        ? 2 * morphProgress * morphProgress
        : -1 + (4 - 2 * morphProgress) * morphProgress;

      stageObjects.forEach((obj, i) => {
        if (i === currentStage) {
          setOpacity(obj, 1 - e);
          obj.scale.setScalar(1 - e * 0.1);
        } else if (i === targetStage) {
          setOpacity(obj, e);
          obj.scale.setScalar(0.9 + e * 0.1);
        }
      });

      if (morphProgress >= 1) {
        stageObjects[currentStage].visible = false;
        setOpacity(stageObjects[currentStage], 1);
        stageObjects[currentStage].scale.setScalar(1);
        currentStage = targetStage;
      }
    }

    /* Update active object */
    const active = stageObjects[currentStage];
    if (active) {
      active._update?.(t);
      /* Gentle mouse-follow rotation — stage 2 rotates differently */
      if (currentStage === 0) {
        active.rotation.y += 0.004 + mouseX * 0.01;
        active.rotation.x += (mouseY * 0.3 - active.rotation.x) * 0.03;
      } else if (currentStage === 1) {
        active.rotation.y += 0.006;
        active.rotation.x += (mouseY * 0.2 - active.rotation.x) * 0.03;
      } else if (currentStage === 2) {
        /* Murmuration — very slow base rotation */
        active.rotation.y += 0.002 + mouseX * 0.008;
      } else if (currentStage === 3) {
        active.rotation.y += (mouseX * 0.4 - active.rotation.y) * 0.02;
      }
    }

    /* Also update transitioning object if mid-morph */
    if (morphProgress < 1 && stageObjects[targetStage] !== active) {
      stageObjects[targetStage]?._update?.(t);
    }

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
    /* Let canvas bleed across — overflow visible */
    visualPanelEl.style.overflow = 'visible';
  }

})();
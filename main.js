/* ============================================================
   OCEAN DEPTHS — main.js
   ============================================================ */

/* ── Loader ── */
(function initLoader() {
  const fill = document.getElementById('loaderFill');
  const pctText = document.getElementById('loaderPct');
  const subText = document.getElementById('loaderSubText');
  const diverWrap = document.getElementById('loaderDiverWrap');
  const loader = document.getElementById('loader');
  const bg = document.getElementById('loaderBgBubbles');

  if (!fill || !loader) return;

  const subMessages = [
    'Calibrating depth sensors...',
    'Pressurizing hull...',
    'Checking oxygen levels...',
    'Testing sonar array...',
    'Activating bioluminescent sensors...',
    'Almost ready...'
  ];

  // Seed some initial background bubbles
  if (bg) {
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('div');
      b.className = 'loader-bg-bubble';
      const size = 2 + Math.random() * 8;
      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:-${size + 10}px;
        animation-duration:${3 + Math.random() * 5}s;
        animation-delay:${Math.random() * 5}s;
        opacity:${0.2 + Math.random() * 0.4};
      `;
      bg.appendChild(b);
    }
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        // Initial reveal of HUD
        document.body.classList.add('site-loaded');
      }, 600);
    }
    
    // UI Updates
    fill.style.width = progress + '%';
    if (pctText) pctText.textContent = Math.floor(progress) + '%';
    
    // Diver Descent
    if (diverWrap) {
      diverWrap.style.setProperty('--dive-progress', progress / 100);
    }

    // Subtext rotation
    if (subText && Math.random() > 0.96) {
      subText.textContent = subMessages[Math.floor(Math.random() * subMessages.length)];
    }
  }, 100);
})();

/* ── Custom cursor ── */
(function initCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'customCursor';
  cursor.style.cssText = `
    position:fixed; width:20px; height:20px; border-radius:50%;
    background:rgba(56,189,248,0.4); border:2px solid rgba(56,189,248,0.8);
    pointer-events:none; z-index:9998; transform:translate(-50%,-50%);
    transition:width 0.2s,height 0.2s,background 0.2s;
    box-shadow:0 0 12px rgba(56,189,248,0.5);
  `;
  document.body.appendChild(cursor);

  const trail = document.createElement('div');
  trail.style.cssText = `
    position:fixed; width:8px; height:8px; border-radius:50%;
    background:rgba(56,189,248,0.6); pointer-events:none; z-index:9997;
    transform:translate(-50%,-50%); transition:left 0.12s ease,top 0.12s ease;
  `;
  document.body.appendChild(trail);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    setTimeout(() => {
      trail.style.left = mx + 'px';
      trail.style.top  = my + 'px';
    }, 80);
  });

  document.addEventListener('mousedown', () => {
    cursor.style.width = '30px';
    cursor.style.height = '30px';
    cursor.style.background = 'rgba(56,189,248,0.2)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.background = 'rgba(56,189,248,0.4)';
  });
})();

/* ── Wave Canvas (Enhanced) ── */
(function initWaves() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = 220;
  }
  resize();
  window.addEventListener('resize', resize);

  const waves = [
    { y: 110, amp: 26, freq: 0.008, speed: 0.018, color: 'rgba(14,165,233,0.15)' },
    { y: 125, amp: 22, freq: 0.012, speed: 0.025, color: 'rgba(14,165,233,0.25)' },
    { y: 140, amp: 18, freq: 0.016, speed: 0.032, color: 'rgba(2,132,199,0.35)' },
    { y: 155, amp: 15, freq: 0.020, speed: 0.040, color: 'rgba(2,132,199,0.45)' },
    { y: 170, amp: 11, freq: 0.026, speed: 0.050, color: 'rgba(1,87,155,0.55)' },
    { y: 185, amp:  8, freq: 0.032, speed: 0.060, color: 'rgba(1,58,107,0.65)' },
  ];

  // Foam particles along wave crests
  const foamParticles = [];
  for (let i = 0; i < 40; i++) {
    foamParticles.push({
      x: Math.random() * (canvas.width || 1920),
      baseY: 105 + Math.random() * 30,
      size: 1 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.6,
      opacity: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient overlay for smoother sky-to-water transition
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    grad.addColorStop(0, 'rgba(135,206,235,0.0)');
    grad.addColorStop(1, 'rgba(14,165,233,0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Draw waves
    waves.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = w.y + Math.sin(x * w.freq + t * w.speed * 100) * w.amp
                      + Math.sin(x * w.freq * 0.5 + t * w.speed * 60) * w.amp * 0.3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
    });

    // Draw foam particles
    foamParticles.forEach(fp => {
      const foamY = fp.baseY + Math.sin(t * 0.03 + fp.phase) * 6;
      const foamOp = fp.opacity * (0.5 + 0.5 * Math.sin(t * 0.02 + fp.phase));
      ctx.beginPath();
      ctx.arc(fp.x, foamY, fp.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${foamOp})`;
      ctx.fill();
      // Drift particles slowly
      fp.x += fp.speed;
      if (fp.x > canvas.width + 10) fp.x = -10;
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Bubble size variants ── */
const BUBBLE_SIZES = [
  { cls: 'bubble--xs', min: 2,  max: 5  },
  { cls: 'bubble--sm', min: 5,  max: 10 },
  { cls: 'bubble--md', min: 10, max: 18 },
  { cls: 'bubble--lg', min: 18, max: 28 },
  { cls: 'bubble--xl', min: 28, max: 42 },
];

/* ── Generate Bubbles (advanced) ── */
function createBubbles(container, count, opts = {}) {
  if (!container) return;
  const sizePool = opts.sizes || ['bubble--xs','bubble--sm','bubble--md'];
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    const sizeKey  = sizePool[Math.floor(Math.random() * sizePool.length)];
    const sizeInfo = BUBBLE_SIZES.find(s => s.cls === sizeKey) || BUBBLE_SIZES[1];
    const size     = sizeInfo.min + Math.random() * (sizeInfo.max - sizeInfo.min);
    b.className    = 'bubble ' + sizeKey;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 20}%;
      animation-duration:${(opts.minDur || 6) + Math.random() * (opts.maxDur || 14)}s;
      animation-delay:${Math.random() * (opts.maxDelay || 10)}s;
    `;
    container.appendChild(b);
  }
}

/* ── Generate Dust (Marine Snow) ── */
function createDust(container, count) {
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'particle particle--dust';
    const size = 1 + Math.random() * 3;
    d.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 80}%;
      animation-duration:${15 + Math.random() * 25}s;
      animation-delay:${Math.random() * -20}s;
    `;
    container.appendChild(d);
  }
}

/* ── Generate Sparkles ── */
function createSparkles(container, count) {
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'particle particle--sparkle';
    const size = 2 + Math.random() * 4;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-duration:${2 + Math.random() * 4}s;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(s);
  }
}

/* ── Generate Particles ── */
function createParticles(container, count, color) {
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 1 + Math.random() * 3;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 30}%;
      background:${color || 'rgba(56,189,248,0.6)'};
      box-shadow: 0 0 ${Math.random() * 5 + 5}px ${color || 'rgba(56,189,248,0.6)'};
      animation-name: floatParticle;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-duration:${8 + Math.random() * 15}s;
      animation-delay:${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}

createParticles(document.getElementById('midnightParticles'), 60, 'rgba(167,139,250,0.35)');

// Add Dust and Sparkles
createDust(document.getElementById('twilightParticles'), 40);
createDust(document.getElementById('midnightParticles'), 50);
createSparkles(document.getElementById('lightRays'), 30);
createSparkles(document.getElementById('heroParticles'), 40);

/* ── Global Background Bubble Layer ── */
(function initBgBubbles() {
  const layer = document.getElementById('bgBubbleLayer');
  if (!layer) return;

  // Seed initial background bubbles spread across full page height
  for (let i = 0; i < 55; i++) {
    const b = document.createElement('div');
    const tier     = Math.floor(Math.random() * BUBBLE_SIZES.length);
    const sizeInfo = BUBBLE_SIZES[tier];
    const size     = sizeInfo.min + Math.random() * (sizeInfo.max - sizeInfo.min);
    b.className    = 'bubble ' + sizeInfo.cls;
    const dur  = 10 + Math.random() * 22;
    const del  = Math.random() * 30;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${Math.random() * 100}%;
      animation-duration:${dur}s;
      animation-delay:-${del}s;
      opacity:${0.06 + Math.random() * 0.16};
    `;
    layer.appendChild(b);
  }

  // Continuous replenishment every ~1.4 s
  setInterval(() => {
    const b = document.createElement('div');
    const tier     = Math.floor(Math.random() * 4);   // skip XL for looping
    const sizeInfo = BUBBLE_SIZES[tier];
    const size     = sizeInfo.min + Math.random() * (sizeInfo.max - sizeInfo.min);
    b.className    = 'bubble ' + sizeInfo.cls;
    const dur      = 9 + Math.random() * 16;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:-${size + 4}px;
      animation-duration:${dur}s;
      animation-delay:0s;
      opacity:${0.07 + Math.random() * 0.15};
    `;
    layer.appendChild(b);
    setTimeout(() => b.remove(), (dur + 2) * 1000);
  }, 1400);
})();

/* ── Section-specific Bubbles ── */
(function initSectionBubbles() {
  // Hero surface — big organic bubbles
  createBubbles(document.getElementById('surfaceBubbles'), 32, {
    sizes: ['bubble--sm','bubble--md','bubble--lg'],
    minDur: 7, maxDur: 16, maxDelay: 12
  });
  // Sunlight zone — varied, bright
  createBubbles(document.getElementById('sunlightBubbles'), 38, {
    sizes: ['bubble--xs','bubble--sm','bubble--md','bubble--lg'],
    minDur: 6, maxDur: 14, maxDelay: 10
  });
  // Twilight zone — small, faint
  createBubbles(document.getElementById('twilightBubbles'), 28, {
    sizes: ['bubble--xs','bubble--sm','bubble--md'],
    minDur: 9, maxDur: 20, maxDelay: 14
  });

  // Small fizzes across sections
  document.querySelectorAll('.bubbles-container').forEach(c => {
    createBubbles(c, 15, { type: 'bubble--fizz', minDur: 3, maxDur: 6 });
  });
})();

/* ── 3D Fish School (Sunlight / Euphotic) ── */
(function init3DFishSchool() {
  const container = document.getElementById('fishSchool3DContainer');
  const section = document.getElementById('sunlight');
  if (!container || !section || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
    0.1,
    200
  );
  camera.position.set(0, 2.5, 18);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  // Lights (bright, surface-like)
  scene.add(new THREE.AmbientLight(0x9be7ff, 0.85));
  const dir = new THREE.DirectionalLight(0xffffff, 0.95);
  dir.position.set(-6, 10, 8);
  scene.add(dir);

  // Fish geometry (simple low-poly fish)
  const bodyGeo = new THREE.ConeGeometry(0.22, 0.9, 10, 1);
  bodyGeo.rotateX(Math.PI * 0.5);
  const tailGeo = new THREE.ConeGeometry(0.14, 0.5, 8, 1);
  tailGeo.rotateX(Math.PI * 0.5);
  // Tail is rendered as a separate instanced mesh (no BufferGeometryUtils needed).

  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.05,
    roughness: 0.35,
    transparent: true,
    opacity: 0.85,
    emissive: new THREE.Color(0x0ea5e9),
    emissiveIntensity: 0.15,
  });

  const count = 120;
  const bodyMesh = new THREE.InstancedMesh(bodyGeo, material, count);
  bodyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(bodyMesh);

  const tailMat = material.clone();
  tailMat.opacity = 0.75;
  tailMat.emissiveIntensity = 0.1;
  const tailMesh = new THREE.InstancedMesh(tailGeo, tailMat, count);
  tailMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(tailMesh);

  const bounds = { x: 14, y: 6, z: 8 };
  const fish = Array.from({ length: count }, () => ({
    p: new THREE.Vector3(
      (Math.random() * 2 - 1) * bounds.x,
      (Math.random() * 2 - 1) * bounds.y * 0.55,
      (Math.random() * 2 - 1) * bounds.z
    ),
    v: new THREE.Vector3(
      0.6 + Math.random() * 0.9,
      (Math.random() * 2 - 1) * 0.25,
      (Math.random() * 2 - 1) * 0.35
    ),
    s: 0.55 + Math.random() * 0.85,
    wob: Math.random() * Math.PI * 2,
  }));

  const dummy = new THREE.Object3D();
  const dummyTail = new THREE.Object3D();
  let last = performance.now();

  function visible() {
    const r = section.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const isVisible = visible();
    renderer.domElement.style.opacity = isVisible ? '1' : '0';

    // Move a "goal" point around to make the school steer together.
    const goal = new THREE.Vector3(
      Math.sin(now * 0.00015) * 6,
      Math.sin(now * 0.00023) * 1.8,
      Math.cos(now * 0.00017) * 3
    );

    for (let i = 0; i < count; i++) {
      const f = fish[i];
      f.wob += dt * (2.5 + f.s);

      // Cohesion toward goal + mild noise
      const toGoal = goal.clone().sub(f.p).multiplyScalar(0.08);
      const noise = new THREE.Vector3(
        Math.sin(f.wob + i) * 0.06,
        Math.cos(f.wob * 1.2 + i) * 0.03,
        Math.sin(f.wob * 0.9 - i) * 0.05
      );

      f.v.add(toGoal.multiplyScalar(dt * 8)).add(noise.multiplyScalar(dt * 6));

      // Limit speed
      const sp = f.v.length();
      const maxSp = 2.6;
      const minSp = 0.9;
      if (sp > maxSp) f.v.multiplyScalar(maxSp / sp);
      if (sp < minSp) f.v.multiplyScalar(minSp / (sp || 1));

      f.p.addScaledVector(f.v, dt * 2.2);

      // Wrap bounds
      if (f.p.x > bounds.x) f.p.x = -bounds.x;
      if (f.p.x < -bounds.x) f.p.x = bounds.x;
      if (f.p.y > bounds.y) f.p.y = -bounds.y;
      if (f.p.y < -bounds.y) f.p.y = bounds.y;
      if (f.p.z > bounds.z) f.p.z = -bounds.z;
      if (f.p.z < -bounds.z) f.p.z = bounds.z;

      // Orient along velocity, add tail wiggle
      dummy.position.copy(f.p);
      dummy.scale.setScalar(0.9 * f.s);
      dummy.rotation.set(0, 0, 0);
      dummy.lookAt(f.p.clone().add(f.v));
      dummy.rotateY(Math.sin(f.wob * 2.6) * 0.12);
      dummy.updateMatrix();
      bodyMesh.setMatrixAt(i, dummy.matrix);

      // Tail follows body orientation, slightly behind with extra wiggle
      const forward = f.v.clone().normalize();
      const tailOffset = forward.multiplyScalar(-0.75 * f.s);
      dummyTail.position.copy(f.p).add(tailOffset);
      dummyTail.quaternion.copy(dummy.quaternion);
      dummyTail.scale.setScalar(0.75 * f.s);
      dummyTail.rotateY(Math.sin(f.wob * 3.4) * 0.35);
      dummyTail.updateMatrix();
      tailMesh.setMatrixAt(i, dummyTail.matrix);
    }
    bodyMesh.instanceMatrix.needsUpdate = true;
    tailMesh.instanceMatrix.needsUpdate = true;

    if (isVisible) renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // Resize
  function onResize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  onResize();

  requestAnimationFrame(tick);
})();

/* ── Achievement Logic ── */
(function initAchievements() {
  const toast = document.getElementById('achievement');
  const title = document.getElementById('achieveTitle');
  const desc  = document.getElementById('achieveDesc');
  const icon  = document.getElementById('achieveIcon');

  if (!toast) return;

  const milestones = [
    { id: 'sunlight', pct: 0.1, title: 'Sunlight Master', desc: 'You reached the Sunlight Zone (200m)!', icon: '☀️' },
    { id: 'twilight', pct: 0.35, title: 'Twilight Explorer', desc: 'You reached the Twilight Zone (1,000m)!', icon: '🌙' },
    { id: 'midnight', pct: 0.65, title: 'Midnight Specialist', desc: 'You reached the Midnight Zone (4,000m)!', icon: '🔴' },
    { id: 'abyss',    pct: 0.92, title: 'Abyss Veteran', desc: 'The deepest part of the ocean (11km)!', icon: '🌑' },
  ];

  const unlocked = new Set();
  let showing = false;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollTop / (docHeight || 1);

    milestones.forEach(m => {
      if (pct >= m.pct && !unlocked.has(m.id)) {
        unlocked.add(m.id);
        triggerToast(m);
      }
    });
  });

  function triggerToast(m) {
    if (showing) {
      // If already showing, queue it? For now just skip or override
      // But let's just show it.
    }
    showing = true;
    title.textContent = m.title;
    desc.textContent  = m.desc;
    icon.textContent  = m.icon;

    toast.classList.add('active');

    // Achievement sound if available
    if (window.oceanPlayBubble) {
      for (let i = 0; i < 3; i++) setTimeout(window.oceanPlayBubble, i * 150);
    }

    setTimeout(() => {
      toast.classList.remove('active');
      showing = false;
    }, 5000);
  }
})();

/* ── Fish hover tooltips ── */
(function initFishTooltips() {
  const tooltip = document.getElementById('fishTooltip');
  if (!tooltip) return;
  document.querySelectorAll('.fish').forEach(fish => {
    fish.addEventListener('mouseenter', (e) => {
      tooltip.textContent = fish.dataset.tooltip || 'Mystery Fish';
      tooltip.style.opacity = '1';
    });
    fish.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 28) + 'px';
    });
    fish.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });
})();

/* ── Bio creature tooltips (Midnight) ── */
(function initBioTooltips() {
  const tooltip = document.getElementById('bioTooltip');
  if (!tooltip) return;
  const descriptions = {
    bioAnglerfish: 'Anglerfish — Uses bioluminescent lure to attract prey in total darkness',
    bioSquid: 'Giant Squid — Can reach 13m long, with basketball-sized eyes',
    bioDragonfish: 'Dragonfish — Produces red light invisible to other creatures',
    bioEel: 'Electric Eel — Generates up to 860 volts of electric discharge',
  };
  document.querySelectorAll('.bio-creature').forEach(creature => {
    creature.addEventListener('mouseenter', (e) => {
      tooltip.textContent = descriptions[creature.id] || creature.title;
      tooltip.style.opacity = '1';
    });
    creature.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 28) + 'px';
    });
    creature.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });
})();

/* ── Scroll Progress & Depth Meter ── */
(function initScrollHUD() {
  const progressBar = document.getElementById('scrollProgress');
  const depthFill   = document.getElementById('depthFill');
  const depthValue  = document.getElementById('depthValue');
  const depthZone   = document.getElementById('depthZone');
  const depthPres   = document.getElementById('depthPressure');

  // Milestone label elements
  const dmLabels = [0,1,2,3,4].map(i => document.getElementById('dmLabel' + i));

  const milestones = [
    { pct: 0,    depth: 0,     name: 'Surface',       zone: 'Surface',       color: '#38bdf8', pressure: '1 atm' },
    { pct: 0.18, depth: 200,   name: 'Sunlight Zone', zone: 'Sunlight Zone', color: '#0ea5e9', pressure: '21 atm' },
    { pct: 0.45, depth: 1000,  name: 'Twilight Zone', zone: 'Twilight Zone', color: '#6366f1', pressure: '100 atm' },
    { pct: 0.73, depth: 4000,  name: 'Midnight Zone', zone: 'Midnight Zone', color: '#a78bfa', pressure: '400 atm' },
    { pct: 1.0,  depth: 11000, name: 'Ocean Floor',   zone: 'The Abyss',    color: '#f472b6', pressure: '1100 atm' },
  ];

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(scrollTop / docHeight, 1);

    // Progress bar
    if (progressBar) progressBar.style.width = (pct * 100) + '%';

    // Depth calculation (0–11000m)
    const depth = Math.round(pct * 11000);
    if (depthValue) depthValue.textContent = depth >= 1000
      ? (depth / 1000).toFixed(1) + 'km'
      : depth + 'm';
    if (depthFill)  depthFill.style.height = (pct * 100) + '%';

    // Determine active milestone
    let activeMilestone = milestones[0];
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (pct >= milestones[i].pct - 0.02) { activeMilestone = milestones[i]; break; }
    }
    // Determine active label index
    let activeLabelIdx = 0;
    if (pct >= 0.85)      activeLabelIdx = 4;
    else if (pct >= 0.58) activeLabelIdx = 3;
    else if (pct >= 0.32) activeLabelIdx = 2;
    else if (pct >= 0.08) activeLabelIdx = 1;

    // Update milestone labels
    dmLabels.forEach((el, i) => {
      if (!el) return;
      if (i === activeLabelIdx) {
        if (!el.classList.contains('active')) {
          el.classList.add('active', 'milestone-ping');
          setTimeout(() => el.classList.remove('milestone-ping'), 1000);
        }
      } else {
        el.classList.remove('active');
      }
    });

    // Water distortion toggle (only surface & sunlight)
    if (pct < 0.25) document.body.classList.add('at-surface');
    else            document.body.classList.remove('at-surface');

    // Zone & pressure
    if (depthZone) {
      depthZone.textContent = activeMilestone.zone;
      depthZone.style.color = activeMilestone.color;
    }
    if (depthPres) depthPres.textContent = activeMilestone.pressure;
  });
})();

/* ── Twilight Zone Mouse Parallax ── */
(function initParallax() {
  const section = document.getElementById('twilight');
  const layer1 = document.getElementById('parallaxLayer1');
  const layer2 = document.getElementById('parallaxLayer2');
  if (!section || !layer1 || !layer2) return;

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;

    layer1.style.transform = `translate(${cx * 30}px, ${cy * 20}px)`;
    layer2.style.transform = `translate(${cx * -20}px, ${cy * -15}px)`;

    // Move jellyfish subtly
    document.querySelectorAll('.jellyfish').forEach((j, i) => {
      const factor = (i + 1) * 8;
      j.style.transform = `translate(${cx * factor}px, ${cy * factor * 0.5}px)`;
    });
  });

  section.addEventListener('mouseleave', () => {
    layer1.style.transform = '';
    layer2.style.transform = '';
    document.querySelectorAll('.jellyfish').forEach(j => j.style.transform = '');
  });
})();

/* ── Submarine Interaction ── */
(function initSubmarine() {
  const wrapper = document.getElementById('submarineWrapper');
  const subBubbles = document.getElementById('subBubbles');
  if (!wrapper) return;

  const sonarRings = wrapper.querySelectorAll('.sub-sonar-ring');

  // Click submarine — sonar ping + bubbles (popup handled by creature-popup system)
  wrapper.addEventListener('click', (e) => {
    // Fire sonar rings
    sonarRings.forEach(ring => {
      ring.classList.remove('active');
      void ring.offsetWidth; // reflow
      ring.classList.add('active');
      setTimeout(() => ring.classList.remove('active'), 2000);
    });

    // Spawn bubbles from sub
    if (subBubbles) {
      for (let i = 0; i < 8; i++) {
        const b = document.createElement('div');
        const size = 3 + Math.random() * 7;
        b.style.cssText = `
          position:absolute; width:${size}px; height:${size}px; border-radius:50%;
          background:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.25);
          box-shadow: 0 0 ${size + 2}px rgba(56,189,248,0.3);
          animation:bubbleRise ${2 + Math.random() * 3}s ease-out forwards;
          left:${Math.random() * 30 - 15}px;
          bottom:0;
          animation-delay:${Math.random() * 0.6}s;
        `;
        subBubbles.appendChild(b);
        setTimeout(() => b.remove(), 5500);
      }
    }

    // Bubble sound
    if (window.oceanPlayBubble) {
      [0, 80, 160, 250].forEach(d => setTimeout(window.oceanPlayBubble, d));
    }
  });

  // Hover tooltip
  const tip = document.getElementById('hoverTip');
  wrapper.addEventListener('mouseenter', () => {
    if (tip) {
      tip.textContent = '🛟 Click for submarine info · DSV Abyss Explorer';
      tip.classList.add('visible');
    }
  });
  wrapper.addEventListener('mousemove', (e) => {
    if (tip) {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top  = (e.clientY - 34) + 'px';
    }
  });
  wrapper.addEventListener('mouseleave', () => {
    if (tip) tip.classList.remove('visible');
  });
})();

/* Return to Surface (Handled by HUD or implicit) */

/* ── Scroll Indicator click ── */
document.getElementById('scrollIndicator')?.addEventListener('click', () => {
  document.getElementById('sunlight')?.scrollIntoView({ behavior: 'smooth' });
});

/* ── Begin Dive button ── */
document.getElementById('btnDive')?.addEventListener('click', () => {
  document.getElementById('sunlight')?.scrollIntoView({ behavior: 'smooth' });
});

/* ── Ocean Sound System — Web Audio API ── */
(function initSound() {
  const btn   = document.getElementById('soundToggle');
  const icon  = document.getElementById('soundIcon');
  const panel = document.getElementById('soundPanel');
  if (!btn) return;

  let ctx           = null;
  let masterGain    = null;
  let bubbleTimer   = null;
  let playing       = false;

  /* ── Build the synth once on first click ── */
  function buildAudio() {
    if (ctx) return;
    ctx        = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;           // start silent; fade in on play
    masterGain.connect(ctx.destination);

    /* —— Underwater noise ambience —— */
    const bufLen = 4 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d   = buffer.getChannelData(ch);
      let   last = 0;
      for (let i = 0; i < bufLen; i++) {
        const w = Math.random() * 2 - 1;
        last    = 0.968 * last + 0.032 * w;   // brownian / low-freq noise
        d[i]    = last * 3.8;
      }
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer    = buffer;
    noiseNode.loop      = true;

    const lpf1 = ctx.createBiquadFilter();
    lpf1.type            = 'lowpass';
    lpf1.frequency.value = 300;
    lpf1.Q.value         = 0.9;

    const lpf2 = ctx.createBiquadFilter();
    lpf2.type            = 'lowpass';
    lpf2.frequency.value = 180;
    lpf2.Q.value         = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.11;

    noiseNode.connect(lpf1);
    lpf1.connect(lpf2);
    lpf2.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseNode.start();

    /* —— Deep drone oscillators with LFO wobble —— */
    [[55, 0.012], [82.4, 0.009], [110, 0.006]].forEach(([freq, gain], i) => {
      const osc  = ctx.createOscillator();
      const gn   = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();

      osc.type           = 'sine';
      osc.frequency.value = freq;
      gn.gain.value       = gain;

      lfo.frequency.value = 0.07 + i * 0.05;
      lfoG.gain.value     = freq * 0.018;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      osc.connect(gn);
      gn.connect(masterGain);
      lfo.start();
      osc.start();
    });
  }

  /* ── Synthesized bubble pop ── */
  function popBubble() {
    if (!ctx || !playing) return;
    const now  = ctx.currentTime;
    const freq = 500 + Math.random() * 900;
    const dur  = 0.07 + Math.random() * 0.11;

    const osc  = ctx.createOscillator();
    const env  = ctx.createGain();
    const filt = ctx.createBiquadFilter();

    filt.type            = 'bandpass';
    filt.frequency.value = freq * 0.8;
    filt.Q.value         = 3;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.25, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + dur);

    env.gain.setValueAtTime(0.22, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filt);
    filt.connect(env);
    env.connect(masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /* ── Expose globally so creature clicks can trigger a pop ── */
  window.oceanPlayBubble = popBubble;

  /* ── Bubble stream timer ── */
  function startBubbles() {
    if (bubbleTimer) return;
    function fire() {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) setTimeout(popBubble, i * 90 + Math.random() * 180);
      bubbleTimer = setTimeout(fire, 1600 + Math.random() * 2800);
    }
    fire();
  }
  function stopBubbles() {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }

  /* ── Toggle ── */
  btn.addEventListener('click', () => {
    buildAudio();
    ctx.resume();
    playing = !playing;
    if (playing) {
      masterGain.gain.setTargetAtTime(0.65, ctx.currentTime, 0.4);
      icon.textContent = '🔊';
      btn.classList.add('playing');
      panel?.classList.add('playing');
      startBubbles();
    } else {
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      icon.textContent = '🔇';
      btn.classList.remove('playing');
      panel?.classList.remove('playing');
      stopBubbles();
    }
  });
})();

/* ── GSAP ScrollTrigger Animations ── */
(function initGSAP() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Fade-in cards on scroll */
  gsap.utils.toArray('[data-gsap-fade]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    );
  });

  /* Hero title letters */
  gsap.from('.hero-title__main', {
    duration: 1.8,
    opacity: 0,
    y: 60,
    ease: 'power4.out',
    delay: 0.6,
  });

  /* Section background parallax */
  gsap.utils.toArray('.section').forEach(section => {
    gsap.to(section, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: { trigger: section, scrub: true },
    });
  });

  /* Fish swim acceleration on scroll */
  ScrollTrigger.create({
    trigger: '#sunlight',
    start: 'top center',
    end: 'bottom center',
    onUpdate: (self) => {
      document.querySelectorAll('.fish').forEach(f => {
        f.style.animationPlayState = self.isActive ? 'running' : 'paused';
      });
    }
  });

  /* Jellyfish glow intensify */
  ScrollTrigger.create({
    trigger: '#twilight',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => {
      gsap.to('.jelly-body', { filter: 'drop-shadow(0 0 30px #f472b6)', duration: 1.5 });
    },
    onLeaveBack: () => {
      gsap.to('.jelly-body', { filter: 'drop-shadow(0 0 20px #f472b6)', duration: 1 });
    }
  });

  /* Midnight zone reveal with stagger */
  gsap.from('.bio-creature', {
    opacity: 0,
    scale: 0.5,
    stagger: 0.2,
    duration: 1,
    ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '#midnight', start: 'top 60%' }
  });

  /* Abyss final reveal */
  gsap.from('#finalCard', {
    opacity: 0, y: 80, scale: 0.95, duration: 1.5, ease: 'power3.out',
    scrollTrigger: { trigger: '#abyss', start: 'top 50%' }
  });

  /* Submarine entrance */
  gsap.from('#submarineWrapper', {
    opacity: 0, scale: 0.7, duration: 2.5, ease: 'power2.out',
    scrollTrigger: { trigger: '#abyss', start: 'top 60%' }
  });

  /* Ocean floor vents stagger */
  gsap.from('.vent', {
    scaleY: 0,
    transformOrigin: 'bottom',
    stagger: 0.3,
    duration: 1,
    ease: 'bounce.out',
    scrollTrigger: { trigger: '#abyss', start: 'top 70%' }
  });

  /* Dynamic Background Depth Effect */
  gsap.to('body', { backgroundColor: '#0284c7', scrollTrigger: { trigger: '#sunlight', start: 'top bottom', end: 'top center', scrub: true } });
  gsap.to('body', { backgroundColor: '#0f172a', scrollTrigger: { trigger: '#twilight', start: 'top bottom', end: 'top center', scrub: true } });
  gsap.to('body', { backgroundColor: '#010205', scrollTrigger: { trigger: '#midnight', start: 'top bottom', end: 'top center', scrub: true } });
  gsap.to('body', { backgroundColor: '#000000', scrollTrigger: { trigger: '#abyss', start: 'top bottom', end: 'top center', scrub: true } });

  /* Depth indicator pulse on milestone depths */
  const depthValue = document.getElementById('depthValue');
  ['sunlight','twilight','midnight','abyss'].forEach(id => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top center',
      onEnter: () => {
        if (depthValue) {
          gsap.fromTo(depthValue,
            { color: '#f472b6', scale: 1.3 },
            { color: '#fff', scale: 1, duration: 0.8, ease: 'power2.out' }
          );
        }
      }
    });
  });

})();

/* ── Add sub bubbles continuously ── */
(function subBubbleLoop() {
  const subBubbles = document.getElementById('subBubbles');
  if (!subBubbles) return;
  setInterval(() => {
    const section = document.getElementById('abyss');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    const b = document.createElement('div');
    const size = 3 + Math.random() * 6;
    b.style.cssText = `
      position:absolute; width:${size}px; height:${size}px; border-radius:50%;
      background:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.2);
      animation:bubbleRise ${3 + Math.random() * 4}s ease-out forwards;
      left:${Math.random() * 20 - 10}px; bottom:0;
    `;
    subBubbles.appendChild(b);
    setTimeout(() => b.remove(), 7000);
  }, 800);
})();

/* ── Section entrance indicator ── */
(function sectionIndicator() {
  const sectionMap = {
    hero:      'Surface',
    sunlight:  'Sunlight Zone',
    twilight:  'Twilight Zone',
    midnight:  'Midnight Zone',
    abyss:     'The Abyss',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const name = sectionMap[entry.target.id];
        if (name) showSectionToast(name);
      }
    });
  }, { threshold: 0.4 });

  Object.keys(sectionMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  function showSectionToast(name) {
    let toast = document.getElementById('sectionToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sectionToast';
      toast.style.cssText = `
        position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
        background:rgba(0,0,0,0.7); border:1px solid rgba(56,189,248,0.3);
        backdrop-filter:blur(12px); padding:0.5rem 1.5rem; border-radius:999px;
        font-family:'Orbitron',monospace; font-size:0.65rem; letter-spacing:0.2em;
        color:#38bdf8; z-index:200; pointer-events:none;
        transition:all 0.4s cubic-bezier(0.16,1,0.3,1); opacity:0;
        text-transform:uppercase;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = '📍 ' + name;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2500);
  }
})();

console.log('%c🌊 Ocean Depths — Loaded', 'color:#38bdf8;font-size:16px;font-weight:bold;');

/* ══════════════════════════════════════════════════════════════
   CREATURE INFO POPUP
   ══════════════════════════════════════════════════════════════ */
(function initCreaturePopup() {
  const popup    = document.getElementById('creaturePopup');
  const backdrop = document.getElementById('popupBackdrop');
  const closeBtn = document.getElementById('popupClose');
  if (!popup || !backdrop) return;

  /* Zone → accent colour map */
  const ZONE_COLORS = {
    'Sunlight Zone': '#38bdf8',
    'Twilight Zone': '#818cf8',
    'Midnight Zone': '#a78bfa',
    'The Abyss':     '#f472b6',
    'Surface':       '#7dd3fc',
  };

  function openPopup(el) {
    const emoji = el.dataset.emoji || '🐠';
    const name  = el.dataset.name  || 'Ocean Creature';
    const zone  = el.dataset.zone  || 'Ocean';
    const desc  = el.dataset.desc  || 'A mysterious creature of the deep.';
    const stats = el.dataset.stats || '';
    const color = ZONE_COLORS[zone] || '#38bdf8';

    /* Populate */
    document.getElementById('popupEmoji').textContent = emoji;
    document.getElementById('popupName').textContent  = name;
    const badge = document.getElementById('popupZone');
    badge.textContent   = zone;
    badge.style.borderColor = color + '88';
    badge.style.color       = color;
    badge.style.background  = color + '11';

    document.getElementById('popupDesc').textContent = desc;

    /* Fun fact */
    const funfact = el.dataset.funfact || '';
    const funfactEl = document.getElementById('popupFunfact');
    const funfactText = document.getElementById('popupFunfactText');
    if (funfactEl && funfactText) {
      if (funfact) {
        funfactText.textContent = funfact;
        funfactEl.style.display = '';
      } else {
        funfactEl.style.display = 'none';
      }
    }

    /* Depth bar — animate fill based on zone */
    const ZONE_DEPTHS = {
      'Sunlight Zone': 0.02,
      'Twilight Zone': 0.12,
      'Midnight Zone': 0.4,
      'The Abyss':     0.85,
      'Surface':       0.005,
    };
    const depthPct = (ZONE_DEPTHS[zone] || 0) * 100;
    const depthFill = document.getElementById('popupDepthFill');
    const depthMarker = document.getElementById('popupDepthMarker');
    const depthLabel = document.getElementById('popupDepthLabel');
    if (depthFill) {
      depthFill.style.width = '0%';
      depthFill.style.background = `linear-gradient(90deg, ${color}, ${color}88)`;
      setTimeout(() => { depthFill.style.width = depthPct + '%'; }, 100);
    }
    if (depthMarker) {
      depthMarker.style.left = '0%';
      setTimeout(() => { depthMarker.style.left = depthPct + '%'; }, 100);
    }
    if (depthLabel) {
      // Extract depth from stats if available
      const depthMatch = (stats || '').match(/Depth:([^|]+)/i);
      depthLabel.textContent = depthMatch ? depthMatch[1].trim() : zone;
    }

    /* Stats grid */
    const statsEl = document.getElementById('popupStats');
    statsEl.innerHTML = '';
    if (stats) {
      stats.split('|').forEach(pair => {
        const idx = pair.indexOf(':');
        if (idx < 0) return;
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        const card = document.createElement('div');
        card.className = 'popup-stat';
        card.innerHTML =
          `<span class="popup-stat__val">${val}</span>` +
          `<span class="popup-stat__key">${key}</span>`;
        statsEl.appendChild(card);
      });
    }

    /* Tint popup glow to zone colour */
    const glowEl = popup.querySelector('.popup-glow');
    if (glowEl) glowEl.style.background =
      `radial-gradient(ellipse at 50% -10%, ${color}18 0%, transparent 65%)`;
    const glowEl2 = popup.querySelector('.popup-glow--secondary');
    if (glowEl2) glowEl2.style.background =
      `radial-gradient(ellipse at 50% 110%, ${color}08 0%, transparent 60%)`;

    /* Tint shimmer to zone color */
    const shimmer = popup.querySelector('.popup-shimmer');
    if (shimmer) shimmer.style.background = `linear-gradient(90deg,
      transparent 0%, ${color}00 20%, ${color}88 50%, ${color}00 80%, transparent 100%)`;

    /* Reveal */
    popup.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    /* Particle burst on open */
    const particleContainer = document.getElementById('popupParticles');
    if (particleContainer) {
      particleContainer.innerHTML = '';
      for (let i = 0; i < 14; i++) {
        const p = document.createElement('div');
        p.className = 'popup-particle';
        const size = 3 + Math.random() * 5;
        const angle = (Math.PI * 2 / 14) * i + Math.random() * 0.5;
        const dist = 60 + Math.random() * 100;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        p.style.cssText = `
          width:${size}px; height:${size}px;
          left:50%; top:50%;
          background:${color};
          box-shadow: 0 0 ${size + 4}px ${color};
          --px:${px}px; --py:${py}px;
          animation-duration:${0.5 + Math.random() * 0.5}s;
          animation-delay:${Math.random() * 0.15}s;
        `;
        particleContainer.appendChild(p);
      }
    }

    /* Bubble sound on open */
    if (window.oceanPlayBubble) {
      window.oceanPlayBubble();
      setTimeout(window.oceanPlayBubble, 90);
      setTimeout(window.oceanPlayBubble, 200);
    }
  }

  function closePopup() {
    popup.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Clean up particles
    const pc = document.getElementById('popupParticles');
    if (pc) setTimeout(() => { pc.innerHTML = ''; }, 500);
  }

  closeBtn?.addEventListener('click', closePopup);
  backdrop.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  /* Attach click to every element that has data-creature */
  document.querySelectorAll('[data-creature]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', e => {
      e.stopPropagation();
      openPopup(el);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   FISH HOVER — excited swimming animation + tooltip
   ══════════════════════════════════════════════════════════════ */
(function initFishHover() {
  const tip = document.getElementById('hoverTip');

  document.querySelectorAll('.fish').forEach(fish => {
    fish.addEventListener('mouseenter', e => {
      fish.classList.add('fish--excited');
      if (tip) {
        tip.textContent = '🖱 Click for facts · ' + (fish.dataset.name || 'Sea creature');
        tip.classList.add('visible');
      }
    });
    fish.addEventListener('mousemove', e => {
      if (tip) {
        tip.style.left = (e.clientX + 16) + 'px';
        tip.style.top  = (e.clientY - 34) + 'px';
      }
    });
    fish.addEventListener('mouseleave', () => {
      fish.classList.remove('fish--excited');
      if (tip) tip.classList.remove('visible');
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   WHALE HOVER — slow drift glow on hover
   ══════════════════════════════════════════════════════════════ */
(function initWhaleHover() {
  const whale = document.getElementById('whale');
  const tip   = document.getElementById('hoverTip');
  if (!whale) return;

  whale.addEventListener('mouseenter', e => {
    whale.classList.add('whale--active');
    if (tip) {
      tip.textContent = '🐋 Click for facts · Blue Whale';
      tip.classList.add('visible');
    }
  });
  whale.addEventListener('mousemove', e => {
    if (tip) {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top  = (e.clientY - 34) + 'px';
    }
  });
  whale.addEventListener('mouseleave', () => {
    whale.classList.remove('whale--active');
    if (tip) tip.classList.remove('visible');
  });
})();

/* ══════════════════════════════════════════════════════════════
   JELLYFISH CLICK — radial glow burst (separate from popup)
   ══════════════════════════════════════════════════════════════ */
(function initJellyGlow() {
  const tip = document.getElementById('hoverTip');

  document.querySelectorAll('.jellyfish').forEach(jelly => {
    /* Tooltip on hover */
    jelly.addEventListener('mouseenter', e => {
      if (tip) {
        tip.textContent = '🪼 Click for facts · ' + (jelly.dataset.name || 'Jellyfish');
        tip.classList.add('visible');
      }
    });
    jelly.addEventListener('mousemove', e => {
      if (tip) {
        tip.style.left = (e.clientX + 16) + 'px';
        tip.style.top  = (e.clientY - 34) + 'px';
      }
    });
    jelly.addEventListener('mouseleave', () => {
      if (tip) tip.classList.remove('visible');
    });

    /* Burst glow on click (fires before popup opens) */
    jelly.addEventListener('click', () => {
      jelly.classList.remove('jelly--burst');
      void jelly.offsetWidth;                    // force reflow to restart animation
      jelly.classList.add('jelly--burst');
      setTimeout(() => jelly.classList.remove('jelly--burst'), 800);

      /* Extra bubble sounds on jelly click */
      if (window.oceanPlayBubble) {
        [0, 60, 130].forEach(delay => setTimeout(window.oceanPlayBubble, delay));
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   BIO CREATURE HOVER TIPS (Midnight zone)
   ══════════════════════════════════════════════════════════════ */
(function initBioHoverTips() {
  const tip = document.getElementById('hoverTip');
  if (!tip) return;

  document.querySelectorAll('.bio-creature').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tip.textContent = '💡 Hover to reveal · Click for facts · ' + (el.dataset.name || 'Deep sea creature');
      tip.classList.add('visible');
    });
    el.addEventListener('mousemove', e => {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top  = (e.clientY - 34) + 'px';
    });
    el.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
})();

/* ══════════════════════════════════════════════════════════════
   ABYSS CREATURE HOVER TIPS
   ══════════════════════════════════════════════════════════════ */
(function initAbyssHoverTips() {
  const tip = document.getElementById('hoverTip');
  if (!tip) return;

  document.querySelectorAll('.abyss-creature').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tip.textContent = '🌑 Click for facts · ' + (el.dataset.name || 'Abyss creature');
      tip.classList.add('visible');
    });
    el.addEventListener('mousemove', e => {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top  = (e.clientY - 34) + 'px';
    });
    el.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
})();

/* ══════════════════════════════════════════════════════════════
   BIOLUMINESCENT FLOATING GLOW PARTICLES
   ══════════════════════════════════════════════════════════════ */
(function initGlowParticles() {
  const ZONES = [
    {
      id: 'twilightGlow',
      sectionId: 'twilight',
      colors: [
        'rgba(244,114,182,0.7)',   // pink
        'rgba(129,140,248,0.6)',   // indigo
        'rgba(56,189,248,0.5)',    // blue
        'rgba(192,80,150,0.6)',    // magenta
      ],
      count: 28,
      interval: 2200,
    },
    {
      id: 'midnightGlow',
      sectionId: 'midnight',
      colors: [
        'rgba(167,139,250,0.7)',   // purple
        'rgba(251,191,36,0.5)',    // amber
        'rgba(244,114,182,0.5)',   // pink
        'rgba(45,212,191,0.6)',    // teal
        'rgba(52,211,153,0.5)',    // green
      ],
      count: 35,
      interval: 1800,
    },
    {
      id: 'abyssGlow',
      sectionId: 'abyss',
      colors: [
        'rgba(244,114,182,0.6)',   // pink
        'rgba(56,189,248,0.4)',    // blue
        'rgba(45,212,191,0.5)',    // teal
        'rgba(129,140,248,0.4)',   // indigo
      ],
      count: 22,
      interval: 2600,
    },
  ];

  ZONES.forEach(zone => {
    const container = document.getElementById(zone.id);
    if (!container) return;

    // Seed initial particles spread across section
    for (let i = 0; i < zone.count; i++) {
      spawnGlowParticle(container, zone.colors, true);
    }

    // Continuous replenishment
    setInterval(() => {
      const section = document.getElementById(zone.sectionId);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      // Only spawn when section is near viewport
      if (rect.top > window.innerHeight * 1.5 || rect.bottom < -window.innerHeight * 0.5) return;
      spawnGlowParticle(container, zone.colors, false);
    }, zone.interval);
  });

  function spawnGlowParticle(container, colors, initialSeed) {
    const p = document.createElement('div');
    p.className = 'glow-particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 2 + Math.random() * 5;
    const dur = 12 + Math.random() * 18;
    const delay = initialSeed ? -(Math.random() * dur) : 0;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${initialSeed ? Math.random() * 100 : Math.random() * 15}%;
      background:${color};
      box-shadow: 0 0 ${size * 2 + 4}px ${color}, 0 0 ${size * 4 + 8}px ${color};
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      opacity: 0;
    `;
    container.appendChild(p);

    // Auto-remove after animation completes (only for non-seeded)
    if (!initialSeed) {
      setTimeout(() => p.remove(), (dur + 2) * 1000);
    }
  }
})();

/* ══════════════════════════════════════════════════════════════
   JOURNEY TRACKER & GLOBAL PARALLAX
   ══════════════════════════════════════════════════════════════ */
(function initJourneyEnhancements() {
  const journeyFill   = document.getElementById('journeyFill');
  const journeyNodes  = document.querySelectorAll('.journey-node');
  const parallaxNodes = document.querySelectorAll('[data-parallax]');

  // -- Journey Tracker Logic --
  function updateJourney() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(scrollTop / (docHeight || 1), 1);

    if (journeyFill) journeyFill.style.height = (pct * 100) + '%';

    // Map percentage to active node
    // Zones: Hero (0), Sunlight (0.18), Twilight (0.45), Midnight (0.73), Abyss (1.0)
    let activeIdx = 0;
    if (pct >= 0.85)      activeIdx = 4;
    else if (pct >= 0.58) activeIdx = 3;
    else if (pct >= 0.32) activeIdx = 2;
    else if (pct >= 0.08) activeIdx = 1;

    journeyNodes.forEach((node, i) => {
      if (i === activeIdx) node.classList.add('active');
      else                 node.classList.remove('active');
    });
  }

  // Node click - smooth scroll to section
  journeyNodes.forEach(node => {
    node.addEventListener('click', () => {
      const sectionId = node.dataset.section;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', updateJourney);
  updateJourney(); // Initial call

  // -- Global Mouse Parallax Logic --
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    // Relative to center of screen (-0.5 to 0.5)
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  function animateParallax() {
    // Smooth interpolation
    targetX += (mouseX - targetX) * 0.08;
    targetY += (mouseY - targetY) * 0.08;

    parallaxNodes.forEach(el => {
      const depth = parseFloat(el.dataset.parallax) || 0.05;
      const moveX = targetX * depth * 800; // Adjusted for subtle movement
      const moveY = targetY * depth * 400;
      
      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    requestAnimationFrame(animateParallax);
  }
  animateParallax();

  /* ── Cinematic Narrative Ambassadors ── */
  (function initNarrative() {
    const narrativeHud = document.getElementById('narrativeHud');
    const author = document.getElementById('narrativeAuthor');
    const text = document.getElementById('narrativeText');
    const overlay = document.getElementById('immersiveOverlay');

    if (!narrativeHud || !author || !text) return;

    const sections = ['hero', 'sunlight', 'twilight', 'midnight', 'abyss'];
    const ambassadors = {
      hero:     { author: '🐠 Butterflyfish', emoji: '🐠' },
      sunlight: { author: '🐠 Clownfish', emoji: '🐠' },
      twilight: { author: '🪼 Moon Jellyfish', emoji: '🪼' },
      midnight: { author: '🎣 Anglerfish', emoji: '🎣' },
      abyss:    { author: '🐙 Dumbo Octopus', emoji: '🐙' }
    };

    sections.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => activateNarrative(id),
        onEnterBack: () => activateNarrative(id),
        onLeave: () => deactivateNarrative(id),
        onLeaveBack: () => deactivateNarrative(id)
      });
    });

    function activateNarrative(id) {
      const ambassadorData = ambassadors[id];
      const creature = document.querySelector(`#${id} [data-ambassador="true"]`);
      const greeting = creature ? creature.dataset.greeting : '';

      // Update HUD
      author.innerHTML = `${ambassadorData.emoji} ${ambassadorData.author}`;
      text.textContent = greeting;
      narrativeHud.classList.add('active');

      // Update Body depth classes for overlay
      document.body.classList.remove('depth-sunlight', 'depth-twilight', 'depth-midnight', 'depth-abyss');
      document.body.classList.add(`depth-${id}`);

      // Animate the ambassador creature if it's visible
      if (creature) {
        gsap.to(creature, {
          scale: 1.4,
          filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.8))',
          duration: 0.6,
          yoyo: true,
          repeat: 1
        });
      }
    }

    function deactivateNarrative(id) {
       if (window.scrollY < 200) {
          narrativeHud.classList.remove('active');
          document.body.classList.remove('depth-sunlight', 'depth-twilight', 'depth-midnight', 'depth-abyss');
       }
    }
  })();
})();

/* ── 3D Shark Integration (Three.js) ── */
(function init3DShark() {
  console.log('Initializing 3D Shark...');
  const container = document.getElementById('sharkContainer');
  const overlayCard = document.getElementById('sharkOverlayCard');
  
  if (!container || !window.THREE || !window.THREE.GLTFLoader) {
    console.warn('3D Shark: THREE or GLTFLoader not found or container missing.');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.pointerEvents = 'auto';

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.8); 
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 2);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  
  // Create fallback shark immediately
  console.log('Creating fallback shark...');
  const sharkGroup = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.BoxGeometry(4, 1, 1.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x708090, 
    metalness: 0.3,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  sharkGroup.add(body);
  
  // Dorsal fin
  const finGeometry = new THREE.ConeGeometry(0.8, 1.5, 3);
  const finMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x606060,
    metalness: 0.2,
    roughness: 0.8
  });
  const dorsalFin = new THREE.Mesh(finGeometry, finMaterial);
  dorsalFin.position.set(0, 1, 0);
  dorsalFin.rotation.z = Math.PI;
  sharkGroup.add(dorsalFin);
  
  // Tail
  const tailGeometry = new THREE.ConeGeometry(1.2, 2, 3);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(-2.5, 0, 0);
  tail.rotation.z = Math.PI / 2;
  sharkGroup.add(tail);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(1.5, 0.2, 0.5);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(1.5, 0.2, -0.5);
  sharkGroup.add(leftEye, rightEye);
  
  // Position and add to scene
  sharkGroup.position.set(0, 0, 0);
  sharkGroup.rotation.y = Math.PI / 2;
  scene.add(sharkGroup);
  
  console.log('Fallback shark created and added to scene');
  
  // Show overlay card
  if (overlayCard) {
    overlayCard.setAttribute('aria-hidden', 'false');
  }
  
  // Add swimming animation
  let swimTime = 0;
  function animateShark() {
    swimTime += 0.02;
    sharkGroup.rotation.y = Math.sin(swimTime) * 0.1 + Math.PI / 2;
    sharkGroup.position.y = Math.sin(swimTime * 2) * 0.2;
    requestAnimationFrame(animateShark);
  }
  animateShark();

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();

/* ── 3D Manta Ray Integration (Three.js) ── */
(function init3DMantaRay() {
  const container = document.getElementById('mantaContainer');
  if (!container || !window.THREE || !window.THREE.GLTFLoader) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.pointerEvents = 'auto';

  const ambientLight = new THREE.AmbientLight(0x8bdfff, 0.9);
  scene.add(ambientLight);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-8, 10, 10);
  scene.add(key);
  const fill = new THREE.PointLight(0x38bdf8, 1.4);
  fill.position.set(10, 2, 6);
  scene.add(fill);

  let manta;
  let mixer;
  const loader = new THREE.GLTFLoader();
  const controls = window.THREE.OrbitControls
    ? new THREE.OrbitControls(camera, renderer.domElement)
    : null;

  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
  }

  // Create fallback shark immediately while trying to load the real one
  console.log('Creating fallback shark immediately...');
  createFallbackShark(scene, container);

  loader.load('cartoon_manta_ray_animated.glb', (gltf) => {
    manta = gltf.scene;
    manta.scale.set(3.2, 3.2, 3.2);
    // Start off-screen left; scroll will "swim" it across like the shark
    manta.position.set(-22, 1.4, -4);
    manta.rotation.set(-0.05, Math.PI / 2, 0.08);
    scene.add(manta);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(manta);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }

    if (controls) {
      controls.target.copy(manta.position);
      controls.update();
    }

    // Scroll-based movement (like shark)
    if (window.gsap && window.ScrollTrigger) {
      // Swim across the Euphotic zone
      gsap.to(manta.position, {
        x: 22,
        y: -0.8,
        z: -2,
        scrollTrigger: {
          trigger: '#sunlight',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.4,
        }
      });

      // Gentle banking / turning while it swims
      gsap.to(manta.rotation, {
        y: Math.PI * 0.55,
        x: 0.08,
        z: -0.06,
        scrollTrigger: {
          trigger: '#sunlight',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.8,
        }
      });

      // Keep OrbitControls centered on the manta as it moves
      ScrollTrigger.create({
        trigger: '#sunlight',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: () => {
          if (controls && manta) controls.target.copy(manta.position);
        }
      });
    }
  }, undefined, (err) => {
    console.error('Error loading 3D manta ray:', err);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();

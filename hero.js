import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const canvas = document.getElementById('heroCanvas');
const hero   = document.getElementById('hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && hero && !reduce.matches) {
  const frames = [...hero.querySelectorAll('.hero-frame')];
  const dots   = [...hero.querySelectorAll('.hero-progress span')];
  const framesEl = hero.querySelector('.hero-frames');
  const scrimL   = hero.querySelector('.scrim-l');
  const scrimR   = hero.querySelector('.scrim-r');
  const idTag    = hero.querySelector('#idTag');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
  scene.fog = new THREE.Fog(0x141118, 22, 70);

  // Environment: one file doing sky, skyline, lighting and reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 1K is plenty for image-based lighting, which is what this file is really.
  new EXRLoader().load('public/models/city-light.exr', (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    scene.background = tex;
    scene.backgroundBlurriness = 0.10;   // enough to sit behind text, not enough to erase the skyline
    scene.backgroundIntensity = 0.7;
    scene.environmentIntensity = 1.0;
    // Turn the sky so the open sunset sits behind the aircraft rather than a building face.
    scene.backgroundRotation = new THREE.Euler(0, 2.15, 0);
    scene.environmentRotation = new THREE.Euler(0, 2.15, 0);
    onScroll();
  });

  // A cool key so the airframe still reads against a warm sunset sky.
  const key = new THREE.DirectionalLight(0xdce8ff, 1.6);
  key.position.set(-5, 5, 4);
  scene.add(key);

  const world = new THREE.Group();
  scene.add(world);

  // The aircraft.
  // The nose turns to face the copy: left while the text is left, right once it
  // has swapped. The gimbal camera is on the nose, so it tracks the reader.
  const FACE_START = -Math.PI / 2 + 0.4;
  const FACE_END   =  Math.PI / 2 - 0.4;
  let modelHeading = 0;
  let droneBase = new THREE.Vector3();
  const tagPos = new THREE.Vector3();
  let droneRadius = 2;
  // Left edge of the copy column, so the aircraft can be sized to what is left.
  function copyLeftPx() {
    const f = frames.find(el => +el.style.opacity > 0.5) || frames[frames.length - 1];
    const line = f && f.querySelector('h1, .hero-line');
    return line ? line.getBoundingClientRect().left : (canvas.clientWidth || 1) * 0.5;
  }
  let drone = null;
  const rotors = [];

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load('public/models/drone.glb', (gltf) => {
    drone = gltf.scene;

    const box = new THREE.Box3().setFromObject(drone);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const s = 4 / Math.max(size.x, size.y, size.z);
    drone.scale.setScalar(s);
    drone.position.sub(centre.multiplyScalar(s));

    // Four propeller groups: 桨叶1–4. Two of them sit several units from their.
    drone.updateMatrixWorld(true);
    const props = [];
    drone.traverse((o) => { if (/^桨叶\d$/.test(o.name)) props.push(o); });

    droneBase = drone.position.clone();
    // Bounding radius drives how far back the camera must sit to hit a target.
    droneRadius = new THREE.Box3().setFromObject(drone)
      .getBoundingSphere(new THREE.Sphere()).radius;

    for (const prop of props) {
      const parent = prop.parent;
      if (!parent) continue;
      const centre = new THREE.Box3().setFromObject(prop).getCenter(new THREE.Vector3());
      const pivot = new THREE.Object3D();
      parent.add(pivot);
      parent.updateMatrixWorld(true);
      pivot.position.copy(parent.worldToLocal(centre));
      pivot.updateMatrixWorld(true);
      pivot.attach(prop);          // attach keeps the rotor exactly where it was
      rotors.push(pivot);
    }

    // Derive which way the nose points from the named front and rear motors.
    const front = new THREE.Vector3(), rear = new THREE.Vector3();
    let nf = 0, nr = 0;
    drone.traverse((o) => {
      if (!o.name.includes('电机')) return;
      const w = o.getWorldPosition(new THREE.Vector3());
      if (o.name.includes('前')) { front.add(w); nf++; }
      else if (o.name.includes('后')) { rear.add(w); nr++; }
    });
    if (nf && nr) {
      front.divideScalar(nf); rear.divideScalar(nr);
      // The model's own nose yaw, measured while its rotation is still zero.
      const heading = Math.atan2(front.x - rear.x, front.z - rear.z);
      modelHeading = heading;
    }

    world.add(drone);
    canvas.classList.add('is-ready');
    onScroll();
  }, undefined, (e) => console.error('drone.glb failed', e));

  // Continuous camera path: orbit + dolly, not three stills
  const DEG = Math.PI / 180;
  const path = (p) => ({
    // Portrait gets a shallower dolly as well as a wider lens: a flat pull-back.
    // Push in through beats A and B, then back out as the aircraft crosses: at
    // beat C the copy takes the right half, so a close drone cannot fit beside it.
    radius: (p < 0.5
      ? 10.5 - 5.6 * p * (1 - portraitK * 0.55)
      : 7.7 + 3.0 * (p - 0.5) * 2) * fitBack,
    azimuth: (-26 + 34 * p) * DEG,
    elevation: (3 - 9 * p) * DEG,   // slightly below the aircraft: sky behind it, horizon low in frame
    // Target sits left of and below the aircraft so it holds the upper right.
    target: new THREE.Vector3(
      // The -2.4 aim offset parks the aircraft upper-right so the copy can own
      // the left. In portrait there is no left column, so relax it to centre.
      -2.4 * (1 - portraitK * 0.82) + 3.0 * swap(p) * crossK,
      // Lift the aim point through the middle of the swap so the aircraft arcs.
      -0.9 + 0.7 * p - portraitK * 1.5 - 1.05 * Math.sin(Math.PI * swap(p)),
      -travel(p) * 0.8
    )
  });

  // How far the copy can travel, 0–1. The aircraft's crossing is scaled by the.
  let crossK = 1;

  // How far the aircraft has flown. It approaches, is stopped dead through the.
  function travel(p) {
    if (p < 0.30) return 6.0 * ease(p / 0.30);
    if (p < 0.60) return 6.0;
    return 6.0 + 7.0 * ease((p - 0.60) / 0.40);
  }

  const BEATS = [[0, 0.30], [0.24, 0.64], [0.58, 1]];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease  = (t) => t * t * (3 - 2 * t);
  // The side-swap belongs to beat C. Running it earlier marched the aircraft.
  const swap  = (p) => ease(clamp((p - 0.52) / 0.48, 0, 1));

  function weight(p, [s, e], i) {
    const first = i === 0, last = i === BEATS.length - 1;
    const edge = (e - s) * 0.18;
    if (p <= s) return first ? 1 : 0;
    if (p >= e) return last ? 1 : 0;
    if (!first && p < s + edge) return (p - s) / edge;
    if (!last && p > e - edge) return (e - p) / edge;
    return 1;
  }

  let progress = 0, visible = true, running = false;

  // Portrait windows crop the aircraft in half at the desktop framing, so widen.
  let fitBack = 1;
  let portraitK = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (canvas.width === w * renderer.getPixelRatio() && camera.aspect === w / h)) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portraitK = clamp((1.2 - camera.aspect) / 0.7, 0, 1);
    camera.fov = 38 + portraitK * 16;
    fitBack = 1 + portraitK * 0.42;
    camera.updateProjectionMatrix();
  }

  function onScroll() {
    const travel = hero.offsetHeight - innerHeight;
    progress = travel > 0 ? clamp(-hero.getBoundingClientRect().top / travel, 0, 1) : 0;

    let lead = 0, leadW = 0;
    frames.forEach((f, i) => {
      const w = weight(progress, BEATS[i], i);
      f.style.opacity = w;
      f.style.transform = `translateY(${(1 - w) * 18}px)`;
      f.style.pointerEvents = w > 0.5 ? 'auto' : 'none';
      f.setAttribute('aria-hidden', w > 0.15 ? 'false' : 'true');
      if (w > leadW) { leadW = w; lead = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === lead));

    const e = ease(progress);
    // Shift only into margin that actually exists, so the column can never.
    const room = Math.min(Math.max(0, (innerWidth - 760) / 2 - 16), 280);
    crossK = room / 280;
    framesEl.style.setProperty('--tx', (swap(progress) * room).toFixed(1) + 'px');
    // A true crossfade: the left scrim has to release as the right one arrives.
    const sideMix = swap(progress) * crossK;
    scrimR.style.opacity = sideMix;
    scrimL.style.opacity = 1 - 0.78 * sideMix;
    start();
  }

  function start() { if (!running && visible) { running = true; requestAnimationFrame(tick); } }

  function tick(t) {
    running = false;
    if (!visible) return;
    resize();

    const e = ease(progress);
    const c = path(e);
    camera.position.set(
      c.target.x + c.radius * Math.cos(c.elevation) * Math.sin(c.azimuth),
      c.target.y + c.radius * Math.sin(c.elevation),
      c.target.z + c.radius * Math.cos(c.elevation) * Math.cos(c.azimuth)
    );
    camera.lookAt(c.target);
    // Sliding the target also slides the camera, so it barely moves the subject.
    // Translating after aiming is what actually shifts it across the frame.
    // By beat C the copy owns the right of the frame, so the aircraft has to be
    // sized to the column left of it rather than to a fixed distance. Solve for
    // the camera distance that makes it that wide, and blend in over the swap.
    const halfFov = camera.fov * DEG * 0.5;
    const vw = canvas.clientWidth || 1, vh = canvas.clientHeight || 1;
    const sw = swap(progress) * crossK;

    if (drone && sw > 0.001) {
      const avail = Math.max(200, copyLeftPx() - 56);
      // 0.9 because the sizing works off the bounding sphere, and the rotor span
      // projects wider than that once the aircraft turns.
      const wantW = Math.min(avail, vw * 0.52) * 0.9;
      const fitDist = (droneRadius * vh) / (wantW * Math.tan(halfFov));
      const here = camera.position.distanceTo(c.target);
      const dist = here + (Math.max(fitDist, here) - here) * sw;

      const dir = camera.position.clone().sub(c.target).normalize();
      camera.position.copy(c.target).addScaledVector(dir, dist);
      camera.lookAt(c.target);

      // Centre it in that column.
      const worldPerPx = (2 * dist * Math.tan(halfFov)) / vh;
      // Centre inside a left margin, not flush to the edge, so nothing clips.
      const centre = 26 + (avail - 26) * 0.5;
      camera.translateX((0.5 * vw - centre) * worldPerPx * sw);
    }

    const cW = weight(progress, BEATS[2], 2);

    if (drone) {
      const d = travel(progress);
      drone.position.set(
        droneBase.x,
        droneBase.y + Math.sin(t * 0.0009) * 0.07,
        droneBase.z - d
      );
      drone.rotation.y = FACE_START + (FACE_END - FACE_START) * swap(progress) - modelHeading;
      // Pitch with acceleration: nose down under power, rearing back at the stop.
      const speed = (travel(Math.min(progress + 0.01, 1)) - travel(Math.max(progress - 0.01, 0))) / 0.02;
      drone.rotation.x = -clamp(speed, -14, 14) * 0.011;
      drone.rotation.z = Math.sin(t * 0.0006) * 0.012;
    }
    // Each pivot inherits its motor's orientation and starts unrotated, so its.
    rotors.forEach((r, i) => r.rotateY(i % 2 ? 0.55 : -0.55));

    // Pin the identity tag to the aircraft's projected screen position, so it.
    if (idTag && drone) {
      // Hold the tag back until the swap has essentially finished, so it never.
      const tagIn = cW * clamp((swap(progress) - 0.74) / 0.22, 0, 1);
      // The camera was moved after lookAt, so its world matrix is stale until.
      camera.updateMatrixWorld(true);
      if (tagIn > 0.01 && portraitK > 0.5) {
        // On a phone the aircraft sits high and part-cropped, so pinning the tag.
        idTag.style.opacity = tagIn;
      } else if (tagIn > 0.01) {
        const p = drone.getWorldPosition(tagPos);
        p.project(camera);
        const x = (p.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (-p.y * 0.5 + 0.5) * canvas.clientHeight;
        // Sit below and to the left of the aircraft: by this beat the copy has.
        const halfFov = camera.fov * DEG * 0.5;
        const distToDrone = camera.position.distanceTo(drone.position);
        const rPx = (droneRadius / Math.max(distToDrone, 0.001))
          * (canvas.clientHeight / 2) / Math.tan(halfFov);
        // translateX(-100%) right-aligns using the tag's own rendered width, so.
        idTag.style.transform =
          `translate(${x.toFixed(1)}px, ${(y + rPx * 0.20).toFixed(1)}px)` +
          ` translateX(-100%) scale(${(0.94 + tagIn * 0.06).toFixed(3)})`;
        idTag.style.opacity = tagIn;
      } else if (idTag.style.opacity !== '0') {
        idTag.style.opacity = 0;
      }
    }

    renderer.render(scene, camera);
    running = true;
    requestAnimationFrame(tick);   // continuous: the aircraft is never fully still
  }

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { onScroll(); } else { running = false; }
  }, { rootMargin: '10% 0px' }).observe(hero);

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
}

// Odometer reels. Right-hand digits spin longer so they settle last.
(() => {
  const section = document.getElementById('gap');
  const els = [...document.querySelectorAll('[data-count]')];
  if (!section || !els.length) return;

  // Reduced motion keeps the figures exactly as authored in the HTML.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // The reels start and stop right to left: the last digit goes first and the.
  const CYCLES_BASE = 2;      // full 0–9 passes for the rightmost digit
  const DUR_BASE    = 1.05;   // seconds for the rightmost digit
  const DUR_STEP    = 0.14;   // each column to its LEFT takes this much longer
  const DELAY_STEP  = 0.09;   // and starts this much later
  const EASE        = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function build(el) {
    const final = el.textContent.trim();
    const frag = document.createDocumentFragment();
    const strips = [];
    let digitIndex = 0;

    for (const ch of final) {
      if (ch < '0' || ch > '9') {
        // Currency marks, separators and suffixes stay put.
        const fixed = document.createElement('span');
        fixed.className = 'odo-fixed';
        fixed.textContent = ch;
        frag.appendChild(fixed);
        continue;
      }

      const reel = document.createElement('span');
      reel.className = 'odo-reel';
      const strip = document.createElement('span');
      strip.className = 'odo-strip';

      const cycles = CYCLES_BASE;   // set properly once the digit count is known
      for (let c = 0; c < cycles; c++) {
        for (let n = 0; n <= 9; n++) strip.appendChild(numeral(n));
      }
      strip.appendChild(numeral(+ch));      // the value it comes to rest on

      reel.appendChild(strip);
      frag.appendChild(reel);
      strips.push({ strip });
      digitIndex++;
    }

    // The reels are decoration; the figure itself is announced once.
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', final);
    el.textContent = '';
    el.classList.add('odo');
    el.appendChild(frag);

    // Now that the total is known, give each column its cycles counted from the.
    const n = strips.length;
    strips.forEach((s, i) => {
      const fromRight = n - 1 - i;
      const cycles = CYCLES_BASE + fromRight;
      const target = s.strip.lastElementChild.textContent;
      s.strip.textContent = '';
      for (let c = 0; c < cycles; c++) {
        for (let d = 0; d <= 9; d++) s.strip.appendChild(numeral(d));
      }
      s.strip.appendChild(numeral(+target));
      s.steps = cycles * 10;
      s.fromRight = fromRight;
    });
    return strips;
  }

  function numeral(n) {
    const s = document.createElement('span');
    s.className = 'odo-num';
    s.textContent = n;
    return s;
  }

  function spin(strips) {
    for (const { strip, steps, fromRight } of strips) {
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      // Force the browser to take the start position before transitioning.
      void strip.offsetHeight;
      const dur = (DUR_BASE + fromRight * DUR_STEP).toFixed(2);
      const delay = (fromRight * DELAY_STEP).toFixed(2);
      strip.style.transition = `transform ${dur}s ${EASE} ${delay}s`;
      strip.style.transform = `translateY(-${steps}em)`;
    }
  }

  const built = els.map(build);

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.disconnect();
      built.forEach(spin);
    }
  }, { threshold: 0.35 });

  io.observe(section);
})();

// Nav: mark the section currently being read
(() => {
  const links = [...document.querySelectorAll('.nav-links a[data-spy]')];
  if (!links.length) return;

  const sections = links
    .map(a => ({ a, el: document.getElementById(a.dataset.spy) }))
    .filter(s => s.el);

  let queued = false;

  function paint() {
    queued = false;
    // The section crossing a line a third down the viewport is the one being read.
    const line = innerHeight * 0.34;
    let current = null;
    for (const s of sections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = s;
    }
    for (const s of sections) s.a.classList.toggle('is-current', s === current);
  }

  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();

// Precedent: pinned three-act sequence.
(() => {
  const section = document.getElementById('precedent');
  if (!section) return;

  const svg      = section.querySelector('.pr-svg');
  const plane    = section.querySelector('.pr-plane');
  const signal   = section.querySelector('.pr-signal');
  const unknown  = section.querySelector('.pr-unknown');
  const radar    = section.querySelector('.pr-radar');
  const beam     = section.querySelector('.pr-beam');
  const blip     = section.querySelector('.pr-blip');
  const blipRing = section.querySelector('.pr-blip-ring');
  const link     = section.querySelector('.pr-link');
  const readout  = section.querySelector('.pr-readout');
  const steps    = [...section.querySelectorAll('.pr-step')];
  const chain    = [...section.querySelectorAll('.pr-chain li')];
  if (!svg || !plane) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) { steps.forEach(s => s.classList.add('on')); chain.forEach(c => c.classList.add('on')); return; }

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease  = (t) => t * t * (3 - 2 * t);
  const span  = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  const TOWER_X = 770, TOWER_Y = 150, FLY_Y = 120;
  const START_X = 90, END_X = 560;

  let queued = false, visible = true;
  let radarOn = 1, planeX = START_X, spinning = false, lastBlip = -1e9;

  // The sweep runs on its own clock rather than on scroll position: a radar that.
  const SWEEP_FROM = -176, SWEEP_TO = -110, SWEEP_MS = 3400;

  function sweepTick(t) {
    spinning = false;
    if (!visible || radarOn < 0.02) return;

    const phase = (t % SWEEP_MS) / SWEEP_MS;
    // Ease at each end so it slows into the turn like a real sector scanner.
    const k = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
    const angle = SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * k;
    beam.setAttribute('transform', `translate(${TOWER_X} 214) rotate(${angle.toFixed(2)})`);

    // Bearing from the dish to the aircraft, in the same frame as the beam.
    const bearing = Math.atan2(FLY_Y - 214, planeX - TOWER_X) * 180 / Math.PI;
    const delta = Math.abs(angle - bearing);
    if (delta < 2.2 && t - lastBlip > 400) lastBlip = t;

    const since = t - lastBlip;
    const flash = since < 1500 ? Math.pow(1 - since / 1500, 2.2) : 0;
    blip.setAttribute('cx', planeX.toFixed(1));
    blip.setAttribute('cy', FLY_Y);
    blip.style.opacity = flash * 0.85 * radarOn;
    blipRing.setAttribute('cx', planeX.toFixed(1));
    blipRing.setAttribute('cy', FLY_Y);
    blipRing.setAttribute('r', (4 + (1 - Math.min(since / 1500, 1)) * 0 + Math.min(since / 1500, 1) * 16).toFixed(1));
    blipRing.style.opacity = flash * 0.5 * radarOn;

    spin();
  }

  function spin() { if (!spinning) { spinning = true; requestAnimationFrame(sweepTick); } }

  function paint() {
    queued = false;
    if (!visible) return;

    const travel = section.offsetHeight - innerHeight;
    const p = travel > 0 ? clamp(-section.getBoundingClientRect().top / travel, 0, 1) : 0;

    // The aircraft crosses the frame for the whole sequence.
    const x = START_X + (END_X - START_X) * ease(span(p, 0.03, 0.86));
    plane.setAttribute('transform', `translate(${x.toFixed(1)} ${FLY_Y})`);
    signal.setAttribute('transform', `translate(${x.toFixed(1)} ${FLY_Y})`);
    unknown.setAttribute('transform', `translate(${x.toFixed(1)} ${(FLY_Y - 44).toFixed(1)})`);

    // Act one: radar, and an aircraft that cannot say who it is. Kept short -.
    radarOn = 1 - span(p, 0.15, 0.26);
    radar.style.opacity = radarOn * 0.95;
    unknown.style.opacity = radarOn;
    planeX = x;

    // Act two: it broadcasts, and the ground listens.
    const bcast = span(p, 0.19, 0.36);
    signal.style.opacity = bcast;
    link.setAttribute('d', `M${x.toFixed(1)} ${FLY_Y} L${TOWER_X} ${TOWER_Y}`);
    link.style.opacity = span(p, 0.25, 0.40) * 0.75;
    readout.style.opacity = span(p, 0.34, 0.47);

    // Act three: the order things happened in.
    const bounds = [[0, 0.20], [0.20, 0.50], [0.50, 1.01]];
    steps.forEach((el, i) => el.classList.toggle('on', p >= bounds[i][0] && p < bounds[i][1]));
    chain.forEach((el, i) => el.classList.toggle('on', p >= 0.54 + i * 0.085));
  }

  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(paint); } }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { onScroll(); spin(); }
  }, { rootMargin: '15% 0px' }).observe(section);

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  paint();
})();

// List reveals. Direction is set in CSS; this only decides when.
(() => {
  const rows = [...document.querySelectorAll('.mech-step, .status-row')];
  if (!rows.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    rows.forEach(r => r.classList.add('in'));
    return;
  }

  // A thin trigger band near the lower third of the viewport. Only the row.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '-62% 0px -30% 0px' });

  rows.forEach(r => io.observe(r));
})();

// Roles are side by side, so use scroll progress not a viewport trigger.
(() => {
  const section = document.getElementById('whatis');
  if (!section) return;
  const roles = [...section.querySelectorAll('.role')];
  if (!roles.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roles.forEach(r => r.classList.add('in'));
    return;
  }

  const AT = [0.16, 0.34, 0.52];   // fraction of the section's pass through the viewport
  let queued = false;

  function paint() {
    queued = false;
    const r = section.getBoundingClientRect();
    // 0 as the section's top reaches the bottom of the viewport, 1 once its top.
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    roles.forEach((el, i) => el.classList.toggle('in', p >= AT[i]));
  }

  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();

// mailto silently fails without a mail client, so offer a copy fallback.
(() => {
  const btn = document.querySelector('.copy-mail');
  if (!btn) return;
  const label = btn.querySelector('.copy-mail-text');
  const mail = btn.dataset.mail;
  const original = label.textContent;
  let revert;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(mail);
      label.textContent = 'Copied';
    } catch {
      // Clipboard blocked (insecure context, or denied): select it instead so.
      const r = document.createRange();
      r.selectNodeContents(label);
      const sel = getSelection();
      sel.removeAllRanges(); sel.addRange(r);
      label.textContent = original;
    }
    btn.classList.add('copied');
    clearTimeout(revert);
    revert = setTimeout(() => {
      label.textContent = original;
      btn.classList.remove('copied');
    }, 1600);
  });
})();

// Side by side, so use scroll progress not a viewport trigger.
(() => {
  const section = document.getElementById('question');
  if (!section) return;
  const steps = [...section.querySelectorAll('.fork .role'),
    ...section.querySelectorAll('.candidates'), section.querySelector('.asking')].filter(Boolean);
  if (!steps.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    steps.forEach(el => el.classList.add('in'));
    return;
  }

  const AT = [0.16, 0.26, 0.38, 0.50, 0.62];
  let queued = false;

  function paint() {
    queued = false;
    const r = section.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    steps.forEach((el, i) => el.classList.toggle('in', p >= (AT[i] ?? 0.5)));
  }

  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();

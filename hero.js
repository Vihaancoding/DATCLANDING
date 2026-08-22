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

  // ── Environment: one file doing sky, skyline, lighting and reflections ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 1K is plenty for image-based lighting, which is what this file is really
  // for. A tonemapped JPG will take over as the *visible* background — this
  // carries both jobs until then, so the sky reads a little softer for now.
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

  // ── The aircraft ──
  // Where the nose points, in radians. 0 = toward the camera, Math.PI = away,
  // -Math.PI/2 = to the left (the way it travels), Math.PI/2 = to the right.
  // The +0.4 turns it off pure profile into a three-quarter view.
  const FACE = -Math.PI / 2 + 0.4;
  let noseYaw = 0;
  let droneBase = new THREE.Vector3();
  const tagPos = new THREE.Vector3();
  let droneRadius = 2;
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

    // Four propeller groups: 桨叶1–4. Two of them sit several units from their
    // parent's origin, so spinning them in place needs a pivot at each rotor's
    // real centre — otherwise those two swing through an arc off the motor.
    drone.updateMatrixWorld(true);
    const props = [];
    drone.traverse((o) => { if (/^桨叶\d$/.test(o.name)) props.push(o); });

    droneBase = drone.position.clone();
    // Bounding radius drives how far back the camera must sit to hit a target
    // on-screen size, whatever the window happens to be.
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

    // Derive which way the nose points from the named front and rear motors
    // (前 = front, 后 = rear) rather than guessing at the model's axis.
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
      noseYaw = FACE - heading;
    }

    world.add(drone);
    canvas.classList.add('is-ready');
    onScroll();
  }, undefined, (e) => console.error('drone.glb failed', e));

  // ── Continuous camera path: orbit + dolly, not three stills ──
  const DEG = Math.PI / 180;
  const path = (p) => ({
    // Portrait gets a shallower dolly as well as a wider lens: a flat pull-back
    // fits beat A and then loses the aircraft once the camera closes in.
    radius: (10.5 - 5.9 * p * (1 - portraitK * 0.55)) * fitBack,
    azimuth: (-26 + 34 * p) * DEG,
    elevation: (3 - 9 * p) * DEG,   // slightly below the aircraft: sky behind it, horizon low in frame
    // Target sits left of and below the aircraft so it holds the upper right
    // of frame at every distance, leaving the headline's third clear.
    // The aircraft crosses the frame right to left; the copy travels the other
    // way. One continuous move rather than three separate cards.
    // The camera trails the aircraft rather than tracking it exactly, so the
    // flight reads as movement through the scene instead of a static hover.
    // On a portrait screen the copy spans the full width, so drop the aim point
    // to lift the aircraft clear of the headline instead of behind it.
    target: new THREE.Vector3(
      -2.4 + 3.8 * swap(p) * crossK,
      // Lift the aim point through the middle of the swap so the aircraft arcs
      // ABOVE the copy instead of crossing straight through it. Peaks halfway
      // and returns to zero, so both ends of the sequence are unaffected.
      -0.9 + 0.7 * p - portraitK * 1.5 - 1.05 * Math.sin(Math.PI * swap(p)),
      -travel(p) * 0.8
    )
  });

  // How far the copy can travel, 0–1. The aircraft's crossing is scaled by the
  // same factor, so on a narrow window neither moves and they never collide.
  let crossK = 1;

  // How far the aircraft has flown. It approaches, is stopped dead through the
  // denial beat, then released — the halt is what carries the argument now that
  // the barrier planes are gone.
  function travel(p) {
    if (p < 0.30) return 6.0 * ease(p / 0.30);
    if (p < 0.60) return 6.0;
    return 6.0 + 7.0 * ease((p - 0.60) / 0.40);
  }

  const BEATS = [[0, 0.30], [0.24, 0.64], [0.58, 1]];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease  = (t) => t * t * (3 - 2 * t);
  // The side-swap belongs to beat C. Running it earlier marched the aircraft
  // through the headline during beat B.
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

  // Portrait windows crop the aircraft in half at the desktop framing, so widen
  // the lens and stand further back the narrower the frame gets.
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
    // Shift only into margin that actually exists, so the column can never
    // overflow on a narrow window — on small screens it simply doesn't move.
    const room = Math.min(Math.max(0, (innerWidth - 760) / 2 - 16), 280);
    crossK = room / 280;
    framesEl.style.setProperty('--tx', (swap(progress) * room).toFixed(1) + 'px');
    // A true crossfade: the left scrim has to release as the right one arrives,
    // otherwise both sit at full strength and crush the whole frame.
    // The left scrim keeps a floor rather than fading to nothing: two opposing
    // gradients at half strength leave the middle of the frame barely covered,
    // which is exactly where the copy sits mid-swap.
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

    const cW = weight(progress, BEATS[2], 2);

    if (drone) {
      const d = travel(progress);
      drone.position.set(
        droneBase.x,
        droneBase.y + Math.sin(t * 0.0009) * 0.07,
        droneBase.z - d
      );
      drone.rotation.y = noseYaw + e * 0.3;
      // Pitch with acceleration: nose down under power, rearing back at the stop.
      const speed = (travel(Math.min(progress + 0.01, 1)) - travel(Math.max(progress - 0.01, 0))) / 0.02;
      drone.rotation.x = -clamp(speed, -14, 14) * 0.011;
      drone.rotation.z = Math.sin(t * 0.0006) * 0.012;
    }
    // Each pivot inherits its motor's orientation and starts unrotated, so its
    // local Y is the shaft. Adding to rotation.y on the rotor itself instead
    // would recompose its mounting rotation and tear it off the motor.
    rotors.forEach((r, i) => r.rotateY(i % 2 ? 0.55 : -0.55));

    // Pin the identity tag to the aircraft's projected screen position, so it
    // tracks the drone as the camera moves instead of floating independently.
    if (idTag && drone) {
      // Hold the tag back until the swap has essentially finished, so it never
      // appears while the aircraft is still travelling across the copy.
      // Sitting on the airframe now, so it must not appear until the aircraft
      // has finished crossing — otherwise it arrives on top of the copy.
      const tagIn = cW * clamp((swap(progress) - 0.74) / 0.22, 0, 1);
      // The camera was moved after lookAt, so its world matrix is stale until
      // render. Projecting against it now would place the tag a frame behind
      // and ignore the framing offset entirely.
      camera.updateMatrixWorld(true);
      if (tagIn > 0.01 && portraitK > 0.5) {
        // On a phone the aircraft sits high and part-cropped, so pinning the tag
        // to it puts the tag off-screen. CSS parks it under the copy instead.
        idTag.style.opacity = tagIn;
      } else if (tagIn > 0.01) {
        const p = drone.getWorldPosition(tagPos);
        p.project(camera);
        const x = (p.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (-p.y * 0.5 + 0.5) * canvas.clientHeight;
        // Sit below and to the left of the aircraft: by this beat the copy has
        // moved to the right of frame, so anything to the right would collide.
        // Tuck it under the airframe rather than beside it: anchored to the
        // aircraft's own projected radius, so it sits against the underside at
        // any camera distance and never drifts onto the copy.
        const halfFov = camera.fov * DEG * 0.5;
        const distToDrone = camera.position.distanceTo(drone.position);
        const rPx = (droneRadius / Math.max(distToDrone, 0.001))
          * (canvas.clientHeight / 2) / Math.tan(halfFov);
        // translateX(-100%) right-aligns using the tag's own rendered width, so
        // there is no measured value to go stale.
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

// ── Stat figures: odometer digit reels ──
// Every digit becomes a column of numerals clipped to one character height and
// spun upward with transform alone. Columns further right spin through more
// cycles and settle later, which is what reads as a reel coming to rest rather
// than a number simply changing.
(() => {
  const section = document.getElementById('gap');
  const els = [...document.querySelectorAll('[data-count]')];
  if (!section || !els.length) return;

  // Reduced motion keeps the figures exactly as authored in the HTML.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // The reels start and stop right to left: the last digit goes first and the
  // leading digit is last to rest, so the motion sweeps across rather than
  // every column firing at once.
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

    // Now that the total is known, give each column its cycles counted from the
    // right, and rebuild its strip to match.
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

// ── Nav: mark the section currently being read ──
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

// ── 3. Precedent: pinned scroll sequence ──
// The section holds while the diagram earns its argument: radar first, then the
// aircraft broadcasting its own verified position, then the four-step chain that
// is the actual thing being borrowed from aviation.
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

  // The sweep runs on its own clock rather than on scroll position: a radar that
  // only turns while you happen to be scrolling doesn't read as a radar. The
  // return flashes when the beam actually crosses the aircraft's bearing, which
  // is the point being made — radar gives you an intermittent, anonymous echo.
  // Kept above the horizon: past -180 the beam drops under the ground line and
  // reads as a shadow. The aircraft's bearing sits between roughly -172 and
  // -156, so this range still passes over it twice a sweep.
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

    // Act one: radar, and an aircraft that cannot say who it is. Kept short —
    // the scan makes its point quickly and then has to give way.
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

// ── List reveals ──
// Rows arrive from alternating sides as they come into view. Direction lives in
// CSS so the markup stays clean; this only decides when, and adds a short
// stagger so a run of rows reads as a cascade rather than one block.
(() => {
  const rows = [...document.querySelectorAll('.mech-step, .status-row')];
  if (!rows.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    rows.forEach(r => r.classList.add('in'));
    return;
  }

  // A thin trigger band near the lower third of the viewport. Only the row
  // actually crossing that line fires, so rows arrive one at a time as they are
  // scrolled to — no stagger, which would still have several moving at once.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '-62% 0px -30% 0px' });

  rows.forEach(r => io.observe(r));
})();

// ── 4. What DATC is: the three roles arrive in order ──
// Side by side on a wide screen, so a viewport trigger would fire all three at
// once. Driven off the section's own scroll progress instead, which keeps the
// rule that only one thing moves at a time and matches the reading order.
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
    // 0 as the section's top reaches the bottom of the viewport, 1 once its top
    // has climbed past the top of the viewport.
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    roles.forEach((el, i) => el.classList.toggle('in', p >= AT[i]));
  }

  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();

// ── Contact: copy the address ──
// A mailto: link does nothing at all on a machine with no mail client set up,
// which is a silent failure on the one action the whole page is asking for.
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
      // Clipboard blocked (insecure context, or denied): select it instead so
      // the reader can copy by hand rather than being left with nothing.
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

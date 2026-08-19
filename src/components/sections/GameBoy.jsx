// 3D Game Boy terminal — rendered with React Three Fiber.
// The screen is a real interactive Html overlay (via @react-three/drei <Html>).
// Drag the body to rotate, use keyboard to interact with the terminal on screen.

import { useRef, useState, useEffect, useCallback, Suspense, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import HeroComputer from './HeroComputer';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  body:    '#7f7fca',
  bezel:   '#000000',
  screen:  '#3a3a80',
  dpad:    '#fefefe',
  btnA:    '#6366f1',
  btnB:    '#ededed',
  btnSS:   '#fdfdfd',
  led:     '#00e676',
  ridge:   '#53547e',
};

// ── Retro 8-bit sound engine ──────────────────────────────────────────────────
// Generates square waves via Web Audio — no sound file needed.
// The original DMG Game Boy hardware used square-wave channels, so this is
// faithful to the real device.
//
//  'a'  →  Super Mario Bros coin ding: B5 (988 Hz) jumps to E6 (1319 Hz)
//  'b'  →  Short descending blip:      C5 (523 Hz) falls to C4 (262 Hz)
let _ac = null;

function playRetroSound(type) {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    const ac   = _ac;
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'square';           // square wave = classic 8-bit timbre
    const t = ac.currentTime;

    if (type === 'a') {
      // ── Coin ding ──────────────────────────────────────────────────────
      osc.frequency.setValueAtTime(988,  t);          // B5
      osc.frequency.setValueAtTime(1319, t + 0.055);  // E6 (jump after 55 ms)
      gain.gain.setValueAtTime(0.15,  t);
      gain.gain.setValueAtTime(0.15,  t + 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    } else if (type === 'b') {
      // ── Low blip ───────────────────────────────────────────────────────
      osc.frequency.setValueAtTime(523, t);           // C5
      osc.frequency.exponentialRampToValueAtTime(262, t + 0.07); // C4
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
      osc.start(t);
      osc.stop(t + 0.10);
    } else if (type === 'insert') {
      // ── Cartridge seat — low mechanical 'chunk' ────────────────────────
      osc.frequency.setValueAtTime(196, t);           // G3
      osc.frequency.setValueAtTime(131, t + 0.05);    // C3 (drop after 50 ms)
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    } else if (type === 'eject') {
      // ── Cartridge eject — rising 'shunk' (reverse of insert) ───────────
      osc.frequency.setValueAtTime(131, t);           // C3
      osc.frequency.setValueAtTime(196, t + 0.05);    // G3 (rise after 50 ms)
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    } else if (type === 'off') {
      // ── Power-off — descending CRT whine to silence ────────────────────
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.45);
      gain.gain.setValueAtTime(0.10, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    }
  } catch (_) { /* silently ignore if AudioContext is blocked */ }
}

// ── Pressable 3-D button ──────────────────────────────────────────────────────
function Btn3D({ position, shape = 'box', args, color, soundType, onClick }) {
  const ref   = useRef();
  // Capture the initial z so we lerp back to the surface, not toward z=0
  // (z=0 is the centre of the body — buttons would sink inside and disappear).
  const restZ = useRef(position[2]);
  const [dn, setDn] = useState(false);

  const press = (e) => {
    e.stopPropagation();
    setDn(true);
    if (soundType) playRetroSound(soundType);
    onClick?.();
  };
  const lift  = (e) => { e?.stopPropagation?.(); setDn(false); };

  useFrame(() => {
    if (!ref.current) return;
    const target = restZ.current + (dn ? -0.025 : 0);
    ref.current.position.z += (target - ref.current.position.z) * 0.35;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerDown={press}
      onPointerUp={lift}
      onPointerLeave={lift}
    >
      {shape === 'sphere'
        ? <sphereGeometry args={[args[0], 32, 32]} />
        : shape === 'cyl'
        ? <cylinderGeometry args={[args[0], args[0], args[1], 24]} />
        : <boxGeometry args={args} />}
      <meshStandardMaterial
        color={color}
        roughness={0.35}
        metalness={0.12}
        emissive={color}
        emissiveIntensity={dn ? 0.45 : 0}
      />
    </mesh>
  );
}

// ── D-pad procedural texture — stipple grip + convex radial shading ──────────
function makeDPadTexture() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  // Base
  ctx.fillStyle = '#dcdcdc';
  ctx.fillRect(0, 0, S, S);

  // Convex radial gradient — lighter centre, darker rim
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.72);
  g.addColorStop(0,   'rgba(255,255,255,0.30)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  g.addColorStop(1,   'rgba(0,0,0,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // Offset stipple dots — staggered rows for rubber-grip feel
  for (let row = 0; row * 7 < S; row++) {
    const offsetX = row % 2 === 0 ? 0 : 3.5;
    for (let col = 0; col * 7 < S; col++) {
      const x = col * 7 + offsetX;
      const y = row * 7;
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fill();
    }
  }

  // Fine cross-hair scratches (mimic injection-moulded plastic)
  ctx.lineWidth = 0.5;
  for (let i = 0; i < S; i += 18) {
    const a = 0.03 + 0.02 * Math.sin(i * 0.21);
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// ── Single pressable D-pad arm ────────────────────────────────────────────────
function DPadArm({ position, args, dpadTex }) {
  const ref    = useRef();
  const restZ  = useRef(position[2]);
  const [dn, setDn] = useState(false);

  const press = (e) => { e.stopPropagation(); setDn(true);  playRetroSound('b'); };
  const lift  = (e) => { e?.stopPropagation?.(); setDn(false); };

  useFrame(() => {
    if (!ref.current) return;
    const target = restZ.current + (dn ? -0.018 : 0);
    ref.current.position.z += (target - ref.current.position.z) * 0.35;
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={press}
      onPointerUp={lift}
      onPointerLeave={lift}
    >
      <RoundedBox args={args} radius={0.016} smoothness={5}>
        <meshStandardMaterial
          color={C.dpad}
          map={dpadTex}
          roughness={0.55}
          metalness={0.04}
          emissive={C.dpad}
          emissiveIntensity={dn ? 0.30 : 0.03}
        />
      </RoundedBox>
    </group>
  );
}

// ── Small Html label (pointer-events off) ────────────────────────────────────
// 'gb-front-html' marks content that must hide while the Game Boy faces away —
// CSS-transformed Html ignores depth, so it would otherwise paint mirrored
// (or with a degenerate projection) over the back of the shell.
function Label({ position, children, size = 8, color = 'rgb(158, 152, 152)' }) {
  return (
    <Html transform position={position} scale={0.006} center
      style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <span className="gb-front-html" style={{
        fontSize: size,
        color,
        fontFamily: "'SF Mono','Fira Code',monospace",
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>{children}</span>
    </Html>
  );
}

// ── Body texture — procedural stipple + diagonal brushed lines ───────────────
// Returns a CanvasTexture; tinted by the material's color prop at render time.
// The canvas itself is neutral grey so the material colour drives the final hue.
function makeBodyTexture() {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  // neutral grey base — the material colour multiplies on top of this
  ctx.fillStyle = '#909090';
  ctx.fillRect(0, 0, S, S);

  // diagonal brushed lines (vary opacity with a sine so it shimmers slightly)
  ctx.lineWidth = 0.8;
  for (let i = -S; i < S * 2; i += 5) {
    const a = 0.025 + 0.02 * (Math.sin(i * 0.07) * 0.5 + 0.5);
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + S, S);
    ctx.stroke();
  }

  // stipple dots — deterministic via sin/cos so the pattern is stable
  for (let x = 0; x < S; x += 6) {
    for (let y = 0; y < S; y += 6) {
      const v = Math.sin(x * 0.22 + y * 0.09) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 0.75, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.04 + v * 0.06})`;
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);        // tile 3× in each direction over the body
  return tex;
}

// ── Cartridge label sticker — canvas texture ──────────────────────────────────
function makeCartLabelTexture() {
  const W = 256, H = 212;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#22224a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 0, W, 30);
  ctx.fillStyle = '#0b0b15';
  ctx.fillRect(0, 30, W, 4);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8e8ff';
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.fillText('ABOUT.GB', W / 2, 108);
  ctx.fillStyle = '#8e8ec9';
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.fillText('PORTFOLIO OS', W / 2, 142);
  ctx.fillStyle = '#55557e';
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText('© 2026 MATTHEW.DEV', W / 2, 190);

  return new THREE.CanvasTexture(cv);
}

// ── Back serial sticker — canvas texture ──────────────────────────────────────
function makeBackStickerTexture() {
  const W = 256, H = 80;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#cdcde0';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#33334f';
  ctx.textAlign = 'left';
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText('MODEL: DMG-2026 · PORTFOLIO OS', 10, 22);
  ctx.fillText('SERIAL: SMU-2025-011', 10, 40);
  // barcode — deterministic pseudo-random stripe widths
  let x = 10;
  for (let i = 0; x < 180; i++) {
    const w = 1 + ((i * 7) % 3);
    ctx.fillRect(x, 50, w, 22);
    x += w + 2 + ((i * 5) % 3);
  }
  return new THREE.CanvasTexture(cv);
}

// ── Entrance animation helpers ────────────────────────────────────────────────
const INTRO_DUR = 1.15; // seconds

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  const tt = Math.min(t, 1);
  return 1 + c3 * Math.pow(tt - 1, 3) + c1 * Math.pow(tt - 1, 2);
}

// ── Scroll keyframe helper ────────────────────────────────────────────────────
// Piecewise interpolation with smoothstep easing between stops.
// stops: [[progress, value], ...] sorted by progress ascending.
function kmap(p, stops) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const [p0, v0] = stops[i - 1];
      const [p1, v1] = stops[i];
      const t = (p - p0) / (p1 - p0);
      return v0 + (v1 - v0) * (t * t * (3 - 2 * t));
    }
  }
  return stops[stops.length - 1][1];
}

// ── The full Game Boy mesh ────────────────────────────────────────────────────
// scrollState: hero pin progress ({ p, pinned }) — drives the cartridge-swap
// choreography while the Home hero is pinned. The Game Boy lives only on the
// Home route now; each content page is its own route with its own animation.
function GameBoyMesh({ introComplete, scrollState }) {
  const bodyTex    = useMemo(() => makeBodyTexture(), []);
  const dpadTex    = useMemo(() => makeDPadTexture(), []);
  const cartTex    = useMemo(() => makeCartLabelTexture(), []);
  const stickerTex = useMemo(() => makeBackStickerTexture(), []);

  // Real PBR plastic maps from Poly Haven (CC0) — stored in /public/textures/
  const plasticRough = useTexture('/textures/plastic_rough.jpg');
  const plasticNor   = useTexture('/textures/plastic_nor.jpg');

  // Set tiling so the plastic surface detail repeats across the body
  useMemo(() => {
    [plasticRough, plasticNor].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      tex.needsUpdate = true;
    });
  }, [plasticRough, plasticNor]);

  const groupRef    = useRef();
  const drag        = useRef({ on: false, sx: 0, sy: 0, rx: 0, ry: 0 });
  const target      = useRef({ x: 0, y: 0 });
  const rotI        = useRef({ x: 0, y: 0 });  // interactive (idle/drag) rotation
  const idleActive  = useRef(true);
  const introStart  = useRef(null);
  const introReady  = useRef(false);

  // ── Scroll-animation plumbing ──
  const frontShown  = useRef(true);   // visibility of front-face Html overlays
  const cartRef     = useRef();
  const lastInsert  = useRef(0);
  const lastReady   = useRef(false);
  const bootRef     = useRef(null);
  const bootLogoRef = useRef(null);
  const bootBarRef  = useRef(null);
  const bootTextRef = useRef(null);

  // Only start the pop-in once the site intro has finished
  useEffect(() => {
    if (introComplete) introReady.current = true;
  }, [introComplete]);

  // Idle float + drag rotation + scroll-driven cartridge-swap choreography
  useFrame(({ clock, viewport, size, camera }) => {
    const g = groupRef.current;
    if (!g) return;

    // Responsive camera dolly — keeps the whole Game Boy in frame on every
    // container aspect ratio (narrow phones through ultrawide desktops).
    // fov=40 was tuned at z=4.8 for landscape/square containers (aspect>=1);
    // on a taller/narrower box the horizontal frustum is what runs out first,
    // clipping the body's left/right edges. Pulling the camera back by
    // 1/aspect keeps the same margin on every side. min(1, aspect) leaves
    // landscape/desktop framing exactly as tuned; the aspect floor guards
    // against a runaway dolly if the container is ever measured at ~0 wide
    // (mid-layout, before ResizeObserver settles).
    if (size.width > 0 && size.height > 0) {
      const aspect = Math.max(0.3, size.width / size.height);
      camera.position.z = 4.8 / Math.min(1, aspect);
    }

    // Entrance pop-in: scale from 0 → 1 with spring overshoot.
    // Wait until the site intro overlay has finished before starting.
    if (!introReady.current) { g.scale.setScalar(0.001); return; }
    if (introStart.current === null) introStart.current = clock.elapsedTime;
    const introT = Math.min((clock.elapsedTime - introStart.current) / INTRO_DUR, 1);
    const entrance = Math.max(0.001, easeOutBack(introT));

    const pinned = scrollState.current.pinned;
    const p = pinned ? scrollState.current.p : 0;
    // Any scroll progress quickly mutes idle bob / drag so scroll owns the pose
    const damp = 1 - kmap(p, [[0, 0], [0.06, 1]]);

    const t = clock.elapsedTime;
    if (!drag.current.on && idleActive.current) {
      target.current.y = Math.sin(t * 0.32) * 0.04;  // max ~2° side tilt
      target.current.x = Math.sin(t * 0.22) * 0.01;  // barely-there forward tilt
    }
    rotI.current.x += (target.current.x - rotI.current.x) * 0.07;
    rotI.current.y += (target.current.y - rotI.current.y) * 0.07;

    // Resting pose inside the full-bleed canvas: replicate the old
    // right-column placement (mirrors .hero-split — 1fr 1.2fr, gap 56,
    // padding 24, max-width 1200) and the old 680px-tall canvas scale.
    let baseX = 0, baseScale = 1;
    if (pinned) {
      const cw = Math.min(1200, size.width);
      const leftCol = (cw - 48 - 56) / 2.2;
      const rightCenterPx = (size.width - cw) / 2 + 24 + leftCol + 56 + (leftCol * 1.2) / 2;
      baseX = ((rightCenterPx - size.width / 2) / size.width) * viewport.width;
      baseScale = Math.min(1, 680 / size.height);
    }

    // ── Scroll choreography ──
    //  0.00–0.18  hero text fades (Hero.jsx), Game Boy drifts to centre stage
    //  0.16–0.40  flip 180° to reveal the back
    //  0.40–0.58  ABOUT.GB cartridge descends and seats into the slot
    //  0.58–0.80  flip back to the front
    //  0.60–0.97  screen boots the cartridge (overlay scrubbed below)
    const scrollRotY = kmap(p, [[0.16, 0], [0.40, Math.PI], [0.58, Math.PI], [0.80, Math.PI * 2]]);
    const scale = entrance * kmap(p, [[0.08, baseScale], [0.30, 1.1], [0.82, 1.1], [0.98, 0.96]]);

    g.scale.setScalar(scale);
    g.position.x = kmap(p, [[0.04, baseX], [0.28, 0]]);
    if (!drag.current.on) g.position.y = Math.sin(t * 0.65) * 0.08 * damp;
    g.rotation.x = rotI.current.x * damp;
    g.rotation.y = rotI.current.y * damp + scrollRotY;
    g.rotation.z = 0;   // hops may roll it — always level in the hero

    // Cartridge descent + seat 'chunk'
    const insertT = kmap(p, [[0.40, 0], [0.585, 1]]);
    if (cartRef.current) {
      cartRef.current.visible = p > 0.28;
      cartRef.current.position.y = 2.3 + (0.58 - 2.3) * insertT;
    }
    if (insertT > 0.97 && lastInsert.current <= 0.97) playRetroSound('insert');
    lastInsert.current = insertT;

    // Boot overlay — DOM mutated directly (no React state per frame)
    if (bootRef.current) {
      bootRef.current.style.opacity = kmap(p, [[0.60, 0], [0.68, 1]]).toFixed(3);
      if (bootLogoRef.current) {
        bootLogoRef.current.style.transform =
          `translateY(${kmap(p, [[0.66, -36], [0.84, 0]]).toFixed(1)}px)`;
      }
      if (bootBarRef.current) {
        // chunky 12-segment fill, like a real cartridge loading bar
        const fill = Math.floor(kmap(p, [[0.70, 0], [0.95, 1]]) * 12) / 12;
        bootBarRef.current.style.width = `${(fill * 100).toFixed(1)}%`;
      }
      const ready = p > 0.96;
      if (bootTextRef.current && ready !== lastReady.current) {
        lastReady.current = ready;
        bootTextRef.current.textContent = ready ? '★ READY — PRESS START ▶' : 'LOADING PORTFOLIO.GB…';
      }
    }
  });

  // Hide front-face Html overlays (screen, labels, brand) while the shell faces
  // away — CSS-transformed Html has no depth test, so it would paint mirrored
  // over the back. Reconciled every frame (drei portals mount asynchronously,
  // so a one-shot toggle can miss elements); writes only on actual change.
  useFrame(({ gl }) => {
    const g = groupRef.current;
    if (!g) return;
    const wrap = gl.domElement.closest('.gb-canvas-wrap');
    if (!wrap) return;

    const vis = Math.cos(g.rotation.y) > 0.25 ? 'visible' : 'hidden';
    frontShown.current = vis === 'visible';
    wrap.querySelectorAll('.gb-front-html').forEach((el) => {
      if (el.style.visibility !== vis) el.style.visibility = vis;
    });

    // The terminal is interactive only while the console rests at the top of
    // the hero; mid-swap it spins and shrinks, so it must not eat page clicks.
    const term = wrap.querySelector('.gb-terminal');
    if (term) {
      const pe = scrollState.current.p < 0.02 ? 'auto' : 'none';
      if (term.style.pointerEvents !== pe) term.style.pointerEvents = pe;
    }
  });

  const startDrag = useCallback((e) => {
    const g = groupRef.current;
    if (!g) return;
    if (scrollState.current.p > 0.03) return;   // scroll owns the pose mid-animation
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, rx: rotI.current.x, ry: rotI.current.y };
    idleActive.current = false;
  }, [scrollState]);

  const moveDrag = useCallback((e) => {
    if (!drag.current.on) return;
    const dx = (e.clientX - drag.current.sx) * 0.003;  // gentler drag
    const dy = (e.clientY - drag.current.sy) * 0.003;
    target.current.y = Math.max(-0.25, Math.min(0.25, drag.current.ry + dx));  // max ~14°
    target.current.x = Math.max(-0.15, Math.min(0.15, drag.current.rx + dy));  // max ~9°
  }, []);

  const endDrag = useCallback(() => {
    if (!drag.current.on) return;
    drag.current.on = false;
    // Spring back to neutral and re-enable idle
    target.current = { x: 0, y: 0 };
    setTimeout(() => { idleActive.current = true; }, 800);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', moveDrag);
    window.addEventListener('pointerup',   endDrag);
    return () => {
      window.removeEventListener('pointermove', moveDrag);
      window.removeEventListener('pointerup',   endDrag);
    };
  }, [moveDrag, endDrag]);

  return (
    <group ref={groupRef} onPointerDown={startDrag}>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {/* 2.6 wide × 2.5 tall × 0.21 deep → front face sits at z = 0.105  */}
      <RoundedBox args={[2.6, 2.6, 0.21]} radius={0.10} smoothness={5}>
        <meshStandardMaterial
          color={C.body}
          map={bodyTex}
          roughnessMap={plasticRough}
          normalMap={plasticNor}
          normalScale={[0.5, 0.5]}
          roughness={0.65}
          metalness={0.06}
        />
      </RoundedBox>

      {/* ── Screen bezel ──────────────────────────────────────────────────── */}
      {/* z=0.107 = body front face (0.105) + half bezel depth (0.008)       */}
      <mesh position={[0, 0.30, 0.107]}>
        <boxGeometry args={[1.68, 1.58, 0.016]} />
        <meshStandardMaterial color={C.bezel} roughness={0.95} />
      </mesh>

      {/* ── Terminal (Html) ───────────────────────────────────────────────── */}
      {/* Sized to fill the bezel exactly: 1.68/0.005=336px, 1.58/0.005=316px.  */}
      {/* drei's <Html transform> always centers the DOM box on this position   */}
      {/* (translate(-50%,-50%) is baked in, regardless of the `center` prop),  */}
      {/* so X/Y here must equal the bezel's own X/Y (0, 0.30) or the screen    */}
      {/* renders off-center inside the bezel cutout on every device.          */}
      <Html
        transform
        position={[0, 0.30, 0.15]}
        scale={0.005}
        distanceFactor={400}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="gb-front-html gb-terminal" style={{
          width: '336px', height: '316px',
          overflow: 'hidden',
          background: C.screen,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <HeroComputer compact />

          {/* ── Cartridge boot screen — scrubbed by scroll in useFrame ── */}
          {/* Classic DMG pea-green; sits above the terminal, fades in once  */}
          {/* the ABOUT.GB cartridge has been seated.                        */}
          <div ref={bootRef} style={{
            position: 'absolute',
            inset: 0,
            background: '#9bbc0f',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            opacity: 0,
            pointerEvents: 'none',
            fontFamily: "'SF Mono','Fira Code',monospace",
          }}>
            <div ref={bootLogoRef} style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: '#0f380f',
            }}>
              MATTHEW.DEV
            </div>
            <div style={{ width: '70%', height: 16, border: '3px solid #0f380f', padding: 2 }}>
              <div ref={bootBarRef} style={{ height: '100%', width: '0%', background: '#0f380f' }} />
            </div>
            <div ref={bootTextRef} style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#306230',
            }}>
              LOADING PORTFOLIO.GB…
            </div>
          </div>
        </div>
      </Html>

      {/* ── Ridge (screen / controls divider) ────────────────────────────── */}
      {/* sits just below bezel bottom (0.30 − 0.79 = −0.49)                */}
      <mesh position={[0, -0.53, 0.107]}>
        <boxGeometry args={[2.40, 0.03, 0.016]} />
        <meshStandardMaterial
          color={C.ridge}
          roughness={0.5}
          emissive={C.ridge}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* ── LED indicator ─────────────────────────────────────────────────── */}
      {/* upper-right corner; body top = 1.25 so y=1.15 is safely inside    */}
      <mesh position={[0.95, 1.15, 0.110]}>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color={C.led} emissive={C.led} emissiveIntensity={1.4} roughness={0.2} />
      </mesh>

      {/* ── Brand name ────────────────────────────────────────────────────── */}
      {/* body top = 1.25; bezel top = 1.09 → place between them at y=1.19  */}
      <Html
        transform
        position={[0, 1.19, 0.110]}
        scale={0.0065}
        distanceFactor={400}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="gb-front-html" style={{
          fontFamily: "'SF Mono','Fira Code',monospace",
          fontSize: 13,
          fontWeight: 700,
          color: '#dadada',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          textShadow: '0 0 12px rgba(99,102,241,0.55)',
        }}>
          matthew.dev
        </div>
      </Html>

      {/* ── D-pad ─────────────────────────────────────────────────────────── */}
      {/* Cross centred at [−0.58, −0.80]. Four separate pressable arms +     */}
      {/* a flush centre cap. Each arm: 0.145 wide × 0.1475 long × 0.055 deep*/}
      {/* Arm centres (from cross centre ± (0.145/2 + 0.1475/2) = ±0.14625): */}
      <DPadArm position={[-0.58,      -0.65375, 0.109]} args={[0.145,  0.1475, 0.055]} dpadTex={dpadTex} />
      <DPadArm position={[-0.58,      -0.94625, 0.109]} args={[0.145,  0.1475, 0.055]} dpadTex={dpadTex} />
      <DPadArm position={[-0.72625,   -0.80,    0.109]} args={[0.1475, 0.145,  0.055]} dpadTex={dpadTex} />
      <DPadArm position={[-0.43375,   -0.80,    0.109]} args={[0.1475, 0.145,  0.055]} dpadTex={dpadTex} />
      {/* Centre cap — covers the junction between all four arms */}
      <RoundedBox position={[-0.58, -0.80, 0.109]} args={[0.145, 0.145, 0.055]} radius={0.012} smoothness={4}>
        <meshStandardMaterial
          color="#1e1e30"
          map={dpadTex}
          roughness={0.88}
          metalness={0.06}
          emissive="#6366f1"
          emissiveIntensity={0.07}
        />
      </RoundedBox>
      <Label position={[-0.58,    -0.655, 0.143]} size={9} color="rgba(255,255,255,0.38)">▲</Label>
      <Label position={[-0.58,    -0.944, 0.143]} size={9} color="rgba(255,255,255,0.38)">▼</Label>
      <Label position={[-0.724,   -0.80,  0.143]} size={9} color="rgba(255,255,255,0.38)">◀</Label>
      <Label position={[-0.436,   -0.80,  0.143]} size={9} color="rgba(255,255,255,0.38)">▶</Label>

      {/* ── A button ──────────────────────────────────────────────────────── */}
      <Btn3D position={[0.59, -0.68, 0.118]} shape="sphere" args={[0.10]} color={C.btnA} soundType="a" />
      <Label position={[0.76, -0.68, 0.118]} size={8} color="rgba(99,102,241,0.7)">A</Label>

      {/* ── B button ──────────────────────────────────────────────────────── */}
      <Btn3D position={[0.37, -0.88, 0.105]} shape="sphere" args={[0.10]} color={C.btnB} soundType="b" />
      <Label position={[0.54, -0.88, 0.118]} size={8} color="rgba(124,58,237,0.7)">B</Label>

    
      {/* ── Speaker holes ─────────────────────────────────────────────────── */}
      {/* y=−1.18 keeps them inside body bottom (−1.25); spread right side   */}
      {[0, 0.16, 0.32, 0.48].map((off, i) => (
        <mesh key={i} position={[0.38 + off, -1.18, 0.107]}>
          <cylinderGeometry args={[0.028, 0.028, 0.038, 8]} />
          <meshStandardMaterial color="#0b0b15" roughness={1} />
        </mesh>
      ))}

      {/* ── Bottom model text ─────────────────────────────────────────────── */}
      <Label position={[0, -1.21, 0.110]} size={7} color="rgba(99,102,241,0.22)">
        PORTFOLIO OS · v2026
      </Label>

      {/* ── Back of the shell — revealed by the scroll-driven flip ────────── */}
      {/* Body back face sits at z = −0.105; details protrude slightly past it */}
      <group>
        {/* Cartridge slot recess plate */}
        <mesh position={[0, 0.55, -0.100]}>
          <boxGeometry args={[1.16, 1.34, 0.02]} />
          <meshStandardMaterial color="#33335a" roughness={0.9} />
        </mesh>
        {/* Slot side rails — guide the cartridge in */}
        <mesh position={[-0.62, 0.55, -0.115]}>
          <boxGeometry args={[0.08, 1.34, 0.045]} />
          <meshStandardMaterial color={C.ridge} roughness={0.6} />
        </mesh>
        <mesh position={[0.62, 0.55, -0.115]}>
          <boxGeometry args={[0.08, 1.34, 0.045]} />
          <meshStandardMaterial color={C.ridge} roughness={0.6} />
        </mesh>
        {/* Corner screws */}
        {[[-1.13, 1.13], [1.13, 1.13], [-1.13, -1.13], [1.13, -1.13]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, -0.105]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.02, 12]} />
            <meshStandardMaterial color="#2c2c4a" roughness={0.6} metalness={0.3} />
          </mesh>
        ))}
        {/* Battery cover with grip grooves */}
        <mesh position={[0, -0.78, -0.103]}>
          <boxGeometry args={[1.0, 0.6, 0.018]} />
          <meshStandardMaterial color="#6f6fb4" roughness={0.7} />
        </mesh>
        {[-0.66, -0.78, -0.90].map((y, i) => (
          <mesh key={i} position={[0, y, -0.104]}>
            <boxGeometry args={[0.92, 0.02, 0.022]} />
            <meshStandardMaterial color="#5a5a94" roughness={0.8} />
          </mesh>
        ))}
        {/* Serial sticker (faces outward from the back) */}
        <mesh position={[0, -0.30, -0.108]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.95, 0.30]} />
          <meshStandardMaterial map={stickerTex} roughness={0.85} />
        </mesh>
      </group>

      {/* ── ABOUT.GB cartridge — descends into the slot on scroll ─────────── */}
      {/* Position.y + visibility driven per-frame from scroll progress.      */}
      <group ref={cartRef} position={[0, 2.3, -0.165]} visible={false}>
        <RoundedBox args={[1.0, 1.12, 0.10]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#52528c" roughness={0.6} metalness={0.05} />
        </RoundedBox>
        {/* grip ridges along the top edge */}
        {[0.38, 0.30, 0.22].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[0.86, 0.025, 0.105]} />
            <meshStandardMaterial color="#3f3f6e" roughness={0.8} />
          </mesh>
        ))}
        {/* label sticker — faces outward while the back is shown */}
        <mesh position={[0, -0.12, -0.054]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.8, 0.66]} />
          <meshStandardMaterial map={cartTex} roughness={0.7} />
        </mesh>
      </group>

    </group>
  );
}

// ── Lights ────────────────────────────────────────────────────────────────────
function Lights() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-2, 0, 2]} intensity={0.35} color="#6366f1" />
      <pointLight position={[0, 2, 3]} intensity={0.5} />
      {/* Back light — keeps the shell readable during the scroll flip */}
      <directionalLight position={[0, 3, -5]} intensity={1.2} />
      <pointLight position={[-1, -1, -3]} intensity={0.3} color="#8a5cff" />
    </>
  );
}

// ── Error boundary — catches WebGL context loss and texture load failures ─────
// Exported so callers can also wrap the whole canvas: an async context-loss
// error from the R3F render loop can surface above the inner boundary, and on a
// portfolio a blank page is unacceptable — the outer boundary keeps the rest of
// the site mounted if the 3-D scene ever fails.
export class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

// ── Export ────────────────────────────────────────────────────────────────────
// scrollState: mutable ref ({ p, pinned }) owned by Hero — drives the pinned
//              cartridge-swap choreography. Falls back to static state when
//              absent, so the Game Boy can also render standalone (mobile).
export default function GameBoy({ introComplete = false, scrollState }) {
  const fallbackScroll = useRef({ p: 0, pinned: false });
  const ss = scrollState ?? fallbackScroll;

  // Skip the Canvas entirely for users who prefer reduced motion — avoids
  // running Three.js animations that would violate their OS accessibility setting.
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) return null;

  return (
    <div className="gb-canvas-wrap">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 40 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            // Make context loss recoverable instead of fatal: preventDefault lets
            // the browser restore the context (and stops three from throwing).
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
          }}
        >
          <Lights />
          <Suspense fallback={null}>
            <GameBoyMesh introComplete={introComplete} scrollState={ss} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

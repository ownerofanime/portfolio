// 3D Game Boy terminal — rendered with React Three Fiber.
// The screen is a real interactive Html overlay (via @react-three/drei <Html>).
// Drag the body to rotate, use keyboard to interact with the terminal on screen.

import { useRef, useState, useEffect, useCallback, Suspense, useMemo } from 'react';
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

// ── Small Html label (pointer-events off) ────────────────────────────────────
function Label({ position, children, size = 8, color = 'rgb(158, 152, 152)' }) {
  return (
    <Html transform position={position} scale={0.006} center
      style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <span style={{
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

// ── The full Game Boy mesh ────────────────────────────────────────────────────
function GameBoyMesh() {
  const bodyTex    = useMemo(() => makeBodyTexture(), []);

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

  const groupRef   = useRef();
  const drag       = useRef({ on: false, sx: 0, sy: 0, rx: 0, ry: 0 });
  const target     = useRef({ x: 0, y: 0 });
  const idleActive = useRef(true);

  // Idle float + lerped rotation toward target
  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.elapsedTime;

    if (!drag.current.on) {
      g.position.y = Math.sin(t * 0.65) * 0.08;   // gentle vertical bob
      if (idleActive.current) {
        target.current.y = Math.sin(t * 0.32) * 0.04;  // max ~2° side tilt
        target.current.x = Math.sin(t * 0.22) * 0.01;  // barely-there forward tilt
      }
    }

    g.rotation.x += (target.current.x - g.rotation.x) * 0.07;
    g.rotation.y += (target.current.y - g.rotation.y) * 0.07;
  });

  const startDrag = useCallback((e) => {
    const g = groupRef.current;
    if (!g) return;
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, rx: g.rotation.x, ry: g.rotation.y };
    idleActive.current = false;
  }, []);

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
      {/* Sized to fill the bezel exactly: 1.68/0.005=336px, 1.58/0.005=316px */}
      {/* z=0.109 sits just in front of bezel (0.107), no separate backing needed */}
      <Html
        transform
        position={[0, 0.30, 0.109]}
        scale={0.005}
        distanceFactor={400}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <div style={{
          width: '336px', height: '316px',
          overflow: 'hidden',
          background: C.screen,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <HeroComputer compact />
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
        <div style={{
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
      {/* centered at [−0.58, −0.80] in the lower-left controls zone         */}
      <mesh position={[-0.58, -0.80, 0.109]}>
        <boxGeometry args={[0.44, 0.145, 0.038]} />
        <meshStandardMaterial color={C.dpad} roughness={0.85} />
      </mesh>
      <mesh position={[-0.58, -0.80, 0.109]}>
        <boxGeometry args={[0.145, 0.44, 0.038]} />
        <meshStandardMaterial color={C.dpad} roughness={0.85} />
      </mesh>
      <mesh position={[-0.58, -0.80, 0.113]}>
        <boxGeometry args={[0.12, 0.12, 0.024]} />
        <meshStandardMaterial color="#26263e" roughness={0.9} />
      </mesh>
      <Label position={[-0.58, -0.65, 0.117]} size={9} color="rgba(255,255,255,0.28)">▲</Label>
      <Label position={[-0.58, -0.95, 0.117]} size={9} color="rgba(255,255,255,0.28)">▼</Label>
      <Label position={[-0.73, -0.80, 0.117]} size={9} color="rgba(255,255,255,0.28)">◀</Label>
      <Label position={[-0.43, -0.80, 0.117]} size={9} color="rgba(255,255,255,0.28)">▶</Label>

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
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function GameBoy() {
  return (
    <div className="gb-canvas-wrap">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Lights />
        <Suspense fallback={null}>
          <GameBoyMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}

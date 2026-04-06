/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../assets/lanyard/card.glb';
import lanyardPNG from '../assets/lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

// ── Sticker definitions ──────────────────────────────────────────────
const STICKERS = [
  { label: 'Python',       bg: '#3776AB', fg: '#FFE873', emoji: '🐍' },
  { label: 'JavaScript',   bg: '#F7DF1E', fg: '#1a1a1a', emoji: 'JS'  },
  { label: 'HTML',         bg: '#E34F26', fg: '#ffffff', emoji: '</>' },
  { label: 'CSS',          bg: '#1572B6', fg: '#ffffff', emoji: '✦'  },
  { label: 'Figma',        bg: '#F24E1E', fg: '#ffffff', emoji: '◆'  },
  { label: 'SQL',          bg: '#336791', fg: '#ffffff', emoji: '🗄️' },
  { label: 'Pandas',       bg: '#130754', fg: '#e2e8f0', emoji: '🐼' },
  { label: 'Git',          bg: '#F05032', fg: '#ffffff', emoji: '⑂'  },
  { label: 'Claude',       bg: '#D97757', fg: '#ffffff', emoji: '✦'  },
  { label: 'Canva',        bg: '#00C4CC', fg: '#ffffff', emoji: '🎨' },
  { label: 'Pixelmator',   bg: '#5E5CE6', fg: '#ffffff', emoji: '✏️' },
  { label: 'sklearn',      bg: '#F7931E', fg: '#1a1a1a', emoji: '⚙'  },
];

// Draw sticker canvas texture for the back of the card
function buildStickerTexture() {
  const W = 512, H = 720;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Card-back base — dark charcoal with subtle noise feel
  ctx.fillStyle = '#1a1a1f';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines as a background pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Helper: draw a sticker pill
  function drawSticker(cx, cy, angle, label, emoji, bg, fg, size = 1) {
    const pH = 36 * size, pW = Math.max(pH * 2.2, (label.length * 10 + 52) * size);
    const r = pH / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // White outline / border for sticker effect
    ctx.shadowColor = 'rgba(255,255,255,0.15)';
    ctx.shadowBlur = 6;

    // Background pill
    ctx.beginPath();
    ctx.roundRect(-pW / 2, -pH / 2, pW, pH, r);
    ctx.fillStyle = bg;
    ctx.fill();

    // Slight inner highlight at top
    const grad = ctx.createLinearGradient(0, -pH / 2, 0, pH / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0.10)');
    ctx.fillStyle = grad;
    ctx.fill();

    // White border
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5 * size;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Emoji / icon
    const emojiSize = 15 * size;
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, -pW / 2 + 10 * size, 1);

    // Label
    ctx.font = `bold ${13 * size}px -apple-system, "SF Pro Display", sans-serif`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, (10 * size + pW / 2 - 10 * size) / 2 - 2 * size, 1);

    ctx.restore();
  }

  // Scatter positions (cx, cy, angle, stickerIndex, size)
  const layout = [
    [130, 100,  0.18, 0,  1.05],
    [340, 130, -0.12, 1,  1.0 ],
    [200, 215,  0.25, 2,  0.95],
    [370, 250, -0.22, 3,  1.0 ],
    [110, 320,  0.10, 4,  1.05],
    [290, 370, -0.15, 5,  1.0 ],
    [150, 445,  0.20, 6,  0.95],
    [380, 430,  0.08, 7,  1.0 ],
    [240, 530, -0.18, 8,  1.05],
    [100, 590,  0.12, 9,  1.0 ],
    [340, 580, -0.08, 10, 1.0 ],
    [210, 655,  0.22, 11, 0.95],
  ];

  layout.forEach(([cx, cy, angle, idx, size]) => {
    const s = STICKERS[idx];
    drawSticker(cx, cy, angle, s.label, s.emoji, s.bg, s.fg, size);
  });

  // Small "Made with ♥" text at bottom
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('made with ♥', W / 2, H - 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  return tex;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  cardImage = null,
  cardScale = 2.25,
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} cardImage={cardImage} cardScale={cardScale} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, cardImage = null, cardScale = 2.25 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardPNG);

  // Custom card image — loaded only when provided, falls back to lanyard png (unused)
  const customCardTexture = useTexture(cardImage || lanyardPNG);

  // PlaneGeometry uses standard UV (0→1), so just set colour space — no flipY or offset needed
  useEffect(() => {
    if (!cardImage) return;
    customCardTexture.colorSpace = THREE.SRGBColorSpace;
    customCardTexture.needsUpdate = true;
  }, [customCardTexture, cardImage]);

  // Configure lanyard band texture
  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
  }, [texture]);

  // Back sticker texture — built once from canvas
  const stickerTexture = useMemo(() => buildStickerTexture(), []);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal';
    return c;
  });
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // Back-plane full size in local (pre-scale) group space — fixed by GLB geometry.
  const CARD_W = 0.8 / 2.25 * 2;    // ≈ 0.711
  const CARD_H = 1.125 / 2.25 * 2;  // = 1.0
  const CARD_D = 0.01 / 2.25 * 2;   // ≈ 0.009 (card thickness)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8 * (cardScale / 2.25), 1.125 * (cardScale / 2.25), 0.01]} />
          <group
            scale={cardScale}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}
          >
            {/* Card body — always uses the GLB's original material */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={materials.base.map} map-anisotropy={16} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
            </mesh>

            {/* Front image overlay — PlaneGeometry has perfect 0→1 UV so image always fits exactly */}
            {cardImage && (
              <mesh position={[0, 0, CARD_D + 0.001]}>
                <planeGeometry args={[CARD_W * 0.94, CARD_H * 0.94]} />
                <meshPhysicalMaterial
                  map={customCardTexture}
                  map-anisotropy={16}
                  clearcoat={isMobile ? 0 : 1}
                  clearcoatRoughness={0.15}
                  roughness={0.9}
                  metalness={0.3}
                  transparent
                />
              </mesh>
            )}

            {/* Back face — sticker sheet */}
            <mesh position={[0, 0, -CARD_D]}>
              <planeGeometry args={[CARD_W * 0.98, CARD_H * 0.98]} />
              <meshPhysicalMaterial
                map={stickerTexture}
                side={THREE.BackSide}
                clearcoat={isMobile ? 0 : 0.6}
                clearcoatRoughness={0.3}
                roughness={0.85}
                metalness={0.1}
              />
            </mesh>

            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={isMobile ? [1000, 2000] : [1000, 1000]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}

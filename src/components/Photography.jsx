import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../photography.css';

// ── Palette ─────────────────────────────────────
const GENRE_COLORS = {
  Concert:   '#FF1744',
  Street:    'rgba(255,255,255,0.85)',
  Portrait:  '#9B30FF',
  Urban:     'rgba(255,255,255,0.5)',
  Landscape: '#FFE600',
  Travel:    '#FFE600',
};

// ── Mock Data ────────────────────────────────────
const FILMSTRIP = [
  { id: 'f1', genre: 'Concert',   title: 'ELECTRIC NIGHT', location: 'Esplanade, Singapore',
    gradient: 'linear-gradient(150deg, #0d0014 0%, #4a0010 55%, #ff1744 100%)' },
  { id: 'f2', genre: 'Street',    title: 'CITY PULSE',     location: 'Kota Tua, Jakarta',
    gradient: 'linear-gradient(150deg, #060610 0%, #0d1b2a 60%, #1b2838 100%)' },
  { id: 'f3', genre: 'Portrait',  title: 'BOLD FACE',      location: 'Singapore CBD',
    gradient: 'linear-gradient(150deg, #0d0014 0%, #2d1b69 55%, #9b30ff 100%)' },
  { id: 'f4', genre: 'Landscape', title: 'HORIZON LINE',   location: 'Seminyak, Bali',
    gradient: 'linear-gradient(150deg, #0a0820 0%, #1a1540 60%, #302b63 100%)' },
  { id: 'f5', genre: 'Travel',    title: 'GOLDEN HOUR',    location: 'Selong Belanak, Lombok',
    gradient: 'linear-gradient(150deg, #1a0e08 0%, #8b4a12 55%, #ffe600 100%)' },
  { id: 'f6', genre: 'Concert',   title: 'FRONT ROW',      location: 'Zepp, Singapore',
    gradient: 'linear-gradient(150deg, #0d0014 0%, #5c1280 50%, #ff1744 100%)' },
];

const ARCHIVE = [
  { id: 'a1', genre: 'Street',    title: 'MONSOON RUSH',    location: 'Jakarta',    ar: '3/4',
    gradient: 'linear-gradient(145deg, #0e0e1e, #16213e)' },
  { id: 'a2', genre: 'Concert',   title: 'STAGE LIGHT',     location: 'Singapore',  ar: '4/3',
    gradient: 'linear-gradient(145deg, #0d0014, #550010, #ff1744)' },
  { id: 'a3', genre: 'Portrait',  title: 'CLARITY',         location: 'Singapore',  ar: '1/1',
    gradient: 'linear-gradient(145deg, #0d0014, #3a1575, #9b30ff)' },
  { id: 'a4', genre: 'Urban',     title: 'CONCRETE PULSE',  location: 'Jakarta',    ar: '16/9',
    gradient: 'linear-gradient(145deg, #111, #2a2a2a, #383838)' },
  { id: 'a5', genre: 'Landscape', title: 'VAST',            location: 'Ende, Flores', ar: '2/3',
    gradient: 'linear-gradient(145deg, #0c2e38, #1a5c44, #71b280)' },
  { id: 'a6', genre: 'Travel',    title: 'TEMPLE DAWN',     location: 'Yogyakarta', ar: '4/3',
    gradient: 'linear-gradient(145deg, #1a1e28, #2a3050, #4286f4)' },
  { id: 'a7', genre: 'Concert',   title: 'FEEDBACK',        location: 'Singapore',  ar: '2/3',
    gradient: 'linear-gradient(145deg, #0d0014, #5c1290, #9b30ff, #ffe600)' },
  { id: 'a8', genre: 'Street',    title: 'NEON RAIN',       location: 'Jakarta',    ar: '1/1',
    gradient: 'linear-gradient(145deg, #0d0014, #7a0020, #ff1744)' },
  { id: 'a9', genre: 'Landscape', title: 'LAST LIGHT',      location: 'Gili Trawangan', ar: '16/9',
    gradient: 'linear-gradient(145deg, #0f1e2a, #1a3545, #2c5364)' },
];

// ── Genre Tag Component ───────────────────────────
function GenreTag({ genre }) {
  const color = GENRE_COLORS[genre] || '#fff';
  return (
    <span className="photo-genre-tag" style={{ color }}>
      {genre}
    </span>
  );
}

// ── usePhotoReveal hook ───────────────────────────
function usePhotoReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('photo-visible'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
}

// ── Photo Nav ─────────────────────────────────────
function PhotoNav({ onExit }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`photo-nav ${scrolled ? 'photo-nav-scrolled' : ''}`}>
        <div className="photo-nav-inner">
          <button className="photo-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            MT
          </button>
          <div className="photo-nav-links">
            <button onClick={() => scrollTo('photo-selected')}>Selected</button>
            <button onClick={() => scrollTo('photo-archive')}>Archive</button>
            <button onClick={() => scrollTo('photo-contact')}>Contact</button>
          </div>
          <div className="photo-nav-right">
            <button className="photo-nav-exit" onClick={onExit}>← Work</button>
            <button
              className={`photo-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      <div className={`photo-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => scrollTo('photo-selected')}>SELECTED</button>
        <button onClick={() => scrollTo('photo-archive')}>ARCHIVE</button>
        <button onClick={() => scrollTo('photo-contact')}>CONTACT</button>
        <button className="photo-mobile-exit" onClick={() => { setMenuOpen(false); onExit(); }}>← WORK</button>
      </div>
    </>
  );
}

// ── Sticker Name Config ───────────────────────────
const STICKER_FONTS = [
  { family: "'Bebas Neue', sans-serif",       weight: 400, style: 'normal' },
  { family: "'Dancing Script', cursive",       weight: 700, style: 'normal' },
  { family: "'Playfair Display', serif",       weight: 700, style: 'normal' },
  { family: "'Space Mono', monospace",         weight: 700, style: 'normal' },
  { family: "'Permanent Marker', cursive",     weight: 400, style: 'normal' },
  { family: "'Abril Fatface', serif",          weight: 400, style: 'normal' },
  { family: "'Inter', sans-serif",             weight: 700, style: 'italic' },
  { family: "'Barlow Condensed', sans-serif",  weight: 700, style: 'normal' },
];

const STICKER_BGS = [
  '#FFFFFF', '#FFFFFF', '#FF1744', '#FFE600',
  '#9B30FF', '#FFFFFF', '#000000', '#FFFFFF',
  '#FF1744', '#FFFFFF', '#FFE600', '#FFFFFF',
  '#FFFFFF', '#9B30FF', '#FFFFFF',
];

const getStickerFg = (bg) => {
  if (bg === '#FFFFFF') return '#0a0a0a';
  if (bg === '#000000') return '#FFFFFF';
  if (bg === '#FFE600') return '#0a0a0a';
  return '#FFFFFF';
};

const SEED = [3, 7, 1, 5, 0, 2, 6, 4, 1, 3, 5, 7, 0, 6, 2];

function buildStickers(text) {
  return text.split('').map((char, i) => {
    const fi = SEED[i % SEED.length] % STICKER_FONTS.length;
    const bg = STICKER_BGS[i % STICKER_BGS.length];
    const rot = ((SEED[i % SEED.length] * 7 + i * 13) % 17) - 8;
    const scale = 0.88 + ((SEED[i % SEED.length] * 3 + i * 5) % 10) / 28;
    return { char, font: STICKER_FONTS[fi], bg, color: getStickerFg(bg), rotation: rot, scale };
  });
}

const STICKERS_FIRST = buildStickers('Matthew');
const STICKERS_LAST  = buildStickers('Tjandera');

function StickerLetter({ config, delay, visible }) {
  const [current, setCurrent] = useState(config);
  const [glitching, setGlitching] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const schedule = () => {
      // Each letter glitches independently at a random interval 2–6s
      const wait = 2000 + Math.random() * 4000 + delay * 0.2;
      timerRef.current = setTimeout(() => {
        setGlitching(true);

        // At the apex of the jump (~180ms in) swap font + colour
        setTimeout(() => {
          const newFontIdx = Math.floor(Math.random() * STICKER_FONTS.length);
          const newBgIdx   = Math.floor(Math.random() * STICKER_BGS.length);
          const newBg      = STICKER_BGS[newBgIdx];
          setCurrent((prev) => ({
            ...prev,
            font:     STICKER_FONTS[newFontIdx],
            bg:       newBg,
            color:    getStickerFg(newBg),
            rotation: Math.random() * 16 - 8,
          }));
        }, 175);

        // End animation + reschedule
        setTimeout(() => {
          setGlitching(false);
          schedule();
        }, 440);
      }, wait);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
  }, [visible]); // eslint-disable-line

  return (
    <span
      className={`photo-sticker-letter ${visible ? 'photo-sticker-visible' : ''} ${glitching ? 'photo-sticker-glitch' : ''}`}
      style={{
        '--sr': `${current.rotation}deg`,
        '--ss': current.scale,
        '--sd': `${delay}ms`,
        fontFamily: current.font.family,
        fontWeight: current.font.weight,
        fontStyle:  current.font.style,
        background: current.bg,
        color:      current.color,
      }}
    >
      {current.char}
    </span>
  );
}

// ── 3D Orbital Scene ──────────────────────────────
function PhotoOrbital() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const rect = mount.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Orbit controls — drag to rotate, auto-rotates when idle
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.06;
    controls.enableZoom       = false;
    controls.enablePan        = false;
    controls.autoRotate       = true;
    controls.autoRotateSpeed  = 0.6;
    controls.minPolarAngle    = 0;
    controls.maxPolarAngle    = Math.PI;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 4, 5);
    scene.add(dir);
    const rim1 = new THREE.PointLight(0xff1744, 0.7, 18);
    rim1.position.set(-4, -2, 3);
    scene.add(rim1);
    const rim2 = new THREE.PointLight(0x9b30ff, 0.5, 18);
    rim2.position.set(3, -3, 2);
    scene.add(rim2);

    // ── 3D Emoji Face (built from geometry) ──
    const faceDark  = new THREE.MeshStandardMaterial({ color: 0x1a0800, roughness: 0.75, metalness: 0 });
    const faceBlush = new THREE.MeshStandardMaterial({
      color: 0xff1744, transparent: true, opacity: 0.42,
      roughness: 1, metalness: 0, depthWrite: false,
    });

    const faceGroup = new THREE.Group();

    // Yellow body
    const bodyGeom = new THREE.SphereGeometry(0.82, 48, 48);
    const bodyMat  = new THREE.MeshStandardMaterial({ color: 0xffe600, roughness: 0.38, metalness: 0 });
    faceGroup.add(new THREE.Mesh(bodyGeom, bodyMat));

    // X eye — two crossed boxes
    const makeEye = (ex, ey, ez) => {
      const g  = new THREE.Group();
      g.position.set(ex, ey, ez);
      const ag = new THREE.BoxGeometry(0.30, 0.058, 0.058);
      const a1 = new THREE.Mesh(ag, faceDark); a1.rotation.z =  Math.PI / 4;
      const a2 = new THREE.Mesh(ag, faceDark); a2.rotation.z = -Math.PI / 4;
      g.add(a1, a2);
      return g;
    };
    faceGroup.add(makeEye(-0.27, 0.25, 0.76));
    faceGroup.add(makeEye( 0.27, 0.25, 0.76));

    // Smile — half-torus flipped to a U-curve
    const smileGeom = new THREE.TorusGeometry(0.30, 0.048, 12, 36, Math.PI);
    const smile = new THREE.Mesh(smileGeom, faceDark);
    smile.position.set(0, -0.13, 0.75);
    smile.rotation.z = Math.PI;   // rotate so arc opens upward = smile ∪
    faceGroup.add(smile);

    // Rosy cheeks — flat circles angled slightly to face forward
    const blushGeom = new THREE.CircleGeometry(0.145, 22);
    const lBlush = new THREE.Mesh(blushGeom, faceBlush);
    lBlush.position.set(-0.50, 0.05, 0.64);
    lBlush.rotation.y = -0.32;   // tilt to hug sphere curvature
    const rBlush = new THREE.Mesh(blushGeom, faceBlush);
    rBlush.position.set( 0.50, 0.05, 0.64);
    rBlush.rotation.y =  0.32;
    faceGroup.add(lBlush, rBlush);

    scene.add(faceGroup);

    // Glow halo — separate so it stays world-space centred
    const glowGeom = new THREE.SphereGeometry(1.10, 32, 32);
    const glowMat  = new THREE.MeshBasicMaterial({ color: 0xffe600, transparent: true, opacity: 0.07 });
    const glow     = new THREE.Mesh(glowGeom, glowMat);
    scene.add(glow);

    // Orbiting shapes — 10 objects, bigger geometry, wider orbits
    const shapes = [
      { geom: new THREE.OctahedronGeometry(0.42, 0),           color: 0xff1744, wire: false, r: 2.1,  spd:  0.55, tilt:  0.30, spin: 0.022, ph: 0 },
      { geom: new THREE.BoxGeometry(0.44, 0.44, 0.44),         color: 0xffe600, wire: true,  r: 2.8,  spd: -0.38, tilt: -0.50, spin: 0.015, ph: Math.PI * 0.70 },
      { geom: new THREE.TorusGeometry(0.30, 0.10, 14, 28),     color: 0x9b30ff, wire: false, r: 2.5,  spd:  0.48, tilt:  0.80, spin: 0.025, ph: Math.PI * 1.30 },
      { geom: new THREE.TetrahedronGeometry(0.38, 0),           color: 0xffffff, wire: true,  r: 3.3,  spd: -0.28, tilt: -0.20, spin: 0.018, ph: Math.PI * 0.40 },
      { geom: new THREE.IcosahedronGeometry(0.34, 0),           color: 0xff1744, wire: true,  r: 1.85, spd:  0.65, tilt:  1.20, spin: 0.030, ph: Math.PI * 1.80 },
      { geom: new THREE.DodecahedronGeometry(0.32, 0),          color: 0xffe600, wire: false, r: 3.7,  spd:  0.22, tilt: -0.70, spin: 0.012, ph: Math.PI * 0.90 },
      { geom: new THREE.TorusKnotGeometry(0.22, 0.08, 64, 8),  color: 0xff1744, wire: false, r: 2.2,  spd: -0.50, tilt:  0.55, spin: 0.020, ph: Math.PI * 0.20 },
      { geom: new THREE.ConeGeometry(0.28, 0.52, 5, 1),        color: 0xffffff, wire: false, r: 3.0,  spd:  0.33, tilt: -0.90, spin: 0.018, ph: Math.PI * 1.55 },
      { geom: new THREE.CylinderGeometry(0.12, 0.12, 0.52, 6), color: 0x9b30ff, wire: true,  r: 1.6,  spd: -0.60, tilt:  0.40, spin: 0.028, ph: Math.PI * 0.60 },
      { geom: new THREE.SphereGeometry(0.25, 6, 5),            color: 0xffe600, wire: false, r: 4.0,  spd:  0.18, tilt: -0.35, spin: 0.015, ph: Math.PI * 1.10 },
    ];

    const orbitals = shapes.map((d) => {
      const mat = d.wire
        ? new THREE.MeshBasicMaterial({ color: d.color, wireframe: true, transparent: true, opacity: 0.7 })
        : new THREE.MeshStandardMaterial({ color: d.color, metalness: 0.3, roughness: 0.5, flatShading: true });
      const mesh = new THREE.Mesh(d.geom, mat);
      scene.add(mesh);
      return { mesh, ...d };
    });

    // Faint orbit rings
    shapes.forEach((d) => {
      const pts = new THREE.EllipseCurve(0, 0, d.r, d.r, 0, Math.PI * 2).getPoints(64);
      const rg = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const ring = new THREE.Line(rg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 }));
      ring.rotation.x = d.tilt;
      scene.add(ring);
    });

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Pulse face
      const pulse = 1 + Math.sin(t * 2) * 0.03;
      faceGroup.scale.setScalar(pulse);
      glow.scale.setScalar(pulse * 1.3);
      glowMat.opacity = 0.06 + Math.sin(t * 1.5) * 0.025;

      // Orbit each shape
      orbitals.forEach((o) => {
        const angle = t * o.spd + o.ph;
        const x = Math.cos(angle) * o.r;
        const z = Math.sin(angle) * o.r;
        o.mesh.position.set(x, z * Math.sin(o.tilt), z * Math.cos(o.tilt));
        o.mesh.rotation.x += o.spin;
        o.mesh.rotation.y += o.spin * 0.7;
      });

      controls.update(); // applies damping + auto-rotate
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const r = mount.getBoundingClientRect();
      width = r.width; height = r.height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      bodyGeom.dispose(); bodyMat.dispose();
      smileGeom.dispose(); blushGeom.dispose();
      faceDark.dispose(); faceBlush.dispose();
      glowGeom.dispose(); glowMat.dispose();
      shapes.forEach((d) => d.geom.dispose());
      orbitals.forEach((o) => o.mesh.material.dispose());
    };
  }, []);

  return <div ref={mountRef} className="photo-orbital-canvas" />;
}

// ── Photo Hero ────────────────────────────────────
function PhotoHero() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="photo-hero" className="photo-hero">
      <div className="photo-hero-split">
        {/* Left: sticker name */}
        <div className={`photo-hero-left ${entered ? 'photo-hero-entered' : ''}`}>
          <p className="photo-label" style={{ marginBottom: 24, opacity: 0.5 }}>
            Photography Portfolio
          </p>
          <h1 className="photo-sticker-name" aria-label="Matthew Tjandera">
            <span className="photo-sticker-row">
              {STICKERS_FIRST.map((cfg, i) => (
                <StickerLetter key={`f${i}`} config={cfg} delay={80 + i * 55} visible={entered} />
              ))}
            </span>
            <span className="photo-sticker-row">
              {STICKERS_LAST.map((cfg, i) => (
                <StickerLetter key={`l${i}`} config={cfg} delay={480 + i * 55} visible={entered} />
              ))}
            </span>
          </h1>
          <div className="photo-hero-meta" style={{ marginTop: 28 }}>
            <span className="photo-hero-location">Singapore · Indonesia</span>
            <div className="photo-hero-genres">
              {['Concert', 'Street', 'Landscape', 'Portrait'].map((g) => (
                <GenreTag key={g} genre={g} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: 3D orbital */}
        <div className="photo-hero-right">
          <PhotoOrbital />
        </div>
      </div>

      <div className="photo-hero-scroll">
        <span>Scroll</span>
        <div className="photo-scroll-line" />
      </div>
    </section>
  );
}

// ── Photo Filmstrip ───────────────────────────────
function PhotoFilmstrip() {
  const trackRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const ref = usePhotoReveal(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY * 1.4;
    };

    const onScroll = () => {
      const itemW = el.querySelector('.photo-filmstrip-item')?.offsetWidth || el.clientWidth * 0.55;
      const idx = Math.round(el.scrollLeft / (itemW + 10));
      setActiveIdx(Math.min(Math.max(idx, 0), FILMSTRIP.length - 1));
    };

    const onMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - el.offsetLeft;
      startScrollLeft.current = el.scrollLeft;
      el.classList.add('dragging');
    };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = startScrollLeft.current - (x - startX.current) * 1.4;
    };
    const onMouseUp = () => { isDragging.current = false; el.classList.remove('dragging'); };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <section id="photo-selected" className="photo-filmstrip-section">
      <div
        className="photo-filmstrip-header photo-reveal"
        ref={ref}
      >
        <span className="photo-label">Selected Work</span>
        <span className="photo-counter">
          {String(activeIdx + 1).padStart(2, '0')} / {String(FILMSTRIP.length).padStart(2, '0')}
        </span>
      </div>
      <div className="photo-filmstrip-track" ref={trackRef}>
        {FILMSTRIP.map((photo) => (
          <div
            key={photo.id}
            className="photo-filmstrip-item"
            style={{ background: photo.gradient }}
          >
            <div className="photo-filmstrip-overlay">
              <GenreTag genre={photo.genre} />
              <div className="photo-filmstrip-meta">
                <div className="photo-filmstrip-title">{photo.title}</div>
                <div className="photo-filmstrip-location">{photo.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="photo-filmstrip-hint">Drag or scroll to explore →</p>
    </section>
  );
}

// ── Photo Archive Grid ─────────────────────────────
function PhotoGrid() {
  const headerRef = usePhotoReveal(0);

  return (
    <section id="photo-archive" className="photo-archive-section">
      <div className="photo-archive-inner">
        <div className="photo-archive-header">
          <div
            className="photo-archive-title photo-reveal"
            ref={headerRef}
          >
            The Archive
          </div>
          <span className="photo-archive-count">{ARCHIVE.length} images</span>
        </div>
        <div className="photo-archive-grid">
          {ARCHIVE.map((photo, i) => {
            const color = GENRE_COLORS[photo.genre] || '#fff';
            return (
              <div
                key={photo.id}
                className="photo-archive-item"
                style={{ aspectRatio: photo.ar }}
              >
                <div
                  className="photo-archive-bg"
                  style={{ background: photo.gradient, aspectRatio: photo.ar }}
                />
                <div className="photo-archive-info">
                  <span className="photo-genre-tag" style={{ color, alignSelf: 'flex-start' }}>
                    {photo.genre}
                  </span>
                  <div>
                    <div className="photo-archive-item-title">{photo.title}</div>
                    <span className="photo-archive-item-location">{photo.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Editorial Statement ───────────────────────────
function PhotoStatement() {
  const lines = useRef([]);
  const eyebrowRef = useRef(null);

  useEffect(() => {
    const allEls = [eyebrowRef.current, ...lines.current].filter(Boolean);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          allEls.forEach((el, i) => {
            setTimeout(() => el?.classList.add('photo-visible'), i * 110);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (allEls[0]) observer.observe(allEls[0]);
    return () => observer.disconnect();
  }, []);

  const setLineRef = useCallback((i) => (el) => { lines.current[i] = el; }, []);

  return (
    <section className="photo-statement-section">
      <div className="photo-statement-inner">
        <span className="photo-statement-eyebrow photo-statement-line" ref={eyebrowRef}>
          The Philosophy
        </span>
        <span className="photo-statement-line" ref={setLineRef(0)}>BLINK AND</span>
        <span className="photo-statement-line" ref={setLineRef(1)}>YOU MISS IT.</span>
        <span className="photo-statement-line accent" ref={setLineRef(2)}>I DON'T.</span>
      </div>
    </section>
  );
}

// ── Photography Contact ───────────────────────────
function PhotoContact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' });
  const leftRef = usePhotoReveal(0);
  const rightRef = usePhotoReveal(120);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Photography inquiry:', form);
    setSubmitted(true);
  };

  return (
    <section id="photo-contact" className="photo-contact-section">
      <div className="photo-contact-inner">
        <div className="photo-contact-left photo-reveal" ref={leftRef}>
          <h2 className="photo-contact-heading">
            LET'S MAKE<br />
            <span>SOMETHING.</span>
          </h2>
          <p className="photo-contact-sub">
            Available for editorial shoots, concert & event coverage, portrait sessions, and travel projects.
            Based in Singapore, open to travel.
          </p>
          <div className="photo-contact-links">
            <a href="mailto:matthewtjandera@gmail.com" className="photo-contact-link">
              <span className="photo-contact-link-type">Email</span>
              matthewtjandera@gmail.com
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="photo-contact-link">
              <span className="photo-contact-link-type">Instagram</span>
              @matthewtjandera
            </a>
          </div>
        </div>

        <div className="photo-reveal" ref={rightRef}>
          {submitted ? (
            <div className="photo-form-success">
              Message received — I'll be in touch soon.
            </div>
          ) : (
            <form className="photo-form" onSubmit={handleSubmit}>
              <div className="photo-form-group">
                <label className="photo-form-label" htmlFor="p-name">Name</label>
                <input
                  id="p-name" type="text" required
                  className="photo-form-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="photo-form-group">
                <label className="photo-form-label" htmlFor="p-email">Email</label>
                <input
                  id="p-email" type="email" required
                  className="photo-form-input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="photo-form-group">
                <label className="photo-form-label" htmlFor="p-type">Project Type</label>
                <select
                  id="p-type" required
                  className="photo-form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="" disabled>Select a type</option>
                  <option value="editorial">Editorial</option>
                  <option value="concert">Concert / Event</option>
                  <option value="portrait">Portrait Session</option>
                  <option value="travel">Travel Project</option>
                  <option value="street">Street / Documentary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="photo-form-group">
                <label className="photo-form-label" htmlFor="p-message">Message</label>
                <textarea
                  id="p-message" required
                  className="photo-form-textarea"
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button type="submit" className="photo-submit-btn">
                Send Inquiry →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Photography Footer ─────────────────────────────
function PhotoFooter({ onExit }) {
  return (
    <footer className="photo-footer">
      <div className="photo-footer-inner">
        <span className="photo-footer-logo">MT</span>
        <span className="photo-footer-copy">
          © {new Date().getFullYear()} Matthew Tjandera · Photography
        </span>
        <button className="photo-footer-exit" onClick={onExit}>
          ← Back to Portfolio
        </button>
      </div>
    </footer>
  );
}

// ── Main Export ────────────────────────────────────
export default function Photography({ onExit }) {
  return (
    <div className="photo-world">
      <PhotoNav onExit={onExit} />
      <PhotoHero />
      <PhotoFilmstrip />
      <PhotoGrid />
      <PhotoStatement />
      <PhotoContact />
      <PhotoFooter onExit={onExit} />
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import '../photography.css';
import BorderGlow from './BorderGlow';
import LiquidEther from './LiquidEther';
import Masonry from './Masonry';

// ── Palette ─────────────────────────────────────
const GENRE_COLORS = {
  Concert:   '#FF1744',
  Street:    'rgba(255,255,255,0.85)',
  Portrait:  '#9B30FF',
  Urban:     'rgba(255,255,255,0.5)',
  Landscape: '#FFE600',
  Travel:    '#FFE600',
};

const GENRE_GLOW = {
  Concert:   { colors: ['#FF1744', '#ff5c7a', '#ff0040'], glow: '350 90 55' },
  Street:    { colors: ['#8899aa', '#667788', '#aabbcc'], glow: '210 20 65' },
  Portrait:  { colors: ['#9B30FF', '#c084fc', '#7c3aed'], glow: '270 90 65' },
  Urban:     { colors: ['#888888', '#aaaaaa', '#666666'], glow: '0 0 65' },
  Landscape: { colors: ['#FFE600', '#fbbf24', '#f59e0b'], glow: '50 90 60' },
  Travel:    { colors: ['#FFE600', '#f59e0b', '#38bdf8'], glow: '45 85 60' },
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

// ── Photo Hero ────────────────────────────────────
function PhotoHero() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="photo-hero" className="photo-hero">
      {/* LiquidEther background */}
      <div className="photo-hero-bg">
        <LiquidEther
          colors={['#0d0014', '#FF1744', '#9B30FF', '#FFE600']}
          mouseForce={50}
          cursorSize={180}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.9}
          autoIntensity={4.0}
          takeoverDuration={0.2}
          autoResumeDelay={0}
          autoRampDuration={0}
        />
      </div>

      <div className={`photo-hero-center ${entered ? 'photo-hero-entered' : ''}`}>
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
        {FILMSTRIP.map((photo) => {
          const glow = GENRE_GLOW[photo.genre] || GENRE_GLOW.Street;
          return (
            <BorderGlow
              key={photo.id}
              colors={glow.colors}
              glowColor={glow.glow}
              backgroundColor="#0a0a0a"
              borderRadius={0}
              glowRadius={30}
              glowIntensity={1}
              coneSpread={25}
              edgeSensitivity={25}
              className="photo-filmstrip-glow"
            >
              <div
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
            </BorderGlow>
          );
        })}
      </div>
      <p className="photo-filmstrip-hint">Drag or scroll to explore →</p>
    </section>
  );
}

// ── Event Galleries ──────────────────────────────────
const EVENT_GALLERIES = [
  {
    label: 'Event Coverage',
    title: 'SMU Patrons Day 2025 X Shazza',
    images: [
      { src: '/SMU Patrons Day/VID08871.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08873.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08876.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08878.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08880.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08881.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08882.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08883.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08884.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08885.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08890.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08891.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08894.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08907.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08908.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08910.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08911.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08912.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08913.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08914.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08917.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08920.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08929.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08932.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08938.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08941.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08946.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08948.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08951.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08959.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08962.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08963.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08966.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08973.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08980.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08992.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08993.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08994.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08997.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08998.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID08999.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09012.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09015.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09016.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09023.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09025.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09030.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09047.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09056.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09059.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09062.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09063.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09065.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09068.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09080.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09095.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09098.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09102.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09108.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09111.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09116.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09117.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09122.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09124.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09125.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09126.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09129.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09133.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09134.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09135.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09137.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09140.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09144.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09146.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09147.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09156.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09158.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09160.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09164.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09165.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09173.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09178.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09189.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09193.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09194.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09204.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09209.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09211.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09213.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09215.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09216.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09219.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09220.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09223.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09229.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09245.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09246.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09250.JPG', alt: 'SMU Patrons Day 2025' },
      { src: '/SMU Patrons Day/VID09253.JPG', alt: 'SMU Patrons Day 2025' },
    ],
  },
  {
    label: 'Travel',
    title: 'Belgium & Netherlands 2025',
    images: [
      { src: '/photos from Belgium and Netherland/1.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/1(1).png', alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/2.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/3.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/3(1).png', alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/4.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/6.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/7.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/8.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/9.png',    alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/10.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/11.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/12.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/13.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/14.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/15.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/16.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/16(1).png',alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/17.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/18.png',   alt: 'Belgium & Netherlands 2025' },
      { src: '/photos from Belgium and Netherland/19.png',   alt: 'Belgium & Netherlands 2025' },
    ],
  },
  {
    label: 'Event Coverage',
    title: 'Church Photos',
    images: [
      { src: '/church photos/SCR-20260406-kehz.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kejv.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-keli.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kema.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kena.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kenz.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-keov.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-keqc.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kesc.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kesy.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-ketp.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-keuk.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kevp.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kewv.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-keyl.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfbs.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfcy.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfes.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfgf.png',  alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfib.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfjb.jpeg', alt: 'Church Photos' },
      { src: '/church photos/SCR-20260406-kfkp.jpeg', alt: 'Church Photos' },
    ],
  },
  {
    label: 'Travel',
    title: 'New Zealand Trip 2025',
    images: [
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbgv.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbjb.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbku.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbmd.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbpl.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbrg.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbsi.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbts.jpeg', alt: 'New Zealand Trip 2025' },
      { src: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbwj.jpeg', alt: 'New Zealand Trip 2025' },
    ],
  },
];

// ── Lightbox ──────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIndex(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  const current = images[index];

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <button
        className="lb-arrow lb-prev"
        onClick={e => { e.stopPropagation(); setIndex(i => (i - 1 + images.length) % images.length); }}
      >‹</button>
      <div className="lb-content" onClick={e => e.stopPropagation()}>
        <img className="lb-img" src={current.src || current.img} alt={current.alt || ''} />
      </div>
      <button
        className="lb-arrow lb-next"
        onClick={e => { e.stopPropagation(); setIndex(i => (i + 1) % images.length); }}
      >›</button>
      <div className="lb-counter">{index + 1} / {images.length}</div>
    </div>
  );
}

function PhotoEventGallery({ label, title, images, onOpen }) {
  const headerRef = usePhotoReveal(0);

  return (
    <section className="photo-event-gallery-section">
      <div className="photo-event-gallery-inner">
        <div className="photo-event-gallery-header photo-reveal" ref={headerRef}>
          <span className="photo-label">{label}</span>
          <h2 className="photo-event-gallery-title">{title}</h2>
        </div>
        <div className="photo-event-gallery-grid">
          {images.map((img, i) => (
            <div key={i} className="photo-event-gallery-item" onClick={() => onOpen(images, i)}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Masonry archive items (real photos) ──────────────
const MASONRY_ITEMS = [
  // SMU Patrons Day
  { id: 's1',  img: '/SMU Patrons Day/VID08871.JPG', height: 600 },
  { id: 's2',  img: '/SMU Patrons Day/VID08873.JPG', height: 440 },
  { id: 's3',  img: '/SMU Patrons Day/VID08876.JPG', height: 660 },
  { id: 's4',  img: '/SMU Patrons Day/VID08878.JPG', height: 480 },
  { id: 's5',  img: '/SMU Patrons Day/VID08880.JPG', height: 560 },
  { id: 's6',  img: '/SMU Patrons Day/VID08881.JPG', height: 400 },
  { id: 's7',  img: '/SMU Patrons Day/VID08882.JPG', height: 620 },
  { id: 's8',  img: '/SMU Patrons Day/VID08883.JPG', height: 460 },
  { id: 's9',  img: '/SMU Patrons Day/VID08884.JPG', height: 520 },
  { id: 's10', img: '/SMU Patrons Day/VID08885.JPG', height: 580 },
  { id: 's11', img: '/SMU Patrons Day/VID08890.JPG', height: 420 },
  { id: 's12', img: '/SMU Patrons Day/VID08891.JPG', height: 640 },
  { id: 's13', img: '/SMU Patrons Day/VID08894.JPG', height: 500 },
  { id: 's14', img: '/SMU Patrons Day/VID08907.JPG', height: 560 },
  { id: 's15', img: '/SMU Patrons Day/VID08908.JPG', height: 380 },
  { id: 's16', img: '/SMU Patrons Day/VID08910.JPG', height: 620 },
  { id: 's17', img: '/SMU Patrons Day/VID08911.JPG', height: 460 },
  { id: 's18', img: '/SMU Patrons Day/VID08912.JPG', height: 540 },
  { id: 's19', img: '/SMU Patrons Day/VID08913.JPG', height: 600 },
  { id: 's20', img: '/SMU Patrons Day/VID08914.JPG', height: 440 },
  { id: 's21', img: '/SMU Patrons Day/VID08917.JPG', height: 660 },
  { id: 's22', img: '/SMU Patrons Day/VID08920.JPG', height: 480 },
  { id: 's23', img: '/SMU Patrons Day/VID08929.JPG', height: 520 },
  { id: 's24', img: '/SMU Patrons Day/VID08932.JPG', height: 400 },
  { id: 's25', img: '/SMU Patrons Day/VID08938.JPG', height: 580 },
  { id: 's26', img: '/SMU Patrons Day/VID08941.JPG', height: 620 },
  { id: 's27', img: '/SMU Patrons Day/VID08946.JPG', height: 460 },
  { id: 's28', img: '/SMU Patrons Day/VID08948.JPG', height: 540 },
  { id: 's29', img: '/SMU Patrons Day/VID08951.JPG', height: 600 },
  { id: 's30', img: '/SMU Patrons Day/VID08959.JPG', height: 420 },
  { id: 's31', img: '/SMU Patrons Day/VID08962.JPG', height: 640 },
  { id: 's32', img: '/SMU Patrons Day/VID08963.JPG', height: 500 },
  { id: 's33', img: '/SMU Patrons Day/VID08966.JPG', height: 560 },
  { id: 's34', img: '/SMU Patrons Day/VID08973.JPG', height: 380 },
  { id: 's35', img: '/SMU Patrons Day/VID08980.JPG', height: 620 },
  { id: 's36', img: '/SMU Patrons Day/VID08992.JPG', height: 460 },
  { id: 's37', img: '/SMU Patrons Day/VID08993.JPG', height: 540 },
  { id: 's38', img: '/SMU Patrons Day/VID08994.JPG', height: 600 },
  { id: 's39', img: '/SMU Patrons Day/VID08997.JPG', height: 440 },
  { id: 's40', img: '/SMU Patrons Day/VID08998.JPG', height: 660 },
  { id: 's41', img: '/SMU Patrons Day/VID08999.JPG', height: 480 },
  { id: 's42', img: '/SMU Patrons Day/VID09012.JPG', height: 520 },
  { id: 's43', img: '/SMU Patrons Day/VID09015.JPG', height: 400 },
  { id: 's44', img: '/SMU Patrons Day/VID09016.JPG', height: 580 },
  { id: 's45', img: '/SMU Patrons Day/VID09023.JPG', height: 620 },
  { id: 's46', img: '/SMU Patrons Day/VID09025.JPG', height: 460 },
  { id: 's47', img: '/SMU Patrons Day/VID09030.JPG', height: 540 },
  { id: 's48', img: '/SMU Patrons Day/VID09047.JPG', height: 600 },
  { id: 's49', img: '/SMU Patrons Day/VID09056.JPG', height: 420 },
  { id: 's50', img: '/SMU Patrons Day/VID09059.JPG', height: 640 },
  { id: 's51', img: '/SMU Patrons Day/VID09062.JPG', height: 500 },
  { id: 's52', img: '/SMU Patrons Day/VID09063.JPG', height: 560 },
  { id: 's53', img: '/SMU Patrons Day/VID09065.JPG', height: 380 },
  { id: 's54', img: '/SMU Patrons Day/VID09068.JPG', height: 620 },
  { id: 's55', img: '/SMU Patrons Day/VID09080.JPG', height: 460 },
  { id: 's56', img: '/SMU Patrons Day/VID09095.JPG', height: 540 },
  { id: 's57', img: '/SMU Patrons Day/VID09098.JPG', height: 600 },
  { id: 's58', img: '/SMU Patrons Day/VID09102.JPG', height: 440 },
  { id: 's59', img: '/SMU Patrons Day/VID09108.JPG', height: 660 },
  { id: 's60', img: '/SMU Patrons Day/VID09111.JPG', height: 480 },
  { id: 's61', img: '/SMU Patrons Day/VID09116.JPG', height: 520 },
  { id: 's62', img: '/SMU Patrons Day/VID09117.JPG', height: 400 },
  { id: 's63', img: '/SMU Patrons Day/VID09122.JPG', height: 580 },
  { id: 's64', img: '/SMU Patrons Day/VID09124.JPG', height: 620 },
  { id: 's65', img: '/SMU Patrons Day/VID09125.JPG', height: 460 },
  { id: 's66', img: '/SMU Patrons Day/VID09126.JPG', height: 540 },
  { id: 's67', img: '/SMU Patrons Day/VID09129.JPG', height: 600 },
  { id: 's68', img: '/SMU Patrons Day/VID09133.JPG', height: 420 },
  { id: 's69', img: '/SMU Patrons Day/VID09134.JPG', height: 640 },
  { id: 's70', img: '/SMU Patrons Day/VID09135.JPG', height: 500 },
  { id: 's71', img: '/SMU Patrons Day/VID09137.JPG', height: 560 },
  { id: 's72', img: '/SMU Patrons Day/VID09140.JPG', height: 380 },
  { id: 's73', img: '/SMU Patrons Day/VID09144.JPG', height: 620 },
  { id: 's74', img: '/SMU Patrons Day/VID09146.JPG', height: 460 },
  { id: 's75', img: '/SMU Patrons Day/VID09147.JPG', height: 540 },
  { id: 's76', img: '/SMU Patrons Day/VID09156.JPG', height: 600 },
  { id: 's77', img: '/SMU Patrons Day/VID09158.JPG', height: 440 },
  { id: 's78', img: '/SMU Patrons Day/VID09160.JPG', height: 660 },
  { id: 's79', img: '/SMU Patrons Day/VID09164.JPG', height: 480 },
  { id: 's80', img: '/SMU Patrons Day/VID09165.JPG', height: 520 },
  { id: 's81', img: '/SMU Patrons Day/VID09173.JPG', height: 400 },
  { id: 's82', img: '/SMU Patrons Day/VID09178.JPG', height: 580 },
  { id: 's83', img: '/SMU Patrons Day/VID09189.JPG', height: 620 },
  { id: 's84', img: '/SMU Patrons Day/VID09193.JPG', height: 460 },
  { id: 's85', img: '/SMU Patrons Day/VID09194.JPG', height: 540 },
  { id: 's86', img: '/SMU Patrons Day/VID09204.JPG', height: 600 },
  { id: 's87', img: '/SMU Patrons Day/VID09209.JPG', height: 420 },
  { id: 's88', img: '/SMU Patrons Day/VID09211.JPG', height: 640 },
  { id: 's89', img: '/SMU Patrons Day/VID09213.JPG', height: 500 },
  { id: 's90', img: '/SMU Patrons Day/VID09215.JPG', height: 560 },
  { id: 's91', img: '/SMU Patrons Day/VID09216.JPG', height: 380 },
  { id: 's92', img: '/SMU Patrons Day/VID09219.JPG', height: 620 },
  { id: 's93', img: '/SMU Patrons Day/VID09220.JPG', height: 460 },
  { id: 's94', img: '/SMU Patrons Day/VID09223.JPG', height: 540 },
  { id: 's95', img: '/SMU Patrons Day/VID09229.JPG', height: 600 },
  { id: 's96', img: '/SMU Patrons Day/VID09245.JPG', height: 440 },
  { id: 's97', img: '/SMU Patrons Day/VID09246.JPG', height: 660 },
  { id: 's98', img: '/SMU Patrons Day/VID09250.JPG', height: 480 },
  { id: 's99', img: '/SMU Patrons Day/VID09253.JPG', height: 520 },
  // Belgium & Netherlands
  { id: 'b1',  img: '/photos from Belgium and Netherland/1.png',    height: 600 },
  { id: 'b2',  img: '/photos from Belgium and Netherland/1(1).png', height: 440 },
  { id: 'b3',  img: '/photos from Belgium and Netherland/2.png',    height: 560 },
  { id: 'b4',  img: '/photos from Belgium and Netherland/3.png',    height: 420 },
  { id: 'b5',  img: '/photos from Belgium and Netherland/3(1).png', height: 640 },
  { id: 'b6',  img: '/photos from Belgium and Netherland/4.png',    height: 480 },
  { id: 'b7',  img: '/photos from Belgium and Netherland/6.png',    height: 580 },
  { id: 'b8',  img: '/photos from Belgium and Netherland/7.png',    height: 400 },
  { id: 'b9',  img: '/photos from Belgium and Netherland/8.png',    height: 660 },
  { id: 'b10', img: '/photos from Belgium and Netherland/9.png',    height: 460 },
  { id: 'b11', img: '/photos from Belgium and Netherland/10.png',   height: 540 },
  { id: 'b12', img: '/photos from Belgium and Netherland/11.png',   height: 600 },
  { id: 'b13', img: '/photos from Belgium and Netherland/12.png',   height: 380 },
  { id: 'b14', img: '/photos from Belgium and Netherland/13.png',   height: 620 },
  { id: 'b15', img: '/photos from Belgium and Netherland/14.png',   height: 500 },
  { id: 'b16', img: '/photos from Belgium and Netherland/15.png',   height: 560 },
  { id: 'b17', img: '/photos from Belgium and Netherland/16.png',   height: 440 },
  { id: 'b18', img: '/photos from Belgium and Netherland/16(1).png',height: 640 },
  { id: 'b19', img: '/photos from Belgium and Netherland/17.png',   height: 480 },
  { id: 'b20', img: '/photos from Belgium and Netherland/18.png',   height: 520 },
  { id: 'b21', img: '/photos from Belgium and Netherland/19.png',   height: 600 },
  // Church Photos
  { id: 'c1',  img: '/church photos/SCR-20260406-kehz.jpeg', height: 560 },
  { id: 'c2',  img: '/church photos/SCR-20260406-kejv.png',  height: 420 },
  { id: 'c3',  img: '/church photos/SCR-20260406-keli.png',  height: 620 },
  { id: 'c4',  img: '/church photos/SCR-20260406-kema.png',  height: 480 },
  { id: 'c5',  img: '/church photos/SCR-20260406-kena.jpeg', height: 540 },
  { id: 'c6',  img: '/church photos/SCR-20260406-kenz.png',  height: 400 },
  { id: 'c7',  img: '/church photos/SCR-20260406-keov.png',  height: 660 },
  { id: 'c8',  img: '/church photos/SCR-20260406-keqc.jpeg', height: 440 },
  { id: 'c9',  img: '/church photos/SCR-20260406-kesc.png',  height: 580 },
  { id: 'c10', img: '/church photos/SCR-20260406-kesy.png',  height: 460 },
  { id: 'c11', img: '/church photos/SCR-20260406-ketp.png',  height: 500 },
  { id: 'c12', img: '/church photos/SCR-20260406-keuk.png',  height: 380 },
  { id: 'c13', img: '/church photos/SCR-20260406-kevp.jpeg', height: 620 },
  { id: 'c14', img: '/church photos/SCR-20260406-kewv.png',  height: 440 },
  { id: 'c15', img: '/church photos/SCR-20260406-keyl.png',  height: 560 },
  { id: 'c16', img: '/church photos/SCR-20260406-kfbs.png',  height: 480 },
  { id: 'c17', img: '/church photos/SCR-20260406-kfcy.png',  height: 420 },
  { id: 'c18', img: '/church photos/SCR-20260406-kfes.png',  height: 600 },
  { id: 'c19', img: '/church photos/SCR-20260406-kfgf.png',  height: 460 },
  { id: 'c20', img: '/church photos/SCR-20260406-kfib.jpeg', height: 540 },
  { id: 'c21', img: '/church photos/SCR-20260406-kfjb.jpeg', height: 400 },
  { id: 'c22', img: '/church photos/SCR-20260406-kfkp.jpeg', height: 520 },
  // New Zealand Trip
  { id: 'm20', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbgv.jpeg', height: 580 },
  { id: 'm21', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbjb.jpeg', height: 420 },
  { id: 'm22', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbku.jpeg', height: 660 },
  { id: 'm23', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbmd.jpeg', height: 440 },
  { id: 'm24', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbpl.jpeg', height: 500 },
  { id: 'm25', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbrg.jpeg', height: 380 },
  { id: 'm26', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbsi.jpeg', height: 620 },
  { id: 'm27', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbts.jpeg', height: 460 },
  { id: 'm28', img: '/photography_New_Zealand_Trip_2025/SCR-20260403-qbwj.jpeg', height: 540 },
];

// ── Photo Archive Grid (Masonry) ───────────────────
function PhotoGrid({ onOpen }) {
  const headerRef = usePhotoReveal(0);
  const masonryImages = MASONRY_ITEMS.map(item => ({ src: item.img, img: item.img, alt: '' }));

  return (
    <section id="photo-archive" className="photo-archive-section">
      <div className="photo-archive-inner">
        <div className="photo-archive-header">
          <div className="photo-archive-title photo-reveal" ref={headerRef}>
            The Archive
          </div>
          <span className="photo-archive-count">{MASONRY_ITEMS.length} images</span>
        </div>
        <div className="photo-masonry-wrap">
          <Masonry
            items={MASONRY_ITEMS}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={0.97}
            blurToFocus
            stagger={0.03}
            duration={0.5}
            onItemClick={(item) => {
              const idx = MASONRY_ITEMS.findIndex(m => m.id === item.id);
              onOpen(masonryImages, idx);
            }}
          />
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
          <div style={{ marginTop: 24 }}>
            <a
              href="/Matthew Photography Portofolio (2).pdf"
              download
              className="photo-submit-btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Download Portfolio ↗
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
  const [lightbox, setLightbox] = useState(null); // { images, index }

  const openLightbox = useCallback((images, index) => {
    setLightbox({ images, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <div className="photo-world">
      <PhotoNav onExit={onExit} />
      <PhotoHero />
      {EVENT_GALLERIES.map((gallery, i) => (
        <PhotoEventGallery
          key={i}
          label={gallery.label}
          title={gallery.title}
          images={gallery.images}
          onOpen={openLightbox}
        />
      ))}
      <PhotoGrid onOpen={openLightbox} />
      <PhotoStatement />
      <PhotoContact />
      <PhotoFooter onExit={onExit} />
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}

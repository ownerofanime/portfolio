import { useState, useEffect, useRef, useCallback } from 'react';
import '../photography.css';
import BorderGlow from './BorderGlow';
import LiquidEther from './LiquidEther';
import Lanyard from './Lanyard';
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
          mouseForce={20}
          cursorSize={120}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.4}
          autoIntensity={2.0}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

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

        {/* Right: Lanyard */}
        <div className="photo-hero-right">
          <Lanyard position={[0, 0, 13]} gravity={[0, -40, 0]} cardImage="/Matthew Card.png" />
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
      { src: '/photography/smu-patrons-day/SCR-20260403-pzoc.jpeg', alt: 'SMU Patrons Day 2025' },
      { src: '/photography/smu-patrons-day/SCR-20260403-pzps.jpeg', alt: 'SMU Patrons Day 2025' },
      { src: '/photography/smu-patrons-day/SCR-20260403-pzrw.jpeg', alt: 'SMU Patrons Day 2025' },
      { src: '/photography/smu-patrons-day/SCR-20260403-pzwl.jpeg', alt: 'SMU Patrons Day 2025 – Performance' },
      { src: '/photography/smu-patrons-day/SCR-20260403-pzxz.jpeg', alt: 'SMU Patrons Day 2025 – Photographers' },
      { src: '/photography/smu-patrons-day/SCR-20260403-pzzk.jpeg', alt: 'SMU Patrons Day 2025 – Shazza performing' },
      { src: '/photography/smu-patrons-day/SCR-20260403-qabi.jpeg', alt: 'SMU Patrons Day 2025 – Shazza performing B&W' },
      { src: '/photography/smu-patrons-day/SCR-20260403-qadd.jpeg', alt: 'SMU Patrons Day 2025 – Guitarist' },
      { src: '/photography/smu-patrons-day/SCR-20260403-qaen.jpeg', alt: 'SMU Patrons Day 2025 – Band on stage' },
    ],
  },
  {
    label: 'Travel',
    title: 'Europe Trip 2025',
    images: [
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qajq.jpeg', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qalr.png', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qamt.jpeg', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qanq.png', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qaoq.png', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qapv.png', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qaqt.jpeg', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qarv.jpeg', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qasz.jpeg', alt: 'Europe Trip 2025' },
      { src: '/photography_Europe_Trip_2025/SCR-20260403-qaup.jpeg', alt: 'Europe Trip 2025' },
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

function PhotoEventGallery({ label, title, images }) {
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
            <div key={i} className="photo-event-gallery-item">
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
  { id: 'm1',  img: '/photography/smu-patrons-day/SCR-20260403-pzoc.jpeg', height: 600 },
  { id: 'm2',  img: '/photography/smu-patrons-day/SCR-20260403-pzps.jpeg', height: 440 },
  { id: 'm3',  img: '/photography/smu-patrons-day/SCR-20260403-pzrw.jpeg', height: 660 },
  { id: 'm4',  img: '/photography/smu-patrons-day/SCR-20260403-pzwl.jpeg', height: 480 },
  { id: 'm5',  img: '/photography/smu-patrons-day/SCR-20260403-pzxz.jpeg', height: 560 },
  { id: 'm6',  img: '/photography/smu-patrons-day/SCR-20260403-pzzk.jpeg', height: 400 },
  { id: 'm7',  img: '/photography/smu-patrons-day/SCR-20260403-qabi.jpeg', height: 620 },
  { id: 'm8',  img: '/photography/smu-patrons-day/SCR-20260403-qadd.jpeg', height: 460 },
  { id: 'm9',  img: '/photography/smu-patrons-day/SCR-20260403-qaen.jpeg', height: 520 },
  // Europe Trip
  { id: 'm10', img: '/photography_Europe_Trip_2025/SCR-20260403-qajq.jpeg', height: 440 },
  { id: 'm11', img: '/photography_Europe_Trip_2025/SCR-20260403-qalr.png',  height: 600 },
  { id: 'm12', img: '/photography_Europe_Trip_2025/SCR-20260403-qamt.jpeg', height: 380 },
  { id: 'm13', img: '/photography_Europe_Trip_2025/SCR-20260403-qanq.png',  height: 560 },
  { id: 'm14', img: '/photography_Europe_Trip_2025/SCR-20260403-qaoq.png',  height: 420 },
  { id: 'm15', img: '/photography_Europe_Trip_2025/SCR-20260403-qapv.png',  height: 640 },
  { id: 'm16', img: '/photography_Europe_Trip_2025/SCR-20260403-qaqt.jpeg', height: 480 },
  { id: 'm17', img: '/photography_Europe_Trip_2025/SCR-20260403-qarv.jpeg', height: 400 },
  { id: 'm18', img: '/photography_Europe_Trip_2025/SCR-20260403-qasz.jpeg', height: 540 },
  { id: 'm19', img: '/photography_Europe_Trip_2025/SCR-20260403-qaup.jpeg', height: 460 },
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
function PhotoGrid() {
  const headerRef = usePhotoReveal(0);

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
      {EVENT_GALLERIES.map((gallery, i) => (
        <PhotoEventGallery key={i} label={gallery.label} title={gallery.title} images={gallery.images} />
      ))}
      <PhotoGrid />
      <PhotoStatement />
      <PhotoContact />
      <PhotoFooter onExit={onExit} />
    </div>
  );
}

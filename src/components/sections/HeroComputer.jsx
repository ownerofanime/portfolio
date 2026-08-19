// Section — HeroComputer: Claude-style interactive chat terminal for the hero page.
// Replaces the NodeCanvas. Has an avatar (M), chat-style messages, command history,
// Web Audio keyboard click sounds, and a matrix easter egg.
//
// Commands: help, whoami, about, skills, projects, contact,
//           ls, open [section], neofetch, matrix, clear, date, echo

import { useState, useRef, useEffect, useCallback } from 'react';
import Keyboard from '../ui/Keyboard';
import { goTo } from '../../lib/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD SOUNDS — Aceternity "CherryMX Black - ABS keycaps" sprite
//
// sound.ogg  lives in /public/sounds/ (served at /sounds/sound.ogg)
// config.json defines each key as [offsetMs, durationMs] inside the sprite.
//
// The config uses Linux scancodes as keys. CODE_TO_SCANCODE converts
// KeyboardEvent.code (what the browser gives us) to those scancodes.
// ─────────────────────────────────────────────────────────────────────────────

// KeyboardEvent.code → Linux scancode used in the Aceternity sound sprite
const CODE_TO_SCANCODE = {
  Escape: 1,
  Backquote: 41,
  Digit1: 2,  Digit2: 3,  Digit3: 4,  Digit4: 5,  Digit5: 6,
  Digit6: 7,  Digit7: 8,  Digit8: 9,  Digit9: 10, Digit0: 11,
  Minus: 12,  Equal: 13,  Backspace: 14,
  Tab: 15,
  KeyQ: 16, KeyW: 17, KeyE: 18, KeyR: 19, KeyT: 20,
  KeyY: 21, KeyU: 22, KeyI: 23, KeyO: 24, KeyP: 25,
  BracketLeft: 26, BracketRight: 27, Backslash: 43,
  CapsLock: 58,
  KeyA: 30, KeyS: 31, KeyD: 32, KeyF: 33, KeyG: 34,
  KeyH: 35, KeyJ: 36, KeyK: 37, KeyL: 38,
  Semicolon: 39, Quote: 40, Enter: 28,
  ShiftLeft: 42,
  KeyZ: 44, KeyX: 45, KeyC: 46, KeyV: 47, KeyB: 48,
  KeyN: 49, KeyM: 50, Comma: 51, Period: 52, Slash: 53,
  ShiftRight: 54,
  ControlLeft: 29,  AltLeft: 56,  MetaLeft: 3675,
  Space: 57,
  MetaRight: 3676,  AltRight: 3640,
  ArrowUp: 57416, ArrowLeft: 57419, ArrowRight: 57421, ArrowDown: 57424,
};

// [offsetMs, durationMs] within sound.ogg — inlined from config.json
const SOUND_DEFINES = {
  1:     [2894,  226], 2:     [12946, 191], 3:     [13470, 190], 4:     [13963, 199],
  5:     [14481, 204], 6:     [14994, 187], 7:     [15505, 217], 8:     [15990, 193],
  9:     [16529, 184], 10:    [17012, 205], 11:    [17550, 174], 12:    [18052, 186],
  13:    [18553, 177], 14:    [19065, 220], 15:    [21734, 238], 16:    [22245, 190],
  17:    [22790, 177], 18:    [23317, 166], 19:    [23817, 184], 20:    [24297, 183],
  21:    [24811, 186], 22:    [25313, 189], 23:    [25795, 182], 24:    [26309, 167],
  25:    [26804, 166], 26:    [27330, 169], 27:    [27883, 197], 28:    [36902, 234],
  29:    [45327, 165], 30:    [31542, 170], 31:    [32031, 175], 32:    [32492, 169],
  33:    [32973, 174], 34:    [33453, 188], 35:    [33986, 185], 36:    [34425, 176],
  37:    [34932, 180], 38:    [35410, 190], 39:    [35914, 189], 40:    [36428, 173],
  41:    [12476, 200], 42:    [38136, 265], 43:    [28393, 200], 44:    [38694, 160],
  45:    [39148, 151], 46:    [39632, 190], 47:    [40136, 188], 48:    [40621, 214],
  49:    [41103, 180], 50:    [41610, 186], 51:    [42110, 183], 52:    [42594, 180],
  53:    [43105, 190], 54:    [43565, 273], 56:    [45750, 164], 57:    [51541, 287],
  58:    [31011, 251], 3640:  [48381, 168], 3675:  [46199, 199], 3676:  [47929, 149],
  57416: [44251, 220], 57419: [49837, 176], 57421: [50783, 221], 57424: [50333, 179],
};

function useKeySound() {
  // All mutable state lives in a ref so the returned callback is always stable
  const s = useRef({ ctx: null, buf: null, loading: false });

  return useCallback(async (code) => {
    const scancode = CODE_TO_SCANCODE[code];
    if (!scancode) return;
    const entry = SOUND_DEFINES[scancode];
    if (!entry) return;

    // Create AudioContext on first user interaction (satisfies autoplay policy)
    if (!s.current.ctx) {
      s.current.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = s.current.ctx;
    if (ctx.state === 'suspended') ctx.resume();

    // Lazy-load and decode the ~2.5 MB OGG sprite once
    if (!s.current.buf && !s.current.loading) {
      s.current.loading = true;
      try {
        const ab = await fetch('/sounds/sound.ogg').then(r => r.arrayBuffer());
        s.current.buf = await ctx.decodeAudioData(ab);
      } catch {
        s.current.loading = false;
        return;
      }
    }
    if (!s.current.buf) return;   // still loading — skip this keypress silently

    const [offsetMs, durationMs] = entry;
    const src  = ctx.createBufferSource();
    src.buffer = s.current.buf;

    const gain = ctx.createGain();
    gain.gain.value = 0.85;

    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0, offsetMs / 1000, durationMs / 1000);
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// MATRIX RAIN EASTER EGG
// ─────────────────────────────────────────────────────────────────────────────

function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width  = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx   = canvas.getContext('2d');
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF';
    const COL_W = 14;
    const drops = Array(Math.floor(canvas.width / COL_W)).fill(1);
    let frame;

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00e676';
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * COL_W, y * COL_W);
        if (y * COL_W > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const timer = setTimeout(() => { cancelAnimationFrame(frame); onDone(); }, 5000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [onDone]);

  return <canvas ref={canvasRef} className="hc-matrix-canvas" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBCAM PIXEL GRID
// Samples the user's camera at WC_COLS × WC_ROWS resolution and renders it as
// a grid of coloured squares — monochrome green (default) or full colour (C key).
// ─────────────────────────────────────────────────────────────────────────────

const WC_COLS = 52;
const WC_ROWS = 36;

function WebcamPixelGrid({ onClose, colorMode }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  const streamRef = useRef(null);
  // 'requesting' → waiting for permission, 'ready' → streaming, 'error' → denied/unavailable
  const [phase,    setPhase]    = useState('requesting');
  const [errorMsg, setErrorMsg] = useState('');
  // colorMode is controlled by the parent — kept in a ref so the draw loop
  // always reads the latest value without needing to re-create the animation frame.
  const colorRef = useRef(false);
  colorRef.current = colorMode;

  // ── 1. Request camera, wait for first decoded frame ──────────────────────
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        // play() only means "started", not "first frame ready".
        // Wait until videoWidth > 0 (browser has decoded the first frame).
        await new Promise(resolve => {
          if (video.videoWidth > 0) { resolve(); return; }
          video.addEventListener('loadeddata', resolve, { once: true });
          setTimeout(resolve, 3000); // fallback: give up waiting after 3 s
        });

        if (!cancelled) setPhase('ready');
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(
            e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
              ? 'Camera access denied — allow it in your browser settings.'
              : 'No camera available on this device.'
          );
          setPhase('error');
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // ── 2. Pixel-grid render loop ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'ready') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const video = videoRef.current;

    // Tiny offscreen canvas for low-res pixel sampling
    const off    = document.createElement('canvas');
    off.width    = WC_COLS;
    off.height   = WC_ROWS;
    const offCtx = off.getContext('2d');

    const draw = () => {
      // Sync canvas pixel buffer to its actual CSS display size every frame
      // so the grid fills the container correctly even after layout changes.
      const W = canvas.offsetWidth  || 600;
      const H = canvas.offsetHeight || 340;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W;
        canvas.height = H;
      }

      // Skip if video not yet producing frames
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Sample video at WC_COLS × WC_ROWS with horizontal mirror
      offCtx.save();
      offCtx.translate(WC_COLS, 0);
      offCtx.scale(-1, 1);
      offCtx.drawImage(video, 0, 0, WC_COLS, WC_ROWS);
      offCtx.restore();

      const { data } = offCtx.getImageData(0, 0, WC_COLS, WC_ROWS);

      ctx.fillStyle = '#080812';
      ctx.fillRect(0, 0, W, H);

      // Cell dimensions computed per-frame from actual canvas size
      const CW  = W / WC_COLS;
      const CH  = H / WC_ROWS;
      const GAP = Math.max(0.8, CW * 0.1);

      for (let row = 0; row < WC_ROWS; row++) {
        for (let col = 0; col < WC_COLS; col++) {
          const i   = (row * WC_COLS + col) * 4;
          const r   = data[i], g = data[i + 1], b = data[i + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          if (lum < 0.04) continue;

          ctx.fillStyle = colorRef.current
            ? `rgb(${r},${g},${b})`
            : `rgba(0,230,118,${Math.pow(lum, 0.55)})`;

          ctx.fillRect(col * CW + GAP / 2, row * CH + GAP / 2, CW - GAP, CH - GAP);
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase]);

  // Key controls (Escape / C) are handled by the parent HeroComputer so they
  // work for both physical keyboard presses and on-screen keyboard clicks.

  return (
    <div className="hc-webcam-wrap">
      {/*
        Keep video in the DOM with zero size — NOT display:none.
        display:none can prevent browsers from decoding frames
        so drawImage would always produce a black canvas.
      */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
      />

      {phase === 'requesting' && (
        <div className="hc-webcam-status">
          <span className="hc-line" style={{ opacity: 0.6 }}>📷 Requesting camera access…</span>
        </div>
      )}

      {phase === 'error' && (
        <div className="hc-webcam-status">
          <span className="hc-line hc-error">{errorMsg}</span>
          <span className="hc-line" style={{ marginTop: 10, opacity: 0.5 }}>
            Type "exit" to close.
          </span>
        </div>
      )}

      {/* Canvas is always mounted once ready so the ref is stable */}
      {phase === 'ready' && (
        <canvas ref={canvasRef} className="hc-webcam-canvas" />
      )}

      <div className="hc-webcam-bar">
        <span>
          {phase === 'requesting' && '📷 waiting for permission…'}
          {phase === 'error'      && '📷 camera unavailable'}
          {phase === 'ready'      && `📷 webcam — ${colorMode ? 'colour' : 'monochrome'}`}
        </span>
        {phase === 'ready' && (
          <span className="hc-webcam-keys">
            <kbd>C</kbd> colour&nbsp;&nbsp;<kbd>ESC</kbd> / "exit" to close
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HACK ANIMATION EASTER EGG
// ─────────────────────────────────────────────────────────────────────────────

const HACK_SCRIPT = [
  { delay: 0,    text: '> Initializing breach protocol…',           cls: 'hk-dim' },
  { delay: 280,  text: '> Target: matthewtjandera.online',           cls: 'hk-dim' },
  { delay: 520,  text: '> Scanning open ports…',                    cls: 'hk-dim' },
  { delay: 740,  text: '  443/tcp  OPEN   https/TLS 1.3',           cls: 'hk-code' },
  { delay: 960,  text: '  22/tcp   FILTERED',                       cls: 'hk-code' },
  { delay: 1180, text: '> TLS intercept… ████████████ done ✓',      cls: 'hk-ok' },
  { delay: 1420, text: '> Bypassing firewall…',                     cls: 'hk-dim' },
  { delay: 1680, text: '  ██████████████████████████████ 100%',     cls: 'hk-bar' },
  { delay: 1900, text: '> Deploying rootkit…',                      cls: 'hk-dim' },
  { delay: 2100, text: '> sudo rm -rf /all_other_portfolios/*',     cls: 'hk-code' },
  { delay: 2340, text: '> Privilege escalation…          ✓',        cls: 'hk-ok' },
  { delay: 2600, text: '> Injecting maximum cool factor…  ✓',       cls: 'hk-ok' },
  { delay: 2900, text: '  ┌───────────────────────────────────┐',   cls: 'hk-box' },
  { delay: 3050, text: '  │   ✓  ACCESS GRANTED — WELCOME     │',   cls: 'hk-granted' },
  { delay: 3200, text: '  └───────────────────────────────────┘',   cls: 'hk-box' },
];

function HackAnimation({ onDone }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const timers = HACK_SCRIPT.map(({ delay, text, cls }) =>
      setTimeout(() => setLines(prev => [...prev, { text, cls }]), delay)
    );
    const finish = setTimeout(() => { setTimeout(onDone, 800); }, HACK_SCRIPT.at(-1).delay + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
  }, [onDone]);

  return (
    <div className="hc-hack-wrap">
      <div className="hc-hack-lines">
        {lines.map((l, i) => <div key={i} className={`hk-line ${l.cls}`}>{l.text}</div>)}
      </div>
      <div className="hc-hack-hint">ESC or Enter to skip</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER — Open-Meteo (no API key, CORS-enabled)
// ─────────────────────────────────────────────────────────────────────────────

const WMO_CODES = {
  0: '☀️  Clear sky',
  1: '🌤️  Mainly clear',  2: '⛅  Partly cloudy',  3: '☁️  Overcast',
  45: '🌫️  Fog',          48: '🌫️  Icy fog',
  51: '🌦️  Light drizzle', 53: '🌦️  Drizzle',      55: '🌧️  Heavy drizzle',
  61: '🌧️  Light rain',   63: '🌧️  Rain',           65: '🌧️  Heavy rain',
  71: '🌨️  Light snow',   73: '🌨️  Snow',           75: '❄️  Heavy snow',
  80: '🌦️  Showers',      81: '🌧️  Rain showers',   82: '⛈️  Heavy showers',
  95: '⛈️  Thunderstorm', 96: '⛈️  Thunderstorm',   99: '⛈️  Heavy thunderstorm',
};

async function fetchWeather() {
  const res = await fetch(
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=1.3521&longitude=103.8198' +
    '&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m' +
    '&timezone=Asia%2FSingapore'
  );
  const data = await res.json();
  const c = data.current;
  return {
    temp:      c.temperature_2m,
    condition: WMO_CODES[c.weathercode] ?? '❓ Unknown',
    humidity:  c.relative_humidity_2m,
    wind:      c.windspeed_10m,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CALC — safe recursive descent parser (no eval)
// ─────────────────────────────────────────────────────────────────────────────

function safeCalc(expr) {
  const s = expr.replace(/\s/g, '');
  // Reject anything that isn't digits, operators, parens, or a decimal point
  if (!/^[\d+\-*/().^%]+$/.test(s)) return null;
  let pos = 0;
  const peek  = () => s[pos];
  const parseExpr   = () => parseAddSub();
  const parseAddSub = () => {
    let v = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = s[pos++]; const r = parseMulDiv();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const parseMulDiv = () => {
    let v = parsePow();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = s[pos++]; const r = parsePow();
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    }
    return v;
  };
  const parsePow = () => {
    const base = parseUnary();
    if (peek() === '^') { pos++; return Math.pow(base, parsePow()); }
    return base;
  };
  const parseUnary = () => {
    if (peek() === '-') { pos++; return -parseUnary(); }
    if (peek() === '+') { pos++; return  parseUnary(); }
    return parsePrimary();
  };
  const parsePrimary = () => {
    if (peek() === '(') {
      pos++;
      const v = parseExpr();
      if (s[pos] === ')') pos++;
      return v;
    }
    const start = pos;
    while (pos < s.length && /[\d.]/.test(s[pos])) pos++;
    if (pos === start) throw new Error('Expected number');
    return parseFloat(s.slice(start, pos));
  };
  try {
    const result = parseExpr();
    if (pos !== s.length) throw new Error('Trailing input');
    if (!isFinite(result)) return 'Error: division by zero';
    // Trim floating-point noise (e.g. 0.1+0.2 → 0.3 not 0.30000000000000004)
    return String(+result.toPrecision(12));
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SNAKE GAME
// Canvas-rendered retro Snake. All mutable game state lives in gRef so the
// render loop never triggers React re-renders. Input is routed through
// inputRef (set by this component) so the parent can forward on-screen key
// clicks without re-registering event listeners.
// ─────────────────────────────────────────────────────────────────────────────

function SnakeGame({ inputRef, onCloseRef }) {
  const canvasRef  = useRef(null);
  const gRef       = useRef(null);  // { snake, dir, next, food, score, dead }
  const rafRef     = useRef(null);
  const ticRef     = useRef(null);
  const restartRef = useRef(null);
  const [score, setScore] = useState(0);
  const [dead,  setDead]  = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const CELL = 14;
    const COLS = Math.max(12, (canvas.clientWidth  || 336) / CELL | 0);
    const ROWS = Math.max(8,  (canvas.clientHeight || 286) / CELL | 0);
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    const ctx = canvas.getContext('2d');

    const randFood = (snake) => {
      let p;
      do { p = { x: Math.random() * COLS | 0, y: Math.random() * ROWS | 0 }; }
      while (snake.some(s => s.x === p.x && s.y === p.y));
      return p;
    };

    const init = () => {
      const cx = COLS / 2 | 0, cy = ROWS / 2 | 0;
      const snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      gRef.current = { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: randFood(snake), score: 0, dead: false };
      setScore(0); setDead(false);
    };
    restartRef.current = init;
    init();

    // ── Render loop ─────────────────────────────────────────────────────────
    const render = () => {
      const g = gRef.current;
      if (!g) { rafRef.current = requestAnimationFrame(render); return; }
      const W = COLS * CELL, H = ROWS * CELL;

      // Background
      ctx.fillStyle = '#080812';
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx.fillStyle = 'rgba(99,102,241,0.07)';
      for (let x = 0; x < COLS; x++)
        for (let y = 0; y < ROWS; y++)
          ctx.fillRect(x * CELL + CELL * 0.5 - 0.5, y * CELL + CELL * 0.5 - 0.5, 1, 1);

      // Food — glowing red
      ctx.shadowColor = '#ff5c7a'; ctx.shadowBlur = 10;
      ctx.fillStyle   = '#ff5c7a';
      ctx.fillRect(g.food.x * CELL + 3, g.food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;

      // Snake — head bright green with glow, body fades
      g.snake.forEach((seg, i) => {
        if (i === 0) {
          ctx.fillStyle = '#00e676'; ctx.shadowColor = '#00e676'; ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(0,230,118,${Math.max(0.18, 1 - i / g.snake.length * 0.75)})`;
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;

      // Game-over overlay
      if (g.dead) {
        ctx.fillStyle = 'rgba(8,8,18,0.84)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff5c7a'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff5c7a';
        ctx.font = "bold 18px 'SF Mono',monospace";
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = "13px 'SF Mono',monospace";
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 4);
        ctx.fillStyle = 'rgba(99,102,241,0.85)';
        ctx.font = "11px 'SF Mono',monospace";
        ctx.fillText('R — restart   ESC — exit', W / 2, H / 2 + 24);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // ── Game tick ───────────────────────────────────────────────────────────
    const tick = () => {
      const g = gRef.current;
      if (!g || g.dead) return;
      g.dir = g.next;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      // Wall + self collision → game over
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
          g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.dead = true; setDead(true); return;
      }
      const ate = head.x === g.food.x && head.y === g.food.y;
      g.snake = ate ? [head, ...g.snake] : [head, ...g.snake.slice(0, -1)];
      if (ate) { g.score++; setScore(g.score); g.food = randFood(g.snake); }
    };
    // Speed increases every 5 points (floor: 70 ms)
    let speed = 130;
    const startTick = () => {
      clearInterval(ticRef.current);
      ticRef.current = setInterval(() => {
        const prev = gRef.current?.score ?? 0;
        tick();
        const curr = gRef.current?.score ?? 0;
        if (curr !== prev) {
          const newSpeed = Math.max(70, 130 - Math.floor(curr / 5) * 10);
          if (newSpeed !== speed) { speed = newSpeed; startTick(); }
        }
      }, speed);
    };
    startTick();

    // ── Shared input handler (also called by parent for on-screen keyboard) ─
    const handleInput = (code) => {
      if (code === 'KeyR') { restartRef.current?.(); startTick(); return; }
      const g = gRef.current;
      if (!g || g.dead) return;
      const D = { KeyW: [0,-1], KeyS: [0,1], KeyA: [-1,0], KeyD: [1,0] };
      const d = D[code];
      if (!d || (d[0] === -g.dir.x && d[1] === -g.dir.y)) return; // no 180° turn
      g.next = { x: d[0], y: d[1] };
    };
    inputRef.current = handleInput;

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(ticRef.current);
      inputRef.current = null;
    };
  }, []); // safe: all values accessed through stable refs

  return (
    <div className="hc-game-wrap">
      <div className="hc-game-bar">
        <span className="hc-game-title">🐍 SNAKE</span>
        <span className="hc-game-score">score <strong>{score}</strong></span>
        <span className="hc-game-hints">
          <kbd>WASD</kbd> move &nbsp; <kbd>R</kbd> restart &nbsp; <kbd>ESC</kbd> exit
        </span>
      </div>
      <canvas ref={canvasRef} className="hc-game-canvas" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS  (stored in localStorage so they persist across sessions)
// ─────────────────────────────────────────────────────────────────────────────

const ACHIEVEMENT_DEFS = {
  curious:    { icon: '🔍', name: 'Curious',       desc: 'Typed help' },
  explorer:   { icon: '🗺️', name: 'Explorer',      desc: 'Opened a section' },
  gamer:      { icon: '🐍', name: 'Gamer',          desc: 'Played Snake' },
  tetromino:  { icon: '🧩', name: 'Tetromino',      desc: 'Played Tetris' },
  hacker:     { icon: '👾', name: 'Hacker',          desc: 'Ran hack sequence' },
  neo:        { icon: '💊', name: 'Wake Up Neo',     desc: 'Triggered Matrix rain' },
  weatherman: { icon: '⛅', name: 'Weatherman',     desc: 'Checked live weather' },
  selfie:     { icon: '📷', name: 'Selfie',          desc: 'Opened camera' },
  konami:     { icon: '🕹️', name: 'Konami Master',  desc: 'Found the secret code' },
  musician:   { icon: '🎵', name: 'Musician',        desc: 'Toggled BGM' },
};

function getAchievements()   {
  try { return JSON.parse(localStorage.getItem('gb_achievements') || '{}'); } catch { return {}; }
}
function unlockAchievement(key) {
  const a = getAchievements();
  if (!a[key]) { a[key] = Date.now(); try { localStorage.setItem('gb_achievements', JSON.stringify(a)); } catch {} }
}

// ─────────────────────────────────────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────────────────────────────────────

const THEMES = {
  dark:  { bg: '#080812', fg: '#e2e8f0', accent: '#6366f1', success: '#00e676', border: 'rgba(99,102,241,0.15)' },
  green: { bg: '#001a00', fg: '#00e676', accent: '#00ff41', success: '#00ff41', border: 'rgba(0,255,65,0.18)' },
  amber: { bg: '#1a0e00', fg: '#ffb000', accent: '#ffd700', success: '#ffb000', border: 'rgba(255,176,0,0.2)' },
  blue:  { bg: '#00091a', fg: '#88ccff', accent: '#4488ff', success: '#00e676', border: 'rgba(68,136,255,0.2)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// TETRIS GAME
// ─────────────────────────────────────────────────────────────────────────────

// Each piece: array of [col, row] offsets from spawn point, per rotation state
const TET_PIECES = {
  I: { color:'#00e5ff', states:[[[0,1],[1,1],[2,1],[3,1]],[[2,0],[2,1],[2,2],[2,3]]] },
  O: { color:'#ffd700', states:[[[0,0],[1,0],[0,1],[1,1]]] },
  T: { color:'#a855f7', states:[[[1,0],[0,1],[1,1],[2,1]],[[1,0],[1,1],[2,1],[1,2]],[[0,1],[1,1],[2,1],[1,2]],[[1,0],[0,1],[1,1],[1,2]]] },
  S: { color:'#00e676', states:[[[1,0],[2,0],[0,1],[1,1]],[[1,0],[1,1],[2,1],[2,2]]] },
  Z: { color:'#ff5c7a', states:[[[0,0],[1,0],[1,1],[2,1]],[[2,0],[1,1],[2,1],[1,2]]] },
  J: { color:'#6366f1', states:[[[0,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[1,1],[1,2]],[[0,1],[1,1],[2,1],[2,2]],[[1,0],[1,1],[0,2],[1,2]]] },
  L: { color:'#ff9800', states:[[[2,0],[0,1],[1,1],[2,1]],[[1,0],[1,1],[1,2],[2,2]],[[0,1],[1,1],[2,1],[0,2]],[[0,0],[1,0],[1,1],[1,2]]] },
};
const TET_COLS = 10, TET_ROWS = 20;

function TetrisGame({ inputRef: _iref }) {
  const canvasRef = useRef(null);
  const stRef     = useRef(null);
  const rafRef    = useRef(null);
  const ticRef    = useRef(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [dead,  setDead]  = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const TYPES  = Object.keys(TET_PIECES);

    // ── Deferred sizing ───────────────────────────────────────────────────────
    // canvas.clientWidth/Height = 0 on first render inside the drei Html portal.
    // Wait one animation frame so the browser finishes flex layout, then read
    // the real painted size via offsetWidth/offsetHeight.
    //
    // To adjust the board ratio yourself:
    //   TET_COLS  (= 10) → wider board         TET_ROWS (= 20) → taller board
    //   CELL is auto-calculated — never hardcode it
    //   OX / OY  centre the board inside the canvas — auto-calculated
    let W = 0, H = 0, CELL = 14, OX = 0, OY = 0;

    const measureCanvas = () => {
      W    = canvas.offsetWidth  || 320;
      H    = canvas.offsetHeight || 284;
      canvas.width  = W;             // pixel buffer = CSS display size (no stretching)
      canvas.height = H;
      CELL = Math.max(8, Math.min(
        Math.floor(W / TET_COLS),    // width  constraint
        Math.floor(H / TET_ROWS),    // height constraint ← usually the tighter one
      ));
      OX = Math.floor((W - TET_COLS * CELL) / 2);   // centre board horizontally
      OY = Math.floor((H - TET_ROWS * CELL) / 2);   // centre board vertically
    };

    const mkPiece = () => {
      const t = TYPES[Math.floor(Math.random() * TYPES.length)];
      return { type: t, rot: 0, x: 3, y: 0 };
    };
    const cells      = (p) => TET_PIECES[p.type].states[p.rot % TET_PIECES[p.type].states.length];
    const board_cells = (p) => cells(p).map(([cx,cy]) => [p.x+cx, p.y+cy]);
    const valid = (p, board) => board_cells(p).every(([x,y]) => x>=0&&x<TET_COLS&&y>=0&&y<TET_ROWS&&!board[y]?.[x]);

    const init = () => {
      const board = Array.from({length:TET_ROWS},()=>Array(TET_COLS).fill(null));
      stRef.current = { board, piece: mkPiece(), next: mkPiece(), score:0, lines:0, dead:false };
      setScore(0); setLines(0); setDead(false);
    };

    // render — all draw calls use OX/OY so the board is always centred
    const render = () => {
      const s = stRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(render); return; }
      // full-canvas dark background
      ctx.fillStyle = '#080812'; ctx.fillRect(0, 0, W, H);
      // subtle grid dots only inside the board area
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for(let r=0;r<TET_ROWS;r++) for(let c=0;c<TET_COLS;c++)
        ctx.fillRect(OX+c*CELL+CELL/2-0.5, OY+r*CELL+CELL/2-0.5, 1, 1);
      // locked board cells
      for(let r=0;r<TET_ROWS;r++) for(let c=0;c<TET_COLS;c++)
        if(s.board[r][c]){
          ctx.fillStyle=s.board[r][c];
          ctx.fillRect(OX+c*CELL+1, OY+r*CELL+1, CELL-2, CELL-2);
          ctx.fillStyle='rgba(255,255,255,0.12)';
          ctx.fillRect(OX+c*CELL+1, OY+r*CELL+1, CELL-2, 2);
        }
      // ghost piece
      if(s.piece){
        let g={...s.piece}; while(valid({...g,y:g.y+1},s.board)) g.y++;
        ctx.fillStyle='rgba(255,255,255,0.07)';
        board_cells(g).forEach(([x,y])=>ctx.fillRect(OX+x*CELL+1, OY+y*CELL+1, CELL-2, CELL-2));
      }
      // active piece with glow
      if(s.piece){
        const col=TET_PIECES[s.piece.type].color;
        ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=6;
        board_cells(s.piece).forEach(([x,y])=>ctx.fillRect(OX+x*CELL+1, OY+y*CELL+1, CELL-2, CELL-2));
        ctx.shadowBlur=0;
      }
      // game-over overlay
      if(s.dead){
        ctx.fillStyle='rgba(8,8,18,0.85)'; ctx.fillRect(0,0,W,H);
        ctx.textAlign='center';
        ctx.fillStyle='#ff5c7a'; ctx.shadowColor='#ff5c7a'; ctx.shadowBlur=18;
        ctx.font=`bold 16px 'SF Mono',monospace`;
        ctx.fillText('GAME OVER', W/2, H/2-18);
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font=`12px 'SF Mono',monospace`;
        ctx.fillText(`Score: ${s.score}  Lines: ${s.lines}`, W/2, H/2+2);
        ctx.fillStyle='rgba(99,102,241,0.85)'; ctx.font=`10px 'SF Mono',monospace`;
        ctx.fillText('R — restart   ESC — exit', W/2, H/2+22);
      }
      rafRef.current = requestAnimationFrame(render);
    };

    // Defer first frame so offsetWidth/Height are resolved by the browser
    rafRef.current = requestAnimationFrame(() => {
      measureCanvas();
      init();
      rafRef.current = requestAnimationFrame(render);
    });

    // tick
    let speed = 700;
    const startTick = () => {
      clearInterval(ticRef.current);
      ticRef.current = setInterval(() => {
        const s = stRef.current; if(!s||s.dead) return;
        const moved = {...s.piece, y:s.piece.y+1};
        if(valid(moved,s.board)){ s.piece=moved; return; }
        // lock
        board_cells(s.piece).forEach(([x,y])=>{ if(y>=0) s.board[y][x]=TET_PIECES[s.piece.type].color; });
        let cleared=0;
        for(let r=TET_ROWS-1;r>=0;r--) if(s.board[r].every(c=>c)){ s.board.splice(r,1); s.board.unshift(Array(TET_COLS).fill(null)); cleared++; r++; }
        if(cleared){ s.score+=[0,100,300,500,800][Math.min(cleared,4)]; s.lines+=cleared; setScore(s.score); setLines(s.lines);
          const ns=Math.max(120,700-Math.floor(s.lines/10)*70); if(ns!==speed){speed=ns;startTick();} }
        s.piece=s.next; s.next=mkPiece();
        if(!valid(s.piece,s.board)){ s.dead=true; setDead(true); }
      }, speed);
    };
    startTick();

    const handleInput = (code) => {
      if(code==='KeyR'){init();startTick();return;}
      const s=stRef.current; if(!s||s.dead) return;
      if(code==='KeyA'||code==='ArrowLeft'){ const m={...s.piece,x:s.piece.x-1}; if(valid(m,s.board)) s.piece=m; }
      else if(code==='KeyD'||code==='ArrowRight'){ const m={...s.piece,x:s.piece.x+1}; if(valid(m,s.board)) s.piece=m; }
      else if(code==='KeyS'||code==='ArrowDown'){ const m={...s.piece,y:s.piece.y+1}; if(valid(m,s.board)) s.piece=m; }
      else if(code==='KeyW'||code==='ArrowUp'){
        const rotated={...s.piece,rot:(s.piece.rot+1)%TET_PIECES[s.piece.type].states.length};
        if(valid(rotated,s.board)) s.piece=rotated;
      } else if(code==='Space'){ while(valid({...s.piece,y:s.piece.y+1},s.board)) s.piece.y++; }
    };
    if(_iref) _iref.current = handleInput;

    return () => { cancelAnimationFrame(rafRef.current); clearInterval(ticRef.current); if(_iref) _iref.current=null; };
  }, []);

  return (
    <div className="hc-game-wrap">
      <div className="hc-game-bar">
        <span className="hc-game-title">🧩 TETRIS</span>
        <span className="hc-game-score">lines <strong>{lines}</strong></span>
        <span className="hc-game-score">score <strong>{score}</strong></span>
        <span className="hc-game-hints"><kbd>AD</kbd> move · <kbd>W</kbd> rotate · <kbd>S</kbd> drop · <kbd>Space</kbd> slam · <kbd>R</kbd> reset</span>
      </div>
      <canvas ref={canvasRef} className="hc-game-canvas" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOCK DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

function ClockDisplay({ theme }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const T = THEMES[theme] || THEMES.dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = canvas.clientWidth  || 300;
    canvas.height = canvas.clientHeight || 240;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      ctx.fillStyle = T.bg; ctx.fillRect(0,0,W,H);
      const now = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Singapore'}));
      const hh  = String(now.getHours()).padStart(2,'0');
      const mm  = String(now.getMinutes()).padStart(2,'0');
      const ss  = String(now.getSeconds()).padStart(2,'0');
      const blink = now.getSeconds() % 2 === 0;
      ctx.textAlign = 'center';
      // Time
      ctx.font = `bold ${Math.floor(H*0.28)}px 'SF Mono',monospace`;
      ctx.fillStyle = T.accent; ctx.shadowColor = T.accent; ctx.shadowBlur = 22;
      ctx.fillText(`${hh}${blink?':':' '}${mm}`, W/2, H*0.48);
      // Seconds
      ctx.font = `${Math.floor(H*0.13)}px 'SF Mono',monospace`;
      ctx.shadowBlur = 10;
      ctx.fillText(`:${ss}`, W/2, H*0.64);
      // Date
      ctx.shadowBlur = 0; ctx.font = `${Math.floor(H*0.08)}px 'SF Mono',monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})+' · SGT', W/2, H*0.80);
      // Hint
      ctx.font = `${Math.floor(H*0.06)}px 'SF Mono',monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillText('ESC to close', W/2, H*0.92);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [theme]);

  return <canvas ref={canvasRef} className="hc-clock-canvas" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// KONAMI SCREEN  (↑↑↓↓←→←→BA)
// ─────────────────────────────────────────────────────────────────────────────

function KonamiScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    const k = (e) => { if(e.key==='Enter'||e.key===' '||e.key==='Escape') onDone(); };
    window.addEventListener('keydown', k);
    return () => { clearTimeout(t); window.removeEventListener('keydown', k); };
  }, [onDone]);

  return (
    <div className="hc-konami-wrap">
      <div className="hc-konami-inner">
        <div className="hc-konami-seq">↑ ↑ ↓ ↓ ← → ← → B A</div>
        <div className="hc-konami-title">CHEAT CODE ACTIVATED</div>
        <div className="hc-konami-lines">
          <span>✓  +30 lives</span>
          <span>✓  infinite ammo</span>
          <span>✓  max cool factor</span>
        </div>
        <div className="hc-konami-hint">press Enter or wait…</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8-BIT BGM  — Tetris theme (Korobeiniki) generated with Web Audio
// ─────────────────────────────────────────────────────────────────────────────

const NOTE = { C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988 };
// [note, beat_duration]
const TETRIS_MELODY = [
  [NOTE.E5,1],[NOTE.B4,0.5],[NOTE.C5,0.5],[NOTE.D5,1],[NOTE.C5,0.5],[NOTE.B4,0.5],
  [NOTE.A4,1],[NOTE.A4,0.5],[NOTE.C5,0.5],[NOTE.E5,1],[NOTE.D5,0.5],[NOTE.C5,0.5],
  [NOTE.B4,1.5],[NOTE.C5,0.5],[NOTE.D5,1],[NOTE.E5,1],
  [NOTE.C5,1],[NOTE.A4,1],[NOTE.A4,2],
  [NOTE.D5,1.5],[NOTE.F5,0.5],[NOTE.A5,1],[NOTE.G5,0.5],[NOTE.F5,0.5],
  [NOTE.E5,1.5],[NOTE.C5,0.5],[NOTE.E5,1],[NOTE.D5,0.5],[NOTE.C5,0.5],
  [NOTE.B4,1],[NOTE.B4,0.5],[NOTE.C5,0.5],[NOTE.D5,1],[NOTE.E5,1],
  [NOTE.C5,1],[NOTE.A4,1],[NOTE.A4,2],
];
const BEAT = 0.18; // seconds per beat unit

let _bgmAc = null, _bgmNodes = [], _bgmPlaying = false;

function startBGM() {
  if (_bgmPlaying) return;
  try {
    if (!_bgmAc) _bgmAc = new (window.AudioContext || window.webkitAudioContext)();
    if (_bgmAc.state === 'suspended') _bgmAc.resume();
    _bgmPlaying = true;
    let t = _bgmAc.currentTime + 0.05;
    TETRIS_MELODY.forEach(([freq, dur]) => {
      const osc  = _bgmAc.createOscillator();
      const gain = _bgmAc.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * BEAT * 0.9);
      osc.connect(gain); gain.connect(_bgmAc.destination);
      osc.start(t); osc.stop(t + dur * BEAT);
      _bgmNodes.push(osc);
      t += dur * BEAT;
    });
    // Play once — auto-reset after melody finishes so `music` can be typed again
    const total = TETRIS_MELODY.reduce((s, [, d]) => s + d, 0) * BEAT;
    setTimeout(() => { _bgmPlaying = false; _bgmNodes = []; }, (total + 0.1) * 1000);
  } catch(_) {}
}

function stopBGM() {
  _bgmPlaying = false;
  _bgmNodes.forEach(n => { try { n.stop(); } catch {} });
  _bgmNodes = [];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND PROCESSOR
// ─────────────────────────────────────────────────────────────────────────────

let _id = 0;

function processCommand(raw) {
  const parts = raw.trim().split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);
  const reply = (content) => ({ id: ++_id, role: 'assistant', content });

  switch (cmd) {
    case '': return { out: [], action: null };

    case 'help':
      return { action: null, out: [reply({ type: 'help', items: [
        { cmd: 'whoami',       desc: 'who is Matthew' },
        { cmd: 'about',        desc: 'extended bio' },
        { cmd: 'skills',       desc: 'tech stack' },
        { cmd: 'projects',     desc: 'hackathon record' },
        { cmd: 'contact',      desc: 'get in touch' },
        { cmd: 'resume',       desc: 'education, experience & links' },
        { cmd: 'github',       desc: 'live GitHub stats 🐙' },
        { cmd: 'card',         desc: 'download contact card 💼' },
        { cmd: 'ls',           desc: 'list portfolio sections' },
        { cmd: 'open',         desc: 'open [section]' },
        { cmd: 'neofetch',     desc: 'system info' },
        { cmd: 'weather',      desc: 'live Singapore weather 🌤️' },
        { cmd: 'camera',       desc: 'webcam pixel grid 📷' },
        { cmd: 'calc',         desc: 'calc [expr]  e.g. calc 2^10' },
        { cmd: 'clock',        desc: 'retro clock 🕐' },
        { cmd: 'snake',        desc: 'Snake 🐍' },
        { cmd: 'tetris',       desc: 'Tetris 🧩' },
        { cmd: 'music',        desc: 'toggle 8-bit BGM 🎵' },
        { cmd: 'theme',        desc: 'theme [dark|green|amber|blue]' },
        { cmd: 'achievements', desc: 'unlocked badges 🏆' },
        { cmd: 'matrix',       desc: 'try it ;)' },
        { cmd: 'hack',         desc: '🔓' },
        { cmd: 'clear',        desc: 'clear terminal' },
        { cmd: 'date',         desc: 'current date/time' },
        { cmd: 'echo',         desc: 'echo [text]' },
      ]})],
    };

    case 'whoami':
      return { action: null, out: [reply({ type: 'lines', items: [
        { text: 'Matthew Tjandera', v: 'accent bold' },
        { text: 'Information Systems @ SMU Singapore' },
        { text: '────────────────────────────────────' },
        { text: 'Data Builder  ·  AI Evaluator  ·  Hackathon Competitor' },
        { text: '🟢 Open to internships · Based in Singapore', v: 'success' },
      ]})],
    };

    case 'about':
      return { action: null, out: [reply({ type: 'lines', items: [
        { text: 'Year-one IS student at SMU building data-driven' },
        { text: 'solutions — from shipping optimizers to AR art' },
        { text: 'marketplaces. I show up to hackathons to ship.' },
        { text: ' ' },
        { text: '7 hackathons  ·  3 finalist placements' },
        { text: '1 first-place win  ·  11,000+ students impacted' },
      ]})],
    };

    case 'skills':
      return { action: null, out: [reply({ type: 'lines', items: [
        { text: 'Proficient', v: 'label' },
        { text: '  Python  ·  SQL  ·  HTML/CSS/JS' },
        { text: '  Data Analytics  ·  Visualization  ·  Figma' },
        { text: ' ' },
        { text: 'Familiar', v: 'label' },
        { text: '  React  ·  SwiftUI  ·  scikit-learn' },
        { text: '  BigQuery/GCP  ·  WebXR/AR  ·  Firebase' },
        { text: ' ' },
        { text: 'Platforms', v: 'label' },
        { text: '  VS Code  ·  Git/GitHub  ·  Linux CLI  ·  Manus AI' },
      ]})],
    };

    case 'projects':
      return { action: null, out: [reply({ type: 'projects', items: [
        { emoji: '🥇', name: 'Chengdu Bowl Expansion',      event: 'Manus AI × January Capital 2026', placement: '1st Place' },
        { emoji: '🏆', name: 'ArtSpace — AR Marketplace',    event: 'PINUS Hack 2026',                placement: 'Top 6 Finalist' },
        { emoji: '🏆', name: 'Sirius Tools — Voyage Opt.',   event: 'Cargill Datathon 2026',          placement: 'Top 10' },
        { emoji: '🏆', name: 'OurReceipt — iOS App',         event: 'SMU Tech Series 2025',           placement: 'Top 10' },
      ]})],
    };

    case 'contact':
      return { action: null, out: [reply({ type: 'contact', items: [
        { label: 'Email',    value: 'matthewtjandera@gmail.com' },
        { label: 'LinkedIn', value: '/in/matthewtjandera' },
        { label: 'GitHub',   value: 'github.com/tjandera' },
        { label: 'Phone',    value: '+65 8980 6759' },
      ]})],
    };

    case 'ls':
      return { action: null, out: [reply({ type: 'lines', items: [
        { text: 'drwxr-xr-x  about/' },
        { text: 'drwxr-xr-x  experience/' },
        { text: 'drwxr-xr-x  skills/' },
        { text: 'drwxr-xr-x  projects/' },
        { text: 'drwxr-xr-x  certifications/' },
        { text: 'drwxr-xr-x  contact/' },
      ]})],
    };

    case 'open': {
      const target = args[0]?.toLowerCase();
      const valid  = ['about', 'experience', 'skills', 'work', 'projects', 'certifications', 'contact'];
      if (!target)
        return { action: null, out: [reply({ type: 'error', text: 'Usage: open [section]' })] };
      if (!valid.includes(target))
        return { action: null, out: [reply({ type: 'error', text: `Unknown section "${target}". Try: ${valid.join(', ')}` })] };
      const path = target === 'work' ? '/projects' : `/${target}`;
      return { action: { type: 'navigate', path }, out: [reply({ type: 'success', text: `Navigating to ${path}…` })] };
    }

    case 'neofetch':
      return { action: null, out: [reply({ type: 'neofetch',
        art: [
          ' ███╗   ███╗',
          ' ████╗ ████║',
          ' ██╔████╔██║',
          ' ██║╚██╔╝██║',
          ' ██║ ╚═╝ ██║',
          ' ╚═╝     ╚═╝',
        ],
        info: [
          { label: 'Host',    value: 'matthewtjandera.online' },
          { label: 'OS',      value: 'Portfolio OS v2026.1' },
          { label: 'Stack',   value: 'React 18 · Vite 8' },
          { label: 'Degree',  value: 'B.Sc. IS — SMU' },
          { label: 'Events',  value: '7 hackathons · 3 finalist' },
          { label: 'Best',    value: '🥇 1st Place — Manus AI' },
          { label: 'Impact',  value: '11,000+ students reached' },
          { label: 'Status',  value: '🟢 Open to internships' },
        ],
      })],
    };

    case 'resume':
      return { action: null, out: [reply({ type: 'resume' })] };

    case 'weather':
      return { action: { type: 'weather' }, out: [reply({ type: 'lines', items: [{ text: '⛅ Fetching Singapore weather…', v: 'label' }] })] };

    case 'hack':
      return { action: { type: 'hack' }, out: [reply({ type: 'success', text: 'Initiating breach sequence… 🔓' })] };

    case 'calc': {
      const expr = args.join('');
      if (!expr)
        return { action: null, out: [reply({ type: 'error', text: 'Usage: calc [expression]   e.g. calc 2^10' })] };
      const result = safeCalc(expr);
      if (result === null)
        return { action: null, out: [reply({ type: 'error', text: `Invalid expression: ${expr}` })] };
      return { action: null, out: [reply({ type: 'lines', items: [{ text: `${expr} = ${result}`, v: 'accent bold' }] })] };
    }

    case 'snake':
    case 'game':
      return { action: { type: 'game' }, out: [reply({ type: 'success', text: '🐍 Starting Snake… WASD to move, R to restart, ESC to quit.' })] };

    case 'camera':
    case 'webcam':
      return { action: { type: 'camera' }, out: [reply({ type: 'success', text: 'Opening camera… type "exit" or press ESC to close.' })] };

    case 'matrix':
      return { action: { type: 'matrix' }, out: [reply({ type: 'success', text: 'Wake up, Neo…' })] };

    case 'github':
      return { action: { type: 'github' }, out: [reply({ type: 'lines', items: [{ text: '⏳ Fetching GitHub stats…', v: 'label' }] })] };

    case 'card': {
      const vcard = [
        'BEGIN:VCARD','VERSION:3.0',
        'FN:Matthew Tjandera','N:Tjandera;Matthew;;;',
        'EMAIL;TYPE=INTERNET:matthewtjandera@gmail.com',
        'TEL;TYPE=CELL:+65 8980 6759',
        'URL:https://matthewtjandera.online',
        'URL;type=LinkedIn:https://linkedin.com/in/matthewtjandera',
        'URL;type=GitHub:https://github.com/tjandera',
        'ORG:SMU Singapore','TITLE:Information Systems Student',
        'NOTE:Data Analyst · AI Evaluator · Builder',
        'END:VCARD',
      ].join('\r\n');
      return { action: { type: 'card', vcard }, out: [reply({ type: 'lines', items: [
        { text: '💼 Contact card ready — downloading…', v: 'success' },
        { text: 'matthew-tjandera.vcf saved to your device.' },
      ]})] };
    }

    case 'achievements': {
      const earned = getAchievements();
      const items = Object.entries(ACHIEVEMENT_DEFS).map(([key, def]) => ({
        text: earned[key]
          ? `${def.icon}  ${def.name.padEnd(16)}  ${def.desc}`
          : `⬜  ${def.name.padEnd(16)}  ???`,
        v: earned[key] ? 'success' : '',
      }));
      return { action: null, out: [reply({ type: 'lines', items: [
        { text: `Achievements  ${Object.keys(earned).length}/${Object.keys(ACHIEVEMENT_DEFS).length}`, v: 'accent bold' },
        { text: '────────────────────────────────────' },
        ...items,
      ]})] };
    }

    case 'theme': {
      const t = args[0]?.toLowerCase();
      if (!t || !THEMES[t])
        return { action: null, out: [reply({ type: 'error', text: `Usage: theme [dark|green|amber|blue]` })] };
      return { action: { type: 'theme', theme: t }, out: [reply({ type: 'success', text: `Theme switched to "${t}".` })] };
    }

    case 'music':
      return { action: { type: 'music' }, out: [reply({ type: 'success', text: '🎵 Toggling 8-bit BGM…' })] };

    case 'clock':
      return { action: { type: 'clock' }, out: [reply({ type: 'success', text: '🕐 Singapore time — ESC to close.' })] };

    case 'tetris':
    case 'tet':
      return { action: { type: 'tetris' }, out: [reply({ type: 'success', text: '🧩 Tetris — AD move · W rotate · S drop · Space slam · ESC quit.' })] };

    case 'clear':
      return { action: { type: 'clear' }, out: [] };

    case 'date':
      return { action: null, out: [reply({ type: 'lines', items: [{ text: new Date().toLocaleString() }] })] };

    case 'echo':
      return { action: null, out: [reply({ type: 'lines', items: [{ text: args.join(' ') || '' }] })] };

    default:
      return { action: null, out: [reply({ type: 'error', text: `command not found: ${cmd}. Type "help" for commands.` })] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR — "M" mark in an indigo rounded square, shown next to each response
// ─────────────────────────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div className="hc-avatar" aria-hidden="true">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="7" fill="#6366f1" />
        <text
          x="14" y="20"
          textAnchor="middle"
          fill="white"
          fontSize="15"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >M</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT CLASS MAP — maps the `v` field on line items to CSS class names
// ─────────────────────────────────────────────────────────────────────────────

const V = {
  'accent':      'hc-accent',
  'bold':        'hc-bold',
  'success':     'hc-success',
  'error':       'hc-error',
  'label':       'hc-label',
  'accent bold': 'hc-accent hc-bold',
};

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function ChatMessage({ role, text, content }) {
  if (role === 'user') {
    return (
      <div className="hc-msg hc-msg-user">
        <span className="hc-user-chevron">❯</span>
        <span className="hc-user-text">{text}</span>
      </div>
    );
  }

  if (!content) return null;
  const { type } = content;
  let body;

  if (type === 'lines') {
    body = content.items.map((item, i) =>
      !item.text?.trim()
        ? <div key={i} className="hc-line-gap" />
        : <div key={i} className={`hc-line ${V[item.v] || ''}`}>{item.text}</div>
    );
  } else if (type === 'help') {
    body = (
      <>
        <div className="hc-line hc-label">Available Commands</div>
        <div className="hc-help-list">
          {content.items.map((item, i) => (
            <div key={i} className="hc-help-row">
              <code className="hc-help-cmd">{item.cmd}</code>
              <span className="hc-help-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </>
    );
  } else if (type === 'projects') {
    body = content.items.map((item, i) => (
      <div key={i} className="hc-project-row">
        <span className="hc-project-emoji">{item.emoji}</span>
        <div>
          <div className="hc-project-name">{item.name}</div>
          <div className="hc-project-meta">{item.event} · {item.placement}</div>
        </div>
      </div>
    ));
  } else if (type === 'contact') {
    body = content.items.map((item, i) => (
      <div key={i} className="hc-contact-row">
        <span className="hc-contact-lbl">{item.label}</span>
        <span className="hc-contact-val">{item.value}</span>
      </div>
    ));
  } else if (type === 'neofetch') {
    body = (
      <div className="hc-neofetch">
        <div className="hc-nf-art">
          {content.art.map((l, i) => <div key={i} className="hc-art-line">{l}</div>)}
        </div>
        <div className="hc-nf-info">
          {content.info.map((item, i) => (
            <div key={i} className="hc-nf-row">
              <span className="hc-nf-label">{item.label}</span>
              <span className="hc-nf-sep">:</span>
              <span className="hc-nf-val">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (type === 'resume') {
    body = (
      <div className="hc-resume">
        <div className="hc-res-section">
          <div className="hc-res-label">Education</div>
          <div className="hc-res-row">
            <span className="hc-res-title">B.Sc. Information Systems</span>
            <span className="hc-res-meta">SMU Singapore · 2025 – 2028</span>
          </div>
        </div>
        <div className="hc-res-section">
          <div className="hc-res-label">Experience</div>
          <div className="hc-res-row">
            <span className="hc-res-title">AI Data Evaluator</span>
            <span className="hc-res-meta">SuperAnnotate · 2024 – Present</span>
          </div>
          <div className="hc-res-row">
            <span className="hc-res-title">Hackathon Competitor</span>
            <span className="hc-res-meta">7 events · 3 finalist placements · 1st place</span>
          </div>
        </div>
        <div className="hc-res-section">
          <div className="hc-res-label">Links</div>
          <div className="hc-res-links">
            <a className="hc-res-link" href="https://linkedin.com/in/matthewtjandera" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a className="hc-res-link" href="https://github.com/tjandera" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="hc-res-link" href="/resume.html" target="_blank" rel="noreferrer">View Résumé ↗</a>
          </div>
        </div>
      </div>
    );
  } else if (type === 'weather') {
    body = (
      <div className="hc-weather">
        <div className="hc-wx-location">📍 Singapore, SG</div>
        <div className="hc-wx-condition">{content.condition}</div>
        <div className="hc-wx-stats">
          <span className="hc-wx-stat"><span className="hc-wx-val">{content.temp}°C</span><span className="hc-wx-key">temp</span></span>
          <span className="hc-wx-stat"><span className="hc-wx-val">{content.humidity}%</span><span className="hc-wx-key">humidity</span></span>
          <span className="hc-wx-stat"><span className="hc-wx-val">{content.wind} km/h</span><span className="hc-wx-key">wind</span></span>
        </div>
      </div>
    );
  } else if (type === 'error') {
    body = <div className="hc-line hc-error">{content.text}</div>;
  } else if (type === 'success') {
    body = <div className="hc-line hc-success">{content.text}</div>;
  }

  return (
    <div className="hc-msg hc-msg-assistant">
      <Avatar />
      <div className="hc-msg-body">{body}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

const WELCOME = [
  // Boot banner
  {
    id: ++_id, role: 'assistant',
    content: { type: 'lines', items: [
      { text: 'matthew.portfolio — OS v2026.1', v: 'accent bold' },
      { text: 'Last login: ' + new Date().toDateString() },
    ]},
  },
  // Auto-run neofetch so it's the first thing users see
  { id: ++_id, role: 'user', text: 'neofetch' },
  ...processCommand('neofetch').out,
  // Hint line after neofetch
  {
    id: ++_id, role: 'assistant',
    content: { type: 'lines', items: [
      { text: 'Type "help" to see all commands.' },
    ]},
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HERO COMPUTER — main export
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroComputer({ compact = false }) {
  const [messages,    setMessages]    = useState(WELCOME);
  const [input,       setInput]       = useState('');
  const [history,     setHistory]     = useState([]);
  const [histIdx,     setHistIdx]     = useState(-1);
  const [activeKeys,  setActiveKeys]  = useState(new Set());
  const [matrixMode,  setMatrixMode]  = useState(false);
  const [hackMode,    setHackMode]    = useState(false);
  const [gameMode,    setGameMode]    = useState(false);   // 'snake' | 'tetris' | false
  const [webcamMode,  setWebcamMode]  = useState(false);
  const [webcamColor, setWebcamColor] = useState(false);
  const [clockMode,   setClockMode]   = useState(false);
  const [konamiMode,  setKonamiMode]  = useState(false);
  const [musicOn,     setMusicOn]     = useState(false);
  const [theme,       setTheme]       = useState('dark');
  const [focused,     setFocused]     = useState(false);

  const inputRef      = useRef(null);
  const outputRef     = useRef(null);
  const gameInputRef  = useRef(null);
  const closeGameRef  = useRef(null);
  closeGameRef.current = () => setGameMode(false);
  const konamiSeq     = useRef([]);
  const playSound = useKeySound();

  const KONAMI_CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];

  // Auto-scroll to latest message
  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages]);

  // Track held keys, keyboard sounds, and Konami code detection
  useEffect(() => {
    const down = (e) => {
      setActiveKeys(prev => new Set([...prev, e.code]));
      playSound(e.code);
      // Konami code: ↑↑↓↓←→←→BA
      konamiSeq.current = [...konamiSeq.current, e.code].slice(-10);
      if (konamiSeq.current.join(',') === KONAMI_CODE.join(',')) {
        setKonamiMode(true);
        unlockAchievement('konami');
        konamiSeq.current = [];
      }
    };
    const up = (e) => setActiveKeys(prev => { const s = new Set(prev); s.delete(e.code); return s; });
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [playSound]);

  const submit = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const isExit = trimmed === 'exit' || trimmed === 'close';

    // Close webcam on "exit" / "close" while it's open
    if (webcamMode && isExit) {
      setWebcamMode(false);
      setWebcamColor(false);
      setMessages(prev => [...prev,
        { id: ++_id, role: 'user', text: trimmed },
        { id: ++_id, role: 'assistant', content: { type: 'success', text: 'Camera closed.' } },
      ]);
      setInput('');
      return;
    }

    // Close matrix on "exit" / "close" while it's running
    if (matrixMode && isExit) {
      setMatrixMode(false);
      setMessages(prev => [...prev,
        { id: ++_id, role: 'user', text: trimmed },
        { id: ++_id, role: 'assistant', content: { type: 'success', text: 'Wake up.' } },
      ]);
      setInput('');
      return;
    }

    // Close hack animation on "exit" / "close" while it's running
    if (hackMode && isExit) {
      setHackMode(false);
      setMessages(prev => [...prev,
        { id: ++_id, role: 'user', text: trimmed },
        { id: ++_id, role: 'assistant', content: { type: 'success', text: 'Breach aborted.' } },
      ]);
      setInput('');
      return;
    }

    // Close snake / tetris game on "exit" / "close"
    if (gameMode && isExit) {
      setGameMode(false);
      setMessages(prev => [...prev,
        { id: ++_id, role: 'user', text: trimmed },
        { id: ++_id, role: 'assistant', content: { type: 'success', text: 'Game over. Thanks for playing!' } },
      ]);
      setInput('');
      return;
    }

    // Close clock on "exit"
    if (clockMode && isExit) {
      setClockMode(false);
      setMessages(prev => [...prev,
        { id: ++_id, role: 'user', text: trimmed },
        { id: ++_id, role: 'assistant', content: { type: 'success', text: 'Clock closed.' } },
      ]);
      setInput('');
      return;
    }

    const { out, action } = processCommand(trimmed);

    if (action?.type === 'clear') { setMessages([]); setInput(''); return; }
    if (action?.type === 'matrix') { setMatrixMode(true); unlockAchievement('neo'); }
    if (action?.type === 'hack')   { setHackMode(true);   unlockAchievement('hacker'); }
    if (action?.type === 'game')   { setGameMode('snake'); unlockAchievement('gamer'); }
    if (action?.type === 'tetris') { setGameMode('tetris'); unlockAchievement('tetromino'); }
    if (action?.type === 'clock')  { setClockMode(true); }
    if (action?.type === 'camera') { setWebcamMode(true); setWebcamColor(false); unlockAchievement('selfie'); }
    if (action?.type === 'music') {
      if (musicOn) { stopBGM(); setMusicOn(false); }
      else         { startBGM(); setMusicOn(true); unlockAchievement('musician'); }
    }
    if (action?.type === 'theme')  { setTheme(action.theme); }
    if (action?.type === 'card')   {
      const blob = new Blob([action.vcard], { type: 'text/vcard' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'matthew-tjandera.vcf'; a.click();
      URL.revokeObjectURL(url);
    }
    if (action?.type === 'navigate') {
      // Each section is its own route now — `open <section>` really navigates.
      unlockAchievement('explorer');
      goTo(action.path);
    }
    if (action?.type === 'github') {
      Promise.all([
        fetch('https://api.github.com/users/tjandera').then(r=>r.json()),
        fetch('https://api.github.com/users/tjandera/repos?sort=stars&per_page=5').then(r=>r.json()),
      ]).then(([user, repos]) => {
        const lines = [
          { text: `🐙  ${user.login}  —  ${user.name}`, v: 'accent bold' },
          { text: `────────────────────────────────────` },
          { text: `Repos:      ${user.public_repos}   ·   Followers: ${user.followers}` },
          { text: `Bio:        ${user.bio || 'N/A'}` },
          { text: ' ' },
          { text: 'Top repos by stars:', v: 'label' },
          ...(Array.isArray(repos) ? repos : []).map(r =>
            ({ text: `  ⭐ ${r.stargazers_count}  ${r.name}  — ${r.description?.slice(0,40) || ''}` })
          ),
        ];
        setMessages(prev => [...prev, { id: ++_id, role: 'assistant', content: { type: 'lines', items: lines } }]);
      }).catch(() =>
        setMessages(prev => [...prev, { id: ++_id, role: 'assistant', content: { type: 'error', text: 'Could not reach GitHub API.' } }])
      );
    }

    if (action?.type === 'weather') {
      fetchWeather()
        .then(data  => setMessages(prev => [...prev, { id: ++_id, role: 'assistant', content: { type: 'weather', ...data } }]))
        .catch(()   => setMessages(prev => [...prev, { id: ++_id, role: 'assistant', content: { type: 'error', text: 'Could not fetch weather — check your connection.' } }]));
    }

    // Achievement for help and neofetch
    if (trimmed === 'help') unlockAchievement('curious');
    if (trimmed === 'weather') unlockAchievement('weatherman');

    setMessages(prev => [
      ...prev,
      { id: ++_id, role: 'user', text: trimmed },
      ...out,
    ]);
    setHistory(prev => [trimmed, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
  }, [webcamMode, matrixMode, hackMode, gameMode, clockMode, musicOn, theme]);

  const handleKeyDown = useCallback((e) => {
    // Escape closes whichever overlay is active
    if (e.key === 'Escape') {
      if (konamiMode) { setKonamiMode(false); return; }
      if (clockMode)  { setClockMode(false);  return; }
      if (webcamMode) { setWebcamMode(false); setWebcamColor(false); return; }
      if (matrixMode) { setMatrixMode(false); return; }
      if (hackMode)   { setHackMode(false);   return; }
      if (gameMode)   { setGameMode(false);   return; }
      return;
    }
    // Games — forward input to active game engine
    if (gameMode) {
      if (e.key === 'r' || e.key === 'R') { gameInputRef.current?.('KeyR'); return; }
      const gameCodes = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'];
      if (gameCodes.includes(e.code)) {
        e.preventDefault();
        gameInputRef.current?.(e.code);
        return;
      }
      return;
    }
    // 'c' toggles webcam colour mode — prevent it typing into the input
    if (e.key.toLowerCase() === 'c' && webcamMode && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setWebcamColor(v => !v);
      return;
    }
    // Enter closes matrix/hack overlays
    if ((matrixMode || hackMode) && e.key === 'Enter') {
      if (matrixMode) setMatrixMode(false);
      if (hackMode)   setHackMode(false);
      return;
    }
    if (e.key === 'Enter') {
      submit(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      if (next >= 0) { setInput(history[next]); setHistIdx(next); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setInput(next === -1 ? '' : history[next] ?? '');
      setHistIdx(next);
    }
  }, [input, history, histIdx, submit, webcamMode, matrixMode, hackMode, gameMode, clockMode, konamiMode]);

  const handleKeyClick = useCallback((code, char) => {
    inputRef.current?.focus();
    playSound(code);
    // Escape closes the active overlay
    if (code === 'Escape') {
      if (webcamMode) { setWebcamMode(false); setWebcamColor(false); }
      else if (matrixMode) setMatrixMode(false);
      else if (hackMode)   setHackMode(false);
      else if (gameMode)   setGameMode(false);
      return;
    }
    // Snake game — on-screen WASD + R forwarded to game engine
    if (gameMode) {
      if (code === 'KeyR') { gameInputRef.current?.('KeyR'); return; }
      if (['KeyW','KeyA','KeyS','KeyD'].includes(code)) {
        gameInputRef.current?.(code); return;
      }
      return;
    }
    // 'C' toggles webcam colour mode
    if (code === 'KeyC' && webcamMode) {
      setWebcamColor(v => !v);
      return;
    }
    // Enter closes matrix/hack overlays or submits the terminal command
    if (code === 'Enter') {
      if (matrixMode) { setMatrixMode(false); return; }
      if (hackMode)   { setHackMode(false);   return; }
      submit(input);
    } else if (code === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (code === 'Space') {
      setInput(prev => prev + ' ');
    } else if (char.length === 1) {
      setInput(prev => prev + char);
    }
  }, [input, submit, playSound, webcamMode, matrixMode, hackMode, gameMode]);

  // ── Compact mode — rendered on the Game Boy screen (no laptop wrapper) ──────
  const T = THEMES[theme] || THEMES.dark;

  if (compact) {
    return (
      <div
        className="hc-compact"
        onClick={() => inputRef.current?.focus()}
        style={{ background: T.bg, color: T.fg, '--hc-accent': T.accent, '--hc-success': T.success, '--hc-border': T.border }}
      >
        {konamiMode && <KonamiScreen onDone={() => setKonamiMode(false)} />}
        {matrixMode && <MatrixRain onDone={() => setMatrixMode(false)} />}
        {hackMode   && <HackAnimation onDone={() => setHackMode(false)} />}
        {gameMode === 'snake'  && <SnakeGame   inputRef={gameInputRef} onCloseRef={closeGameRef} />}
        {gameMode === 'tetris' && <TetrisGame  inputRef={gameInputRef} />}
        {clockMode  && <ClockDisplay theme={theme} />}
        {webcamMode && (
          <WebcamPixelGrid
            onClose={() => { setWebcamMode(false); setWebcamColor(false); }}
            colorMode={webcamColor}
          />
        )}
        <div className="hc-output" ref={outputRef}>
          {messages.map(m => <ChatMessage key={m.id} {...m} />)}
        </div>
        <div className="hc-compact-input">
          <span className="hc-ps1">~%</span>
          <span className="hc-input-mirror">
            {input}
            <span className={`hc-cursor${focused ? ' hc-cursor-blink' : ''}`}>▋</span>
          </span>
          <input
            ref={inputRef}
            className="hc-real-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hero-computer">

      {/* ── Screen ──────────────────────────────────── */}
      <div className="hc-screen-wrap">
        <div className="hc-camera" />

        <div className="hc-screen">
          {/* macOS title bar */}
          <div className="hc-titlebar">
            <div className="hc-traffic-lights">
              <span className="hc-tl hc-tl-r" />
              <span className="hc-tl hc-tl-y" />
              <span className="hc-tl hc-tl-g" />
            </div>
            <span className="hc-titlebar-label">matthew.portfolio — zsh</span>
            <div className="hc-titlebar-spacer" />
          </div>

          {/* Chat terminal body */}
          <div className="hc-content" onClick={() => inputRef.current?.focus()}>
            {matrixMode && <MatrixRain onDone={() => setMatrixMode(false)} />}
            {hackMode   && <HackAnimation onDone={() => setHackMode(false)} />}
            {gameMode   && <SnakeGame inputRef={gameInputRef} onCloseRef={closeGameRef} />}
            {webcamMode && <WebcamPixelGrid onClose={() => { setWebcamMode(false); setWebcamColor(false); }} colorMode={webcamColor} />}

            {/* Message history */}
            <div className="hc-output" ref={outputRef}>
              {messages.map(m => <ChatMessage key={m.id} {...m} />)}
            </div>

            {/* Active input */}
            <div className="hc-input-row">
              <span className="hc-ps1">matthew@portfolio ~ %</span>
              <span className="hc-input-mirror">
                {input}
                <span className={`hc-cursor${focused ? ' hc-cursor-blink' : ''}`}>▋</span>
              </span>
              <input
                ref={inputRef}
                className="hc-real-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
            </div>
          </div>
        </div>

        <div className="hc-chin">
          <span className="hc-chin-brand">◉ matthew.portfolio</span>
        </div>
      </div>

      {/* ── Trackpad ─────────────────────────────────── */}
      <div className="hc-trackpad-area">
        <div className="hc-trackpad" />
      </div>

      {/* ── Keyboard ─────────────────────────────────── */}
      <Keyboard activeKeys={activeKeys} onKeyClick={handleKeyClick} />

    </div>
  );
}

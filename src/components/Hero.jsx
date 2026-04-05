import { useState, useEffect, useRef, useCallback } from 'react';
import ColorBends from './ColorBends';
import TextType from './TextType';

const stats = [
  { value: 1, suffix: 'st', label: 'Manus AI Hackathon' },
  { value: 3000, suffix: '+', label: 'SGD Raised for Charity' },
];

function AnimatedCounter({ target, suffix, visible }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);

  return <>{count.toLocaleString()}{suffix}</>;
}

/* Interactive Node Canvas */
function NodeCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    nodes: [],
    mode: 'cluster',
    clusterCenter: { x: 0, y: 0 },
    formProgress: 0,
    longPressTimer: null,
    clusterTimer: null,
    isPressed: false,
    textPoints: null,
    width: 0,
    height: 0,
    dpr: 1,
  });

  const getTextPoints = useCallback((text, w, h) => {
    const sW = Math.round(w), sH = Math.round(h);
    if (sW < 10 || sH < 10) return [];
    const offscreen = document.createElement('canvas');
    offscreen.width = sW;
    offscreen.height = sH;
    const ctx = offscreen.getContext('2d');
    const fontSize = Math.max(28, Math.min(sW * 0.08, 52));
    ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, sW / 2, sH / 2);
    const imageData = ctx.getImageData(0, 0, sW, sH);
    const points = [];
    const gap = Math.max(4, Math.floor(6 * (600 / sW)));
    for (let y = 0; y < sH; y += gap) {
      for (let x = 0; x < sW; x += gap) {
        if (imageData.data[(y * sW + x) * 4 + 3] > 100) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, []);

  const initNodes = useCallback((w, h) => {
    const count = Math.min(180, Math.floor((w * h) / 3000));
    const cx = w / 2;
    const cy = h / 2;
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(w, h) * 0.25;
      nodes.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 2.5,
        targetX: null,
        targetY: null,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.008,
        orbitRadius: Math.random() * Math.min(w, h) * 0.25,
      });
    }
    return nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    let animId;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      s.dpr = window.devicePixelRatio || 1;
      s.width = rect.width;
      s.height = rect.height;
      canvas.width = rect.width * s.dpr;
      canvas.height = rect.height * s.dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      s.clusterCenter = { x: s.width / 2, y: s.height / 2 };
      if (s.nodes.length === 0) {
        s.nodes = initNodes(s.width, s.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const startPress = () => {
      if (s.clusterTimer) { clearTimeout(s.clusterTimer); s.clusterTimer = null; }
      s.isPressed = true;
      s.longPressTimer = setTimeout(() => {
        if (s.isPressed) {
          const points = getTextPoints('hello world', s.width, s.height);
          if (points.length === 0) return;
          while (s.nodes.length < points.length) {
            const cx = s.width / 2, cy = s.height / 2;
            s.nodes.push({
              x: cx + (Math.random() - 0.5) * 100,
              y: cy + (Math.random() - 0.5) * 100,
              vx: 0, vy: 0, radius: Math.random() * 2 + 2.5,
              targetX: null, targetY: null,
              orbitAngle: Math.random() * Math.PI * 2,
              orbitSpeed: (Math.random() - 0.5) * 0.008,
              orbitRadius: Math.random() * Math.min(s.width, s.height) * 0.25,
            });
          }
          const used = new Set();
          points.forEach((pt) => {
            let bestDist = Infinity, bestIdx = 0;
            for (let i = 0; i < s.nodes.length; i++) {
              if (used.has(i)) continue;
              const dx = s.nodes[i].x - pt.x, dy = s.nodes[i].y - pt.y;
              const d = dx * dx + dy * dy;
              if (d < bestDist) { bestDist = d; bestIdx = i; }
            }
            used.add(bestIdx);
            s.nodes[bestIdx].targetX = pt.x;
            s.nodes[bestIdx].targetY = pt.y;
          });
          s.nodes.forEach((n, i) => { if (!used.has(i)) { n.targetX = null; n.targetY = null; } });
          s.mode = 'forming';
          s.formProgress = 0;
        }
      }, 500);
    };

    const endPress = () => {
      s.isPressed = false;
      if (s.longPressTimer) { clearTimeout(s.longPressTimer); s.longPressTimer = null; }
      if (s.mode === 'forming' || s.mode === 'formed') {
        s.mode = 'dispersing';
        s.nodes.forEach((n) => {
          n.targetX = null; n.targetY = null;
          n.vx = (Math.random() - 0.5) * 3;
          n.vy = (Math.random() - 0.5) * 3;
        });
        s.clusterTimer = setTimeout(() => { s.mode = 'cluster'; s.clusterTimer = null; }, 800);
      } else if (s.mode === 'cluster') {
        s.mode = 'dispersing';
        s.nodes.forEach((n) => { n.vx = (Math.random() - 0.5) * 4; n.vy = (Math.random() - 0.5) * 4; });
        s.clusterTimer = setTimeout(() => { s.mode = 'cluster'; s.clusterTimer = null; }, 1200);
      }
    };

    const triggerText = (text) => {
      if (s.mode === 'forming' || s.mode === 'formed') {
        s.mode = 'dispersing';
        s.nodes.forEach((n) => {
          n.targetX = null; n.targetY = null;
          n.vx = (Math.random() - 0.5) * 3; n.vy = (Math.random() - 0.5) * 3;
        });
        s.clusterTimer = setTimeout(() => { s.mode = 'cluster'; s.clusterTimer = null; }, 800);
        return;
      }
      if (s.clusterTimer) { clearTimeout(s.clusterTimer); s.clusterTimer = null; }
      const points = getTextPoints(text, s.width, s.height);
      if (points.length === 0) return;
      while (s.nodes.length < points.length) {
        const cx = s.width / 2, cy = s.height / 2;
        s.nodes.push({
          x: cx + (Math.random() - 0.5) * 100, y: cy + (Math.random() - 0.5) * 100,
          vx: 0, vy: 0, radius: Math.random() * 2 + 2.5,
          targetX: null, targetY: null,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.008,
          orbitRadius: Math.random() * Math.min(s.width, s.height) * 0.25,
        });
      }
      const used = new Set();
      points.forEach((pt) => {
        let bestDist = Infinity, bestIdx = 0;
        for (let i = 0; i < s.nodes.length; i++) {
          if (used.has(i)) continue;
          const dx = s.nodes[i].x - pt.x, dy = s.nodes[i].y - pt.y;
          const d = dx * dx + dy * dy;
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        used.add(bestIdx);
        s.nodes[bestIdx].targetX = pt.x;
        s.nodes[bestIdx].targetY = pt.y;
      });
      s.nodes.forEach((n, i) => { if (!used.has(i)) { n.targetX = null; n.targetY = null; } });
      s.mode = 'forming';
      s.formProgress = 0;
    };

    const onKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'h') triggerText('hello world');
      else if (key === 'p') triggerText('python');
      else if (key === 's') triggerText('SQL');
    };

    const onTouchStart = (e) => { e.preventDefault(); startPress(); };
    canvas.addEventListener('mousedown', startPress);
    document.addEventListener('mouseup', endPress);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchend', endPress);
    window.addEventListener('keydown', onKeyDown);

    const draw = () => {
      ctx.clearRect(0, 0, s.width, s.height);
      const { nodes, mode, clusterCenter } = s;

      if (mode === 'forming' && s.formProgress < 1) {
        s.formProgress = Math.min(1, s.formProgress + 0.02);
      }
      if (s.formProgress >= 0.95) {
        if (mode === 'forming') s.mode = 'formed';
      }

      const easeInOut = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
      const t = easeInOut(s.formProgress);

      nodes.forEach((node) => {
        if (mode === 'forming' || mode === 'formed') {
          if (node.targetX !== null) {
            node.x += (node.targetX - node.x) * 0.08;
            node.y += (node.targetY - node.y) * 0.08;
            node.vx *= 0.9; node.vy *= 0.9;
          } else {
            node.orbitAngle += node.orbitSpeed;
            const tx = clusterCenter.x + Math.cos(node.orbitAngle) * node.orbitRadius * 1.2;
            const ty = clusterCenter.y + Math.sin(node.orbitAngle) * node.orbitRadius * 1.2;
            node.x += (tx - node.x) * 0.01;
            node.y += (ty - node.y) * 0.01;
          }
        } else if (mode === 'cluster') {
          node.orbitAngle += node.orbitSpeed;
          const tx = clusterCenter.x + Math.cos(node.orbitAngle) * node.orbitRadius;
          const ty = clusterCenter.y + Math.sin(node.orbitAngle) * node.orbitRadius;
          node.x += (tx - node.x) * 0.03;
          node.y += (ty - node.y) * 0.03;
          node.vx *= 0.95; node.vy *= 0.95;
        } else {
          node.x += node.vx; node.y += node.vy;
          node.vx *= 0.97; node.vy *= 0.97;
          const pad = 20;
          if (node.x < pad) node.vx += 0.3;
          if (node.x > s.width - pad) node.vx -= 0.3;
          if (node.y < pad) node.vy += 0.3;
          if (node.y > s.height - pad) node.vy -= 0.3;
        }
        node.x = Math.max(0, Math.min(s.width, node.x));
        node.y = Math.max(0, Math.min(s.height, node.y));
      });

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nodeRGB = isDark ? '255,255,255' : '10,10,10';
      const hintColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
      const connDist = (mode === 'formed' || mode === 'forming') ? 25 + 20*(1-t) : 80;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * ((mode === 'formed') ? 0.5 : 0.25);
            ctx.strokeStyle = `rgba(${nodeRGB},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const inFormation = (mode === 'forming' || mode === 'formed') && node.targetX !== null;
        const alpha = inFormation ? 0.7 + 0.3*t : 0.55;
        const r = inFormation ? node.radius * (0.9 + 0.3*t) : node.radius;
        ctx.fillStyle = `rgba(${nodeRGB},${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI*2);
        ctx.fill();
      });

      if (mode === 'cluster') {
        ctx.fillStyle = hintColor;
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('click · hold · H key for a surprise', s.width/2, s.height - 24);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', startPress);
      document.removeEventListener('mouseup', endPress);
      canvas.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', endPress);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [initNodes, getTextPoints]);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

export default function Hero({ introComplete = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        />
      </div>
      <div className={`hero-split ${visible ? 'hero-entered' : ''}`}>
        <div className="hero-left">
          <div className="hero-row hero-row-1">
            <div className="hero-availability">
              <span className="hero-availability-dot" />
              Open to data internships · Available May 2025
            </div>
            <p className="hero-tagline">Data Analyst · AI Evaluator · Builder</p>
          </div>
          <div className="hero-row hero-row-2">
            <h1 className="hero-name">
              <TextType
                texts={['Matthew']}
                typingSpeed={80}
                loop={false}
                start={introComplete}
                delay={120}
                showCursor={false}
              />
              <br />
              <TextType
                texts={['Tjandera']}
                typingSpeed={80}
                loop={false}
                start={introComplete}
                delay={840}
                showCursor
                cursorCharacter="|"
                hideCursorOnDone
                cursorBlinkDuration={0.5}
              />
            </h1>
          </div>
          <div className="hero-row hero-row-3">
            <p className="hero-bio">
              Year-one Information Systems student at SMU who builds
              data-driven solutions to real problems, from shipping
              optimizers to AR art marketplaces. I show up to hackathons
              to ship, not just participate.
            </p>
          </div>
          <div className="hero-ctas hero-row hero-row-4">
            <a href="#work" className="btn btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }); }}>
              View Work
            </a>
            <a href="#contact" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Get in Touch
            </a>
          </div>
          <div className="hero-stats hero-row hero-row-5">
            {stats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} visible={visible} />
                </div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <NodeCanvas />
        </div>
      </div>
      <div className="hero-scroll">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v12M3 9l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
}

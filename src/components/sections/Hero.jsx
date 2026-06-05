// Section — Hero: landing screen with animated name, stats, and the interactive HeroComputer.

import { useState, useEffect, useRef } from 'react';
import ColorBends from '../ui/ColorBends';
import TextType from '../ui/TextType';
import GameBoy from './GameBoy';

// ── Stats data for the animated counters ──
const stats = [
  { value: 11000, suffix: '+', label: 'Students Impacted' },
  { value: 7, suffix: '', label: 'Hackathons Entered' },
  { value: 3, suffix: '', label: 'Finalist Placements' },
  { value: 1, suffix: 'st', label: 'Place Win' },
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

function getAvailableMonth() {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();
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
              Open to data internships · Available {getAvailableMonth()}
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
          <GameBoy introComplete={introComplete} />
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

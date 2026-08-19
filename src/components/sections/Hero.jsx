// Section — Hero: landing screen with animated name, stats, and the 3-D Game Boy.
// On desktop the hero pins for ~2 extra screens while scroll drives the
// cartridge-swap animation: the Game Boy drifts to centre stage, flips to show
// its back, the ABOUT.GB cartridge seats into the slot, and the screen boots.
// Scroll progress is shared with the Three.js scene via a mutable ref (no
// React re-renders per scroll tick).

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from '../../lib/gsap';
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

// The Home route's landing screen. Owns the pin that drives the Game Boy's
// cartridge-swap: scrollState is written here and read every frame by the
// 3-D scene rendered on the stage below.
export default function Hero({ introComplete = false }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const cueRef = useRef(null);
  const ss = useRef({ p: 0, pinned: false });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
      ss.current.pinned = true;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => { ss.current.p = self.progress; },
        },
      });
      // Text + scroll cue leave during the first ~18% of the pinned scroll.
      // The empty tween pads the timeline so 1 unit of duration == full pin.
      tl.to(leftRef.current, { autoAlpha: 0, y: -90, ease: 'none', duration: 0.18 }, 0)
        .to(cueRef.current, { autoAlpha: 0, ease: 'none', duration: 0.06 }, 0)
        .to({}, { duration: 0.82 }, 0.18);

      return () => {
        ss.current.pinned = false;
        ss.current.p = 0;
      };
    });
    return () => mm.revert();
  }, [ss]);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
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

      {/* Full-bleed 3-D stage: sits behind the hero text on desktop (the
          cartridge swap plays across the whole hero), and becomes an inline
          block above the text on mobile. */}
      <div className="gb-stage">
        <GameBoy introComplete={introComplete} scrollState={ss} />
      </div>

      <div className={`hero-split ${visible ? 'hero-entered' : ''}`}>
        <div className="hero-left" ref={leftRef}>
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
            <Link to="/projects" className="btn btn-primary">
              View Work
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Get in Touch
            </Link>
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

      </div>

      <div className="hero-scroll" ref={cueRef}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v12M3 9l5 5 5-5" />
        </svg>
        <span className="hero-scroll-text">scroll to load cartridge</span>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';

const TOOLS = [
  { name: 'Python',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { name: 'JavaScript',    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
  { name: 'SQL',           icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
  { name: 'HTML',          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
  { name: 'CSS',           icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
  { name: 'Figma',         icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
  { name: 'Pandas',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg' },
  { name: 'scikit-learn',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg' },
  { name: 'Git',           icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
  { name: 'Claude',        icon: null, initials: 'Cl', color: '#D97757' },
  { name: 'Canva',         icon: null, initials: 'Ca', color: '#00C4CC' },
  { name: 'Pixelmator',    icon: null, initials: 'Px', color: '#5E5CE6' },
  { name: 'WebXR',         icon: null, initials: 'XR', color: '#FF6B35' },
];

export default function LogoLoop({ speed = 0.4 }) {
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const list = track.querySelector('.logoloop__list');
    if (!list) return;

    const listWidth = list.scrollWidth;

    function animate() {
      if (!pausedRef.current) {
        xRef.current -= speed;
        if (Math.abs(xRef.current) >= listWidth) {
          xRef.current = 0;
        }
        track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed]);

  return (
    <div className="logoloop logoloop--fade">
      <div className="logoloop__track" ref={trackRef}>
        {[0, 1].map((copy) => (
          <ul className="logoloop__list" key={copy} aria-hidden={copy === 1}>
            {TOOLS.map((tool) => (
              <li className="logoloop__item logoloop--scale-hover" key={tool.name + copy}>
                <div
                  className="logoloop__node"
                  onMouseEnter={() => { pausedRef.current = true; }}
                  onMouseLeave={() => { pausedRef.current = false; }}
                >
                  {tool.icon ? (
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="logoloop__icon"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="logoloop__initials"
                      style={{ background: tool.color }}
                    >
                      {tool.initials}
                    </span>
                  )}
                  <span className="logoloop__label">{tool.name}</span>
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

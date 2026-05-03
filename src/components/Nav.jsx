import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const sections = ['about', 'work', 'experience', 'certifications', 'contact'];

const navItems = [
  { id: 'about',      label: 'About'      },
  { id: 'work',       label: 'Work'       },
  { id: 'experience', label: 'Experience' },
  { id: 'contact',    label: 'Contact'    },
];

export default function Nav({ onEnterPhotography }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, toggle } = useTheme();
  const popoverRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setMenuOpen(false);
        document.body.classList.remove('nav-open');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleClick = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    document.body.classList.remove('nav-open');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    document.body.classList.toggle('nav-open');
  };

  return (
    <nav className="nav">
      <div className="pill-nav-bar">
        {/* ── Logo circle ── */}
        <a
          href="#"
          className="pill-logo"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Back to top"
        >
          MT
        </a>

        {/* ── Desktop pill items ── */}
        <div className="pill-nav-items desktop-only">
          <ul className="pill-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`pill${activeSection === item.id ? ' is-active' : ''}`}
                  onClick={(e) => handleClick(e, item.id)}
                >
                  <span className="hover-circle" />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
            <li>
              <button className="pill pill-photo" onClick={onEnterPhotography}>
                <span className="hover-circle" />
                <span className="label-stack">
                  <span className="pill-label">Photos</span>
                  <span className="pill-label-hover">Photos</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* ── Right actions ── */}
        <div className="pill-nav-actions">
          <a href="/Matthew_Tjandera_Resume (5).pdf" download="Matthew_Tjandera_Resume.pdf" className="pill-resume">
            Resume ↗
          </a>
          <button className="pill-theme-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* ── Mobile hamburger ── */}
          <button
            className={`mobile-menu-button mobile-only${menuOpen ? ' is-open' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* ── Mobile popover ── */}
      {menuOpen && (
        <div className="mobile-menu-popover open" ref={popoverRef}>
          <ul className="mobile-menu-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="mobile-menu-link"
                  onClick={(e) => handleClick(e, item.id)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                className="mobile-menu-link"
                style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}
                onClick={() => { setMenuOpen(false); document.body.classList.remove('nav-open'); onEnterPhotography(); }}
              >
                Photos ↗
              </button>
            </li>
            <li>
              <a href="/Matthew_Tjandera_Resume (5).pdf" download="Matthew_Tjandera_Resume.pdf" className="mobile-menu-link">
                Resume ↗
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

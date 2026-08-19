// Layout — Nav: sticky pill-style navigation bar with theme toggle and mobile menu.
// Now route-driven: the active pill comes from the current URL (NavLink) rather
// than from a scroll-spy, since each section is its own page.

import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { routes, photographyRoute } from '../../lib/routes';

const navItems = [...routes, photographyRoute];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const popoverRef = useRef(null);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove('nav-open');
  }, [pathname]);

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

  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    document.body.classList.toggle('nav-open');
  };

  return (
    <nav className="nav">
      <div className="pill-nav-bar">
        {/* ── Logo circle ── */}
        <Link to="/" className="pill-logo" aria-label="Home">
          MT
        </Link>

        {/* ── Desktop pill items ── */}
        <div className="pill-nav-items desktop-only">
          <ul className="pill-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `pill${isActive ? ' is-active' : ''}`}
                >
                  <span className="hover-circle" />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover">{item.label}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right actions ── */}
        <div className="pill-nav-actions">
          <a href="/matthew_resume_tech.docx" download="matthew_resume_tech.docx" className="pill-resume">
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
              <li key={item.path}>
                <NavLink to={item.path} className="mobile-menu-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a href="/matthew_resume_tech.docx" download="matthew_resume_tech.docx" className="mobile-menu-link">
                Resume ↗
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

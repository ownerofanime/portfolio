// Root component — sets up client-side routing.
//
// The site used to be one long scroll; it is now a set of real pages, each at
// its own URL with its own signature entrance animation (see hooks/usePageIntro).
// The 3-D Game Boy lives on the Home route only, where its pinned cartridge-swap
// is the landing moment — content pages stay calm and readable.

import { useState, useEffect, useLayoutEffect } from 'react';
import {
  BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate,
} from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollTrigger } from './lib/gsap';
import { setNavigator } from './lib/navigation';

// ── Layout ───────────────────────────────────────────────────────────
import Intro from './components/layout/Intro';
import Nav from './components/layout/Nav';
import ScrollProgress from './components/layout/ScrollProgress';

// ── Pages ────────────────────────────────────────────────────────────
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import ExperiencePage from './pages/ExperiencePage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import CertificationsPage from './pages/CertificationsPage';
import ContactPage from './pages/ContactPage';
import PhotographyPage from './pages/PhotographyPage';

// Each navigation starts at the top, and ScrollTrigger has to re-measure
// because the new page's height is completely different from the old one's.
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}

// Publishes navigate() to code that lives outside the router tree — notably the
// Game Boy terminal, which renders inside the R3F canvas's separate root.
function NavigatorBridge() {
  const navigate = useNavigate();
  useEffect(() => { setNavigator(navigate); }, [navigate]);
  return null;
}

// Shell shared by every standard page: nav, scroll bar, and the routed view.
// `key` on the view remounts it per route, which both replays the CSS route
// transition and re-runs that page's intro timeline.
function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <Nav />
      <ScrollProgress />
      <div className="route-view" key={pathname}>
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  // The boot intro only makes sense as a landing moment — skip it when someone
  // deep-links straight to a content page.
  const [introVisible, setIntroVisible] = useState(
    () => typeof window === 'undefined' || window.location.pathname === '/'
  );

  useEffect(() => {
    if (!introVisible) return;
    // Safety net: never let the overlay strand the page if Intro fails to call back.
    const t = setTimeout(() => setIntroVisible(false), 6000);
    return () => clearTimeout(t);
  }, [introVisible]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <NavigatorBridge />
        {introVisible && <Intro onDone={() => setIntroVisible(false)} />}
        <Routes>
          {/* Photography is full-screen with its own chrome — outside the shell */}
          <Route path="/photography" element={<PhotographyPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home introComplete={!introVisible} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Unknown URLs fall back to the landing page */}
            <Route path="*" element={<Home introComplete={!introVisible} />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Analytics />
    </ThemeProvider>
  );
}

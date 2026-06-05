// Root component — assembles all sections and manages top-level page state.
// Handles the glitch transition animation when switching to/from Photography mode.

import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';

// ── Layout: structural shell components ──────────────────────────────
import Intro from './components/layout/Intro';
import Nav from './components/layout/Nav';
import GlitchTransition from './components/layout/GlitchTransition';

// ── Sections: full-page content sections (rendered in scroll order) ──
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Certifications from './components/sections/Certifications';
import Contact from './components/sections/Contact';
import Photography from './components/sections/Photography';

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [photographyMode, setPhotographyMode] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const triggerGlitch = (toPhotography) => {
    if (glitching) return;
    setGlitching(true);
    setTimeout(() => {
      setPhotographyMode(toPhotography);
      window.scrollTo(0, 0);
    }, 530);
    setTimeout(() => setGlitching(false), 1150);
  };

  return (
    <ThemeProvider>
      {glitching && <GlitchTransition />}
      {introVisible && !photographyMode && (
        <Intro onDone={() => setIntroVisible(false)} />
      )}
      {photographyMode ? (
        <Photography onExit={() => triggerGlitch(false)} />
      ) : (
        <>
          <Nav onEnterPhotography={() => triggerGlitch(true)} />
          <Hero introComplete={!introVisible} />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Certifications />
          <Contact />
        </>
      )}
      <Analytics />
    </ThemeProvider>
  );
}

import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GlitchTransition from './components/GlitchTransition';
import Photography from './components/Photography';

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
          <Projects />
          <Skills />
          <Certifications />
          <Contact />
          <Footer />
        </>
      )}
    </ThemeProvider>
  );
}

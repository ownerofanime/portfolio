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

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);

  return (
    <ThemeProvider>
      {introVisible && <Intro onDone={() => setIntroVisible(false)} />}
      <Nav />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Certifications />
      <Contact />
      <Footer />
    </ThemeProvider>
  );
}

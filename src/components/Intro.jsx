import { useEffect, useRef, useState } from 'react';

const WORDS = [
  'Hello',       // English
  'Halo',        // Bahasa Indonesia
  '你好',         // Mandarin
  'こんにちは',   // Japanese
  '안녕하세요',   // Korean
  'Bonjour',     // French
  'Hola',        // Spanish
  'Ciao',        // Italian
  'مرحبا',       // Arabic
  'Olá',         // Portuguese
  'Привет',      // Russian
  'नमस्ते',      // Hindi
];

const WORD_DURATION = 320; // ms per word

export default function Intro({ onDone }) {
  const logoRef = useRef(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('words'); // words → logo → fly → exit

  // Lock scroll for duration of intro
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cycle through words
  useEffect(() => {
    if (phase !== 'words') return;
    const t = setTimeout(() => {
      if (wordIdx < WORDS.length - 1) {
        setWordIdx(i => i + 1);
      } else {
        setPhase('logo');
      }
    }, WORD_DURATION);
    return () => clearTimeout(t);
  }, [phase, wordIdx]);

  // Hold MT logo then trigger fly
  useEffect(() => {
    if (phase !== 'logo') return;
    const t = setTimeout(() => setPhase('fly'), 1700);
    return () => clearTimeout(t);
  }, [phase]);

  // Fly MT logo to nav position
  useEffect(() => {
    if (phase !== 'fly') return;

    const logo = logoRef.current;
    const navLogo = document.querySelector('.nav-logo');
    if (!logo || !navLogo) return;

    const from = logo.getBoundingClientRect();
    const to = navLogo.getBoundingClientRect();

    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const scale = to.height / from.height;

    logo.getBoundingClientRect(); // force reflow
    logo.style.transition =
      'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.45s ease 0.7s';
    logo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    logo.style.opacity = '0';

    const exitTimer = setTimeout(() => setPhase('exit'), 1050);
    return () => clearTimeout(exitTimer);
  }, [phase]);

  // Fade overlay out then unmount
  useEffect(() => {
    if (phase !== 'exit') return;
    const timer = setTimeout(() => {
      document.body.style.overflow = '';
      onDone();
    }, 750);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  return (
    <div className={`intro-overlay intro-phase-${phase}`} aria-hidden="true">
      {phase === 'words' && (
        <span key={wordIdx} className="intro-word">
          {WORDS[wordIdx]}
        </span>
      )}
      {(phase === 'logo' || phase === 'fly') && (
        <span
          ref={logoRef}
          className={`intro-logo ${phase === 'logo' ? 'intro-logo-enter' : ''}`}
        >
          MT
        </span>
      )}
    </div>
  );
}

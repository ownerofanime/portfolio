// Route: /photography — a full-screen experience with its own chrome, so it
// renders outside the standard page layout (no site nav, no pager).
// Signature entrance: the CRT glitch wipe that used to fire when switching
// into photography "mode" now plays on route entry and on the way back out.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Photography from '../components/sections/Photography';
import GlitchTransition from '../components/layout/GlitchTransition';

const GLITCH_MS = 1150;   // matches the CSS animation length
const SWAP_MS = 530;      // point in the glitch where the swap is hidden

export default function PhotographyPage() {
  const navigate = useNavigate();
  const [glitching, setGlitching] = useState(true);

  // Entry glitch
  useEffect(() => {
    const t = setTimeout(() => setGlitching(false), GLITCH_MS);
    return () => clearTimeout(t);
  }, []);

  const exit = () => {
    setGlitching(true);
    setTimeout(() => navigate('/'), SWAP_MS);
  };

  return (
    <>
      {glitching && <GlitchTransition />}
      <Photography onExit={exit} />
    </>
  );
}

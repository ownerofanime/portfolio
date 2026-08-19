// Layout — ScrollProgress: retro segmented loading bar fixed to the top of the
// page. Fill is scroll-linked (scrubbed) across the whole document, echoing the
// Game Boy cartridge-loading theme from the hero.

import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      barRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-fill" ref={barRef} />
    </div>
  );
}

// useReveal — scroll-linked reveal powered by GSAP ScrollTrigger.
// The element fades/slides in as it enters the viewport, scrubbed to scroll
// position (scrolling back up reverses it), replacing the old one-shot
// IntersectionObserver behaviour.
// useRevealChildren also staggers direct children carrying the class 'reveal-child'.

import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 62%', scrub: 0.4 },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return ref;
}

export function useRevealChildren() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll('.reveal-child');
    if (prefersReducedMotion()) {
      gsap.set([el, ...children], { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 70%', scrub: 0.4 },
        }
      );
      if (children.length) {
        gsap.fromTo(
          children,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'none',
            stagger: 0.15,
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 45%', scrub: 0.4 },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return ref;
}

// usePageIntro — gives each route its own signature entrance animation.
//
// Returns a ref to attach to the page root. On mount (and on every route
// change, since the router remounts the page) it plays the named variant.
// Motion is deliberately contained to the entrance: pages are short and
// focused now, so nothing keeps moving while the content is being read.
//
// Honours prefers-reduced-motion by snapping everything visible instead.

import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Each variant: (q) => timeline steps, where q is a scoped selector helper.
const VARIANTS = {
  // About — a dossier opening: photo swings in from the left on its hinge,
  // the write-up feeds in from the right.
  dossier: (tl, q) => {
    tl.from(q('.about-photo'), {
      autoAlpha: 0, xPercent: -12, rotateY: -22, transformOrigin: 'left center',
      duration: 0.75, ease: 'power3.out',
    }, 0)
      .from(q('.about-text > p, .about-edu'), {
        autoAlpha: 0, x: 34, duration: 0.55, stagger: 0.09, ease: 'power2.out',
      }, 0.18);
  },

  // Experience — the timeline draws itself: dots pop in sequence and each
  // entry slides off the spine.
  timeline: (tl, q) => {
    tl.from(q('.timeline-item'), {
      autoAlpha: 0, x: -38, duration: 0.5, stagger: 0.11, ease: 'power2.out',
    }, 0)
      .from(q('.timeline-dot'), {
        scale: 0, duration: 0.42, stagger: 0.11, ease: 'back.out(2.6)',
      }, 0.06);
  },

  // Projects — dealing a hand of cards onto the table, then the hackathon
  // record and GitHub strip settle in underneath.
  deal: (tl, q) => {
    tl.from(q('.featured-grid > *, .projects-grid > *'), {
      autoAlpha: 0, y: 76, rotateZ: (i) => (i % 2 ? 5 : -5), scale: 0.94,
      duration: 0.62, stagger: 0.075, ease: 'back.out(1.5)',
    }, 0)
      .from(q('.hackathon-list-wrap, .github-strip'), {
        autoAlpha: 0, y: 32, duration: 0.5, stagger: 0.1, ease: 'power2.out',
      }, 0.35);
  },

  // Skills — chips powering up, tier by tier. No overshoot easing here: a
  // back.out() bounce briefly scales text past 100%, and text mid-transform
  // renders blurred/smeared in most browsers — looks like a rendering glitch
  // in a screenshot. power2.out keeps the same pop without that artifact.
  powerup: (tl, q) => {
    tl.from(q('.skills-tier-header'), {
      autoAlpha: 0, x: -22, duration: 0.45, stagger: 0.14, ease: 'power2.out',
    }, 0)
      .from(q('.skill-tag'), {
        autoAlpha: 0, scale: 0.75, duration: 0.4, stagger: 0.025, ease: 'power2.out',
      }, 0.1);
  },

  // Certifications — badges flipping face-up.
  flip: (tl, q) => {
    tl.from(q('.cert-grid > *'), {
      autoAlpha: 0, rotateY: 84, transformOrigin: 'center center',
      duration: 0.6, stagger: 0.07, ease: 'power3.out',
    }, 0);
  },

  // Contact — a terminal booting: details then the form, line by line.
  boot: (tl, q) => {
    tl.from(q('.contact-note, .status-badge, .contact-link, .contact-grid .btn'), {
      autoAlpha: 0, y: 18, duration: 0.45, stagger: 0.07, ease: 'power2.out',
    }, 0)
      .from(q('.form-group, .contact-form .btn'), {
        autoAlpha: 0, y: 22, duration: 0.42, stagger: 0.08, ease: 'power2.out',
      }, 0.12);
  },

};

export function usePageIntro(variant) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // The page header animates on every route; the variant adds its signature.
    const header = root.querySelectorAll('.section-label, .section-title, .section-subtitle');

    if (reduced()) {
      gsap.set([...header, ...root.querySelectorAll('[data-intro]')], { clearProps: 'all' });
      return;
    }

    let safety;
    const ctx = gsap.context(() => {
      const q = (sel) => root.querySelectorAll(sel);
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

      tl.from(header, {
        autoAlpha: 0, y: 26, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      }, 0);

      VARIANTS[variant]?.(tl, q);

      // Safety reveal. from() hides these elements on the spot, so anything
      // that stops the timeline advancing (a backgrounded tab pausing rAF, a
      // stalled ticker) would leave the page looking empty. If the timeline
      // has not finished shortly after its natural end, snap it to the end so
      // the content is always readable. setTimeout still fires while hidden.
      const done = () => clearTimeout(safety);
      tl.eventCallback('onComplete', done);
      safety = setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, (tl.duration() + 1.5) * 1000);
    }, root);

    return () => { clearTimeout(safety); ctx.revert(); };
  }, [variant]);

  return ref;
}

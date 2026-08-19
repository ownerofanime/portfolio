// Central GSAP setup — registers ScrollTrigger once and re-exports.
// Import gsap/ScrollTrigger from here so the plugin is always registered.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// With a pinned hero, browser scroll restoration fights ScrollTrigger's
// layout (the pin spacer doesn't exist yet at restore time) — let GSAP
// manage scroll memory manually instead.
ScrollTrigger.clearScrollMemory('manual');

export { gsap, ScrollTrigger };

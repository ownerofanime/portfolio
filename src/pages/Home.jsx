// Route: / — the landing screen. Keeps the pinned 3-D Game Boy cartridge-swap
// (the site's signature moment), then hands off to the route card-swap deck,
// which is how you reach every other page.

import Hero from '../components/sections/Hero';
import RouteCardSwap from '../components/sections/RouteCardSwap';
import { usePageIntro } from '../hooks/usePageIntro';

export default function Home({ introComplete }) {
  // No page-specific variant: CardSwap runs its own entrance/cycle animation
  // the moment it mounts, so layering a second GSAP reveal on the same cards
  // would just be two systems fighting over the same elements. The shared
  // header-line animation (see usePageIntro) still plays for the intro copy.
  const ref = usePageIntro();

  return (
    <main className="page page-home" ref={ref}>
      <Hero introComplete={introComplete} />
      <RouteCardSwap />
    </main>
  );
}

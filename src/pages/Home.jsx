// Route: / — the landing screen. Keeps the pinned 3-D Game Boy cartridge-swap
// (the site's signature moment), then hands off to the cartridge shelf, which
// is how you reach every other page.

import Hero from '../components/sections/Hero';
import CartridgeShelf from '../components/sections/CartridgeShelf';
import { usePageIntro } from '../hooks/usePageIntro';

export default function Home({ introComplete }) {
  const ref = usePageIntro('shelf');

  return (
    <main className="page page-home" ref={ref}>
      <Hero introComplete={introComplete} />
      <CartridgeShelf />
    </main>
  );
}

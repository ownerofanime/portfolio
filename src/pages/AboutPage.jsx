// Route: /about — signature entrance: the profile card swings open like a
// dossier while the write-up feeds in beside it.

import About from '../components/sections/About';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function AboutPage() {
  const ref = usePageIntro('dossier');

  return (
    <main className="page" ref={ref}>
      <About />
      <PagePager pathname="/about" />
    </main>
  );
}

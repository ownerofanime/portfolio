// Route: /skills — signature entrance: skill chips power up tier by tier.

import Skills from '../components/sections/Skills';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function SkillsPage() {
  const ref = usePageIntro('powerup');

  return (
    <main className="page" ref={ref}>
      <Skills />
      <PagePager pathname="/skills" />
    </main>
  );
}

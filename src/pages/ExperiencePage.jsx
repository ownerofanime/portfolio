// Route: /experience — signature entrance: the timeline draws itself, dots
// popping in sequence as each role slides off the spine.

import Experience from '../components/sections/Experience';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function ExperiencePage() {
  const ref = usePageIntro('timeline');

  return (
    <main className="page" ref={ref}>
      <Experience />
      <PagePager pathname="/experience" />
    </main>
  );
}

// Route: /projects — signature entrance: project cards are dealt onto the
// table, each landing with a slight rotation.

import Projects from '../components/sections/Projects';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function ProjectsPage() {
  const ref = usePageIntro('deal');

  return (
    <main className="page" ref={ref}>
      <Projects />
      <PagePager pathname="/projects" />
    </main>
  );
}

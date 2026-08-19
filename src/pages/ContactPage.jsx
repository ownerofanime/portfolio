// Route: /contact — signature entrance: details and form fields boot in
// line by line, like a terminal coming up.

import Contact from '../components/sections/Contact';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function ContactPage() {
  const ref = usePageIntro('boot');

  return (
    <main className="page" ref={ref}>
      <Contact />
      <PagePager pathname="/contact" />
    </main>
  );
}

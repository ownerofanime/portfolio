// Route: /certifications — signature entrance: certificates flip face-up
// like badges being turned over.

import Certifications from '../components/sections/Certifications';
import PagePager from '../components/layout/PagePager';
import { usePageIntro } from '../hooks/usePageIntro';

export default function CertificationsPage() {
  const ref = usePageIntro('flip');

  return (
    <main className="page" ref={ref}>
      <Certifications />
      <PagePager pathname="/certifications" />
    </main>
  );
}

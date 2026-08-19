// Layout — PagePager: prev/next links at the foot of every content page, so
// the site is still traversable in one direction like the old single scroll,
// just without everything living on one screen.

import { Link } from 'react-router-dom';
import { pagerFor } from '../../lib/routes';

export default function PagePager({ pathname }) {
  const { prev, next } = pagerFor(pathname);
  if (!prev && !next) return null;

  return (
    <nav className="page-pager" aria-label="Page navigation">
      {prev && (
        <Link className="page-pager-link page-pager-prev" to={prev.path}>
          <span className="page-pager-dir">◀ Previous</span>
          <span className="page-pager-name">{prev.label}</span>
          <span className="page-pager-cart">{prev.cart}</span>
        </Link>
      )}
      {next && (
        <Link className="page-pager-link page-pager-next" to={next.path}>
          <span className="page-pager-dir">Next ▶</span>
          <span className="page-pager-name">{next.label}</span>
          <span className="page-pager-cart">{next.cart}</span>
        </Link>
      )}
    </nav>
  );
}

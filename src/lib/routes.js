// Single source of truth for the site's routes.
// Drives the nav, the Home "cartridge shelf", and the prev/next page pager,
// so adding a page here wires it into all three at once.

export const routes = [
  {
    path: '/about',
    label: 'About',
    cart: 'ABOUT.GB',
    blurb: 'Year-one IS student at SMU who ships.',
  },
  {
    path: '/experience',
    label: 'Experience',
    cart: 'EXPERIENCE.GB',
    blurb: 'Roles across data, events, and education.',
  },
  {
    path: '/projects',
    label: 'Projects',
    cart: 'PROJECTS.GB',
    blurb: 'Seven hackathon builds and counting.',
  },
  {
    path: '/skills',
    label: 'Skills',
    cart: 'SKILLS.GB',
    blurb: 'Proven in shipped work, not coursework.',
  },
  {
    path: '/certifications',
    label: 'Certs',
    cart: 'CERTS.GB',
    blurb: 'Certified, and still learning.',
  },
  {
    path: '/contact',
    label: 'Contact',
    cart: 'CONTACT.GB',
    blurb: 'Open to data internships.',
  },
];

// Photography is a full-screen experience with its own chrome, so it sits
// outside the standard page layout (and outside the pager).
export const photographyRoute = {
  path: '/photography',
  label: 'Photos',
  cart: 'PHOTOS.GB',
  blurb: 'Through my lens.',
};

export const findRoute = (pathname) =>
  routes.find((r) => r.path === pathname) ??
  (pathname === photographyRoute.path ? photographyRoute : null);

// Wrap-around neighbours for the bottom-of-page pager.
export function pagerFor(pathname) {
  const i = routes.findIndex((r) => r.path === pathname);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: routes[(i - 1 + routes.length) % routes.length],
    next: routes[(i + 1) % routes.length],
  };
}

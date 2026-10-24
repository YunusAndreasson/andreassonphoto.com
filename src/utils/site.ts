// Identity shared by every page: the name in the header and titles, the nav,
// and the one Person node that all structured data points at. The origin comes
// from `site` in astro.config, so no page hardcodes the domain.

export const SITE_NAME = 'Andrèasson Photo';
export const PERSON_NAME = 'Yūnus Andrèasson';
export const PERSON_FULL_NAME = `Jonas ${PERSON_NAME}`;
export const SITE_ORIGIN = new URL(import.meta.env.SITE).origin;
export const PERSON_ID = `${SITE_ORIGIN}/#person`;

export const GITHUB_URL = 'https://github.com/YunusAndreasson';

// Profiles that are the same person, for the Person node's `sameAs`.
export const SAME_AS = [
  GITHUB_URL,
  'https://x.com/YunusAndreasson',
  'https://www.instagram.com/andreasson.photo/',
  'https://www.linkedin.com/in/yunusandreasson/',
];

export const NAV = [
  { href: '/', label: 'Work' },
  { href: '/about', label: 'Words' },
  { href: '/birds', label: 'Wings' },
  { href: '/projects', label: 'Webs' },
];

// "Page — Andrèasson Photo"-style titles stay consistent across pages.
export const pageTitle = (page: string) => `${SITE_NAME} — ${page}`;

// The CollectionPage node /projects and /birds both carry, authored by the Person.
export function collectionPageSchema(path: string, name: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: `${SITE_ORIGIN}${path}`,
    ...(description && { description }),
    author: { '@id': PERSON_ID },
  };
}

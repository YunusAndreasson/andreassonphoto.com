// Identity shared by every page: the name in the header and titles, the nav,
// and the one Person node that all structured data points at. The origin comes
// from `site` in astro.config, so no page hardcodes the domain.

export const SITE_NAME = 'Andrèasson Photo';
export const PERSON_NAME = 'Jonas Yūnus Andrèasson';
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

// With the trailing slash: Cloudflare Pages serves each page at its folder
// URL and answers /poems with a 308 to /poems/, a round trip per click.
export const NAV = [
  { href: '/poems/', label: 'Poems' },
  { href: '/birds/', label: 'Birds' },
  { href: '/code/', label: 'Code' },
];

// "Poems — Andrèasson Photo": the page first, so a row of tabs tells the
// pages apart before the site name is cut off.
export const pageTitle = (page: string) => `${page} — ${SITE_NAME}`;

// The CollectionPage node /code and /birds both carry, authored by the Person.
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

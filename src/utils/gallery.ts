import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

// The gallery in its curated order. The homepage and the image sitemap both
// read it from here, so they can never list the prints differently.
export async function getGalleryImages() {
  const images = (await getCollection('gallery'))
    .map((entry) => entry.data)
    .sort((a, b) => a.order - b.order);
  // Two prints with the same `order` would hang in whichever order the
  // collection happened to load them; fail the build instead.
  for (let i = 1; i < images.length; i++) {
    if (images[i].order === images[i - 1].order) {
      throw new Error(`Gallery: "${images[i - 1].title}" and "${images[i].title}" share order ${images[i].order}.`);
    }
  }
  return images;
}

// A print's address: 65_whooper_swan → /whooper-swan/, the wall opened on it.
export const printSlug = (id: string) => id.replace(/^\d+_/, '').replaceAll('_', '-');

// The second line of a print's label: "Halland, 2021", "Halland", "2021",
// or nothing. The viewer, the print's own page and its link preview
// (scripts/make-og.mjs, which repeats this one line) all say it the same way.
export const printPlace = ({ place, year }: { place?: string; year?: number }) =>
  [place, year].filter(Boolean).join(', ');

// AVIF quality for every gallery variant. The encoder default (50) smooths
// away the film grain the prints are made of; 70 keeps it for about twice the
// bytes.
export const AVIF_QUALITY = 70;

// The print at its own size (up to 2400px) as an AVIF, for the image sitemap.
// It is the same file as `src` on the wall's <img>, which the viewer uses as the
// top of its srcset: the options match, so Astro emits it only once.
export function getFullscreenImage(meta: ImageMetadata) {
  return getImage({ src: meta, width: Math.min(2400, meta.width), format: 'avif', quality: AVIF_QUALITY });
}

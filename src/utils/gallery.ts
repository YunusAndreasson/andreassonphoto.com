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

// AVIF quality for every gallery variant. The encoder default (50) smooths
// away the film grain the prints are made of; 70 keeps it for about twice the
// bytes.
export const AVIF_QUALITY = 70;

// The large AVIF the fullscreen view shows: the print at its own size (up to
// 2400px), so the viewer can fill a big screen without upscaling. The image
// sitemap lists the same file, and because the options match, Astro emits it
// only once.
export function getFullscreenImage(meta: ImageMetadata) {
  return getImage({ src: meta, width: Math.min(2400, meta.width), format: 'avif', quality: AVIF_QUALITY });
}

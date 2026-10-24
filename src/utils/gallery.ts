import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

// The gallery in its curated order. The homepage and the image sitemap both
// read it from here, so they can never list the prints differently.
export async function getGalleryImages() {
  return (await getCollection('gallery'))
    .map((entry) => entry.data)
    .sort((a, b) => a.order - b.order);
}

// The large AVIF the fullscreen view shows. The image sitemap lists the same
// file, and because the options match, Astro emits it only once.
export function getFullscreenImage(meta: ImageMetadata) {
  return getImage({ src: meta, width: Math.min(1600, meta.width), format: 'avif' });
}

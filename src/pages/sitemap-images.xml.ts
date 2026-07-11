import type { APIRoute, ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';

// A dedicated Google Image sitemap for the single-page gallery.
//
// @astrojs/sitemap's own sitemap-0.xml lists only the page URLs; it cannot
// attach <image:image> blocks here because the built, hashed image URLs are
// only known during rendering (getImage runs in the Astro pipeline, not in
// astro.config's serialize hook). So this endpoint renders the image sitemap
// directly — this is a photographer's site, and Google Images is the channel.
//
// Image URLs mirror GalleryView.astro's fullscreen variant exactly (same src,
// width and format), so Astro dedupes to the already-emitted AVIF file rather
// than generating extra assets. AVIF is never touched by prune-orphan-images.

// Optimized binaries, resolved by filename from the gallery asset folder.
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/gallery_bw/*.{jpg,jpeg}',
);

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://andreassonphoto.com';

  // Same source and ordering as the homepage (src/pages/index.astro).
  const images = (await getCollection('gallery'))
    .map((entry) => entry.data)
    .sort((a, b) => a.order - b.order);

  const entries = await Promise.all(
    images.map(async (img) => {
      const loader = imageModules[`/src/assets/gallery_bw/${img.file}`];
      if (!loader) throw new Error(`Gallery image not found: src/assets/gallery_bw/${img.file}`);
      const meta = (await loader()).default;
      const full = await getImage({
        src: meta,
        width: Math.min(1600, meta.width),
        format: 'avif',
      });
      const loc = new URL(full.src, origin).href;
      return [
        '    <image:image>',
        `      <image:loc>${xmlEscape(loc)}</image:loc>`,
        `      <image:title>${xmlEscape(img.title)}</image:title>`,
        '    </image:image>',
      ].join('\n');
    }),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${origin}/</loc>
${entries.join('\n')}
  </url>
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

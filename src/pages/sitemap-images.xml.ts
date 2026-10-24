import type { APIRoute } from 'astro';
import { getFullscreenImage, getGalleryImages } from '../utils/gallery';
import { SITE_ORIGIN } from '../utils/site';

// A dedicated Google Image sitemap for the single-page gallery.
//
// @astrojs/sitemap's own sitemap-0.xml lists only the page URLs; it cannot
// attach <image:image> blocks here because the built, hashed image URLs are
// only known during rendering (getImage runs in the Astro pipeline, not in
// astro.config's serialize hook). So this endpoint renders the image sitemap
// directly — this is a photographer's site, and Google Images is the channel.
//
// Image URLs are GalleryView's fullscreen variant (the shared getFullscreenImage),
// so Astro dedupes to the already-emitted AVIF file rather than generating extra
// assets. AVIF is never touched by prune-orphan-images.

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const origin = SITE_ORIGIN;
  const images = await getGalleryImages();

  const entries = await Promise.all(
    images.map(async (img) => {
      const loc = new URL((await getFullscreenImage(img.file)).src, origin).href;
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

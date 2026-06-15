// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andreassonphoto.com',
  output: 'static',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: [],
    // No global `layout`: GalleryView drives srcset via explicit `widths`/`sizes`
    // so the existing gallery CSS keeps full control of image sizing.
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});

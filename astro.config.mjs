// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://andreassonphoto.com',
  output: 'static',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  // Self-hosted through the Fonts API: Astro emits the @font-face rules, hashed
  // (immutable-cached) files, and metric-matched fallbacks so the swap from
  // Times to Garamond doesn't shift the layout. Only faces the CSS uses.
  fonts: [
    {
      // Display face: header, nav, labels, names, signature (its italic carries ū).
      provider: fontProviders.local(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      fallbacks: ['Garamond', 'Times New Roman', 'serif'],
      options: {
        variants: [
          { weight: 300, style: 'normal', src: ['./src/assets/fonts/cormorant-garamond-light.woff2'] },
          { weight: 300, style: 'italic', src: ['./src/assets/fonts/cormorant-garamond-light-italic.woff2'] },
        ],
      },
    },
    {
      // Text face: prose and notes — Cormorant's hairlines vanish at reading sizes.
      provider: fontProviders.local(),
      name: 'EB Garamond',
      cssVariable: '--font-eb-garamond',
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: ['./src/assets/fonts/eb-garamond-regular.woff2'] },
          { weight: 400, style: 'italic', src: ['./src/assets/fonts/eb-garamond-italic.woff2'] },
        ],
      },
    },
  ],
});

import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const gallery = defineCollection({
  loader: file('src/content/gallery/images.json'),
  schema: z.object({
    id: z.string(),
    file: z.string(),
    title: z.string(),
    tone: z.enum(['dark', 'light', 'mid']),
    aspect: z.enum(['square', 'portrait', 'landscape']),
    featured: z.boolean().default(false),
    // Opt-in full-bleed placement. When no image sets this, composeRows falls
    // back to a heuristic (see markHeroes) so the wall still gets hero moments.
    hero: z.boolean().default(false),
    order: z.number(),
    edgeColor: z.string(),
  }),
});

export const collections = { gallery };

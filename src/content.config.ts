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
    order: z.number(),
    edgeColor: z.string(),
  }),
});

export const collections = { gallery };

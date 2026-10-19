import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const gallery = defineCollection({
  loader: file('src/content/gallery/images.json'),
  // `file` is a path relative to images.json; image() validates it exists at
  // build time and resolves it to ImageMetadata for <Image> / getImage().
  schema: ({ image }) => z.object({
    id: z.string(),
    file: image(),
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

// Yunus's Sweden list — every species he has seen in Sweden, in taxonomic order.
// Not the national checklist (that runs to ~530); each entry here is a bird he
// has actually recorded. `group` is the family heading the birds page renders
// under; `status` is the Förekomst code describing how the species occurs in
// Sweden, and `regular` folds it down to "lives here" vs "turns up" — so the
// page can pick out which of the 314 were the rarities.
const birds = defineCollection({
  loader: file('src/content/birds/species.json'),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    sv: z.string(),
    en: z.string(),
    la: z.string(),
    group: z.string(),
    status: z.string(),
    regular: z.boolean(),
  }),
});

export const collections = { gallery, birds };

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
    // Opt-in: give this print a full-width row of its own (see composeRows).
    hero: z.boolean().default(false),
    // Position on the wall; unique, so the sequence is never left to chance.
    order: z.number(),
    // The curated hang: prints sharing a row number hang side by side as one
    // row (a diptych or triptych, or a lone print as a pause). Prints without
    // one are broken into rows automatically.
    row: z.number().int().positive().optional(),
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

// Short pieces from Yunus's diaries, mostly written in Swedish and translated
// for the Poems page. Generated from the private diary repository, which keeps
// the sources; only what is published lives here. `date` is year and month
// (YYYY-MM), never the day. Stanzas are separated by a blank line in `text`.
const poems = defineCollection({
  loader: file('src/content/poems/pieces.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    text: z.string(),
  }),
});

// The websites on /code, in page order, each labelled by its domain (from `url`). `image` is a 1440×900 screenshot of
// the site's front page, taken by scripts/capture-sites.mjs; the page hangs it
// in black and white, like the prints.
const code = defineCollection({
  loader: file('src/content/code/sites.json'),
  schema: ({ image }) => z.object({
    id: z.string(),
    url: z.url(),
    // Where to photograph the site when that differs from the link, e.g. a
    // new version not yet live at `url`.
    capture: z.url().optional(),
    desc: z.string(),
    image: image(),
    order: z.number(),
  }),
});

export const collections = { gallery, birds, poems, code };

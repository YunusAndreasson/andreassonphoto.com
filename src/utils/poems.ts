import { getCollection } from 'astro:content';
import source from '../content/poems/pieces.yaml?raw';

// A date names only the month, so within a month the pieces keep the order
// they're written in pieces.yaml (the diary order). The collection itself
// comes back sorted by id, which would put them in alphabetical order.
const filed = new Map([...source.matchAll(/^- id: (\S+)$/gm)].map((match, i) => [match[1], i]));

// The pieces from the diaries, newest month first: the order of /poems, and of
// the older and newer turns at the foot of each poem's own page.
export async function getPoems() {
  return (await getCollection('poems'))
    .map((entry) => entry.data)
    .sort((a, b) => b.date.localeCompare(a.date) || (filed.get(a.id) ?? 0) - (filed.get(b.id) ?? 0));
}

export type Poem = Awaited<ReturnType<typeof getPoems>>[number];

const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' });

// "2015-11" → "November". UTC so the build machine's zone can't shift it.
export const month = (date: string) =>
  monthFormatter.format(new Date(`${date}-01T00:00:00Z`));

// A blank line ends a stanza. A stanza in Arabic script is set right to left.
// Transliteration (Ẓuhr, Muḥammad, Allāh) is set as written: the faces carry
// the precomposed letters (scripts/make-fonts.py).
export const stanzas = (text: string) =>
  text.split(/\n{2,}/).map((stanza) => ({ lines: stanza.split('\n'), arabic: /[؀-ۿ]/.test(stanza) }));

// The poem as one run of words, for a description: what a search result or a
// link preview shows in text. Cut at a word, near the length they display.
export function excerpt(text: string, max = 155) {
  const flat = text.replace(/\s*\n+\s*/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, flat.lastIndexOf(' ', max)).replace(/[,;:.]$/, '')}…`;
}

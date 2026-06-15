import type { CollectionEntry } from 'astro:content';

// Single source of truth: inferred from the gallery collection schema
// (src/content.config.ts). composeRows only relies on `aspect`.
export type GalleryImage = CollectionEntry<'gallery'>['data'];

export interface Cell {
  span: number;
  img: GalleryImage;
}

export type Row = Cell[];

// Pairing strategy:
// Same aspect or square+landscape → 6/6 (equal or intentionally different)
// Portrait + non-portrait → 5/7 (clear dynamic tension at 30%+)
// The 5/7 split with square+landscape creates a 5% near-miss that looks like
// an error, so we treat them as "close enough" for equal spans.
function makePair(a: GalleryImage, b: GalleryImage, aLeft: boolean): Row {
  const hasPortrait = a.aspect === 'portrait' || b.aspect === 'portrait';

  if (!hasPortrait || a.aspect === b.aspect) {
    return [{ span: 6, img: a }, { span: 6, img: b }];
  }

  // One is portrait, the other isn't — portrait gets span 5
  if (a.aspect === 'portrait') {
    return aLeft
      ? [{ span: 5, img: a }, { span: 7, img: b }]
      : [{ span: 7, img: b }, { span: 5, img: a }];
  }
  return aLeft
    ? [{ span: 7, img: a }, { span: 5, img: b }]
    : [{ span: 5, img: b }, { span: 7, img: a }];
}

type Pattern = (items: GalleryImage[]) => { row: Row; used: number } | null;

const patterns: Pattern[] = [
  // Pair: wider aspect on left
  (items) => {
    if (items.length < 2) return null;
    return { row: makePair(items[0], items[1], true), used: 2 };
  },
  // Pair reversed: wider aspect on right
  (items) => {
    if (items.length < 2) return null;
    return { row: makePair(items[0], items[1], false), used: 2 };
  },
  // Anchor: full width for landscape/square, pair fallback for portrait
  (items) => {
    if (items[0].aspect !== 'portrait') {
      return { row: [{ span: 12, img: items[0] }], used: 1 };
    }
    if (items.length >= 2) {
      return { row: makePair(items[0], items[1], true), used: 2 };
    }
    return { row: [{ span: 12, img: items[0] }], used: 1 };
  },
  // Triple: same aspect only, otherwise fall back to pair
  (items) => {
    if (items.length >= 3 && items[0].aspect === items[1].aspect && items[0].aspect === items[2].aspect) {
      return {
        row: [
          { span: 4, img: items[0] },
          { span: 4, img: items[1] },
          { span: 4, img: items[2] },
        ],
        used: 3,
      };
    }
    if (items.length >= 2) {
      return { row: makePair(items[0], items[1], false), used: 2 };
    }
    return null;
  },
];

export function composeRows(imgs: GalleryImage[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  let patIdx = 0;

  while (i < imgs.length) {
    const remaining = imgs.slice(i);
    const pattern = patterns[patIdx % patterns.length];
    const result = pattern(remaining);
    if (result) {
      rows.push(result.row);
      i += result.used;
    } else {
      rows.push([{ span: 12, img: remaining[0] }]);
      i += 1;
    }
    patIdx++;
  }
  return rows;
}

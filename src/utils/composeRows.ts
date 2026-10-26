import type { CollectionEntry } from 'astro:content';
import { CONTENT_W, GAP } from './layout';

// Single source of truth: inferred from the gallery collection schema
// (src/content.config.ts).
export type GalleryImage = CollectionEntry<'gallery'>['data'];

// An image paired with its real aspect ratio (width / height, from
// astro:assets ImageMetadata).
export interface Item {
  img: GalleryImage;
  ar: number;
}

export interface Cell {
  img: GalleryImage;
  ar: number;
  // flex-grow within the row: proportional to aspect ratio so every image in
  // the row resolves to the SAME height (height = rowWidth / Σar).
  grow: number;
}

// Every row spans the full content width.
export interface Row {
  cells: Cell[];
}

// ── Layout tuning ──────────────────────────────────────────────────────────
// Approximate: flex-grow does the exact pixel work in the browser at the live
// viewport width. These and the wall's CONTENT_W / GAP (src/utils/layout.ts)
// steer how the curated order is broken into rows; GalleryView uses rowHeight
// to estimate each print's rendered width for `sizes`.
const TARGET_H = 500; // preferred print height — every row is justified toward this
const MAX_PER_ROW = 3; // keep prints large; never cram a row

// Height a row of n images (aspect-ratio sum `sumAr`) renders at when it fills
// the full content width — which EVERY row now does, so the left and right
// edges of the wall are perfectly straight verticals from top to bottom.
export function rowHeight(sumAr: number, n: number): number {
  return (CONTENT_W - (n - 1) * GAP) / sumAr;
}

/**
 * Lay the curated order out as a fully-justified grid.
 *
 * Never reorders. Every row spans the full content width, so the wall's outer
 * edges are dead-straight top to bottom (a premium museum hang) — there are no
 * centered/inset rows and no lone floating prints.
 *
 * Rows are the curator's where given: consecutive prints sharing a `row`
 * number hang together exactly as chosen (a print alone in its row is a
 * pause), and only their widths are computed. Prints without a `row` (and any
 * flagged `hero`, which hang alone) are broken into rows by dynamic
 * programming, minimising each row's squared deviation from TARGET_H so
 * heights stay tight and nothing is crammed.
 */
export function composeRows(items: Item[]): Row[] {
  const rows: Row[] = [];
  const seenRows = new Set<number>();
  let segment: Item[] = [];
  let curated: Item[] = [];

  const toRow = (run: Item[]): Row => ({ cells: run.map((it) => ({ img: it.img, ar: it.ar, grow: it.ar })) });
  const flushSegment = () => {
    if (segment.length) rows.push(...justify(segment));
    segment = [];
  };
  const flushCurated = () => {
    if (curated.length) rows.push(toRow(curated));
    curated = [];
  };

  for (const it of items) {
    const row = it.img.row;
    if (row !== undefined) {
      flushSegment();
      if (curated.length && curated[0].img.row !== row) flushCurated();
      if (!curated.length) {
        // A row number met again after another row has hung means its prints
        // are not next to each other in `order`; say so rather than split it.
        if (seenRows.has(row)) throw new Error(`Gallery: row ${row} is split by other prints ("${it.img.title}").`);
        seenRows.add(row);
      }
      curated.push(it);
    } else if (it.img.hero) {
      flushCurated();
      flushSegment();
      rows.push(toRow([it]));
    } else {
      flushCurated();
      segment.push(it);
    }
  }
  flushCurated();
  flushSegment();

  return rows;
}

/**
 * Optimal justified break-up of one run of images.
 *
 * dp[j] = least total cost to lay out items[0..j); the last row of that optimum
 * starts at back[j]. Cost of a row is the squared gap between its full-width
 * render height and TARGET_H — so a too-tall lone portrait or a too-short
 * three-wide row are both heavily penalised and avoided whenever the order
 * allows. Rows are capped at MAX_PER_ROW.
 */
function justify(items: Item[]): Row[] {
  const n = items.length;

  // Prefix sums of aspect ratios for O(1) row-width math.
  const prefix = [0];
  for (let k = 0; k < n; k++) prefix.push(prefix[k] + items[k].ar);
  const sumAr = (a: number, b: number) => prefix[b] - prefix[a];

  const cost = (a: number, b: number): number => {
    if (b - a > MAX_PER_ROW) return Infinity;
    const d = rowHeight(sumAr(a, b), b - a) - TARGET_H;
    return d * d;
  };

  const dp = new Array<number>(n + 1).fill(Infinity);
  const back = new Array<number>(n + 1).fill(0);
  dp[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let a = Math.max(0, j - MAX_PER_ROW); a < j; a++) {
      const c = dp[a] + cost(a, j);
      if (c < dp[j]) {
        dp[j] = c;
        back[j] = a;
      }
    }
  }

  // Walk the back-pointers to recover row boundaries.
  const cuts: number[] = [];
  for (let j = n; j > 0; j = back[j]) cuts.push(j);
  cuts.push(0);
  cuts.reverse();

  const rows: Row[] = [];
  for (let r = 0; r < cuts.length - 1; r++) {
    const a = cuts[r];
    const b = cuts[r + 1];
    const cells: Cell[] = items.slice(a, b).map((it) => ({ img: it.img, ar: it.ar, grow: it.ar }));
    rows.push({ cells });
  }
  return rows;
}

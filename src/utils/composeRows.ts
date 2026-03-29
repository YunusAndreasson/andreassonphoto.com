export interface GalleryImage {
  file: string;
  title: string;
  city: string;
  country: string;
  tone: string;
  aspect: string;
  width: number;
  height: number;
  order: number;
}

export interface Cell {
  span: number;
  img: GalleryImage;
}

export type Row = Cell[];

type Pattern = (items: GalleryImage[]) => { row: Row; used: number } | null;

const patterns: Pattern[] = [
  // Pair: equal spans for same aspect, wider for landscape/narrower for portrait when mixed
  (items) => {
    if (items.length < 2) return null;
    const [a, b] = items;
    if (a.aspect === b.aspect) {
      return { row: [{ span: 6, img: a }, { span: 6, img: b }], used: 2 };
    }
    return a.aspect === 'portrait'
      ? { row: [{ span: 5, img: a }, { span: 7, img: b }], used: 2 }
      : { row: [{ span: 7, img: a }, { span: 5, img: b }], used: 2 };
  },
  // Pair reversed
  (items) => {
    if (items.length < 2) return null;
    const [a, b] = items;
    if (a.aspect === b.aspect) {
      return { row: [{ span: 6, img: a }, { span: 6, img: b }], used: 2 };
    }
    return b.aspect === 'portrait'
      ? { row: [{ span: 7, img: a }, { span: 5, img: b }], used: 2 }
      : { row: [{ span: 5, img: a }, { span: 7, img: b }], used: 2 };
  },
  // Anchor: full width for landscape/square, pair fallback for portrait
  (items) => {
    if (items[0].aspect !== 'portrait') {
      return { row: [{ span: 12, img: items[0] }], used: 1 };
    }
    if (items.length >= 2) {
      return items[0].aspect === items[1].aspect
        ? { row: [{ span: 6, img: items[0] }, { span: 6, img: items[1] }], used: 2 }
        : { row: [{ span: 5, img: items[0] }, { span: 7, img: items[1] }], used: 2 };
    }
    return { row: [{ span: 12, img: items[0] }], used: 1 };
  },
  // Triple
  (items) => {
    if (items.length < 3) return null;
    return {
      row: [
        { span: 4, img: items[0] },
        { span: 4, img: items[1] },
        { span: 4, img: items[2] },
      ],
      used: 3,
    };
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

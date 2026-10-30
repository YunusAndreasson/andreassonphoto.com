// The wall's geometry for build-time estimates (row breaks, `sizes` hints).
// The browser lays the pages out from the CSS tokens in global.css (:root
// --wall-max, --gap, and the 768px breakpoint); these mirror them, so change
// both together.

export const WALL_MAX = 1200; // --wall-max at rest: every page's box, padding included
export const GAP = 40; // a representative --gap (clamp(20px, 3vw, 56px))
export const CONTENT_W = WALL_MAX - 2 * GAP; // the wall inside its padding
export const PHONE_MAX = 768; // the breakpoint where walls become one column

const PHONE_GUTTERS = 2 * 20; // --gap on a phone, both sides
const WIDEST_CONTENT_W = 1600 - 2 * 56; // --wall-max at its largest, inside its padding

// How much bigger a print renders on the widest wall than on the resting one.
export const WIDEST_SCALE = WIDEST_CONTENT_W / CONTENT_W;

// The `sizes` value for something `px` wide on the resting wall, following the
// wall through each of its states: a full column on a phone, a share of the
// window (with its 3vw gaps) on a small screen, its fixed width on a laptop,
// and a share of the growing wall (72vw, less its padding) on a large screen.
export function wallSizes(px: number): string {
  const share = px / CONTENT_W;
  const vw = (n: number) => `${+(share * n).toFixed(1)}vw`;
  const large = `max(${px}px, ${vw(66)})`;
  return `(width <= ${PHONE_MAX}px) calc(100vw - ${PHONE_GUTTERS}px), min(${large}, ${vw(94)}, ${Math.round(px * WIDEST_SCALE)}px)`;
}

// The wall's geometry for build-time estimates (row breaks, `sizes` hints).
// The browser lays the pages out from the CSS tokens in global.css (:root
// --wall-max, --gap, and the 768px breakpoint); these mirror them, so change
// both together.

export const WALL_MAX = 1200; // --wall-max: every page's box, padding included
export const GAP = 40; // a representative --gap (clamp(20px, 3vw, 56px))
export const CONTENT_W = WALL_MAX - 2 * GAP; // the wall inside its padding
export const PHONE_MAX = 768; // the breakpoint where walls become one column

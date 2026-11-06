// Prune orphaned original images from the build output.
//
// Now a safety net: as of Astro 7 a static build emits no unreferenced
// originals (this reports 0). It was added when importing each gallery image
// (then via import.meta.glob, now the collection's image() schema) made Astro
// emit each ORIGINAL source file into dist/_astro
// (because ImageMetadata.src must point to a real, hashed asset) — even though
// the gallery only ever renders the generated `_<transform>.avif` variants.
// The result is ~21 MB of unreferenced JPEGs per build that bloat every deploy
// (and make the upload far more likely to fail on a flaky network).
//
// This removes any raster image in dist/_astro whose filename appears nowhere
// in the build's textual output (HTML/CSS/JS/XML/_headers/…). Referenced files
// (the AVIF variants, the OG image under dist/og, etc.) are never touched.
import { existsSync, readdirSync, readFileSync, statSync, rmSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const DIST = 'dist';
const ASTRO_DIR = join(DIST, '_astro');

// Original source formats that are safe to drop when unreferenced. AVIF (the
// rendered variants), CSS and JS are intentionally excluded.
const PRUNABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
// Output file types whose contents we scan for asset references.
const TEXT_EXT = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.json', '.txt', '']);

if (!existsSync(ASTRO_DIR)) {
  console.log('prune-orphan-images: no dist/_astro — nothing to do');
  process.exit(0);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    out.push(...(statSync(p).isDirectory() ? walk(p) : [p]));
  }
  return out;
}

// Most builds have no originals. Avoid reading every page in that case.
const candidates = walk(ASTRO_DIR).filter((f) => PRUNABLE.has(extname(f).toLowerCase()));
const files = candidates.length ? walk(DIST) : [];

// One haystack of all textual output; membership test is by exact filename.
let haystack = '';
for (const f of files) {
  if (TEXT_EXT.has(extname(f).toLowerCase())) {
    try { haystack += readFileSync(f, 'utf8') + '\n'; } catch { /* skip unreadable */ }
  }
}

let removed = 0;
let bytes = 0;
for (const f of candidates) {
  if (haystack.includes(basename(f))) continue; // referenced somewhere — keep
  bytes += statSync(f).size;
  rmSync(f);
  removed++;
}

console.log(
  `prune-orphan-images: removed ${removed} unreferenced original(s), freed ${(bytes / 1048576).toFixed(1)} MB`,
);

// Stand-ins for the photographs, which aren't in git: photos/ is ignored, and
// src/assets/gallery_bw links into it, so a fresh clone (or CI) stops the
// build at the first missing print. This fills each missing print with its own
// link preview (public/og/prints/<slug>.jpg, 1200×800), so the wall builds and
// runs with every print in its place, though landscape and small.
//
//   node scripts/stand-in-prints.mjs
//
// A file that is already there is never touched, so it is safe to run where
// the real prints are: it then does nothing.
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, readlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const images = JSON.parse(readFileSync('src/content/gallery/images.json', 'utf8'));
mkdirSync(resolve('src/assets', readlinkSync('src/assets/gallery_bw')), { recursive: true });

// printSlug in src/utils/gallery.ts: 65_whooper_swan → whooper-swan.
const slug = (id) => id.replace(/^\d+_/, '').replaceAll('_', '-');

let made = 0;
for (const { id, file } of images) {
  const target = resolve('src/content/gallery', file);
  if (existsSync(target)) continue;
  copyFileSync(`public/og/prints/${slug(id)}.jpg`, target, constants.COPYFILE_EXCL);
  made++;
}
console.log(`stand-in-prints: ${made} stand-ins made, ${images.length - made} prints already in place`);

// The home-screen icons, drawn from the favicon's two tones (public/favicon.svg):
// the --ink dot on the wall, full bleed, since phones cut their own shape. Rerun
// it if the wall colour changes: node scripts/make-icons.mjs
import sharp from 'sharp';

const WALL = '#4f4d49';
const INK = '#d3d0c8';

for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
    <rect width="32" height="32" fill="${WALL}"/>
    <circle cx="16" cy="16" r="6" fill="${INK}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ palette: true }).toFile(`public/${file}`);
}

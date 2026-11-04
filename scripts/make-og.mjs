// The link previews: what a chat or a feed shows when a page is shared. Each
// card is the page itself in small, set on the wall in the site's own faces.
//
//   public/og/poems/<id>.jpg    each poem, typeset (also /poems: Swifts)
//   public/og/prints/<slug>.jpg each photograph, hung on the wall with its label
//                               (no menu word: the wall is the home page)
//   public/og/birds.jpg         the one bird that stayed for the camera
//   public/og/code.jpg          a site hung as a print
//
// The home page keeps its photograph (public/og/the-lone-tree.jpg).
//
//   node scripts/make-og.mjs            # every card
//   node scripts/make-og.mjs swifts     # only cards whose name contains this
//
// Headless Chrome draws each card from HTML (fonts and pictures straight from
// src/assets), and sharp turns the screenshot into the JPEG served from
// public/og/. Set CHROME to use another binary. Rerun it when a poem or a
// print is added or changed, or the wall, the faces or the bird count change.
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const CHROME = process.env.CHROME ?? 'google-chrome-stable';
const W = 1200;
const H = 800;
const only = process.argv[2];
const asset = (path) => pathToFileURL(resolve(path)).href;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const species = JSON.parse(await readFile('src/content/birds/species.json', 'utf8'));
const prints = JSON.parse(await readFile('src/content/gallery/images.json', 'utf8'));

// pieces.yaml keeps to one plain shape (see src/content.config.ts): `- id:`
// opens a piece, two-space keys follow, and `text: |-` is a block indented
// four spaces (a one-line piece may give its text inline). Read just that, rather than lean on a parser this package
// doesn't declare.
function readPieces(src) {
  const pieces = [];
  let piece;
  let inText = false;
  for (const line of src.split('\n')) {
    const open = line.match(/^- id: (.+)$/);
    if (open) {
      piece = { id: open[1].trim(), text: [] };
      pieces.push(piece);
      inText = false;
      continue;
    }
    if (inText && (line.startsWith('    ') || line.trim() === '')) {
      piece.text.push(line.slice(4));
      continue;
    }
    const key = line.match(/^ {2}(\w+): ?(.*)$/);
    if (key) {
      const value = key[2].trim().replace(/^(['"])(.*)\1$/, '$2');
      inText = key[1] === 'text' && /^\|-?$/.test(value);
      if (key[1] === 'text' && !inText) piece.text = [value];
      else if (!inText) piece[key[1]] = value;
    }
  }
  for (const p of pieces) p.text = p.text.join('\n').trim();
  return pieces;
}

const pieces = readPieces(await readFile('src/content/poems/pieces.yaml', 'utf8'));
const month = (date) =>
  new Date(`${date}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });

// The site's tokens (src/styles/global.css :root), at a card's scale.
const page = (here, body, script = '') => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: Cormorant; font-weight: 300; src: url(${asset('src/assets/fonts/cormorant-garamond-light.woff2')}); }
  @font-face { font-family: Cormorant; font-weight: 500; src: url(${asset('src/assets/fonts/cormorant-garamond-medium.woff2')}); }
  @font-face { font-family: Garamond; font-style: normal; src: url(${asset('src/assets/fonts/eb-garamond-regular.woff2')}); }
  @font-face { font-family: Garamond; font-style: italic; src: url(${asset('src/assets/fonts/eb-garamond-italic.woff2')}); }
  * { margin: 0; box-sizing: border-box; }
  html { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    width: ${W}px; height: ${H}px; padding: 64px 88px 72px;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #57554f 0%, #4f4d49 ${H * 0.45}px);
    color: #f1eee7; font-family: Garamond, serif;
    font-kerning: normal; font-variant-ligatures: common-ligatures contextual;
    font-variant-numeric: lining-nums; text-wrap: balance;
  }
  header { display: flex; justify-content: space-between; align-items: baseline; flex: none; }
  .name, .here {
    font-family: Cormorant, serif; font-weight: 500; text-transform: uppercase; color: #f4f2ec;
  }
  .name { font-size: 22px; letter-spacing: 0.22em; }
  .here {
    font-size: 19px; letter-spacing: 0.15em;
    text-decoration: underline 1px color-mix(in oklab, #f4f2ec 55%, transparent); text-underline-offset: 7px;
  }
  main { flex: 1; min-height: 0; display: flex; align-items: center; gap: 88px; padding-top: 28px; }
  .text { flex: 1; }
  .lead { font-style: italic; font-size: 40px; line-height: 1.45; }
  .title { font-family: Cormorant, serif; font-weight: 500; font-size: 62px; line-height: 1; }
  .date, .caption, .label {
    font-family: Cormorant, serif; font-weight: 500; font-size: 17px;
    letter-spacing: 0.15em; text-transform: uppercase; color: #d3d0c8;
  }
  .date { margin: 18px 0 36px; }
  .verse { font-size: 44px; line-height: 1.5; }
  .verse p + p { margin-top: 0.6em; }
  .verse .line { display: block; padding-left: 1.2em; text-indent: -1.2em; }
  .verse [dir='rtl'] { font-family: 'Noto Naskh Arabic', 'Amiri', serif; width: fit-content; }
  .verse.is-prose p { line-height: 1.55; text-wrap: pretty; }
  .figure { font-family: Cormorant, serif; font-weight: 300; font-size: 92px; line-height: 1; margin-top: 56px; }
  .caption { margin-top: 14px; }
  .print { flex: none; box-shadow: 0 22px 56px -14px rgb(0 0 0 / 0.6), 0 3px 12px -6px rgb(0 0 0 / 0.4); }
  .print img { display: block; height: 100%; width: 100%; object-fit: cover; }
  .hung { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
  .label { font-size: 19px; color: #f1eee7; }
  .where {
    margin-left: 0.85em; font-family: Garamond, serif; font-style: italic; font-weight: 400;
    font-size: 21px; letter-spacing: normal; text-transform: none; color: #d3d0c8;
  }
</style>
<body>
<header>
  <span class="name">Andrèasson Photo</span>
  ${here ? `<span class="here">${here}</span>` : ''}
</header>
${body}
${script}
</body>`;

// A poem's card: the whole poem where it fits. A long one steps down in size,
// to a floor still easy to read in a chat; past that, it ends at the last line
// that fits, with an ellipsis, rather than at a broken line.
function poemCard(piece) {
  const prose = piece.form === 'prose';
  const stanzas = piece.text.split(/\n{2,}/).map((stanza) => {
    const arabic = /[؀-ۿ]/.test(stanza);
    const lines = stanza.split('\n').map(esc);
    const dir = arabic ? ' dir="rtl" lang="ar"' : '';
    return prose ? `<p${dir}>${lines.join(' ')}</p>` : `<p${dir}>${lines.map((l) => `<span class="line">${l}</span>`).join('')}</p>`;
  });
  const fit = `<script>
    const main = document.querySelector('main');
    const text = document.querySelector('.text');
    const verse = document.querySelector('.verse');
    const over = () => text.offsetHeight > main.clientHeight;
    let size = 44;
    while (over() && size > 30) verse.style.fontSize = (size -= 2) + 'px';
    if (over()) {
      const units = () => [...verse.querySelectorAll(${prose ? "'p'" : "'.line'"})];
      while (over() && units().length > 1) {
        const last = units().at(-1);
        const stanza = last.closest('p');
        last.remove();
        if (stanza && !stanza.textContent.trim()) stanza.remove();
      }
      const end = units().at(-1);
      end.textContent = end.textContent.replace(/[\\s,;:.—–-]+$/, '') + '…';
    }
  </script>`;
  return page(
    'Poems',
    `<main><div class="text">
      <p class="title">${esc(piece.title)}</p>
      <p class="date">${month(piece.date)} ${piece.date.slice(0, 4)}</p>
      <div class="verse${prose ? ' is-prose' : ''}">${stanzas.join('')}</div>
    </div></main>`,
    fit,
  );
}

// The label's second line, as src/utils/gallery.ts printPlace says it.
const where = ({ place, year }) => [place, year].filter(Boolean).join(', ');

// A photograph's card: the print hung on the wall at its own shape, never
// cropped, with its title beneath as the viewer captions it: where and when
// beside it in italic, if known.
async function printCard(print) {
  const file = resolve('src/content/gallery', print.file);
  const { width, height } = await sharp(file).metadata();
  const ar = width / height;
  const [w, h] = ar * 540 <= 1000 ? [ar * 540, 540] : [1000, 1000 / ar];
  return page(
    '',
    `<main><div class="hung">
      <div class="print" style="width: ${w.toFixed(1)}px; height: ${h.toFixed(1)}px">
        <img src="${pathToFileURL(file).href}" alt="">
      </div>
      <p class="label">${esc(print.title)}${where(print) ? `<span class="where">${esc(where(print))}</span>` : ''}</p>
    </div></main>`,
  );
}

const swifts = pieces.find((p) => p.id === 'swifts');
const cards = [
  ['poems', poemCard(swifts)],
  ...pieces.map((piece) => [`poems/${piece.id}`, poemCard(piece)]),
  ...(await Promise.all(prints.map(async (print) => {
    const slug = print.id.replace(/^\d+_/, '').replaceAll('_', '-');
    return [`prints/${slug}`, await printCard(print)];
  }))),
  ['birds', page('Birds', `
    <main>
      <div class="text">
        <p class="lead">Every bird I have seen in Sweden.</p>
        <p class="figure">${species.length}</p>
        <p class="caption">Seen in Sweden</p>
      </div>
      <div class="print" style="height: 560px; aspect-ratio: 1000 / 1250">
        <img src="${asset('src/assets/gallery_bw/65_whooper_swan.jpg')}" alt="">
      </div>
    </main>`)],
  ['code', page('Code', `
    <main>
      <div class="text">
        <p class="lead">I also write code,<br>mostly for the web.</p>
      </div>
      <div class="print" style="width: 620px; aspect-ratio: 1440 / 900">
        <img src="${asset('src/assets/code/zuhd-news.jpg')}" alt="" style="filter: grayscale(1)">
      </div>
    </main>`)],
].filter(([name]) => !only || name.includes(only));

const dir = await mkdtemp(join(tmpdir(), 'make-og-'));
await mkdir('public/og/poems', { recursive: true });
await mkdir('public/og/prints', { recursive: true });

async function draw([name, html], worker) {
  const base = join(dir, name.replaceAll('/', '--'));
  await writeFile(`${base}.html`, html);
  await run(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', `--user-data-dir=${join(dir, `profile-${worker}`)}`,
    `--window-size=${W},${H}`, '--virtual-time-budget=4000',
    `--screenshot=${base}.png`, pathToFileURL(`${base}.html`).href,
  ]);
  await sharp(`${base}.png`).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/og/${name}.jpg`);
}

try {
  // A few Chromes at once, each with its own profile.
  const queue = [...cards];
  await Promise.all(Array.from({ length: 6 }, async (_, worker) => {
    for (let card; (card = queue.shift()); ) await draw(card, worker);
  }));
  console.log(`${cards.length} cards in public/og/`);
} finally {
  await rm(dir, { recursive: true, force: true });
}

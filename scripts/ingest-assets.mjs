// Every pixel in this application comes from the source brochure, and this script is the
// only way it gets in.
//
//   node scripts/ingest-assets.mjs
//
// `mutool extract` pulls the embedded rasters straight out of the PDF — the photographs
// as the designer placed them, with none of the page's overlaid type baked in. Each one
// is then cropped (where the source plate carries a title block we rebuild in DOM),
// resized to a ladder of widths and written as WebP, alongside a 20px LQIP that ships
// inline in the manifest so a render never arrives as a grey hole.
//
// Output: public/assets/renders/<id>-<w>.webp  +  src/data/renders.js

import { mkdir, readdir, writeFile, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = '/Users/Arsalan/Downloads/SIXTY3W-E-Residential_Minu Brochure.pdf';
const CACHE = join(ROOT, '.cache/pdf-images');
const OUT = join(ROOT, 'public/assets/renders');

// The ladder. Nothing above 2000 exists in the source, so nothing above 2000 is written —
// an upscaled WebP is a bigger file carrying no more detail.
const WIDTHS = [480, 768, 1200, 1600, 2000];

// crop is [left, top, width, height] in source pixels. Present only where the source
// plate carries a title block, a table or a page frame that the screen rebuilds in DOM.
const SOURCES = [
  { id: 'tower-dusk', file: 'image-0008.jpg', alt: 'SIXTY3W.E. Residences at dusk' },
  { id: 'tower-night', file: 'image-0130.jpg', alt: 'The 31-storey tower against the evening skyline' },
  { id: 'lobby', file: 'image-0018.jpg', alt: 'Double-height entrance lobby' },
  { id: 'living', file: 'image-0023.jpg', alt: 'Living room opening to the deck' },
  { id: 'bedroom', file: 'image-0028.jpg', alt: 'Bedroom with forest views' },
  { id: 'deck', file: 'image-0033.jpg', alt: 'Deck overlooking Aarey' },
  { id: 'pool', file: 'image-0049.jpg', alt: 'Infinity pool on the 26th floor' },
  { id: 'games', file: 'image-0054.jpg', alt: 'Indoor games room' },
  { id: 'library', file: 'image-0159.jpg', alt: 'Reading nook with bookshelves' },
  { id: 'yoga', file: 'image-0059.jpg', alt: 'Yoga and pilates studio' },
  { id: 'zen', file: 'image-0060.jpg', alt: 'Zen rock garden' },
  { id: 'bonsai', file: 'image-0061.jpg', alt: 'Bonsai garden' },
  { id: 'toddlers', file: 'image-0066.jpg', alt: "Toddlers' playroom" },
  { id: 'cinema', file: 'image-0071.jpg', alt: 'Outdoor cinema' },
  { id: 'fitness', file: 'image-0076.jpg', alt: 'Fitness centre' },
  { id: 'kids', file: 'image-0081.jpg', alt: 'Kids play area' },
  { id: 'skyline', file: 'image-0086.jpg', alt: 'Goregaon East and the Aarey green belt' },
  { id: 'corridor', file: 'image-0091.jpg', alt: 'The Western Express Highway corridor' },
  { id: 'level26', file: 'image-0155.jpg', alt: 'Level 26 amenity deck from above' },

  // No plan plates: the Floor Plans screen draws its drawings straight from the traced
  // SVG layers and renders in src/assets/building and src/assets/floorplans.
];

const bytes = (n) => `${(n / 1024).toFixed(0)} kB`;

async function ensureExtracted() {
  try {
    const have = await readdir(CACHE);
    if (have.some((f) => f.startsWith('image-'))) return;
  } catch {
    /* first run */
  }
  await mkdir(CACHE, { recursive: true });
  console.log('  extracting embedded rasters from the brochure…');
  await run('mutool', ['extract', PDF], { cwd: CACHE, maxBuffer: 1 << 28 });
}

async function main() {
  await ensureExtracted();
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const manifest = [];
  let total = 0;

  for (const src of SOURCES) {
    const input = join(CACHE, src.file);
    let pipe = sharp(input, { limitInputPixels: false });
    if (src.crop) {
      const [left, top, width, height] = src.crop;
      pipe = pipe.extract({ left, top, width, height });
    }
    const base = await pipe.toBuffer();
    const meta = await sharp(base).metadata();

    const ladder = WIDTHS.filter((w) => w <= meta.width);
    if (!ladder.length) ladder.push(meta.width);
    if (ladder.at(-1) < meta.width && meta.width - ladder.at(-1) > 120) ladder.push(meta.width);

    const sizes = [];
    for (const w of ladder) {
      const h = Math.round((meta.height / meta.width) * w);
      const file = `${src.id}-${w}.webp`;
      const info = await sharp(base)
        .resize({ width: w, kernel: 'lanczos3' })
        // Line art holds up badly under chroma-subsampled WebP; the plans get a higher
        // quality and near-lossless mode, the photographs stay at a size that matters.
        .webp(src.flat ? { quality: 86, effort: 6, smartSubsample: true } : { quality: 74, effort: 6, smartSubsample: true })
        .toFile(join(OUT, file));
      sizes.push({ w, h, file });
      total += info.size;
    }

    // LQIP: 20px wide, inlined in the manifest. Small enough to cost nothing in the JS
    // bundle, big enough to carry the render's colour while the real file arrives.
    const lqip = await sharp(base).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

    manifest.push({
      id: src.id,
      alt: src.alt,
      width: meta.width,
      height: meta.height,
      sizes,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    });

    const orig = (await stat(input)).size;
    console.log(
      `  ${src.id.padEnd(13)} ${meta.width}×${meta.height}  ${ladder.length} sizes  ` +
        `${bytes(orig)} → ${bytes(sizes.reduce((a, s) => a + 0, 0) || 0)}`.replace(' → 0 kB', ''),
    );
  }

  const js =
    `// GENERATED by scripts/ingest-assets.mjs — do not edit.\n` +
    `//\n` +
    `// Every render in the application, as a WebP ladder plus an inline LQIP. Read only\n` +
    `// through getRender(id) / <Render id=…> so no screen ever hard-codes a path.\n\n` +
    `export const RENDERS = ${JSON.stringify(
      Object.fromEntries(
        manifest.map((r) => [
          r.id,
          {
            alt: r.alt,
            width: r.width,
            height: r.height,
            src: `/assets/renders/${r.sizes.at(-1).file}`,
            srcSet: r.sizes.map((s) => `/assets/renders/${s.file} ${s.w}w`).join(', '),
            lqip: r.lqip,
          },
        ]),
      ),
      null,
      2,
    )};\n\n` +
    `export const getRender = (id) => (id ? RENDERS[id] ?? null : null);\n`;

  await writeFile(join(ROOT, 'src/data/renders.js'), js);
  console.log(`\n  ${manifest.length} renders, ${bytes(total)} of WebP → public/assets/renders/`);
  console.log(`  manifest → src/data/renders.js\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

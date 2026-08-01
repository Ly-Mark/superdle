// scripts/generateCardThumbs.mjs
// One-off (re-runnable) generator for small card thumbnails.
//
// The source art in public/games/clashroyale/cards/ is 285x420 to 460x567 and
// averages 245 KB — 28.9 MB across all 121. That is right for the game, where a
// handful show at a time, and completely wrong for the card guide, which lists
// every card on one page. Rendering a 245 KB file into a 56px box downloads
// roughly a hundred times more data than the pixels need.
//
// Writes 128px-wide webp into cards/thumb/. 128 rather than 56 so the images
// stay sharp on high-DPI screens at 2x.
//
// Run with: npm run thumbs
// Output is committed, so a normal build and CI never need sharp.
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../public/games/clashroyale/cards');
const OUT = path.join(SRC, 'thumb');

// Every thumbnail comes out at exactly this size. The source art is not
// consistent — widths run 285 to 460, aspect ratios differ, and some cards
// have a decorative border baked into the image while others do not. Left
// alone they render at different heights and with visible frames on only
// some tiles, which looks like a mistake rather than a style.
const SIZE = 160; // square, 2x the ~72px display size

// Fraction trimmed from each edge before the square crop, to cut past the
// baked-in borders. 0.12 removes the frame on the cards that have one without
// biting into the artwork on the ones that don't.
const INSET = 0.12;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const sources = readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (!sources.length) {
    console.error('generateCardThumbs: no source images found in', SRC);
    process.exit(1);
}

let srcBytes = 0;
let outBytes = 0;

for (const file of sources) {
    const from = path.join(SRC, file);
    const to = path.join(OUT, file.replace(/\.(png|jpe?g)$/i, '.webp'));

    srcBytes += statSync(from).size;

    const image = sharp(from);
    const { width, height } = await image.metadata();

    // Trim past the border, then take a square from the upper-middle. Cards are
    // portrait and the character sits above centre, so a straight centre crop
    // cuts heads off. `position: 'top'` after the inset lands on the subject.
    const dx = Math.round(width * INSET);
    const dy = Math.round(height * INSET);

    await image
        .extract({
            left: dx,
            top: dy,
            width: width - dx * 2,
            height: height - dy * 2,
        })
        .resize(SIZE, SIZE, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(to);

    outBytes += statSync(to).size;
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
    `Thumbnails: ${sources.length} images, ${mb(srcBytes)} MB -> ${mb(outBytes)} MB ` +
    `(${Math.round((1 - outBytes / srcBytes) * 100)}% smaller)`
);

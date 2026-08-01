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

// Width only — aspect ratio is preserved and NO cropping happens here.
//
// Framing is deliberately left to CSS, exactly as ClassicGame's CardPortrait
// already does it: a square box with object-cover, plus scale(1.4) from centre
// to zoom past the border baked into some of the source art. That treatment is
// proven in the game, and doing it in CSS means one number tunes every card at
// once. An earlier attempt cropped in this script instead and misframed a lot
// of cards, because the right crop is not the same for all of them.
const WIDTH = 160;

// A few source images are mostly empty canvas. Furnace is 850x850 with the
// artwork occupying 515x623 — 44% of the frame, against a median of 80% across
// the deck. Left alone it renders visibly smaller than every other card,
// because object-cover has nothing to crop on a square source and the zoom
// alone can't make up the difference.
//
// Any image below this ratio gets its transparent padding trimmed first, which
// brings it back in line with the rest. Deliberately a threshold rather than a
// list of card names: it also catches whatever gets added next. Trimming
// everything was rejected — it would re-frame the 120 cards that already look
// right.
const TRIM_BELOW = 0.6;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const sources = readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (!sources.length) {
    console.error('generateCardThumbs: no source images found in', SRC);
    process.exit(1);
}

let srcBytes = 0;
let outBytes = 0;
const trimmed = [];

for (const file of sources) {
    const from = path.join(SRC, file);
    const to = path.join(OUT, file.replace(/\.(png|jpe?g)$/i, '.webp'));

    srcBytes += statSync(from).size;

    const meta = await sharp(from).metadata();
    let input = from;

    // Measure how much of the canvas is actually artwork, and tighten the
    // outliers. Wrapped in try/catch because trim() throws on a fully uniform
    // image, which should not take the whole run down.
    try {
        const { info } = await sharp(from)
            .trim({ threshold: 1 })
            .toBuffer({ resolveWithObject: true });
        const filled = (info.width * info.height) / (meta.width * meta.height);
        if (filled < TRIM_BELOW) {
            input = await sharp(from).trim({ threshold: 1 }).toBuffer();
            trimmed.push(`${file} (${Math.round(filled * 100)}% filled)`);
        }
    } catch {
        // leave it alone
    }

    await sharp(input)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(to);

    outBytes += statSync(to).size;
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(
    `Thumbnails: ${sources.length} images, ${mb(srcBytes)} MB -> ${mb(outBytes)} MB ` +
    `(${Math.round((1 - outBytes / srcBytes) * 100)}% smaller)`
);
if (trimmed.length) {
    console.log(`Padding trimmed on ${trimmed.length}: ${trimmed.join(', ')}`);
}

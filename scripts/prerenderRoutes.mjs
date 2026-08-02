// scripts/prerenderRoutes.mjs
// The single list of routes that get prerendered. Also drives sitemap.xml.
//
// IMPORTANT: there is no SPA catch-all any more (see public/_redirects). A
// route in App.jsx that is missing here will 404 on direct navigation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { slug } from '../src/utils/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const STATIC_ROUTES = [
    '/',
    '/clashroyale/description',
    '/clashroyale/rush',
    '/clashroyale/memory',
    '/cards',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
];

// A card gets a page once it has written material — a hand-written spotlight,
// or research in balance-history.md. Both sources are read here so a page and
// its route can never disagree: fill in the markdown, the route appears.
//
// Deliberately NOT every card. cards.json has roughly 45 words of unique text
// per card, so 121 generated pages would be near-identical boilerplate, which
// is the thin-content pattern this whole effort exists to remove. An earlier
// version of this file had an INCLUDE_CARD_ROUTES flag that would have done
// exactly that; it is gone so nobody flips it by accident.
const read = (p) => readFileSync(path.resolve(__dirname, p), 'utf8');

function spotlightCards() {
    const src = read('../src/content/cardSpotlights.jsx');
    // Top-level keys of CARD_SPOTLIGHTS, e.g.   'Goblin Barrel': {
    return [...src.matchAll(/^\s{4}'([^']+)':\s*\{/gm)].map((m) => m[1]);
}

// Mirrors normalizeCardName in src/utils/clashroyale/cardSearch.js. Duplicated
// rather than imported because that module is written for the browser bundle;
// four lines is cheaper than making it Node-safe. If one changes, change both.
const normalizeName = (s) =>
    String(s).toLowerCase().trim()
        .replace(/^(the|a|an)\s+/, '')
        .replace(/[^a-z0-9 ]/g, '');

// Mirrors the parser in src/utils/clashroyale/cardContent.js. Kept deliberately
// simple — it only needs to answer "does this card have any bullets", not build
// the full structure.
function researchedCards() {
    const md = read('../src/content/balance-history.md');
    const SUBS = new Set(['balance history', 'counters', 'synergies', 'strategy notes']);
    const found = new Set();
    let card = null;
    let inSub = false;
    let inComment = false;

    for (const line of md.split(/\r?\n/)) {
        const t = line.trim();
        if (t.includes('<!--')) inComment = true;
        if (inComment) {
            if (t.includes('-->')) inComment = false;
            continue;
        }
        const h = t.match(/^#{1,6}\s+(.+?)\s*$/);
        if (h) {
            if (SUBS.has(h[1].toLowerCase())) inSub = true;
            else { card = h[1]; inSub = false; }
            continue;
        }
        if (card && inSub && /^-\s+\S/.test(t)) found.add(card);
    }
    return [...found];
}

export function getPrerenderRoutes() {
    const cards = JSON.parse(read('../src/data/cards.json')).map((c) => c.card);
    const known = new Set(cards);

    // Resolve names through the same normalisation the page parser uses, so a
    // heading written "P.E.K.K.A." still produces a route for "PEKKA". Without
    // this the card would have content but no page.
    const canonical = new Map(cards.map((n) => [normalizeName(n), n]));
    const resolve = (n) => (known.has(n) ? n : canonical.get(normalizeName(n)));

    const wanted = new Set(
        [...spotlightCards(), ...researchedCards()].map(resolve).filter(Boolean)
    );

    // Ordered by the dataset rather than by discovery, so the route list and
    // therefore the sitemap are stable between builds.
    const cardRoutes = cards.filter((n) => wanted.has(n)).map((n) => `/cards/${slug(n)}`);
    return [...STATIC_ROUTES, ...cardRoutes];
}

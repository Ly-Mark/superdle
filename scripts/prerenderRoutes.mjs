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

// Only cards with hand-written copy get a page. Read from the same file that
// holds the copy, so adding a spotlight adds its route automatically and the
// two can never disagree.
//
// Deliberately NOT every card: cards.json has roughly 45 words of unique text
// per card, so 121 generated pages would be near-identical boilerplate — the
// thin-content pattern this whole effort exists to remove. An earlier version
// of this file had an INCLUDE_CARD_ROUTES flag that would have done exactly
// that; it has been removed so nobody flips it by accident.
function getSpotlightRoutes() {
    const src = readFileSync(
        path.resolve(__dirname, '../src/content/cardSpotlights.jsx'),
        'utf8'
    );
    // Top-level keys of CARD_SPOTLIGHTS, e.g.   'Goblin Barrel': {
    const names = [...src.matchAll(/^\s{4}'([^']+)':\s*\{/gm)].map((m) => m[1]);
    return names.map((name) => `/cards/${slug(name)}`);
}

export function getPrerenderRoutes() {
    return [...STATIC_ROUTES, ...getSpotlightRoutes()];
}

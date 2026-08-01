// scripts/prerenderRoutes.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { slug } from '../src/utils/slug.js';

// ⬇ Flip to true in Commit 2, once CardsIndex/CardDetail pages exist.
const INCLUDE_CARD_ROUTES = false;

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

function getCardRoutes() {
    const cards = JSON.parse(
        readFileSync(path.resolve(__dirname, '../src/data/cards.json'), 'utf8')
    );
    return ['/cards', ...cards.map((c) => `/cards/${slug(c.card)}`)];
}

export function getPrerenderRoutes() {
    return INCLUDE_CARD_ROUTES
        ? [...STATIC_ROUTES, ...getCardRoutes()]
        : STATIC_ROUTES;
}
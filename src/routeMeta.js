// src/routeMeta.js
// Single source of truth for per-route document metadata. Consumed only by
// src/prerender.jsx at build time, which is what puts these tags into the
// initial HTML where a crawler with JS disabled can actually see them.
//
// Deliberately imports NOTHING. scripts/generateSitemap.mjs pulls this in from
// plain Node, where a JSON import needs `with { type: 'json' }` that Vite does
// not want — so card data is passed in by the caller instead of imported here.
export const SITE_NAME = 'Clashdle';
export const SITE_ORIGIN = 'https://clash.ac';
// Absolute https PNG. Relative paths and SVGs are not valid og:image values.
export const OG_IMAGE = `${SITE_ORIGIN}/og.png`;
export const THEME_COLOR = '#0b3a82';

// ogTitle / ogDescription fall back to title / description. Only override them
// where the social card genuinely reads better than the search-result text.
const ROUTE_META = {
    '/': {
        title: 'Clashdle — Daily Clash Royale Card Guessing Game',
        description: 'Guess the daily Clash Royale card. Compare rarity, cost, type, arena and more with color-coded feedback. A new puzzle every day across four game modes.',
        ogTitle: 'Clashdle — Daily Clash Royale guessing game',
        ogDescription: 'A new card to guess every day. Compare attributes, share results, build streaks.',
    },
    '/clashroyale/description': {
        title: 'Description Mode — Clashdle',
        description: 'Guess the daily Clash Royale card from its in-game description. Clues unlock as you guess. A new flavor-text puzzle every day.',
        ogTitle: 'Description Mode — Clashdle',
        ogDescription: 'No stats, just the card description. Can you name it?',
    },
    '/clashroyale/rush': {
        title: 'Rush Mode — Clashdle',
        description: 'Rapid-fire Clash Royale card guessing against the clock. Name as many cards as you can before time runs out.',
        ogTitle: 'Rush Mode — Clashdle',
        ogDescription: 'Ninety seconds on the clock, and every correct card buys you more time.',
    },
    '/clashroyale/memory': {
        title: 'Memory Mode — Clashdle',
        description: 'Type every Clash Royale card you can remember before the timer ends. How much of the full card roster do you really know?',
        ogTitle: 'Memory Mode — Clashdle',
        ogDescription: 'How many of the 121 Clash Royale cards can you name from memory?',
    },
    '/cards': {
        title: 'Clash Royale Card Guide — All 121 Cards — Clashdle',
        description: 'Every Clash Royale card in one reference: elixir cost, type, arena and release year, grouped by rarity from Common through Champion.',
        ogTitle: 'Clash Royale Card Guide — all 121 cards',
        ogDescription: 'Elixir cost, type, arena and year for every card, grouped by rarity.',
    },
    '/about':   { title: 'About — Clashdle',           description: 'About Clashdle, a free fan-made daily Clash Royale guessing game with four modes and a full card guide.' },
    '/privacy': { title: 'Privacy Policy — Clashdle',  description: 'How Clashdle handles data, cookies, advertising, and local storage.' },
    '/terms':   { title: 'Terms of Use — Clashdle',    description: 'Terms of use for Clashdle, a free fan-made Clash Royale guessing game.' },
    '/contact': { title: 'Contact — Clashdle',         description: 'Get in touch with the Clashdle team with feedback, bug reports, or questions.' },
};

// normalize: strip trailing slash except for root
const normalize = (url) => (url.length > 1 ? url.replace(/\/+$/, '') : url);

/**
 * Canonical URL for a path. Depends on the path only — no card data, no route
 * table — so the sitemap script can call it for every prerendered route,
 * including /cards/:slug pages whose titles it has no way to resolve.
 *
 * Trailing slash is deliberate: the prerender plugin emits `about/index.html`,
 * so Cloudflare Pages serves it at `/about/` and 308s `/about` to it. A
 * canonical pointing at the redirecting form would tell Google the
 * authoritative URL is one that redirects away.
 */
export function toCanonical(path) {
    const key = normalize(path);
    return `${SITE_ORIGIN}${key === '/' ? '/' : `${key}/`}`;
}

// Metadata for an individual card page, derived from the card so it cannot
// fall out of step with what the page actually shows. The caller supplies the
// card — see the note at the top about why this file imports nothing.
export function cardRouteMeta(card) {
    return {
        title: `${card.card} — Clash Royale Card Guide — Clashdle`,
        description: `${card.card}: ${card.cost} elixir ${card.rarity.toLowerCase()} ${card.type.toLowerCase()}, unlocked in ${card.arena}, released ${card.year}. Stats, mechanics and where it sits in the roster.`,
        ogTitle: `${card.card} — Clash Royale card guide`,
        ogDescription: card.description,
    };
}

/**
 * @param url    the route being rendered
 * @param card   optional card object, when url is a /cards/:slug page
 */
export function getRouteMeta(url, card = null) {
    const key = normalize(url);

    const meta =
        key in ROUTE_META
            ? ROUTE_META[key]
            : card && key.startsWith('/cards/')
              ? cardRouteMeta(card)
              : null;

    // Unknown paths redirect to "/" in App.jsx, so they canonicalise there too.
    const resolvedKey = meta ? key : '/';
    const resolved = meta ?? ROUTE_META['/'];

    return {
        title: resolved.title,
        description: resolved.description,
        // Derived, never hand-written. Hand-copied URLs are chances to typo a
        // domain, and a wrong canonical de-indexes the page.
        canonical: toCanonical(resolvedKey),
        ogTitle: resolved.ogTitle ?? resolved.title,
        ogDescription: resolved.ogDescription ?? resolved.description,
        ogImage: OG_IMAGE,
        siteName: SITE_NAME,
        themeColor: THEME_COLOR,
    };
}

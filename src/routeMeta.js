// src/routeMeta.js
// Single source of truth for per-route document metadata. Consumed only by
// src/prerender.jsx at build time, which is what puts these tags into the
// initial HTML where a crawler with JS disabled can actually see them.

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
    '/about':   { title: 'About — Clashdle',           description: 'About Clashdle, a free fan-made daily Clash Royale guessing game with four modes and a full card guide.' },
    '/privacy': { title: 'Privacy Policy — Clashdle',  description: 'How Clashdle handles data, cookies, advertising, and local storage.' },
    '/terms':   { title: 'Terms of Use — Clashdle',    description: 'Terms of use for Clashdle, a free fan-made Clash Royale guessing game.' },
    '/contact': { title: 'Contact — Clashdle',         description: 'Get in touch with the Clashdle team with feedback, bug reports, or questions.' },
};

// normalize: strip trailing slash except for root
const normalize = (url) => (url.length > 1 ? url.replace(/\/+$/, '') : url);

export function getRouteMeta(url) {
    const key = normalize(url);
    // Unknown paths redirect to "/" in App.jsx, so they canonicalise there too.
    const resolvedKey = key in ROUTE_META ? key : '/';
    const meta = ROUTE_META[resolvedKey];

    return {
        title: meta.title,
        description: meta.description,
        // Derived, never hand-written. Eight hand-copied URLs is eight chances
        // to typo a domain, and a wrong canonical de-indexes the page.
        //
        // Trailing slash is deliberate. The prerender plugin emits
        // `about/index.html`, so Cloudflare Pages serves that at `/about/` and
        // 308s `/about` to it. A canonical pointing at the redirecting form
        // would tell Google the authoritative URL is one that redirects away.
        canonical: `${SITE_ORIGIN}${resolvedKey === '/' ? '/' : `${resolvedKey}/`}`,
        ogTitle: meta.ogTitle ?? meta.title,
        ogDescription: meta.ogDescription ?? meta.description,
        ogImage: OG_IMAGE,
        siteName: SITE_NAME,
        themeColor: THEME_COLOR,
    };
}

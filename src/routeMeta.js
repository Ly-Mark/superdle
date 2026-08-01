// src/routeMeta.js
const ROUTE_META = {
    '/': {
        title: 'Clashdle — Daily Clash Royale Card Guessing Game',
        description: 'Guess the daily Clash Royale card. Compare rarity, cost, type, arena and more with color-coded feedback. A new puzzle every day across four game modes.',
    },
    '/clashroyale/description': {
        title: 'Description Mode — Clashdle',
        description: 'Guess the daily Clash Royale card from its in-game description. Clues unlock as you guess. A new flavor-text puzzle every day.',
    },
    '/clashroyale/rush': {
        title: 'Rush Mode — Clashdle',
        description: 'Rapid-fire Clash Royale card guessing against the clock. Name as many cards as you can before time runs out.',
    },
    '/clashroyale/memory': {
        title: 'Memory Mode — Clashdle',
        description: 'Type every Clash Royale card you can remember before the timer ends. How much of the full card roster do you really know?',
    },
    '/about':   { title: 'About — Clashdle',           description: 'About Clashdle, a free fan-made daily Clash Royale guessing game with four modes and a full card guide.' },
    '/privacy': { title: 'Privacy Policy — Clashdle',  description: 'How Clashdle handles data, cookies, advertising, and local storage.' },
    '/terms':   { title: 'Terms of Use — Clashdle',    description: 'Terms of use for Clashdle, a free fan-made Clash Royale guessing game.' },
    '/contact': { title: 'Contact — Clashdle',         description: 'Get in touch with the Clashdle team with feedback, bug reports, or questions.' },
};

export function getRouteMeta(url) {
    // normalize: strip trailing slash except for root
    const key = url.length > 1 ? url.replace(/\/+$/, '') : url;
    return ROUTE_META[key] ?? ROUTE_META['/'];
}
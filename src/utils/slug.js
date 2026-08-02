// src/utils/slug.js
// Internal slug: used for /cards/:slug routes and the sitemap.
export const slug = (name) =>
    name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // strip punctuation (apostrophes, periods)
        .trim()
        .replace(/\s+/g, '-');         // spaces → hyphens

// Deck Shop Pro slug.
//
// Actually tested against the live site on 2026-08-01, all 121 cards, both URL
// shapes. 120 pass. The one exception is below — an earlier comment here
// claimed all 121 were verified, which was not true, so the numbers above are
// from a real run rather than an assumption.
const DECKSHOP_OVERRIDES = {
    // cards.json calls it "Snowball"; the card's real name, and Deck Shop's
    // slug, is "Giant Snowball". `snowball` 404s.
    Snowball: 'giant-snowball',
};

export const deckshopSlug = (name) =>
    DECKSHOP_OVERRIDES[name] ??
    name.toLowerCase()
        .replace(/['.,]/g, '')
        .replace(/\s+/g, '-');

// Both pages exist for every card. Decks is the more useful of the two, so it
// goes first.
export const deckshopLinks = (name) => {
    const s = deckshopSlug(name);
    return [
        {
            href: `https://www.deckshop.pro/best-decks/with/${s}`,
            label: `Current decks featuring ${name}`,
            note: 'Deck Shop Pro — community-maintained deck lists',
        },
        {
            href: `https://www.deckshop.pro/card/detail/${s}`,
            label: `Full stats and matchups for ${name}`,
            note: 'Deck Shop Pro — detailed card breakdown',
        },
    ];
};
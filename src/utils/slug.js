// src/utils/slug.js
// Internal slug: used for /cards/:slug routes and the sitemap.
export const slug = (name) =>
    name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // strip punctuation (apostrophes, periods)
        .trim()
        .replace(/\s+/g, '-');         // spaces → hyphens

// Deck Shop Pro slug: verified against deckshop.pro for all 121 cards,
// including PEKKA, Mini PEKKA, X-Bow, The Log, Goblinstein, Suspicious Bush.
export const deckshopSlug = (name) =>
    name.toLowerCase()
        .replace(/['.,]/g, '')
        .replace(/\s+/g, '-');
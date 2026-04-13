// src/utils/clashroyale/cardImages.js

export const slugifyCardName = (name) =>
    String(name)
        .toLowerCase()
        .replace(/p\.?\s*e\.?\s*k\.?\s*k\.?\s*a/gi, "pekka")
        .replace(/&/g, "and")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const getCardThumbSources = (game, slug) => [
    `/games/${game}/cards/${slug}.webp`,
    `/games/${game}/cards/${slug}.png`,
    `/games/${game}/cards/${slug}.jpg`,
];

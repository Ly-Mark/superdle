// src/utils/clashroyale/cardSearch.js
// Shared name matching for the guess input in Classic, Rush, and Description.
//
// Still a PREFIX match, deliberately. Substring matching would make "giant"
// list all five Giants and "wizard" list all three, which hands the player a
// shortlist and takes the guesswork out of the game. Knowing the card's actual
// name is the point.
//
// Normalisation covers exactly two names in the 121-card deck, the only ones
// where the written name differs from what a player types:
//   - "The Log"  -> leading article dropped, so "log" finds it
//   - "X-Bow"    -> punctuation dropped, so "xbow" and "x-bow" both find it
//
// Spaces are preserved on purpose: "megaknight" should NOT match Mega Knight.
// Verified that after normalisation all 121 cards still resolve uniquely.
export const normalizeCardName = (s) =>
    String(s)
        .toLowerCase()
        .trim()
        .replace(/^(the|a|an)\s+/, '')
        .replace(/[^a-z0-9 ]/g, '');

// Extra names players actually use, where the card's written name in
// cards.json differs from what people type. Deliberately a short explicit
// list rather than fuzzy matching — each entry is a decision, not a guess.
//
// "Giant Snowball" is the card's real in-game name; cards.json calls it
// "Snowball" and the artwork is stored as snowball.png, so aliasing is less
// disruptive than renaming.
const ALIASES = {
    Snowball: ['Giant Snowball'],
};

// card name -> [normalised name, ...normalised aliases]
const SEARCH_KEYS = new Map(
    Object.entries(ALIASES).map(([card, alts]) => [
        card,
        [normalizeCardName(card), ...alts.map(normalizeCardName)],
    ])
);

const keysFor = (cardName) =>
    SEARCH_KEYS.get(cardName) ?? [normalizeCardName(cardName)];

export const matchesCardQuery = (cardName, query) => {
    const q = normalizeCardName(query);
    if (!q) return false;

    const [primary, ...aliases] = keysFor(cardName);
    if (primary.startsWith(q)) return true;

    // An alias only kicks in once the player is past its first word. Without
    // this, the "giant snowball" alias would make typing "giant" surface
    // Snowball alongside the actual Giants — handing out a card the player
    // was not looking for. "giant s" is a deliberate search; "giant" is not.
    return aliases.some(
        (alias) => alias.startsWith(q) && q.length > alias.split(' ')[0].length
    );
};

// Every string that should resolve to this card on an exact match. Used by
// Memory mode, which validates a typed answer rather than suggesting one.
export const exactKeysFor = (cardName) => keysFor(cardName);

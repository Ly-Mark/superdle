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

export const matchesCardQuery = (cardName, query) =>
    normalizeCardName(cardName).startsWith(normalizeCardName(query));

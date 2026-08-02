// src/utils/clashroyale/cardPages.js
// One answer to "does this card have a page", used by every link that might
// point at one.
//
// A card earns a page from EITHER source: a hand-written spotlight, or
// research in balance-history.md. Checking only one of them is a real bug —
// Goblin Barrel has a spotlight but an empty markdown section, so a check
// against the markdown alone left its chips unlinked while the page existed.
//
// scripts/prerenderRoutes.mjs decides the routes from the same two sources. If
// this ever disagrees with that, links will 404: there is no SPA catch-all any
// more, so an unrouted path is a real 404 rather than a silent fallback.
import { CARD_SPOTLIGHTS } from '../../content/cardSpotlights.jsx';
import { getCardContent } from './cardContent.js';

export function cardHasPage(cardName) {
    return !!CARD_SPOTLIGHTS[cardName] || !!getCardContent(cardName);
}

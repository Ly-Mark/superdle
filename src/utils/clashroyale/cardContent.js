// src/utils/clashroyale/cardContent.js
// Parses src/content/balance-history.md into per-card content.
//
// The markdown file is the editable source of truth — a human fills it in and
// this reads it directly via Vite's ?raw import. No generated JSON to keep in
// sync and no build step: edit the file, the page updates.
//
// Shape it expects, tolerant of heading level because the file mixes them:
//
//   # Knight            <- or ## Knight
//   ## Balance history  <- or ### Balance history
//   - 2016-05-18 — Hitpoints increased by 10%.
//   ## Counters
//   - Inferno Tower
//
// A heading is a SUBSECTION if its text is one of the four known ones;
// otherwise it starts a new card. That means the file's own instructional
// headings ("Format", "Why this file exists") parse as cards and are simply
// dropped, because they never match a real card name.
import raw from '../../content/balance-history.md?raw';
import cardsData from '../../data/cards.json';

const SUBSECTIONS = {
    'balance history': 'balance',
    counters: 'counters',
    synergies: 'synergies',
    'strategy notes': 'notes',
};

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const BULLET = /^-\s+(.+?)\s*$/;
// A balance entry must lead with an ISO date. That is also how placeholder
// lines like "Need source verification." get excluded — they have no date, so
// they never become an entry, and the page shows no history rather than a
// fake one.
const DATED = /^(\d{4}-\d{2}-\d{2})\s*[—–-]?\s*(.*)$/;

function parse(md) {
    const byCard = {};
    let card = null;
    let sub = null;
    let inComment = false;

    for (const line of md.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (trimmed.includes('<!--')) inComment = true;
        if (inComment) {
            if (trimmed.includes('-->')) inComment = false;
            continue;
        }

        const heading = trimmed.match(HEADING);
        if (heading) {
            const text = heading[2];
            const known = SUBSECTIONS[text.toLowerCase()];
            if (known) {
                sub = known;
            } else {
                card = text;
                sub = null;
                byCard[card] = byCard[card] ?? {
                    balance: [],
                    counters: [],
                    synergies: [],
                    notes: [],
                };
            }
            continue;
        }

        if (!card || !sub) continue;

        const bullet = trimmed.match(BULLET);
        if (!bullet) continue;

        if (sub === 'balance') {
            const dated = bullet[1].match(DATED);
            if (dated) byCard[card].balance.push({ date: dated[1], text: dated[2].trim() });
        } else {
            byCard[card][sub].push(bullet[1]);
        }
    }

    for (const entry of Object.values(byCard)) {
        entry.balance.sort((a, b) => a.date.localeCompare(b.date));
    }
    return byCard;
}

const PARSED = parse(raw);
const KNOWN_CARDS = new Set(cardsData.map((c) => c.card));

// A section whose heading doesn't match a card name is either one of the file's
// own instructional headings or a typo — "Fire Spirits" when the card is "Fire
// Spirit". The first is harmless, the second silently loses a card's worth of
// research, so surface it rather than swallow it.
export const UNMATCHED_SECTIONS = Object.keys(PARSED).filter(
    (name) =>
        !KNOWN_CARDS.has(name) &&
        // sections with no content at all are the file's prose headings
        Object.values(PARSED[name]).some((v) => v.length > 0)
);

const hasContent = (c) =>
    !!c && (c.balance.length || c.counters.length || c.synergies.length || c.notes.length);

export function getCardContent(cardName) {
    const c = PARSED[cardName];
    return hasContent(c) ? c : null;
}

// Cards with enough written material to justify a page of their own.
export const CARDS_WITH_CONTENT = cardsData
    .map((c) => c.card)
    .filter((name) => hasContent(PARSED[name]));

// Explicit month names rather than toLocaleDateString: locale formatting
// differs between Node at build time and the browser, which breaks hydration.
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatBalanceDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return MONTHS[m - 1] ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
}

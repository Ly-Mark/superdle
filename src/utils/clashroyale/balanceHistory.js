// src/utils/clashroyale/balanceHistory.js
// Parses src/content/balance-history.md into { [cardName]: [{ date, text }] }.
//
// The markdown file is the editable source of truth — a human fills it in, and
// this reads it directly via Vite's ?raw import. No generated JSON to keep in
// sync, and no build step: edit the file, the page updates.
//
// Format (documented in the .md itself):
//   ## Card Name
//   - YYYY-MM-DD — what changed
//
// Anything that isn't a heading or a bullet is ignored, so comments and notes
// in the file are safe.
import raw from '../../content/balance-history.md?raw';

// Matches a bullet whose first token is an ISO date. Everything after the date
// (and an optional dash of any flavour) is the description.
const ENTRY = /^-\s*(\d{4}-\d{2}-\d{2})\s*[—–-]?\s*(.*)$/;

function parse(md) {
    const byCard = {};
    let current = null;
    let inComment = false;

    for (const line of md.split(/\r?\n/)) {
        const trimmed = line.trim();

        // Skip HTML comment blocks — the template file uses one as an example.
        if (trimmed.includes('<!--')) inComment = true;
        if (inComment) {
            if (trimmed.includes('-->')) inComment = false;
            continue;
        }

        const heading = trimmed.match(/^##\s+(.+?)\s*$/);
        if (heading) {
            const name = heading[1];
            // The file's own instructional headings are not cards. Any heading
            // that doesn't match a bullet-bearing section simply ends up empty
            // and is filtered out below.
            current = name;
            byCard[current] = byCard[current] ?? [];
            continue;
        }

        if (!current) continue;

        const entry = trimmed.match(ENTRY);
        if (entry) {
            byCard[current].push({ date: entry[1], text: entry[2].trim() });
        }
    }

    // Drop empty sections (including the file's prose headings) and sort each
    // card's entries oldest first.
    return Object.fromEntries(
        Object.entries(byCard)
            .filter(([, entries]) => entries.length > 0)
            .map(([card, entries]) => [
                card,
                [...entries].sort((a, b) => a.date.localeCompare(b.date)),
            ])
    );
}

const BALANCE_HISTORY = parse(raw);

export function getBalanceHistory(cardName) {
    return BALANCE_HISTORY[cardName] ?? [];
}

// Human-readable date without pulling in a formatting library. Kept explicit
// so it renders identically at build time in Node and in the browser — locale
// formatting would differ between the two and break hydration.
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatBalanceDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const month = MONTHS[m - 1];
    if (!month) return iso;
    return `${d} ${month} ${y}`;
}

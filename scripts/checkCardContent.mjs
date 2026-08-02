// scripts/checkCardContent.mjs
// Reports which cards have a page, which don't, and anything in
// balance-history.md that will not be picked up.
//
// Run with: npm run check:cards
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug } from '../src/utils/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(path.resolve(__dirname, p), 'utf8');

const cards = JSON.parse(read('../src/data/cards.json'));
const names = cards.map((c) => c.card);

const normalizeName = (s) =>
    String(s).toLowerCase().trim()
        .replace(/^(the|a|an)\s+/, '')
        .replace(/[^a-z0-9 ]/g, '');

const canonical = new Map(names.map((n) => [normalizeName(n), n]));
const SUBS = new Set(['balance history', 'counters', 'synergies', 'strategy notes']);

// Same parse as src/utils/clashroyale/cardContent.js, counting bullets only.
function parse(md) {
    const counts = new Map();
    const unknown = new Map();
    let card = null;
    let sub = false;
    let inComment = false;

    for (const line of md.split(/\r?\n/)) {
        const t = line.trim();
        if (t.includes('<!--')) inComment = true;
        if (inComment) {
            if (t.includes('-->')) inComment = false;
            continue;
        }
        const h = t.match(/^#{1,6}\s+(.+?)\s*$/);
        if (h) {
            if (SUBS.has(h[1].toLowerCase())) {
                sub = true;
            } else {
                const resolved = canonical.get(normalizeName(h[1]));
                card = resolved ?? h[1];
                if (!resolved) unknown.set(h[1], 0);
                sub = false;
            }
            continue;
        }
        if (!card || !sub) continue;
        if (/^-\s+\S/.test(t)) {
            counts.set(card, (counts.get(card) ?? 0) + 1);
            if (unknown.has(card)) unknown.set(card, unknown.get(card) + 1);
        }
    }
    return { counts, unknown };
}

const { counts, unknown } = parse(read('../src/content/balance-history.md'));

const spotlights = [
    ...read('../src/content/cardSpotlights.jsx').matchAll(/^\s{4}'([^']+)':\s*\{/gm),
].map((m) => m[1]);

const hasPage = (n) => (counts.get(n) ?? 0) > 0 || spotlights.includes(n);

const done = names.filter(hasPage);
const todo = names.filter((n) => !hasPage(n));

const ORDER = ['Common', 'Rare', 'Epic', 'Legendary', 'Champion'];
const byRarity = (list) =>
    ORDER.map((r) => ({ r, cards: list.filter((n) => cards.find((c) => c.card === n).rarity === r) }))
        .filter((g) => g.cards.length);

console.log(`Cards with a page: ${done.length} / ${names.length}`);
console.log(`Still to write:    ${todo.length}\n`);

for (const { r, cards: g } of byRarity(todo)) {
    console.log(`  ${r} (${g.length})`);
    console.log(`    ${g.join(', ')}\n`);
}

// Sections that have bullets but match no card — a typo costs a whole card's
// research, silently, so this is the check worth running after every edit.
const lost = [...unknown.entries()].filter(([, n]) => n > 0);
if (lost.length) {
    console.log('SECTIONS MATCHING NO CARD (their content is being dropped):');
    for (const [name, n] of lost) console.log(`  "${name}" — ${n} bullets`);
} else {
    console.log('No orphaned sections: every heading with content matches a card.');
}

// Cross-check against what actually got built, when dist exists.
const dist = path.resolve(__dirname, '../dist/cards');
if (existsSync(dist)) {
    const built = new Set(readdirSync(dist).filter((d) => existsSync(path.join(dist, d, 'index.html'))));
    const missing = done.filter((n) => !built.has(slug(n)));
    const extra = [...built].filter((s) => !done.some((n) => slug(n) === s));
    console.log(`\nBuilt pages: ${built.size}`);
    if (missing.length) console.log(`  expected but not built: ${missing.join(', ')}`);
    if (extra.length) console.log(`  built but not expected: ${extra.join(', ')}`);
    if (!missing.length && !extra.length) console.log('  matches expectations exactly.');
}

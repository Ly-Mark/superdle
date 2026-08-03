// scripts/playClashdoku.mjs
//
// A terminal playthrough of a ClashDoku puzzle. Exists to find out whether the
// game is any fun BEFORE the React UI gets built - the grid rules, the axis
// feedback and the scoring are all cheap to change now and expensive later.
//
//     node scripts/playClashdoku.mjs                 today's puzzle
//     node scripts/playClashdoku.mjs --day 42        a specific day
//     node scripts/playClashdoku.mjs --day 42 --reveal   show the answers, no prompt
//     node scripts/playClashdoku.mjs --scan 10       summarise the next 10 days
//
// Answer a cell with:  a1 hog rider      (row letter, column number, card)
// Card names are matched loosely - case, spaces and punctuation are ignored,
// and a unique prefix is enough, so "a1 hog" works.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import readline from 'node:readline';
import {
    buildIndex, dailyGridsUpTo, answersFor, difficultyBand, MIN_ANSWERS,
} from '../src/utils/clashdoku/grid.js';
import { CATEGORIES } from '../src/utils/clashdoku/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cards = JSON.parse(
    readFileSync(path.resolve(__dirname, '../src/data/clashdoku.json'), 'utf8'),
);
const index = buildIndex(cards, CATEGORIES);

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
    const i = argv.indexOf(name);
    return i === -1 ? fallback : (argv[i + 1] ?? true);
};
// Local-date based, matching getDailyCard rather than the UTC getDayIndex in
// shareText.js. Those two already disagree near midnight (see CLAUDE.md); this
// is a prototype, so it follows the mode it will sit next to.
const EPOCH = new Date('2026-05-07T00:00:00Z');
const todayIndex = Math.floor((new Date() - EPOCH) / 86400000);
const day = Number(flag('--day', todayIndex));

const grid = dailyGridsUpTo(index, day).at(-1);
const label = (id) => CATEGORIES.find((c) => c.id === id).label;
const ROW_KEYS = ['a', 'b', 'c'];

// --- card mode: what does one card qualify for, and why? -------------------
// Spot-checking membership is the slowest way to find a wrong tag, so make it
// one command. The judgement-based lists (the four families, the two
// tank-killer lists) are the ones worth auditing; everything else is sourced.
if (argv.includes('--card')) {
    const q = String(flag('--card', '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    const hits = cards.filter((c) => c.card.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q));
    if (!hits.length) { console.log('no such card'); process.exit(1); }
    for (const card of hits) {
        console.log(`\n${card.card}`);
        console.log(`  ${card.rarity} · ${card.cost} elixir · ${card.type} · ${card.year} · ${card.arena} (arena ${card.arenaTier})`);
        console.log(`  targets: ${card.targets}   families: ${card.families.join(', ') || '—'}   tags: ${card.tags.join(', ') || '—'}`);
        const inCats = CATEGORIES.filter((cat) => cat.test(card));
        console.log(`  qualifies for ${inCats.length} of ${CATEGORIES.length} categories:`);
        for (const cat of inCats) console.log(`     ${cat.label}`);
    }
    process.exit(0);
}

// --- odd mode: cards most likely to be tagged wrong ------------------------
// Surfaces the cards carrying a judgement-based tag, so a review pass has
// somewhere to start rather than reading all 121 entries.
if (argv.includes('--odd')) {
    const JUDGED = ['goblin', 'undead', 'human', 'royal'];
    const JUDGED_TAGS = ['groundTankKiller', 'airTankKiller'];
    console.log('cards carrying a judgement-based family or tag (everything else is sourced):\n');
    for (const card of cards) {
        const f = card.families.filter((x) => JUDGED.includes(x));
        const t = card.tags.filter((x) => JUDGED_TAGS.includes(x));
        if (!f.length && !t.length) continue;
        console.log(`  ${card.card.padEnd(24)} ${[...f, ...t].join(', ')}`);
    }
    process.exit(0);
}

// --- scan mode: are consecutive days varied and sensibly graded? -----------
if (argv.includes('--scan')) {
    const count = Number(flag('--scan', 10));
    const all = dailyGridsUpTo(index, day + count);
    console.log(`day   band     score   categories`);
    for (let d = day; d <= day + count; d++) {
        const g = all[d];
        console.log(
            `${String(d).padEnd(5)} ${difficultyBand(g.difficulty).label.padEnd(8)} ` +
            `${String(g.difficulty).padStart(5)}   ` +
            `${[...g.rows, ...g.cols].map(label).join(' · ')}`,
        );
    }
    process.exit(0);
}

// --- rendering ------------------------------------------------------------
const state = new Map();          // "a1" -> card
const used = new Set();
let guessesLeft = 9;

const cellKey = (r, c) => `${ROW_KEYS[r]}${c + 1}`;
const colWidth = 22;

function render() {
    const band = difficultyBand(grid.difficulty);
    console.log(`\nClashDoku — day ${day}   ${band.label} (${grid.difficulty})   ${guessesLeft} guesses left\n`);
    console.log(' '.repeat(colWidth) + grid.cols.map((id, i) => `${i + 1}. ${label(id)}`.padEnd(colWidth)).join(''));
    grid.rows.forEach((rowId, r) => {
        const head = `${ROW_KEYS[r]}. ${label(rowId)}`.padEnd(colWidth);
        const cells = grid.cols.map((_, c) => {
            const filled = state.get(cellKey(r, c));
            return (filled ? `[${filled}]` : '·').padEnd(colWidth);
        });
        console.log(head + cells.join(''));
    });
}

// --- reveal mode ----------------------------------------------------------
if (argv.includes('--reveal')) {
    render();
    console.log('\nvalid answers per cell:');
    grid.rows.forEach((rowId, r) => {
        grid.cols.forEach((colId, c) => {
            const ans = answersFor(index, grid.rowIdx[r], grid.colIdx[c]);
            console.log(`  ${cellKey(r, c)}  ${label(rowId)} × ${label(colId)}  (${ans.length})`);
            console.log(`      ${ans.join(', ')}`);
        });
    });
    process.exit(0);
}

// --- matching -------------------------------------------------------------
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function resolveCard(input) {
    const q = norm(input);
    if (!q) return { error: 'no card given' };
    const exact = cards.filter((c) => norm(c.card) === q);
    if (exact.length === 1) return { card: exact[0] };
    const prefix = cards.filter((c) => norm(c.card).startsWith(q));
    if (prefix.length === 1) return { card: prefix[0] };
    if (prefix.length > 1) return { error: `ambiguous — ${prefix.slice(0, 6).map((c) => c.card).join(', ')}` };
    const loose = cards.filter((c) => norm(c.card).includes(q));
    if (loose.length === 1) return { card: loose[0] };
    if (loose.length > 1) return { error: `ambiguous — ${loose.slice(0, 6).map((c) => c.card).join(', ')}` };
    return { error: 'no such card' };
}

// --- play -----------------------------------------------------------------
render();
console.log(`\nEvery cell has at least ${MIN_ANSWERS} valid answers.`);
console.log('Type e.g. "a1 hog rider".  "?" explains the six categories.  "quit" to stop.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
rl.prompt();

rl.on('line', (line) => {
    const raw = line.trim();
    if (!raw) return rl.prompt();
    if (raw === 'quit' || raw === 'q') return rl.close();
    if (raw === '?' || raw === 'help') {
        // Fuzzy chips are the fastest way to make a wrong guess feel arbitrary,
        // so the rule for each one has to be reachable while playing.
        for (const id of [...grid.rows, ...grid.cols]) {
            const cat = CATEGORIES.find((x) => x.id === id);
            console.log(`  ${cat.label}
      ${cat.definition}`);
        }
        return rl.prompt();
    }

    const m = raw.match(/^([abc])\s*([123])\s+(.+)$/i);
    if (!m) {
        console.log('  format: <row letter><col number> <card>, e.g. "b2 wizard"');
        return rl.prompt();
    }
    const r = ROW_KEYS.indexOf(m[1].toLowerCase());
    const c = Number(m[2]) - 1;
    const key = cellKey(r, c);

    if (state.has(key)) {
        console.log(`  ${key} is already filled with ${state.get(key)}`);
        return rl.prompt();
    }

    const { card, error } = resolveCard(m[3]);
    if (error) { console.log(`  ${error}`); return rl.prompt(); }
    if (used.has(card.card)) {
        console.log(`  ${card.card} is already used — no card twice in a grid`);
        return rl.prompt();
    }

    const rowCat = CATEGORIES.find((x) => x.id === grid.rows[r]);
    const colCat = CATEGORIES.find((x) => x.id === grid.cols[c]);
    const rowOk = rowCat.test(card);
    const colOk = colCat.test(card);
    guessesLeft--;

    if (rowOk && colOk) {
        state.set(key, card.card);
        used.add(card.card);
        console.log(`  ✓ ${card.card}`);
    } else {
        // Axis feedback - the settled twist on PokeDoku's silent miss.
        const bits = [
            `${rowOk ? '✓' : '✗'} ${rowCat.label}`,
            `${colOk ? '✓' : '✗'} ${colCat.label}`,
        ];
        console.log(`  ✗ ${card.card} — ${bits.join('   ')}`);
    }

    if (state.size === 9) {
        render();
        console.log(`\nSolved with ${9 - guessesLeft} guesses.`);
        return rl.close();
    }
    if (guessesLeft === 0) {
        render();
        console.log(`\nOut of guesses — ${state.size}/9 filled.`);
        return rl.close();
    }
    render();
    rl.prompt();
});

rl.on('close', () => process.exit(0));

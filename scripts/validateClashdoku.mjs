// scripts/validateClashdoku.mjs
//
// Checks src/data/clashdoku.json can produce fair puzzles, and reports the
// numbers the board quotes. Run it with:
//
//     node scripts/validateClashdoku.mjs
//     node scripts/validateClashdoku.mjs --quiet   # exit code only
//
// Exits non-zero if the data could not produce a fair puzzle, so it can be
// wired into CI alongside `npm run build`.
//
// The category list and the validity rules are imported, NOT redefined here -
// two drifting copies would produce puzzles that still look valid. See
// src/utils/clashdoku/categories.js and grid.js.
//
// The enumeration below is exhaustive and O(C(n,3)^2), so it takes a few
// seconds. That is exactly why the runtime selector uses rejection sampling
// instead; this script exists to prove the pool the selector draws from.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildIndex, isValidGrid, difficultyScore, MIN_ANSWERS } from '../src/utils/clashdoku/grid.js';
import { CATEGORIES } from '../src/utils/clashdoku/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cards = JSON.parse(
    readFileSync(path.resolve(__dirname, '../src/data/clashdoku.json'), 'utf8'),
);

const quiet = process.argv.includes('--quiet');
const index = buildIndex(cards, CATEGORIES);
const { sets, n } = index;

const trio = [];
for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) trio.push([a, b, c]);

let total = 0;
let degenerate = 0;
const appearances = new Int32Array(n);
const difficulties = [];
for (const rows of trio) {
    for (const cols of trio) {
        if (cols.some((c) => rows.includes(c))) continue;
        if (!isValidGrid(index, rows, cols)) continue;
        total++;
        difficulties.push(difficultyScore(index, rows, cols));
        for (const i of [...rows, ...cols]) appearances[i]++;
        // A cell is degenerate when one axis adds nothing to the other.
        for (const r of rows) for (const c of cols) {
            const p = index.pair[r * n + c];
            if (p === sets[r].members.length || p === sets[c].members.length) degenerate++;
        }
    }
}

// SOLVABILITY. A minimum of MIN_ANSWERS per cell does NOT by itself guarantee
// a grid can be filled: cards cannot be reused, so nine cells need nine
// DISTINCT cards, and several cells may draw from the same small pool. Three
// "Goblin family" cells of four answers each could share the same four goblins.
//
// This is a bipartite matching problem, so test it as one (Kuhn's algorithm)
// rather than trusting the per-cell floor. Currently zero grids fail, but that
// is incidental to the present data, not guaranteed by the rules - which is
// exactly why it is checked on every run rather than assumed.
function isSolvable(rows, cols) {
    const cells = [];
    for (const r of rows) for (const c of cols) {
        cells.push(sets[r].members.filter((card) => sets[c].memberSet.has(card)));
    }
    const takenBy = new Map();
    const augment = (cell, seen) => {
        for (const card of cells[cell]) {
            if (seen.has(card)) continue;
            seen.add(card);
            if (!takenBy.has(card) || augment(takenBy.get(card), seen)) {
                takenBy.set(card, cell);
                return true;
            }
        }
        return false;
    };
    for (let i = 0; i < 9; i++) if (!augment(i, new Set())) return false;
    return true;
}

let unsolvable = 0;
const unsolvableSamples = [];
for (const rows of trio) {
    for (const cols of trio) {
        if (cols.some((c) => rows.includes(c))) continue;
        if (!isValidGrid(index, rows, cols)) continue;
        if (isSolvable(rows, cols)) continue;
        unsolvable++;
        if (unsolvableSamples.length < 5) {
            unsolvableSamples.push(
                `${rows.map((i) => sets[i].label).join(' | ')}  ×  ${cols.map((i) => sets[i].label).join(' | ')}`,
            );
        }
    }
}

// Pairs sitting exactly on the floor: one mis-tagged card removes them from
// the pool. Not a failure, but the fragile edge worth watching.
const atFloor = [];
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (index.pair[i * n + j] === MIN_ANSWERS) atFloor.push(`${sets[i].label} × ${sets[j].label}`);
}

const nested = [];
for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (index.nested[i * n + j]) nested.push([sets[i].label, sets[j].label]);
}

const empty = sets.filter((s) => s.members.length === 0).map((s) => s.label);
const dead = sets.map((s, i) => [s.label, appearances[i]]).filter(([, c]) => c === 0);
difficulties.sort((a, b) => a - b);

if (!quiet) {
    console.log(`cards: ${cards.length}   categories: ${n}   min answers/cell: ${MIN_ANSWERS}`);
    console.log(`
nested pairs (barred from opposite axes): ${nested.length}`);
    for (const [a, b] of nested) console.log(`   ${a} ⊂ ${b}`);
    console.log(`
valid grids: ${total.toLocaleString()}`);
    console.log(`degenerate cells: ${degenerate}`);
    console.log(`unsolvable grids (9 cells, 9 distinct cards): ${unsolvable}`);
    console.log(`category pairs sitting exactly on the ${MIN_ANSWERS}-answer floor: ${atFloor.length}`);
    console.log(`difficulty (sum of 9 cell answer counts): min ${difficulties[0]}, median ${difficulties[difficulties.length >> 1]}, max ${difficulties[difficulties.length - 1]}`);
    console.log('\ngrid appearances per category:');
    sets.map((s, i) => [s.label, appearances[i]])
        .sort((x, y) => x[1] - y[1])
        .forEach(([l, c]) => console.log(`   ${String(c).padStart(9)}  ${l}`));
}

const problems = [];
if (empty.length) problems.push(`categories matching no cards: ${empty.join(', ')}`);
if (dead.length) problems.push(`categories in zero valid grids: ${dead.map(([l]) => l).join(', ')}`);
if (degenerate) problems.push(`${degenerate} degenerate cells - one axis adds nothing`);
if (unsolvable) problems.push(`${unsolvable} grids cannot be filled with 9 distinct cards, e.g. ${unsolvableSamples[0]}`);
if (total < 3650) problems.push(`only ${total} valid grids - under ten years of dailies`);

if (problems.length) {
    console.error('\nFAIL');
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
}
if (!quiet) console.log('\nOK');

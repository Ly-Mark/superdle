// scripts/testClashdokuGrid.mjs
//
// Exercises the grid selector. Not a unit-test framework - the repo has none -
// but every check below fails loudly and sets the exit code, so it can run in
// CI next to the build.
//
//     node scripts/testClashdokuGrid.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
    buildIndex, gridFromSeed, dailyGrid, dailyGridsUpTo, isValidGrid,
    answersFor, sharedCategories, MIN_ANSWERS,
} from '../src/utils/clashdoku/grid.js';
import { CATEGORIES } from '../src/utils/clashdoku/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cards = JSON.parse(
    readFileSync(path.resolve(__dirname, '../src/data/clashdoku.json'), 'utf8'),
);

let failures = 0;
const check = (name, ok, detail = '') => {
    console.log(`${ok ? '  ok  ' : 'FAIL  '}${name}${detail ? `  — ${detail}` : ''}`);
    if (!ok) failures++;
};
const ms = (fn) => { const t = process.hrtime.bigint(); const r = fn(); return [r, Number(process.hrtime.bigint() - t) / 1e6]; };

const [index, buildMs] = ms(() => buildIndex(cards, CATEGORIES));
console.log(`index: ${cards.length} cards, ${index.n} categories, built in ${buildMs.toFixed(1)}ms\n`);

// --- determinism ----------------------------------------------------------
console.log('determinism');
const a = dailyGrid(index, 100);
const b = dailyGrid(index, 100);
check('same day gives the same grid', JSON.stringify(a.rows) === JSON.stringify(b.rows)
    && JSON.stringify(a.cols) === JSON.stringify(b.cols));
const c = dailyGrid(index, 101);
check('different days differ', JSON.stringify(a.rows) !== JSON.stringify(c.rows)
    || JSON.stringify(a.cols) !== JSON.stringify(c.cols));

// --- validity over a long run --------------------------------------------
console.log('\nvalidity (2000 days)');
const DAYS = 2000;
const [grids, genMs] = ms(() => Array.from({ length: DAYS }, (_, d) => dailyGrid(index, d)));
check('every day produced a grid', grids.every(Boolean));
check('every grid passes isValidGrid',
    grids.every((g) => isValidGrid(index, g.rowIdx, g.colIdx)));
check('all six categories distinct',
    grids.every((g) => new Set([...g.rows, ...g.cols]).size === 6));

let worstCell = Infinity;
for (const g of grids) {
    for (const r of g.rowIdx) for (const cc of g.colIdx) {
        worstCell = Math.min(worstCell, answersFor(index, r, cc).length);
    }
}
check(`every cell has >= ${MIN_ANSWERS} answers`, worstCell >= MIN_ANSWERS, `thinnest cell = ${worstCell}`);

// --- cost -----------------------------------------------------------------
console.log('\ncost');
const draws = grids.map((g) => g.draws);
const avgDraws = draws.reduce((x, y) => x + y, 0) / draws.length;
console.log(`  draws per grid: avg ${avgDraws.toFixed(1)}, worst ${Math.max(...draws)}`);
console.log(`  ${DAYS} grids in ${genMs.toFixed(0)}ms (${(genMs / DAYS).toFixed(3)}ms each)`);
check('a single grid costs under 1ms', genMs / DAYS < 1);

// acceptance rate, measured directly rather than inferred
let tried = 0, accepted = 0;
for (let i = 0; i < 20000; i++) {
    const g = gridFromSeed(index, `probe-${i}`);
    if (g) { tried += g.draws; accepted++; }
}
console.log(`  acceptance rate: ${(100 * accepted / tried).toFixed(2)}% (${accepted} grids from ${tried} draws)`);

// --- spacing --------------------------------------------------------------
console.log('\nspacing');
// First: is the rule even needed? Measure collisions WITHOUT it.
const naive = Array.from({ length: 400 }, (_, d) => gridFromSeed(index, `clashdoku-${d}`));
let naiveWorst = 0, naiveOffenders = 0;
for (let i = 0; i < naive.length; i++) {
    for (let j = Math.max(0, i - 30); j < i; j++) {
        const s = sharedCategories(naive[i], naive[j]);
        naiveWorst = Math.max(naiveWorst, s);
        if (s > 3) naiveOffenders++;
    }
}
console.log(`  without the rule: worst overlap ${naiveWorst}/6, ${naiveOffenders} pairs over the limit in 400 days`);

const [spaced, spacedMs] = ms(() => dailyGridsUpTo(index, 399));
let spacedWorst = 0;
for (let i = 0; i < spaced.length; i++) {
    for (let j = Math.max(0, i - 30); j < i; j++) {
        spacedWorst = Math.max(spacedWorst, sharedCategories(spaced[i], spaced[j]));
    }
}
check('spacing rule holds over 400 days', spacedWorst <= 3, `worst overlap ${spacedWorst}/6`);
console.log(`  400 spaced days in ${spacedMs.toFixed(0)}ms`);

// --- coverage and difficulty ---------------------------------------------
console.log('\ncoverage over 2000 days');
const seen = {};
for (const g of grids) for (const id of [...g.rows, ...g.cols]) seen[id] = (seen[id] || 0) + 1;
const missing = CATEGORIES.filter((c) => !seen[c.id]).map((c) => c.label);
check('every category appears at least once', missing.length === 0, missing.join(', '));
// Raw appearance counts are hard to reason about; days-between-appearances is
// the number that says whether a player will ever meet a category.
const counts = CATEGORIES.map((c) => [c.label, seen[c.id] || 0]).sort((x, y) => x[1] - y[1]);
const everyNDays = (n) => (n === 0 ? Infinity : DAYS / n);
console.log('  appears once every N days:');
for (const [label, n] of counts.slice(0, 8)) {
    console.log(`    ${String(Math.round(everyNDays(n))).padStart(4)}d  ${label}  (${n} in ${DAYS})`);
}
console.log(`    ...`);
for (const [label, n] of counts.slice(-3)) {
    console.log(`    ${String(Math.round(everyNDays(n))).padStart(4)}d  ${label}  (${n} in ${DAYS})`);
}

// Sampling is uniform over valid GRIDS, which is not the same as uniform over
// categories: a category that can only legally pair with a handful of others
// appears in few grids and so is drawn rarely. That is arithmetically correct
// and can still be a bad game.
const starved = counts.filter(([, n]) => everyNDays(n) > 365).map(([l, n]) => `${l} (every ${Math.round(everyNDays(n))}d)`);
check('every category appears at least once a year',
    starved.length === 0, starved.join(', ') || undefined);

const diffs = grids.map((g) => g.difficulty).sort((x, y) => x - y);
console.log(`  difficulty (sum of 9 cell answer counts): min ${diffs[0]}, median ${diffs[Math.floor(diffs.length / 2)]}, max ${diffs[diffs.length - 1]}`);

// --- a sample grid, rendered ---------------------------------------------
console.log('\nsample — day 0');
const g0 = grids[0];
const label = (id) => CATEGORIES.find((c) => c.id === id).label;
console.log(`  rows: ${g0.rows.map(label).join(' | ')}`);
console.log(`  cols: ${g0.cols.map(label).join(' | ')}`);
for (const r of g0.rowIdx) {
    const row = g0.colIdx.map((cc) => {
        const ans = answersFor(index, r, cc);
        return `${String(ans.length).padStart(2)} (${ans.slice(0, 2).join(', ')}${ans.length > 2 ? '…' : ''})`;
    });
    console.log(`    ${index.sets[r].label.padEnd(22)} ${row.join('   ')}`);
}

console.log(failures ? `\n${failures} FAILED` : '\nall checks passed');
process.exit(failures ? 1 : 0);

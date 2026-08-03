// ClashDoku grid selection.
//
// THE PROBLEM THIS SOLVES
//
// There are ~55 million ways to draw 3 rows and 3 columns from 38 categories,
// and ~1.5 million of those are legal grids. Enumerating them takes seconds -
// fine in a build script, far too slow in a browser, and the board ruled out
// committing a pre-built puzzles.json.
//
// So selection is REJECTION SAMPLING rather than indexing into an enumerated
// pool: draw six categories from a seeded stream, test them, redraw on
// failure. Roughly one draw in thirty-six is legal, each test is a handful of
// array lookups, and the PRNG is deterministic - so the same day produces the
// same grid everywhere without anyone ever enumerating anything.
//
// Rejection sampling from a uniform proposal is uniform over the accepted set,
// so this is not a biased shortcut: every legal grid is equally likely.
//
// WARNING: the grid for a given day depends on the exact contents and ORDER of
// CATEGORIES, and on the exact sequence of PRNG draws. Adding, removing or
// reordering a category changes every past and future puzzle - the same
// hazard CLAUDE.md documents for cards.json length and getDailyCard.

import { seededRandom } from '../prng.js';
import { CATEGORIES } from './categories.js';

export const MIN_ANSWERS = 4;      // settled: every cell needs >= 4 valid cards
export const MAX_PER_FAMILY = 2;   // stops three rarity rows
const MAX_DRAWS = 5000;            // safety valve; expected need is ~36

/**
 * Precompute everything selection needs: category membership, the pair matrix
 * (how many cards satisfy both categories) and which pairs are nested.
 *
 * Nested pairs are COMPUTED, never hand-listed. The subset check finds several
 * nobody predicts - every Legendary and every Champion unlocks at Arena 11+,
 * so those categories are redundant with each other in a way that only shows
 * up against real data.
 */
export function buildIndex(cards, categories = CATEGORIES) {
    const sets = categories.map((c) => ({
        ...c,
        members: cards.filter(c.test).map((x) => x.card),
        memberSet: new Set(cards.filter(c.test).map((x) => x.card)),
    }));
    const n = sets.length;

    const pair = new Int32Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            let count = 0;
            for (const card of sets[i].members) if (sets[j].memberSet.has(card)) count++;
            pair[i * n + j] = count;
        }
    }

    // nested[i*n+j] === 1 when every member of i is also in j.
    const nested = new Uint8Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j || sets[i].members.length === 0) continue;
            if (sets[i].members.length >= sets[j].members.length) continue;
            if (sets[i].members.every((c) => sets[j].memberSet.has(c))) nested[i * n + j] = 1;
        }
    }

    return { cards, sets, n, pair, nested };
}

/** Cards satisfying both categories - what a cell will accept. */
export function answersFor(index, rowIdx, colIdx) {
    return index.sets[rowIdx].members.filter((c) => index.sets[colIdx].memberSet.has(c));
}

/**
 * Is this draw a legal grid? Three tests, cheapest first, so most rejected
 * draws bail on the first cell they check.
 */
export function isValidGrid(index, rows, cols, minAnswers = MIN_ANSWERS) {
    const { n, pair, nested, sets } = index;

    for (const r of rows) {
        for (const c of cols) {
            if (pair[r * n + c] < minAnswers) return false;
        }
    }

    const perFamily = {};
    for (const i of [...rows, ...cols]) {
        const f = sets[i].family;
        perFamily[f] = (perFamily[f] || 0) + 1;
        if (perFamily[f] > MAX_PER_FAMILY) return false;
    }

    // Nesting only matters ACROSS the axes, never within one.
    //
    // If a row category is a subset of a COLUMN category, their shared cell
    // accepts everything in the smaller one and the other axis adds nothing:
    // "Champion x Troop" is really just "name a Champion". That cell is
    // degenerate and the grid should be rejected.
    //
    // Two nested categories both used as ROWS are harmless - no cell has both
    // as constraints, so nothing is degenerate. An earlier version rejected
    // nesting anywhere among the six, which threw away 11% of the pool and
    // punished small categories for nothing. Measured: this version produces
    // exactly as many degenerate cells (zero) from a larger pool.
    for (const r of rows) {
        for (const c of cols) {
            if (nested[r * n + c] || nested[c * n + r]) return false;
        }
    }

    return true;
}

/** Sum of the nine cell answer counts. Lower means harder. */
export function difficultyScore(index, rows, cols) {
    let total = 0;
    for (const r of rows) for (const c of cols) total += index.pair[r * index.n + c];
    return total;
}

/**
 * Draw a legal grid from a seed string. Returns null only if MAX_DRAWS is
 * exhausted, which would mean the category set had become unusable - the
 * validator exists to catch that at build time instead.
 */
export function gridFromSeed(index, seedStr, { minAnswers = MIN_ANSWERS, reject } = {}) {
    const rand = seededRandom(seedStr);
    const { n } = index;

    for (let draw = 0; draw < MAX_DRAWS; draw++) {
        const picked = [];
        // Six distinct category indices. Resampling collisions keeps the draw
        // uniform and costs almost nothing at n=38.
        let guard = 0;
        while (picked.length < 6 && guard++ < 200) {
            const k = Math.floor(rand() * n);
            if (!picked.includes(k)) picked.push(k);
        }
        if (picked.length < 6) continue;

        const rows = picked.slice(0, 3);
        const cols = picked.slice(3, 6);
        if (!isValidGrid(index, rows, cols, minAnswers)) continue;

        const grid = {
            rows: rows.map((i) => index.sets[i].id),
            cols: cols.map((i) => index.sets[i].id),
            rowIdx: rows,
            colIdx: cols,
            difficulty: difficultyScore(index, rows, cols),
            draws: draw + 1,
        };
        if (reject && reject(grid)) continue;
        return grid;
    }
    return null;
}

/** How many categories two grids share. Used by the spacing rule. */
export function sharedCategories(a, b) {
    const set = new Set([...b.rows, ...b.cols]);
    return [...a.rows, ...a.cols].filter((id) => set.has(id)).length;
}

export const DAILY_SALT = 'clashdoku';

/**
 * The grid for a given day index.
 *
 * `history` is the recently-used grids that this one must not resemble. The
 * caller owns it, because building it requires generating the preceding days -
 * see dailyGridsUpTo, which does that iteratively rather than recursively.
 */
export function dailyGrid(index, dayIndex, { history = [], maxShared = 3 } = {}) {
    return gridFromSeed(index, `${DAILY_SALT}-${dayIndex}`, {
        reject: (grid) => history.some((prev) => sharedCategories(grid, prev) > maxShared),
    });
}

/**
 * Every grid from day 0 to dayIndex, applying the spacing rule forward.
 *
 * Spacing is inherently sequential: day N's grid depends on the N-1 before it.
 * Generating a single far-future day therefore costs a walk from the epoch.
 * That is cheap (see scripts/testClashdokuGrid.mjs for the measurement) but it
 * is not free, so the UI should generate once and cache, not per render.
 */
export function dailyGridsUpTo(index, dayIndex, { window = 30, maxShared = 3 } = {}) {
    const out = [];
    for (let d = 0; d <= dayIndex; d++) {
        const history = out.slice(Math.max(0, out.length - window));
        out.push(dailyGrid(index, d, { history, maxShared }));
    }
    return out;
}

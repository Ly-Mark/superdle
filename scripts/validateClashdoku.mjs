// scripts/validateClashdoku.mjs
//
// Checks src/data/clashdoku.json is fit to build puzzles from, and reports the
// numbers the board quotes. Run it with:
//
//     node scripts/validateClashdoku.mjs
//     node scripts/validateClashdoku.mjs --quiet   # exit code only
//
// Exits non-zero if the data could not produce a fair puzzle, so it can be
// wired into CI alongside `npm run build`.
//
// CATEGORIES is the definition of what a row or column chip can be. T37's
// generator needs the same list client-side; when it does, lift this block
// into a shared module and import it here rather than keeping two copies.
//
// The enumeration below is the same one used to size the pool during scoping.
// It is O(C(n,3)^2) and takes a few seconds at 38 categories - fine for a
// check, too slow to run per page load, which is part of why the daily puzzle
// is selected by seeded index rather than enumerated at runtime.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cards = JSON.parse(
    readFileSync(path.resolve(__dirname, '../src/data/clashdoku.json'), 'utf8'),
);

const MIN_ANSWERS = 4;   // settled: 4 answers per cell
const quiet = process.argv.includes('--quiet');

// `family` groups categories that describe the same axis. No grid may use more
// than two from one family, which is what stops three rarity rows.
const has = (t) => (c) => c.tags.includes(t);
const fam = (f) => (c) => c.families.includes(f);

const CATEGORIES = [
    { id: 'common',      label: 'Common',                 family: 'rarity',   test: (c) => c.rarity === 'Common' },
    { id: 'rare',        label: 'Rare',                   family: 'rarity',   test: (c) => c.rarity === 'Rare' },
    { id: 'epic',        label: 'Epic',                   family: 'rarity',   test: (c) => c.rarity === 'Epic' },
    { id: 'legendary',   label: 'Legendary',              family: 'rarity',   test: (c) => c.rarity === 'Legendary' },
    { id: 'champion',    label: 'Champion',               family: 'rarity',   test: (c) => c.rarity === 'Champion' },

    { id: 'cost2',       label: '2 elixir or less',       family: 'cost',     test: (c) => c.cost <= 2 },
    { id: 'cost3',       label: '3 elixir',               family: 'cost',     test: (c) => c.cost === 3 },
    { id: 'cost4',       label: '4 elixir',               family: 'cost',     test: (c) => c.cost === 4 },
    { id: 'cost5',       label: '5 elixir or more',       family: 'cost',     test: (c) => c.cost >= 5 },

    { id: 'troop',       label: 'Troop',                  family: 'type',     test: (c) => c.type === 'Troop' },
    { id: 'spell',       label: 'Spell',                  family: 'type',     test: (c) => c.type === 'Spell' },
    { id: 'building',    label: 'Building',               family: 'type',     test: (c) => c.type === 'Building' },

    // Disjoint on purpose. The brief proposed 2016 / 2018+ / 2021+, but 2021+
    // nests inside 2018+ and a grid drawing both makes one row a subset of
    // the other.
    { id: 'era1',        label: 'Released 2016-17',       family: 'era',      test: (c) => c.year <= 2017 },
    { id: 'era2',        label: 'Released 2018-20',       family: 'era',      test: (c) => c.year >= 2018 && c.year <= 2020 },
    { id: 'era3',        label: 'Released 2021+',         family: 'era',      test: (c) => c.year >= 2021 },

    // No card attacks air without also attacking ground, so these three are a
    // complete partition of everything that attacks anything.
    { id: 'hitsAir',     label: 'Hits air',               family: 'targets',  test: (c) => c.targets === 'air' },
    { id: 'groundOnly',  label: 'Ground only',            family: 'targets',  test: (c) => c.targets === 'ground' },
    { id: 'buildingsOnly', label: 'Targets buildings',    family: 'targets',  test: (c) => c.targets === 'buildings' },

    { id: 'arenaEarly',  label: 'Arena 1-5',              family: 'arena',    test: (c) => c.arenaTier >= 1 && c.arenaTier <= 5 },
    { id: 'arenaMid',    label: 'Arena 6-10',             family: 'arena',    test: (c) => c.arenaTier >= 6 && c.arenaTier <= 10 },
    { id: 'arenaLate',   label: 'Arena 11+',              family: 'arena',    test: (c) => c.arenaTier >= 11 },

    { id: 'goblin',      label: 'Goblin family',          family: 'clan',     test: fam('goblin') },
    { id: 'undead',      label: 'Undead',                 family: 'clan',     test: fam('undead') },
    { id: 'human',       label: 'Human',                  family: 'clan',     test: fam('human') },
    { id: 'royal',       label: 'Nobility',               family: 'clan',     test: fam('royal') },

    { id: 'flying',      label: 'Flying unit',            family: 'mobility', test: has('flying') },
    { id: 'melee',       label: 'Melee',                  family: 'range',    test: has('melee') },
    { id: 'ranged',      label: 'Ranged',                 family: 'range',    test: has('ranged') },

    { id: 'groundSplash', label: 'Splashes ground',       family: 'splash',   test: has('groundSplash') },
    { id: 'airSplash',    label: 'Splashes air',          family: 'splash',   test: has('airSplash') },

    { id: 'wincon',      label: 'Win condition',          family: 'role',     test: has('wincon') },
    { id: 'spawns',      label: 'Spawns units',           family: 'spawn',    test: has('spawns') },
    { id: 'deathDamage', label: 'Death damage',           family: 'death',    test: has('deathDamage') },
    { id: 'multiUnit',   label: 'Deploys 2+ units',       family: 'count',    test: has('multiUnit') },

    { id: 'bigTank',     label: 'Big tank',               family: 'tank',     test: has('bigTank') },
    { id: 'miniTank',    label: 'Mini tank',              family: 'tank',     test: has('miniTank') },
    // On probation - these describe a matchup rather than a property of the
    // card. See TASKS.md. If they go, remove both.
    { id: 'groundTankKiller', label: 'Ground tank killer', family: 'tk',      test: has('groundTankKiller') },
    { id: 'airTankKiller',    label: 'Air tank killer',    family: 'tk',      test: has('airTankKiller') },
];

const sets = CATEGORIES.map((c) => ({
    ...c,
    members: new Set(cards.filter(c.test).map((x) => x.card)),
}));
const N = sets.length;

// Pair matrix: how many cards satisfy both categories.
const pair = new Int32Array(N * N);
for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
        if (i === j) continue;
        let n = 0;
        for (const card of sets[i].members) if (sets[j].members.has(card)) n++;
        pair[i * N + j] = n;
    }
}

// Nested pairs: every member of A is also in B. Not a correctness bug - the
// grid still solves - but one row's cells become a subset of the other's,
// which reads as redundant. Computed, never hand-listed: the check found
// several nobody predicted, e.g. every Legendary unlocks at Arena 11+.
const nested = [];
for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
        if (i === j || sets[i].members.size === 0) continue;
        if (sets[i].members.size >= sets[j].members.size) continue;
        if ([...sets[i].members].every((c) => sets[j].members.has(c))) {
            nested.push([sets[i].label, sets[j].label]);
        }
    }
}
const isNested = new Set(nested.map(([a, b]) => `${a}|${b}`));
const nestedPair = (a, b) =>
    isNested.has(`${sets[a].label}|${sets[b].label}`) ||
    isNested.has(`${sets[b].label}|${sets[a].label}`);

// Enumerate every legal grid: 3 rows x 3 cols, all six categories distinct,
// every cell with at least MIN_ANSWERS, no family more than twice, no nested
// pair among the six.
let total = 0;
const appearances = new Int32Array(N);
const trio = [];
for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) for (let c = b + 1; c < N; c++) trio.push([a, b, c]);

for (const rows of trio) {
    for (const cols of trio) {
        if (cols.some((c) => rows.includes(c))) continue;
        let ok = true;
        for (const r of rows) {
            for (const c of cols) {
                if (pair[r * N + c] < MIN_ANSWERS) { ok = false; break; }
            }
            if (!ok) break;
        }
        if (!ok) continue;

        const six = [...rows, ...cols];
        const byFamily = {};
        for (const i of six) byFamily[sets[i].family] = (byFamily[sets[i].family] || 0) + 1;
        if (Object.values(byFamily).some((n) => n > 2)) continue;

        let clash = false;
        for (let i = 0; i < 6 && !clash; i++) {
            for (let j = i + 1; j < 6; j++) {
                if (nestedPair(six[i], six[j])) { clash = true; break; }
            }
        }
        if (clash) continue;

        total++;
        for (const i of six) appearances[i]++;
    }
}

const dead = sets.map((s, i) => [s.label, appearances[i]]).filter(([, n]) => n === 0);
const empty = sets.filter((s) => s.members.size === 0).map((s) => s.label);

if (!quiet) {
    console.log(`cards: ${cards.length}   categories: ${N}   min answers/cell: ${MIN_ANSWERS}`);
    console.log(`\nnested pairs (excluded from the same grid): ${nested.length}`);
    for (const [a, b] of nested) console.log(`   ${a} ⊂ ${b}`);
    console.log(`\nvalid grids: ${total.toLocaleString()}`);
    console.log('\ngrid appearances per category:');
    sets.map((s, i) => [s.label, appearances[i]])
        .sort((x, y) => x[1] - y[1])
        .forEach(([l, n]) => console.log(`   ${String(n).padStart(9)}  ${l}`));
}

const problems = [];
if (empty.length) problems.push(`categories matching no cards: ${empty.join(', ')}`);
if (dead.length) problems.push(`categories in zero valid grids: ${dead.map(([l]) => l).join(', ')}`);
if (total < 3650) problems.push(`only ${total} valid grids - under ten years of dailies`);

if (problems.length) {
    console.error('\nFAIL');
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
}
if (!quiet) console.log('\nOK');

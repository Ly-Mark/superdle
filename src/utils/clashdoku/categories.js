// The definition of what a ClashDoku row or column chip can be.
//
// SINGLE SOURCE. The generator, the UI and scripts/validateClashdoku.mjs all
// import this. Two drifting category lists would be the worst bug available
// here, because the puzzle would still look valid - a cell would simply accept
// or reject the wrong cards with nothing to indicate why.
//
// `family` groups categories describing the same axis. No grid may use more
// than two from one family, which is what stops three rarity rows.
//
// Adding or removing a category changes every past and future daily grid,
// because selection is a seeded draw over this list. Treat a change here the
// same way CLAUDE.md treats a change to cards.json length.

const has = (tag) => (c) => c.tags.includes(tag);
const fam = (name) => (c) => c.families.includes(name);

export const CATEGORIES = [
    { id: 'common',      label: 'Common',              family: 'rarity',   test: (c) => c.rarity === 'Common' },
    { id: 'rare',        label: 'Rare',                family: 'rarity',   test: (c) => c.rarity === 'Rare' },
    { id: 'epic',        label: 'Epic',                family: 'rarity',   test: (c) => c.rarity === 'Epic' },
    { id: 'legendary',   label: 'Legendary',           family: 'rarity',   test: (c) => c.rarity === 'Legendary' },
    { id: 'champion',    label: 'Champion',            family: 'rarity',   test: (c) => c.rarity === 'Champion' },

    { id: 'cost2',       label: '2 elixir or less',    family: 'cost',     test: (c) => c.cost <= 2 },
    { id: 'cost3',       label: '3 elixir',            family: 'cost',     test: (c) => c.cost === 3 },
    { id: 'cost4',       label: '4 elixir',            family: 'cost',     test: (c) => c.cost === 4 },
    { id: 'cost5',       label: '5 elixir or more',    family: 'cost',     test: (c) => c.cost >= 5 },

    { id: 'troop',       label: 'Troop',               family: 'type',     test: (c) => c.type === 'Troop' },
    { id: 'spell',       label: 'Spell',               family: 'type',     test: (c) => c.type === 'Spell' },
    { id: 'building',    label: 'Building',            family: 'type',     test: (c) => c.type === 'Building' },

    // Disjoint on purpose. The brief proposed 2016 / 2018+ / 2021+, but 2021+
    // nests inside 2018+, and a grid drawing both makes one row's cells a
    // strict subset of the other's.
    { id: 'era1',        label: 'Released 2016-17',    family: 'era',      test: (c) => c.year <= 2017 },
    { id: 'era2',        label: 'Released 2018-20',    family: 'era',      test: (c) => c.year >= 2018 && c.year <= 2020 },
    { id: 'era3',        label: 'Released 2021+',      family: 'era',      test: (c) => c.year >= 2021 },

    // An exact partition of everything that attacks: no card hits air without
    // also hitting ground, so there is no fourth bucket missing.
    { id: 'hitsAir',        label: 'Hits air',         family: 'targets',  test: (c) => c.targets === 'air' },
    { id: 'groundOnly',     label: 'Ground only',      family: 'targets',  test: (c) => c.targets === 'ground' },
    { id: 'buildingsOnly',  label: 'Targets buildings', family: 'targets', test: (c) => c.targets === 'buildings' },

    { id: 'arenaEarly',  label: 'Arena 1-5',           family: 'arena',    test: (c) => c.arenaTier >= 1 && c.arenaTier <= 5 },
    { id: 'arenaMid',    label: 'Arena 6-10',          family: 'arena',    test: (c) => c.arenaTier >= 6 && c.arenaTier <= 10 },
    { id: 'arenaLate',   label: 'Arena 11+',           family: 'arena',    test: (c) => c.arenaTier >= 11 },

    { id: 'goblin',      label: 'Goblin family',       family: 'clan',     test: fam('goblin') },
    { id: 'undead',      label: 'Undead',              family: 'clan',     test: fam('undead') },
    { id: 'human',       label: 'Human',               family: 'clan',     test: fam('human') },
    { id: 'royal',       label: 'Nobility',            family: 'clan',     test: fam('royal') },

    { id: 'flying',      label: 'Flying unit',         family: 'mobility', test: has('flying') },
    { id: 'melee',       label: 'Melee',               family: 'range',    test: has('melee') },
    { id: 'ranged',      label: 'Ranged',              family: 'range',    test: has('ranged') },

    { id: 'groundSplash', label: 'Splashes ground',    family: 'splash',   test: has('groundSplash') },
    { id: 'airSplash',    label: 'Splashes air',       family: 'splash',   test: has('airSplash') },

    { id: 'wincon',      label: 'Win condition',       family: 'role',     test: has('wincon') },
    { id: 'spawns',      label: 'Spawns units',        family: 'spawn',    test: has('spawns') },
    { id: 'deathDamage', label: 'Death damage',        family: 'death',    test: has('deathDamage') },
    { id: 'multiUnit',   label: 'Deploys 2+ units',    family: 'count',    test: has('multiUnit') },

    { id: 'bigTank',     label: 'Big tank',            family: 'tank',     test: has('bigTank') },
    { id: 'miniTank',    label: 'Mini tank',           family: 'tank',     test: has('miniTank') },

    // On probation - these describe a matchup rather than a property of the
    // card, so they are the least guessable chips in the set. See TASKS.md.
    // If they go, remove both.
    { id: 'groundTankKiller', label: 'Ground tank killer', family: 'tk',   test: has('groundTankKiller') },
    { id: 'airTankKiller',    label: 'Air tank killer',    family: 'tk',   test: has('airTankKiller') },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

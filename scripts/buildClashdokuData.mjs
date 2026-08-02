// scripts/buildClashdokuData.mjs
//
// Generates src/data/clashdoku.json from src/data/cards.json plus the
// hand-authored membership lists below. Run it with:
//
//     node scripts/buildClashdokuData.mjs
//
// WHY A GENERATOR RATHER THAN A HAND-EDITED JSON
//
// ClashDoku needs its own card file (adding `tags`/`families` to cards.json
// would silently turn them into compared attributes in Classic - see
// compareAttributes in src/utils/clashroyale/gamelogic.js, which iterates
// Object.keys(target)). But a hand-maintained second copy would drift from
// cards.json the first time a card is added. This script re-derives the whole
// file, and asserts every entry still maps back to a real card.
//
// EVERYTHING IN THE HAND LISTS IS A JUDGEMENT CALL, NOT DATA. They were
// drafted from general knowledge of the game and need review. Where a call is
// contested, record it here rather than in the generated JSON - the JSON is
// output and gets overwritten.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => JSON.parse(readFileSync(path.resolve(__dirname, p), 'utf8'));

const cards = read('../src/data/cards.json');

// ---------------------------------------------------------------------------
// Exclusions
// ---------------------------------------------------------------------------

// Mirror has cost "Other" AND targets "Other". It cannot be placed in a cost
// bucket or a targeting bucket, so it can never be a valid answer anywhere.
const EXCLUDE = ['Mirror'];

// ---------------------------------------------------------------------------
// Arena unlock order
// ---------------------------------------------------------------------------

// cards.json stores arena NAMES with no ordering, so the tiers have to come
// from somewhere. Index == the in-game arena number, with Training Camp at 0.
//
// Confirmed by owner 2026-08-02. An earlier draft had PEKKA's Playhouse at 4
// and Spell Valley/Builder's Workshop at 5/6; they are the other way round.
// That is exactly the failure this list invites - a wrong order produces
// plausible-looking buckets and nothing fails.
//
// Arenas 19-22 hold no cards today. They are listed so a future card that
// unlocks there does not trip the "arena not in ARENA_ORDER" guard.
const ARENA_ORDER = [
    'Training Camp',        // 0
    'Goblin Stadium',       // 1
    'Bone Pit',             // 2
    'Barbarian Bowl',       // 3
    'Spell Valley',         // 4
    "Builder's Workshop",   // 5
    "PEKKA's Playhouse",    // 6
    'Royal Arena',          // 7
    'Frozen Peak',          // 8
    'Jungle Arena',         // 9
    'Hog Mountain',         // 10
    'Electro Valley',       // 11
    'Spooky Town',          // 12
    "Rascal's Hideout",     // 13
    'Serenity Peak',        // 14
    "Miner's Mine",         // 15
    "Executioner's Kitchen",// 16
    'Royal Crypt',          // 17
    'Silent Sanctuary',     // 18 - the last arena that unlocks any card
    'Dragon Spa',           // 19
    'Boot Camp',            // 20
    'Clash Fest',           // 21
    'PANCAKES!',            // 22
];

// ---------------------------------------------------------------------------
// Split cards
// ---------------------------------------------------------------------------

// Spirit Empress deploys as ground for 3 elixir or flying for 6. cards.json
// stores that as cost "3 / 6". It ships as two entries so the flying variant
// can carry the `flying` tag and the ground one cannot - a single entry would
// have to pick one and be wrong about half the card.
//
// Both share a slug so they resolve to the same art. If alternate portraits
// turn up, give them separate slugs here.
const SPLITS = {
    'Spirit Empress': [
        { suffix: '(Ground)', cost: 3, flying: false },
        { suffix: '(Flying)', cost: 6, flying: true },
    ],
};

// ---------------------------------------------------------------------------
// Families - a card may belong to several
// ---------------------------------------------------------------------------

// Derived, not hand-listed: any card whose name contains "goblin". 13 cards,
// no exceptions needed, and it picks up future Goblin cards automatically.
const isGoblin = (name) => name.toLowerCase().includes('goblin');

const UNDEAD = [
    'Skeletons', 'Skeleton Army', 'Skeleton Barrel', 'Skeleton Dragons',
    'Giant Skeleton', 'Skeleton King', 'Guards', 'Tombstone', 'Graveyard',
    'Balloon', 'Royal Ghost', 'Bats', 'Phoenix', 'Witch', 'Night Witch',
    'Mother Witch',
];

// Broad "people" axis. Machines and undead are out even when humanoid.
// Contested calls settled 2026-08-02: the giants are IN (they are large
// people); Guards are OUT because they are skeletons.
const HUMAN = [
    'Knight', 'Musketeer', 'Three Musketeers', 'Prince', 'Dark Prince',
    'Princess', 'Little Prince', 'Wizard', 'Ice Wizard', 'Electro Wizard',
    'Witch', 'Night Witch', 'Mother Witch', 'Barbarians', 'Elite Barbarians',
    'Bandit', 'Boss Bandit', 'Lumberjack', 'Fisherman', 'Archer Queen',
    'Archers', 'Magic Archer', 'Valkyrie', 'Executioner', 'Bowler', 'Hunter',
    'Berserker', 'Rascals', 'Miner', 'Mighty Miner', 'Monk', 'Golden Knight',
    'Mega Knight', 'Royal Recruits', 'Battle Healer', 'Firecracker',
    'Hog Rider', 'Ram Rider', 'Battle Ram', 'Giant', 'Royal Giant',
    'Electro Giant', 'Rune Giant',
];

// Cards associated with nobility. Supplied by owner 2026-08-02 as a closed
// list of 15 - it is not derivable from names, since Knight and Mega Knight
// are in while several "Royal"-prefixed reads would be wrong to guess at.
//
// Deliberately crosses Human rather than nesting inside it: Royal Ghost is
// undead and Royal Hogs are animals.
const ROYAL = [
    'Knight', 'Mega Knight', 'Golden Knight', 'Royal Recruits', 'Royal Giant',
    'Royal Delivery', 'Royal Hogs', 'Royal Ghost', 'Prince', 'Dark Prince',
    'Princess', 'Little Prince', 'Archer Queen', 'Skeleton King',
    'Spirit Empress',
];

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

// The unit itself is airborne. Distinct from "hits air", which is about what a
// card can attack - Balloon flies but only targets buildings.
const FLYING = [
    'Minions', 'Minion Horde', 'Mega Minion', 'Bats', 'Baby Dragon',
    'Inferno Dragon', 'Electro Dragon', 'Skeleton Dragons', 'Balloon',
    'Lava Hound', 'Flying Machine', 'Phoenix', 'Skeleton Barrel',
];

// Produces additional units - on a timer, on death, or on placement.
const SPAWNS = [
    'Goblin Hut', 'Barbarian Hut', 'Furnace', 'Tombstone', 'Witch',
    'Night Witch', 'Golem', 'Lava Hound', 'Goblin Giant', 'Skeleton Barrel',
    'Elixir Golem', 'Graveyard', 'Mother Witch', 'Goblin Drill', 'Goblin Cage',
    'Phoenix', 'Royal Delivery', 'Barbarian Barrel', 'Skeleton King',
    'Goblinstein',
];

// Community-standard win conditions. The most contested list here - Three
// Musketeers and Wall Breakers are arguable either way.
const WINCON = [
    'Hog Rider', 'Royal Giant', 'Giant', 'Golem', 'Lava Hound', 'Balloon',
    'Graveyard', 'X-Bow', 'Mortar', 'Miner', 'Goblin Barrel', 'Goblin Drill',
    'Ram Rider', 'Battle Ram', 'Wall Breakers', 'Electro Giant', 'Royal Hogs',
    'Goblin Giant', 'Skeleton Barrel', 'Three Musketeers',
];

// Damages multiple targets in an area. THE LEAST REVIEWED LIST IN THIS FILE -
// it was drafted last and has had no owner pass. Treat every entry as
// provisional.
const SPLASH = [
    'Wizard', 'Baby Dragon', 'Valkyrie', 'Bomber', 'Witch', 'Executioner',
    'Bowler', 'Giant Skeleton', 'Dark Prince', 'Magic Archer', 'Princess',
    'Firecracker', 'Electro Dragon', 'Mega Knight', 'Sparky', 'Goblin Machine',
    'Arrows', 'Fireball', 'Rocket', 'Zap', 'Poison', 'Lightning', 'Earthquake',
    'The Log', 'Barbarian Barrel', 'Royal Delivery', 'Snowball', 'Tornado',
    'Goblin Curse', 'Void', 'Bomb Tower', 'Mortar', 'Goblin Demolisher',
];

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

const TYPE = { Troops: 'Troop', Spells: 'Spell', Building: 'Building' };

// Collapses the 7 raw `targets` values into 4 buckets. Verified as an exact
// partition: every card lands in exactly one. "none" is a bucket, not a
// category - at 8 cards it can never reach the 4-answer minimum, so those
// cards simply fail all three targeting predicates.
function targetBucket(raw) {
    const v = String(raw);
    if (v.includes('Air')) return 'air';
    if (v === 'Ground' || v === 'Buildings / Ground') return 'ground';
    if (v === 'Buildings') return 'buildings';
    return 'none';
}

function slugify(name) {
    return name.toLowerCase().replace(/[.'’]/g, '').replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const problems = [];
const check = (list, label) => {
    const missing = list.filter((n) => !cards.some((c) => c.card === n));
    if (missing.length) problems.push(`${label}: not in cards.json - ${missing.join(', ')}`);
};
check(UNDEAD, 'UNDEAD'); check(HUMAN, 'HUMAN'); check(ROYAL, 'ROYAL');
check(FLYING, 'FLYING'); check(SPAWNS, 'SPAWNS'); check(WINCON, 'WINCON');
check(SPLASH, 'SPLASH');

const out = [];
for (const c of cards) {
    if (EXCLUDE.includes(c.card)) continue;

    const arenaTier = ARENA_ORDER.indexOf(c.arena);
    if (arenaTier < 0) problems.push(`arena not in ARENA_ORDER: "${c.arena}" (${c.card})`);

    const families = [
        isGoblin(c.card) && 'goblin',
        UNDEAD.includes(c.card) && 'undead',
        HUMAN.includes(c.card) && 'human',
        ROYAL.includes(c.card) && 'royal',
    ].filter(Boolean);

    const baseTags = [
        SPAWNS.includes(c.card) && 'spawns',
        WINCON.includes(c.card) && 'wincon',
        SPLASH.includes(c.card) && 'splash',
    ].filter(Boolean);

    const base = {
        card: c.card,
        slug: slugify(c.card),
        rarity: c.rarity,
        type: TYPE[c.type] ?? c.type,
        year: c.year,
        arena: c.arena,
        arenaTier,
        targets: targetBucket(c.targets),
        families,
    };

    const split = SPLITS[c.card];
    if (split) {
        for (const v of split) {
            out.push({
                ...base,
                card: `${c.card} ${v.suffix}`,
                slug: base.slug,                      // both variants share art
                cost: v.cost,
                tags: [...baseTags, v.flying && 'flying'].filter(Boolean),
            });
        }
        continue;
    }

    const cost = Number(c.cost);
    if (Number.isNaN(cost)) problems.push(`non-numeric cost and no split rule: ${c.card} = "${c.cost}"`);

    out.push({
        ...base,
        cost,
        tags: [...baseTags, FLYING.includes(c.card) && 'flying'].filter(Boolean),
    });
}

if (problems.length) {
    console.error('Refusing to write - fix these first:');
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
}

const dest = path.resolve(__dirname, '../src/data/clashdoku.json');
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`wrote ${out.length} entries to src/data/clashdoku.json`);

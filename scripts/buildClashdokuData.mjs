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
// The wiki stat line reads "6/3 ... 5.00/1.20 (Melee: Medium)", so the 6-cost
// form is ranged and the 3-cost form is melee. That is a second axis the two
// entries capture and a single entry could not, on top of flying.
const SPLITS = {
    'Spirit Empress': [
        { suffix: '(Ground)', cost: 3, flying: false, range: 'melee' },
        { suffix: '(Flying)', cost: 6, flying: true, range: 'ranged' },
    ],
};

// ---------------------------------------------------------------------------
// Families - a card may belong to several
// ---------------------------------------------------------------------------

// Derived, not hand-listed: any card whose name contains "goblin". 13 cards,
// no exceptions needed, and it picks up future Goblin cards automatically.
const isGoblin = (name) => name.toLowerCase().includes('goblin');

// Bomber and Wall Breakers are skeletons and belong here - clashdoku.md names
// both in its skeleton family and the drafted list dropped them anyway. Found
// 2026-08-03 while auditing what "humanoid" would sweep in, which is exactly
// the kind of miss T40 exists to catch: nothing fails, the data stays
// self-consistent, and the only symptom is a cell that quietly rejects a card
// a player is right about.
const UNDEAD = [
    'Skeletons', 'Skeleton Army', 'Skeleton Barrel', 'Skeleton Dragons',
    'Giant Skeleton', 'Skeleton King', 'Guards', 'Tombstone', 'Graveyard',
    'Balloon', 'Royal Ghost', 'Bats', 'Phoenix', 'Witch', 'Night Witch',
    'Mother Witch', 'Bomber', 'Wall Breakers',
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
    'Electro Giant', 'Rune Giant', 'Spirit Empress',
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

// Produces additional units - on a timer, on death, on placement, or via an
// ability. Taken verbatim from the wiki's spawner table (owner, 2026-08-02),
// so this list is DATA rather than judgement. Spawned units that are not
// themselves cards (Golemite, Lava Pup, Phoenix Egg, Bush Goblins, Guardienne,
// Cursed Hog, Elixir Blob, Goblin Brawler) are dropped.
//
// The table corrected five omissions and one invention in the drafted list:
// Battle Ram, Goblin Barrel, Goblin Curse, Little Prince and Suspicious Bush
// were missing; Goblinstein was in and should not have been.
//
// Goblinstein stays OUT, and the wiki table is right to omit it: the Monster
// arrives WITH Goblinstein rather than being spawned by it, and the ability
// links the two with an electric line (owner, 2026-08-02). That makes it a
// multi-unit card, not a spawner - see MULTI_UNIT.
const SPAWNS = [
    'Barbarian Barrel', 'Barbarian Hut', 'Battle Ram', 'Elixir Golem',
    'Furnace', 'Goblin Barrel', 'Goblin Cage', 'Goblin Curse', 'Goblin Drill',
    'Goblin Giant', 'Goblin Hut', 'Golem', 'Graveyard', 'Lava Hound',
    'Little Prince', 'Mother Witch', 'Night Witch', 'Phoenix',
    'Royal Delivery', 'Skeleton Barrel', 'Skeleton King', 'Suspicious Bush',
    'Tombstone', 'Witch',
];

// Win conditions, taken from deckshop.pro (owner, 2026-08-02). External and
// community-standard rather than my judgement, which settles the Three
// Musketeers and Wall Breakers arguments - both are in.
//
// The drafted list was 20 of these 21; only Elixir Golem was missing.
const WINCON = [
    'Mortar', 'Skeleton Barrel', 'Royal Giant', 'Battle Ram', 'Hog Rider',
    'Giant', 'Royal Hogs', 'Elixir Golem', 'Three Musketeers', 'Wall Breakers',
    'Goblin Barrel', 'Goblin Drill', 'Balloon', 'Goblin Giant', 'X-Bow',
    'Electro Giant', 'Golem', 'Miner', 'Ram Rider', 'Graveyard', 'Lava Hound',
];

// ---------------------------------------------------------------------------
// Tags derived from the wiki stat tables (owner, 2026-08-02)
// ---------------------------------------------------------------------------
//
// These three are transcribed from published columns rather than judged, which
// makes them the most trustworthy tags in this file. The risk is transcription
// error, not opinion - so ATTACK_RANGE below asserts full coverage and the
// build fails if a card is missed.

// The "(Death)" label in the Special Damage column.
const DEATH_DAMAGE = [
    'Balloon', 'Giant Skeleton', 'Golem', 'Ice Golem', 'Lumberjack', 'Phoenix',
    'Skeleton Barrel', 'Goblin Demolisher', 'Bomb Tower',
];

// Count column > 1 - the card deploys several units at once.
// Rascals is 1 boy + 2 girls; Goblinstein is itself plus the Monster, which
// the Count column records as 1 and therefore undercounts.
const MULTI_UNIT = [
    'Archers', 'Barbarians', 'Bats', 'Elite Barbarians', 'Goblin Gang',
    'Goblins', 'Guards', 'Minion Horde', 'Minions', 'Royal Hogs',
    'Royal Recruits', 'Skeleton Army', 'Skeletons', 'Skeleton Dragons',
    'Spear Goblins', 'Three Musketeers', 'Wall Breakers', 'Zappies',
    'Rascals', 'Goblinstein',
];

// The Range column: "(Melee: Short/Medium/Long)" vs a plain number.
//
// This is attack range, NOT what a card can hit - a melee unit can still hit
// air (Bats, Mega Minion) and a ranged one can be ground-only (Bomber). An
// earlier pass dismissed melee/ranged as duplicating the targeting axis; that
// was wrong, they are independent.
//
// `both` is for cards deploying units of each kind, e.g. Goblin Giant carries
// spear goblins. Spirit Empress is here because its ground form is melee and
// its flying form is ranged - see the per-variant override in SPLITS handling.
const ATTACK_RANGE = {
    melee: [
        'Balloon', 'Bandit', 'Barbarians', 'Bats', 'Battle Healer',
        'Battle Ram', 'Berserker', 'Boss Bandit', 'Dark Prince',
        'Electro Giant', 'Elite Barbarians', 'Elixir Golem', 'Fisherman',
        'Giant', 'Giant Skeleton', 'Goblins', 'Golden Knight', 'Golem',
        'Guards', 'Hog Rider', 'Ice Golem', 'Knight', 'Lumberjack',
        'Mega Knight', 'Mega Minion', 'Mighty Miner', 'Miner', 'Mini PEKKA',
        'Monk', 'Night Witch', 'PEKKA', 'Phoenix', 'Prince', 'Royal Ghost',
        'Royal Hogs', 'Royal Recruits', 'Rune Giant', 'Skeleton Army',
        'Skeleton Barrel', 'Skeleton King', 'Skeletons', 'Valkyrie',
        'Wall Breakers',
    ],
    ranged: [
        'Archers', 'Archer Queen', 'Baby Dragon', 'Bomber', 'Bowler',
        'Cannon Cart', 'Dart Goblin', 'Electro Dragon', 'Electro Spirit',
        'Electro Wizard', 'Executioner', 'Firecracker', 'Fire Spirit',
        'Flying Machine', 'Goblin Demolisher', 'Goblinstein', 'Heal Spirit',
        'Hunter', 'Ice Spirit', 'Ice Wizard', 'Inferno Dragon', 'Lava Hound',
        'Little Prince', 'Magic Archer', 'Minion Horde', 'Minions',
        'Mother Witch', 'Musketeer', 'Princess', 'Royal Giant',
        'Skeleton Dragons', 'Sparky', 'Spear Goblins', 'Three Musketeers',
        'Witch', 'Wizard', 'Zappies', 'Bomb Tower', 'Cannon', 'Inferno Tower',
        'Mortar', 'Tesla', 'X-Bow',
    ],
    both: [
        'Goblin Gang', 'Goblin Giant', 'Goblin Machine', 'Ram Rider',
        'Rascals',
    ],
    // Deploys or exists but never attacks: every spell, the pure spawner
    // buildings, Elixir Collector, and Suspicious Bush (its bush goblins
    // fight, the bush does not).
    none: [
        'Arrows', 'Barbarian Barrel', 'Clone', 'Earthquake', 'Fireball',
        'Freeze', 'Goblin Barrel', 'Goblin Curse', 'Graveyard', 'Lightning',
        'Poison', 'Rage', 'Rocket', 'Royal Delivery', 'Snowball', 'The Log',
        'Tornado', 'Vines', 'Void', 'Zap',
        'Barbarian Hut', 'Elixir Collector', 'Furnace', 'Goblin Cage',
        'Goblin Drill', 'Goblin Hut', 'Tombstone', 'Suspicious Bush',
    ],
};

// SPLASH - taken from deckshop.pro (owner, 2026-08-02), split into what a
// card splashes AGAINST rather than a single flag.
//
// This replaces the earlier `splashAttacker` tag and reverses two calls made
// while drafting it:
//
//   - Spells are back IN. Deckshop counts them, and with the question split
//     into "splashes ground" / "splashes air" that is right: a player asking
//     what clears an air swarm genuinely means Arrows and Fireball as much as
//     Wizard. The cost is that these tags now overlap `Spell` heavily.
//   - Indirect and death-triggered area damage is back IN - Ice Golem's death
//     nova, Furnace via its fire spirits, Skeleton King's ability. Deckshop
//     cares about the effect, not the mechanism.
//
// The two lists are NOT nested: Witch and Magic Archer splash air but not
// ground, so neither is a subset of the other.
const GROUND_SPLASH = [
    'Ice Spirit', 'Fire Spirit', 'Electro Spirit', 'Bomber', 'Zap', 'Snowball',
    'Arrows', 'Firecracker', 'Royal Delivery', 'Skeleton Dragons', 'Mortar',
    'Ice Golem', 'Earthquake', 'Fireball', 'Valkyrie', 'Bomb Tower', 'Furnace',
    'Goblin Demolisher', 'Wizard', 'Rocket', 'Tornado', 'Baby Dragon',
    'Dark Prince', 'Freeze', 'Poison', 'Hunter', 'Electro Dragon', 'Bowler',
    'Executioner', 'Electro Giant', 'The Log', 'Princess', 'Ice Wizard',
    'Royal Ghost', 'Goblin Machine', 'Sparky', 'Mega Knight', 'Skeleton King',
];

const AIR_SPLASH = [
    'Ice Spirit', 'Fire Spirit', 'Electro Spirit', 'Zap', 'Snowball', 'Arrows',
    'Firecracker', 'Royal Delivery', 'Skeleton Dragons', 'Ice Golem',
    'Fireball', 'Furnace', 'Wizard', 'Rocket', 'Tornado', 'Baby Dragon',
    'Freeze', 'Poison', 'Hunter', 'Witch', 'Electro Dragon', 'Executioner',
    'Electro Giant', 'Princess', 'Magic Archer', 'Goblin Machine',
];

// ROLE TAGS - deckshop.pro (owner, 2026-08-02).
//
// These describe how a card is USED rather than what it is, which makes them
// the softest tags in the file. Kept because they are externally sourced and
// consistent, but see the note on tank killers below before adding more of
// this kind.

// Bulk. A property of the card itself, so these read cleanly as puzzle
// categories: a player can look at Golem and know it is a big tank.
const BIG_TANK = [
    'Royal Giant', 'Elixir Golem', 'Giant', 'Rune Giant', 'Giant Skeleton',
    'Goblin Giant', 'PEKKA', 'Electro Giant', 'Golem', 'Mega Knight',
    'Lava Hound', 'Goblinstein',
];

const MINI_TANK = [
    'Knight', 'Rascals', 'Elite Barbarians', 'Ice Golem', 'Mini PEKKA',
    'Goblin Cage', 'Valkyrie', 'Battle Ram', 'Hog Rider', 'Battle Healer',
    'Goblin Demolisher', 'Baby Dragon', 'Dark Prince', 'Prince', 'Bowler',
    'Executioner', 'Cannon Cart', 'Miner', 'Royal Ghost', 'Bandit',
    'Fisherman', 'Lumberjack', 'Ram Rider', 'Goblin Machine', 'Spirit Empress',
    'Golden Knight', 'Skeleton King', 'Mighty Miner', 'Monk', 'Boss Bandit',
];

// Tank killers describe a MATCHUP, not a property, and that is the difference
// that matters for a puzzle. Owner flagged Wizard, Goblin Drill and Bandit as
// reading oddly, and the reasons are deck theory rather than card knowledge -
// Wizard clears the support around a tank, Goblin Drill pulls it as a
// building, Bandit's dash cannot actually threaten one. All defensible advice;
// none of it guessable from the card.
//
// Taken verbatim rather than trimmed, so the list stays deckshop's opinion
// rather than becoming a mix of theirs and ours. If these play badly, drop
// both tags whole rather than editing the membership.
const GROUND_TANK_KILLER = [
    'Goblins', 'Bats', 'Archers', 'Minions', 'Cannon', 'Goblin Gang',
    'Skeleton Dragons', 'Tesla', 'Barbarians', 'Minion Horde',
    'Elite Barbarians', 'Royal Recruits', 'Mega Minion', 'Mini PEKKA',
    'Musketeer', 'Goblin Cage', 'Inferno Tower', 'Wizard', 'Three Musketeers',
    'Guards', 'Skeleton Army', 'Hunter', 'Goblin Drill', 'Witch', 'Prince',
    'Cannon Cart', 'X-Bow', 'PEKKA', 'Bandit', 'Inferno Dragon', 'Phoenix',
    'Lumberjack', 'Night Witch', 'Sparky', 'Spirit Empress', 'Mighty Miner',
    'Archer Queen',
];

const AIR_TANK_KILLER = [
    'Bats', 'Archers', 'Minions', 'Skeleton Dragons', 'Tesla', 'Minion Horde',
    'Mega Minion', 'Dart Goblin', 'Musketeer', 'Inferno Tower', 'Wizard',
    'Three Musketeers', 'Hunter', 'Inferno Dragon', 'Phoenix',
    'Spirit Empress', 'Little Prince', 'Archer Queen',
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
check(GROUND_SPLASH, 'GROUND_SPLASH'); check(AIR_SPLASH, 'AIR_SPLASH');
check(BIG_TANK, 'BIG_TANK'); check(MINI_TANK, 'MINI_TANK');
check(GROUND_TANK_KILLER, 'GROUND_TANK_KILLER'); check(AIR_TANK_KILLER, 'AIR_TANK_KILLER');
check(DEATH_DAMAGE, 'DEATH_DAMAGE'); check(MULTI_UNIT, 'MULTI_UNIT');
Object.entries(ATTACK_RANGE).forEach(([k, v]) => check(v, `ATTACK_RANGE.${k}`));

// ATTACK_RANGE is transcribed by hand from a wiki column, so the failure mode
// is a card silently falling through rather than a wrong opinion. Require
// every card to appear in exactly one bucket.
{
    const seen = new Map();
    for (const [bucket, list] of Object.entries(ATTACK_RANGE)) {
        for (const name of list) {
            if (seen.has(name)) problems.push(`ATTACK_RANGE: "${name}" in both ${seen.get(name)} and ${bucket}`);
            seen.set(name, bucket);
        }
    }
    const uncovered = cards
        .filter((c) => !EXCLUDE.includes(c.card) && !SPLITS[c.card] && !seen.has(c.card))
        .map((c) => c.card);
    if (uncovered.length) problems.push(`ATTACK_RANGE: no bucket for ${uncovered.join(', ')}`);
}

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

    const range = Object.entries(ATTACK_RANGE)
        .find(([, list]) => list.includes(c.card))?.[0];

    const baseTags = [
        SPAWNS.includes(c.card) && 'spawns',
        WINCON.includes(c.card) && 'wincon',
        GROUND_SPLASH.includes(c.card) && 'groundSplash',
        AIR_SPLASH.includes(c.card) && 'airSplash',
        BIG_TANK.includes(c.card) && 'bigTank',
        MINI_TANK.includes(c.card) && 'miniTank',
        GROUND_TANK_KILLER.includes(c.card) && 'groundTankKiller',
        AIR_TANK_KILLER.includes(c.card) && 'airTankKiller',
        DEATH_DAMAGE.includes(c.card) && 'deathDamage',
        MULTI_UNIT.includes(c.card) && 'multiUnit',
        (range === 'melee' || range === 'both') && 'melee',
        (range === 'ranged' || range === 'both') && 'ranged',
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
                tags: [...baseTags, v.flying && 'flying', v.range].filter(Boolean),
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

// `node scripts/buildClashdokuData.mjs --arenas` prints every arena with the
// cards it unlocks, in order, for diffing against a published unlock table.
// ARENA_ORDER is hand-written and a wrong entry fails silently, so this is the
// only cheap way to check it.
if (process.argv.includes('--arenas')) {
    console.log('\nArena unlocks as this file understands them:\n');
    ARENA_ORDER.forEach((name, tier) => {
        const here = out.filter((e) => e.arenaTier === tier).map((e) => e.card);
        const label = `${String(tier).padStart(2)}  ${name}`.padEnd(28);
        console.log(`${label}${here.length ? here.join(', ') : '—'}`);
    });
}

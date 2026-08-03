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
// `definition` is the exact rule, in one line, for the player. EVERY category
// has one and the UI must be able to show it. A guessing game cannot have
// fuzzy chips: if a player has to wonder whether "ground only" means where a
// card walks or what it shoots, a wrong guess feels arbitrary rather than
// earned. Prefer a longer, unambiguous label over a snappy one.
//
// ORDER IS LOAD-BEARING. Selection is a seeded draw over this array, so
// adding, removing or reordering an entry changes every past and future daily
// puzzle - the same hazard CLAUDE.md documents for cards.json length. Editing
// a `label` or `definition` is safe; moving a line is not.

const has = (tag) => (c) => c.tags.includes(tag);
const fam = (name) => (c) => c.families.includes(name);

export const CATEGORIES = [
    { id: 'common', label: 'Common', family: 'rarity',
      definition: 'Common rarity.', test: (c) => c.rarity === 'Common' },
    { id: 'rare', label: 'Rare', family: 'rarity',
      definition: 'Rare rarity.', test: (c) => c.rarity === 'Rare' },
    { id: 'epic', label: 'Epic', family: 'rarity',
      definition: 'Epic rarity.', test: (c) => c.rarity === 'Epic' },
    { id: 'legendary', label: 'Legendary', family: 'rarity',
      definition: 'Legendary rarity.', test: (c) => c.rarity === 'Legendary' },
    { id: 'champion', label: 'Champion', family: 'rarity',
      definition: 'Champion rarity — the eight cards with an activated ability.',
      test: (c) => c.rarity === 'Champion' },

    { id: 'cost2', label: '2 elixir or less', family: 'cost',
      definition: 'Costs 1 or 2 elixir.', test: (c) => c.cost <= 2 },
    { id: 'cost3', label: '3 elixir', family: 'cost',
      definition: 'Costs exactly 3 elixir.', test: (c) => c.cost === 3 },
    { id: 'cost4', label: '4 elixir', family: 'cost',
      definition: 'Costs exactly 4 elixir.', test: (c) => c.cost === 4 },
    { id: 'cost5', label: '5 elixir or more', family: 'cost',
      definition: 'Costs 5 elixir or more. Spirit Empress counts here in its 6-elixir flying form.',
      test: (c) => c.cost >= 5 },

    { id: 'troop', label: 'Troop', family: 'type',
      definition: 'A troop card — not a spell and not a building.', test: (c) => c.type === 'Troop' },
    { id: 'spell', label: 'Spell', family: 'type',
      definition: 'A spell card.', test: (c) => c.type === 'Spell' },
    { id: 'building', label: 'Building', family: 'type',
      definition: 'A building card.', test: (c) => c.type === 'Building' },

    // Disjoint on purpose. The brief proposed 2016 / 2018+ / 2021+, but 2021+
    // nests inside 2018+, and a grid drawing both makes one row's cells a
    // strict subset of the other's.
    { id: 'era1', label: 'Released 2016-17', family: 'era',
      definition: 'Released in 2016 or 2017.', test: (c) => c.year <= 2017 },
    { id: 'era2', label: 'Released 2018-20', family: 'era',
      definition: 'Released between 2018 and 2020.', test: (c) => c.year >= 2018 && c.year <= 2020 },
    { id: 'era3', label: 'Released 2021+', family: 'era',
      definition: 'Released in 2021 or later.', test: (c) => c.year >= 2021 },

    // These three describe what a card ATTACKS, never where it moves. That
    // ambiguity is exactly what the labels were changed to remove: "Ground
    // only" read as though it meant a ground-walking troop, which is the
    // `flying` axis. Goblin Gang is NOT in "Attacks ground only", because its
    // spear goblins shoot air, even though every goblin in it walks.
    //
    // An exact partition of everything that attacks: no card can hit air
    // without also hitting ground, so there is no fourth bucket missing.
    { id: 'hitsAir', label: 'Can attack air', family: 'targets',
      definition: 'Can shoot air units. Every card that can also hits ground — nothing attacks air alone.',
      test: (c) => c.targets === 'air' },
    { id: 'groundOnly', label: 'Attacks ground only', family: 'targets',
      definition: 'Cannot attack air units. About what it shoots, not where it walks.',
      test: (c) => c.targets === 'ground' },
    { id: 'buildingsOnly', label: 'Attacks buildings only', family: 'targets',
      definition: 'Ignores troops and walks for buildings — Hog Rider, Balloon, Golem.',
      test: (c) => c.targets === 'buildings' },

    { id: 'arenaEarly', label: 'Arena 1-5', family: 'arena',
      definition: 'Unlocks in Goblin Stadium through Builder’s Workshop. Training Camp cards are not included.',
      test: (c) => c.arenaTier >= 1 && c.arenaTier <= 5 },
    { id: 'arenaMid', label: 'Arena 6-10', family: 'arena',
      definition: 'Unlocks in P.E.K.K.A’s Playhouse through Hog Mountain.',
      test: (c) => c.arenaTier >= 6 && c.arenaTier <= 10 },
    { id: 'arenaLate', label: 'Arena 11+', family: 'arena',
      definition: 'Unlocks in Electro Valley or later.', test: (c) => c.arenaTier >= 11 },

    { id: 'goblin', label: 'Goblin family', family: 'clan',
      definition: 'Any card with "Goblin" in its name, including Goblinstein.', test: fam('goblin') },
    { id: 'undead', label: 'Undead', family: 'clan',
      definition: 'Skeletons, the witches that raise them, Balloon, Royal Ghost, Bats and Phoenix.',
      test: fam('undead') },
    { id: 'human', label: 'Human', family: 'clan',
      definition: 'People, including the giants. Machines, skeletons and beasts are excluded — so Guards and P.E.K.K.A are out.',
      test: fam('human') },
    { id: 'royal', label: 'Nobility', family: 'clan',
      definition: 'The royal court — the Knights, the Princes, Princess, Archer Queen, Skeleton King, Spirit Empress and the Royal cards.',
      test: fam('royal') },

    { id: 'flying', label: 'Flying unit', family: 'mobility',
      definition: 'The unit itself flies. Different from attacking air: Balloon flies but only attacks buildings.',
      test: has('flying') },

    // "Has a" is doing real work in these two labels, not padding.
    //
    // Five cards deploy both kinds - Goblin Gang, Rascals, Goblin Giant, Ram
    // Rider, Goblin Machine - so melee and ranged are NOT mutually exclusive,
    // and the pair legitimately lands on opposite axes in ~51k grids. A cell
    // headed "Melee x Ranged" reads as a contradiction and a player skips it;
    // headed this way it reads as "cards that bring both", which is a good
    // puzzle. The grids were fine, the words were wrong.
    { id: 'melee', label: 'Has a melee unit', family: 'range',
      definition: 'Deploys at least one unit that must touch its target. Cards deploying both kinds count here and under ranged.',
      test: has('melee') },
    { id: 'ranged', label: 'Has a ranged unit', family: 'range',
      definition: 'Deploys at least one unit that attacks from a distance. Spirits count — they strike from about 2.5 tiles rather than making contact.',
      test: has('ranged') },

    { id: 'groundSplash', label: 'Splashes ground', family: 'splash',
      definition: 'Damages an area on the ground, by any means — attack, death, or the units it leaves behind.',
      test: has('groundSplash') },
    { id: 'airSplash', label: 'Splashes air', family: 'splash',
      definition: 'Damages an area in the air. Not every ground splasher can: Valkyrie and Bowler cannot.',
      test: has('airSplash') },

    { id: 'wincon', label: 'Win condition', family: 'role',
      definition: 'A card decks are built around to take towers, by deckshop.pro’s list.',
      test: has('wincon') },
    { id: 'spawns', label: 'Spawns units', family: 'spawn',
      definition: 'Produces extra units after being played — on a timer, on death, or from an ability.',
      test: has('spawns') },
    { id: 'deathDamage', label: 'Death damage', family: 'death',
      definition: 'Deals damage when it dies — Golem, Balloon, Giant Skeleton, Ice Golem.',
      test: has('deathDamage') },
    { id: 'multiUnit', label: 'Deploys 2+ units', family: 'count',
      definition: 'Places more than one unit at once. Not the same as spawning, which happens later.',
      test: has('multiUnit') },

    { id: 'bigTank', label: 'Big tank', family: 'tank',
      definition: 'A high-hitpoint card played out front to absorb damage.', test: has('bigTank') },
    { id: 'miniTank', label: 'Mini tank', family: 'tank',
      definition: 'A mid-hitpoint card that can absorb some damage without being a full tank.',
      test: has('miniTank') },

    // On probation - these describe a matchup rather than a property of the
    // card, so they are the least guessable chips in the set. See TASKS.md.
    // If they go, remove both.
    { id: 'groundTankKiller', label: 'Ground tank killer', family: 'tk',
      definition: 'Used to bring down ground tanks quickly, by deckshop.pro’s list.',
      test: has('groundTankKiller') },
    { id: 'airTankKiller', label: 'Air tank killer', family: 'tk',
      definition: 'Used to bring down air tanks quickly, by deckshop.pro’s list.',
      test: has('airTankKiller') },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/** Every category must carry a player-facing rule. Guarded, not assumed. */
export const CATEGORIES_MISSING_DEFINITION = CATEGORIES
    .filter((c) => !c.definition || c.definition.length < 10)
    .map((c) => c.id);

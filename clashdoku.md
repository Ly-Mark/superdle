# ClashDoku — Grid Mode Spec (Scoping Brief)

A PokeDoku-style 3×3 grid mode for clash.ac. Rows and columns are categories;
each cell must be filled with a card matching both. 9 cells, 9 guesses, no card
reuse, daily reset, uniqueness scoring.

Feasibility is proven: with ~116 cards and only 23 basic categories, brute force
finds **~10,000–54,000 valid grids** depending on strictness (≥3–5 answers per
cell, attribute-family diversity). That's decades of dailies before any category
expansion. The scripts live in the session workspace (`cards.py`, `feas.py`,
`feas2.py`) — rerun them against the real card JSON for exact counts.

---

## 1. Category catalog

### Tier 1 — already in the card data (free)
- **Rarity:** Common / Rare / Epic / Legendary / Champion
- **Elixir:** ≤2 / 3 / 4 / 5+ (buckets, not exact values 6–9 — too sparse)
- **Type:** Troop / Spell / Building
- **Targeting:** Hits air / Ground-only / Targets buildings only
- **Speed:** Fast or Very Fast / Slow
- **Release era:** Launch card (2016) / 2018+ / 2021+
- **Arena:** Training Camp / unlocks Arena 10+

### Tier 2 — one boolean per card to add (a few hours of data entry)
- **Splash damage**
- **Spawns other units** (huts, Witch, Golem death-split, Lava Hound…)
- **Win condition** (community-standard list)
- **Flying unit**
- **Has an Evolution** (keep updated as Supercell adds them)
- **Ranged attacker** / **Melee attacker**
- **Multi-unit card** (deploys 2+ units: Archers, Skeleton Army, Royal Hogs…)
- **Death effect** (death damage, death spawn: Balloon, Giant Skeleton, Golem…)
- **Champion ability** (trivial subset but pairs well)

### Tier 3 — family/species tags (the fun ones; user-suggested)
One `family` array per card. A card can belong to several.
- **Skeleton family** — Skeletons, Skeleton Army, Guards, Giant Skeleton,
  Skeleton Barrel, Skeleton King, Tombstone, Graveyard, Wall Breakers,
  Bomber, Balloon…
- **Goblin family** — Goblins, Spear Goblins, Goblin Gang, Goblin Barrel,
  Goblin Hut, Goblin Giant, Goblin Cage, Goblin Drill, Dart Goblin,
  Goblin Machine, Goblinstein…
- **Human/Villager family** — Knight, Musketeer, Prince, Wizard family,
  Barbarians, Bandit, Lumberjack, Fisherman, Archer Queen…
- **Wizard family** — Wizard, Ice Wizard, Electro Wizard, Witch, Mother Witch,
  Night Witch, Magic Archer (define the boundary once, document it)
- **Dragon family** — Baby Dragon, Inferno Dragon, Electro Dragon, Skeleton
  Dragons, Phoenix (debatable — decide and document)
- **Royal family** — Royal Giant, Royal Hogs, Royal Recruits, Royal Ghost,
  Royal Delivery, Prince, Princess, Little Prince…
- **Spirit family** — Fire/Ice/Electro/Heal Spirit
- **Barbarian family**, **Minion family**, **Hog family**
- **Undead** (broader than skeleton: adds Royal Ghost, Phoenix…)

### Tier 4 — mechanic/trivia tags (stretch; add over time as content drops)
- **Stuns or slows** (Zap, Ice Spirit, Electro cards, Freeze…)
- **Resets targets** (Zap, Lightning, Fisherman pull…)
- **Charges/dashes** (Prince, Dark Prince, Bandit, Ram Rider, Battle Ram…)
- **Invisible/untargetable at times** (Royal Ghost, Bandit dash, Miner tunnel)
- **Shield** (Guards, Dark Prince, Royal Recruits, Skeleton King ability)
- **Appeared in Clash of Clans** (Barbarians, Giant, Balloon, P.E.K.K.A…) —
  nice cross-IP hook for the SupercellDle vision
- **Free-to-cycle / cheapest in class**, **Was once 1 elixir**, etc. (trivia)

Rule of thumb: ship Tier 1+2 and 4–6 families from Tier 3 at launch
(~35 categories). Add 1–2 new categories monthly as a content cadence —
this is the anti-staleness lever.

## 2. Data model changes

Extend each card in the existing JSON:

```json
{
  "name": "Skeleton King",
  "rarity": "Champion", "cost": 4, "type": "Troop",
  "targets": "ground", "speed": "Medium", "year": 2021, "arena": 15,
  "tags": ["splash", "spawner", "death_effect", "champion_ability"],
  "families": ["skeleton", "undead", "royal"]
}
```

Categories are defined in one file as `{id, label, predicate}` — predicates over
these fields. Adding a category = adding a tag + one entry. No component changes.

## 3. Puzzle generation (build-time, not runtime)

1. **Pair matrix:** for all category pairs, precompute the intersection card
   lists. Keep pairs with ≥3 answers (tune: 4–5 for a more forgiving game).
2. **Grid enumeration:** all {3 rows} × {3 cols} with every intersection valid.
3. **Quality filters:**
    - No attribute family (rarity/cost/type/year) more than twice per grid
    - At least one Tier 2/3 category per grid (kills boring database grids)
    - Optional difficulty score = sum of cell answer counts (small = hard);
      schedule easy grids Mon, hard Sat, like crosswords
4. **Daily selection:** seeded PRNG over the pool (same daily-seed logic as
   Classic), with a spacing rule: reject grids sharing ≥4 categories with any
   of the last 30 days.
5. Output: static `puzzles.json` (or generate deterministically client-side
   from the seed — consistent with the site's no-backend architecture).

Validation to run in CI: every published grid solvable, every cell ≥ min
answers, spacing rule holds for a simulated year.

## 4. UI (reuses redesign-brief components)

- 3×3 grid of panel-styled cells; category chips on top and left (pill badges)
- Click cell → card search modal (reuse Classic's autocomplete; filter out
  already-used cards)
- Correct: card art fills the cell + gold glow pop. Wrong: shake, guess counter
  decrements. 0 guesses or 9 cells = end state
- Score: guesses used + uniqueness % per cell (client-side approximation at
  first: score by card "obscurity weight"; true crowd-% needs a backend later)
- Share result: emoji grid (🟩/⬛ + score), like Wordle
- New mode pill: **Grid**, route `/clashroyale/grid`

## 5. Implementation phases

- **Phase 1 — data (1–2 sessions):** add `tags` + `families` to card JSON
  (Tier 2 + 5-ish families). Port the feasibility script into the repo as a
  Node script; verify counts against real data.
- **Phase 2 — generator (1 session):** pair matrix, grid enumeration, filters,
  seeded daily selection, CI validation.
- **Phase 3 — UI (2–3 sessions):** grid component, cell search modal, guess
  logic, end states, localStorage stats (streak, avg guesses).
- **Phase 4 — polish:** share card, difficulty curve, uniqueness scoring,
  monthly category-drop cadence.

## 6. Open decisions

1. Min answers per cell: 3 (harder, bigger pool) vs 5 (fairer, still 10k+ grids)
2. Family boundary calls (is Phoenix a dragon? is Witch a wizard?) — write a
   `families.md` doc so answers are consistent and disputable-but-documented
3. Wrong-guess feedback: silent miss (PokeDoku-style) vs showing which axis
   matched (more forgiving, our own twist)
4. Uniqueness scoring without a backend: static obscurity weights now,
   real crowd data if/when a backend exists
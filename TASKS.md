# TASKS

Working board for Clashdle. Maintained by Claude Code — see the "Task board
protocol" section of `CLAUDE.md` for the update rules.

**Last updated:** 2026-08-02
**Current branch:** `p8-clashdoku` — cut from `main` after PR #12 merged.
Holds the ClashDoku scoping (T36–T39). `main` is clean.
**Next branch:** `p6-code-migration` — cut and waiting, starts with T9.

> **`p6-code-migration` must be rebased onto `main` before any work on it.**
> It was cut *before* `p7`, which then rewrote `ClassicGame.jsx`,
> `CRBackground`, the nav and the tile styling — exactly the files T9, T24f
> and T22 touch. Rebasing after starting means resolving those conflicts
> twice. `git checkout p6-code-migration && git rebase main` first, then
> confirm `npm run build` still passes before writing any code.

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Open decisions

- **Rush icon — keep the helm?** Owner said fine, so this is closed unless the
  view changes. Recorded because the measurement is worth keeping: the helm
  inks **39%** of its canvas against 71–74% for the other three, so it carries
  about half their visual weight and is the least legible of the four at 20 px.
  Per-icon `size` overrides in `GameModeNav` compensate. **Tune those before
  touching the artwork.** Crossed swords would fill a square better if it is
  ever revisited.

- **T31 · Guess bar scrolls off on Classic — approach undecided.** The board
  grows past a screenful, so reading earlier guesses takes the input away with
  it. Real problem, still unsolved.
  *Attempt 1, reverted:* `sticky top-12` on a blurred band. Sticking it needs
  an opaque backdrop or the board scrolls visibly through, and that band read
  as a dark slab across the page.
  *Options:* a floating pill · a compact bar that only appears once scrolled
  past the input *(recommended)* · move the board into its own scroll container
  so the page never scrolls. **Do not just re-apply `sticky` with a background.**

---

## `clashdoku` — new grid mode (scoped 2026-08-02)

Brief is `clashdoku.md` at the repo root. PokeDoku-style 3×3: rows and columns
are categories, each cell takes a card matching both. 9 cells, 9 guesses, no
card reuse, daily reset.

**Settled by owner 2026-08-02 — do not relitigate:**
- **No diagonals.** Row × column only. A diagonal applies to 3 cells and the
  centre sits on both, so cells would carry 2, 3 or 4 constraints depending on
  position — unrenderable next to a row chip and a column chip.
- **Min 4 answers per cell.**
- **No uniqueness scoring.** A flat points system instead. Uniqueness needs
  crowd data, and inventing "obscurity weights" and showing them as a percentage
  is the same fake-number objection that killed T17.
- **Axis feedback on a wrong guess** — show which of the row/column matched and
  which did not. Our twist on PokeDoku's silent miss.
- **Its own data file.** Nothing about this mode goes in `cards.json`.
- **`targets` stays**, collapsed to a 3-category taxonomy — see T36.
- **No category may appear twice in one grid.** Six distinct headers, so
  `Common × Common` can never occur. This is what the enumeration assumes.
- **Splash and flying are partitions, not booleans** — splash/single-target,
  flying/grounded. Two categories each for the same data entry.
- **Cost buckets are `≤2 / 3 / 4 / 5+`,** and a card may sit in more than one:
  `Spirit Empress` is `"3 / 6"`, so it counts in both `Cost 3` and `Cost 5+`.
  The generator must split on `/` rather than parse a single number.

**Measured launch pool: 51,768 grids at MIN=4**, using only data that exists
today (23 categories: rarity, cost, type, year, targets, arena, Goblin,
Undead). No Tier 2 tag is required to ship. Every one of the 23 appears in at
least 484 grids, so none is dead weight.

- [ ] **T36 · Build the ClashDoku data file**
  `src/data/clashdoku.json`. Borrows `card`/`rarity`/`cost`/`type`/`year`/
  `arena` and `targets` from `cards.json`; drops `moveSpeed` and
  `healthCategory` (both are dirty — `moveSpeed` has `"Medium / Very Fast"` and
  `"None"`; `healthCategory` has *both* `"High / Medium"` and `"Medium / High"`
  as distinct values). Adds `tags` and `families` per the brief's Tier 2/3.

  **Targeting taxonomy — settled 2026-08-02.** The raw field has 7 values and
  is not usable as-is. It collapses to a clean 4-way partition; verified that
  all 121 cards land in exactly one bucket, no overlap, no card left out:

  | Bucket | Raw `targets` values | Cards | Use as a category? |
  |---|---|---|---|
  | **Hits air** | anything containing `Air` | 57 | yes |
  | **Ground only** | `Ground`, `Buildings / Ground` | 42 | yes |
  | **Targets buildings only** | `Buildings` | 14 | yes — this is the win-condition axis |
  | **Attacks nothing** | `None`, `Other` | 8 | **no — too thin at MIN=4** |

  - **Spells are fine and do not need special handling.** The worry does not
    survive contact with the data: 15 spells hit air (Arrows, Zap, Fireball,
    Rocket…) and 4 are ground-only (The Log, Earthquake, Barbarian Barrel,
    Graveyard). Those match how players already talk about them — "The Log
    doesn't hit air" is common knowledge, not a technicality.
  - **"Attacks nothing" is a bucket, not a category.** Its 8 members are the
    spawner buildings (Furnace, Goblin Hut, Tombstone, Barbarian Hut, Goblin
    Cage), Elixir Collector, Goblin Barrel and Mirror. At 8 cards it can almost
    never reach 4 answers against a second category. Those cards simply fail
    all three targeting predicates — which the partition already gives us free.
  - **Exclude `Mirror` from ClashDoku entirely.** It is uncategorisable on two
    axes at once: `targets: "Other"` and `cost: "Other"`.
  - **`Spirit Empress` (`cost: "3 / 6"`) belongs to both `Cost 3` and `Cost 5+`**
    — settled by owner. Cost is therefore *not* a strict partition; the
    predicate splits on `/` and tests every value. **It is the only dual-cost
    card** once Mirror is excluded — 63 cards contain a `/` somewhere, but all
    the others are multi-targeting (`Air / Ground`) or two-unit cards with
    split speed/HP (Rascals, Guards, Dark Prince, Battle Ram, Goblinstein,
    Little Prince). Write the predicate generally anyway.
    **Rejected: giving it two entries** (one ground at 3, one flying at 5+).
    Two rows sharing a `card` name break the search modal (two identical
    options, indistinguishable), break card-art keying, and make the no-reuse
    rule ambiguous. Membership in both buckets already produces identical grid
    behaviour, and correctly still allows only one use per grid.
    *Unknown:* what the `3 / 6` represents mechanically. Nobody has confirmed
    it. It does not change the grid logic either way, but it may change what
    the chip should be labelled.
  - **Year buckets must be disjoint.** The brief proposes `2016 / 2018+ /
    2021+`, but `2021+` is a strict subset of `2018+` — a grid drawing both as
    rows would make one row's cells a subset of the other's. Use
    **`2016–17` (78) / `2018–20` (23) / `2021+` (19)** instead.
    *Related trap for the generator:* nested pairs exist across families too —
    `Human family` and (had we shipped it) `Grounded` are both strict subsets
    of `Troop`. **Nesting is a quality problem, not a correctness one:** the
    grid is still solvable, but one row's cells become a subset of the other's,
    which reads as redundant. Add a grid-level filter that rejects any grid
    containing a nested pair, rather than banning the categories or trying to
    spot them all by hand.
  - *Content note:* **78 of 120 cards are 2016–17.** The set is heavily
    launch-weighted, which is why the era family only supports three buckets.
  - **`arena` stays, bucketed. Do not drop it.** An earlier pass killed the
    whole arena family after testing only `Training Camp` (8 cards) — testing
    one category and concluding about a family. The brief's other arena
    category, "unlocks Arena 10+", is 58 cards and was never tested. Bucketed
    by unlock order it is the strongest cheap category family available:

    | Bucket | Cards |
    |---|---|
    | Arena 1–5 (early) | 24 |
    | Arena 6–10 (mid) | 38 |
    | Arena 11+ (late) | 50 |

    | Category set | Grids at MIN=4 |
    |---|---|
    | Tier 1, no arena (18) | 6,322 |
    | + arena buckets (21) | **33,474** |
    | + Goblin family (22) | **39,802** |

    A 5× multiplier for less work than one Tier 2 tag. `Training Camp` on its
    own stays dropped at 8 cards; it folds into "Arena 1–5".
    **Cost: a 19-entry arena-name → unlock-order lookup.** `cards.json` stores
    arena *names* only, with no ordering. Factual, one-time, no judgment.
    **The ordering used for these numbers came from general knowledge of the
    game, not from anything in the repo — verify it against the live game
    before shipping.** A wrong order makes the buckets quietly wrong.
  - **`Champion` is thin at 8** but survives, because it still pairs with the
    large categories. Expect it to appear only against Troop / Hits air / cost
    buckets.

  **How the pool grew during scoping**, all measured at MIN=4 on real data:

  | Category set | Grids |
  |---|---|
  | Tier 1 without arena (18) | 6,322 |
  | + arena buckets (21) | 33,474 |
  | + Goblin family (22) | 39,802 |
  | **+ Undead, disjoint year buckets (23)** | **51,768** |

  An intermediate conclusion on this board — *"Tier 2 is the launch
  requirement"* — was **wrong and has been removed.** It rested on the 6,322
  figure, which was itself the product of wrongly dropping arena. With arena
  restored there is no volume problem to solve.

  *Why it grows faster than the category count:* variety comes from **which
  six categories are drawn together**, not from how many cards a category
  holds, so the pool scales with C(n,3)² — combinations, not categories. The
  max-two-per-family rule over 6 headers forces at least 3 distinct families
  per grid, and that is the binding constraint. Each new family relaxes it
  rather than just adding options, which is why arena (one family, 3
  categories) outperforms four independent Tier 2 booleans.

  *Corollary worth remembering:* **a category does not have to be large to
  earn its place.** It only has to reach 4 answers against the categories it
  gets paired with. One that pairs well with 15 others beats a bigger one that
  pairs with 5.

  **Tier 2 tags — settled by owner 2026-08-02. Four, framed as six
  categories:**

  | Tag | Categories it yields | Family |
  |---|---|---|
  | Splash | `Splash` / `Single-target` | `damage` |
  | Flying | `Flying` / `Grounded` | `mobility` |
  | Win condition | `Win condition` | own |
  | Spawns units | `Spawns units` | own |

  Splash and flying are **partitions, not booleans** — two categories each for
  identical data entry, and the max-two-per-family rule handles them for free.
  *Not shipping:* **has Evolution** (upkeep every time Supercell ships one),
  **ranged/melee** (a near-partition of troops, so it duplicates the `targets`
  axis rather than adding one), **multi-unit**, **death effect**.

  **Drafted and measured 2026-08-02.** Lists were authored from general
  knowledge of the game, **not** from repo data — every membership call needs
  owner review before it ships. Measured one at a time against the settled 23:

  | Tag | Cards | Pool after | Gain |
  |---|---|---|---|
  | **Human family** | 44 | 91,618 | **+77%** |
  | **Spawns units** | 20 | 88,002 | **+70%** |
  | Win condition | 20 | 65,318 | +26% |
  | Flying | 13 | 57,320 | +11% |
  | ~~Grounded~~ | 75 | 100,412 | +94% |
  | *all five (28 categories)* | — | **305,454** | — |

  - **`Human family` (Tier 3) is the biggest single lever in the whole brief**,
    bigger than any Tier 2 tag. Raised by owner 2026-08-02; the earlier
    "families are a weak lever" conclusion was drawn from the small species
    families and does not hold for this one. 44 cards, and it is the broad
    "not goblin, not skeleton, not machine" axis the others lack.
    *Excluded and arguable:* PEKKA, Mini PEKKA, Sparky, Cannon Cart, Zappies,
    Skeleton King, Royal Ghost, Goblinstein. *Included and arguable:* Giant,
    Royal Giant, Electro Giant, Guards.
  - **Win condition and Spawns units are both 20 cards but not equally
    valuable** — +26% against +70%. Win conditions cluster (nearly all cost 4+,
    nearly all ground troops, many `Buildings only`) so they intersect thinly
    with everything; spawners spread across buildings, troops and spells.
    Keep win condition for flavour, not volume.
  - **Ship `Flying` as a plain boolean. Drop `Grounded`.** The split is 13/75,
    too lopsided to work as a partition, and `Grounded` is defined as
    troop-and-not-flying so it is a strict subset of `Troop` — a near-duplicate
    chip, and a dull one. **This reverses the partition advice above for
    flying specifically**; splash/single-target may still be worth partitioning,
    but that cannot be checked until the splash data exists.

  **These are texture, not volume.** The measured pool without any Tier 2 tag
  is already 51,768. Author them because `Win condition × Cost ≤2` is a better
  puzzle than `Epic × Arena 6-10`, not to reach a target.

  **Tier 3 families — measured 2026-08-02. Ship Goblin and Undead, stop there.**
  Measured cumulatively, against the pre-arena baseline of 6,322:

  | Added | Total grids | Grids containing a family | Hand-added members |
  |---|---|---|---|
  | none | 6,322 | 0 | — |
  | **+ Goblin family (13)** | **8,016** | **1,694** | **0** |
  | + Undead (16) | 11,686 | 5,364 | 10 |
  | + Royal (11), Electric (10), Big tank (13), Fire/Ice (11) | 15,850 | 9,528 | 17 more |

  *Species* families are a smaller lever than they look: 10–16 cards each, and
  a small category struggles to reach 4 answers in intersection. The four
  beyond Goblin and Undead add ~4k grids between them for 17 hand-added
  members and a pile of boundary arguments.
  **This does not generalise to `Human family`** — at 44 cards it behaves like
  a broad attribute rather than a species tag, and it is the largest single
  addition available. See the Tier 2 block above.

  - **`Undead` is confirmed by owner 2026-08-02** and ships alongside Goblin.
    Build it as name-stem `skeleton` plus an explicit member list — skeletons,
    the witches, Balloon, Royal Ghost, Guards, Tombstone, Graveyard, Bats,
    Phoenix. 16 cards. Write the boundary down so it stays arguable rather
    than arbitrary.
  - **`Goblin family` is free and should ship.** 13 cards from a pure
    substring match on `card`, no exceptions, no judgment calls, and it
    self-maintains — any future card named `Goblin X` joins automatically. Best
    effort-to-value item in the whole brief.
  - **Every other family needs hand-added members**, because names alone are
    too thin: Skeleton and Giant hit 6, Royal and Spirit 5, Dragon and
    Barbarian 4. **56 of 121 cards match no family stem at all** (Knight,
    PEKKA, Valkyrie, Sparky, Miner, Bandit, every spell).
  - Families also carry judgment cost Tier 2 does not. "Does it deal splash
    damage" has an answer; "is Phoenix a dragon, is Balloon skeleton family"
    are arguments. The brief concedes this by asking for a `families.md`.
  - **The case for families is texture, not volume.** `Goblin family × Cost ≤2`
    is a better cell than `Splash × Cost ≤2`. Worth one or two, not six.
  - Treat all families as a single attribute family for the max-two rule — a
    grid with three species rows would read as a gimmick.

  **Drop "Champion ability" from the Tier 2 list.** It is not data entry — it
  is exactly `rarity === "Champion"`, the same 8 cards as the existing Champion
  category. It would be a duplicate, and one of the thinnest. That leaves 9
  candidate Tier 2 tags, not 10.

  *Two traps:*
  - **Never add these fields to `cards.json`.** `compareAttributes` in
    `utils/clashroyale/gamelogic.js` iterates `Object.keys(target)` and skips
    only `card`, `healthValue` and `hint*`. A `tags` key there silently becomes
    a colour-coded guess attribute in Classic.
  - **Never add or remove a card.** `getDailyCard` mods by `cards.length` (121).
    Changing the count rewrites every past and future Classic and Description
    answer. A separate file sidesteps this only if its card list stays a strict
    subset — worth a build-time assert that it does.

- [ ] **T37 · Generator: pair matrix, enumeration, filters, daily selection**
  Blocked by T36. Precompute category-pair intersections, keep pairs with ≥4
  answers, enumerate valid 3×3s, filter (no attribute family more than twice
  across the six headers), select by seeded PRNG.
  **Generate client-side from the daily seed, not into a committed
  `puzzles.json`** — consistent with the other four modes, and a committed file
  is one more thing to regenerate every time a category changes.
  Feasibility is proven against the real 121 cards, not the brief's ~116:
  **37,032 grids at MIN=4 with all Tier 1 categories** (see the pool note in
  the open decision below).

- [ ] **T38 · ClashDoku UI**
  Blocked by T37. 3×3 of panel cells, category chips top and left, cell → card
  search modal reusing Classic's autocomplete with used cards filtered out.
  Guess counter, end states, localStorage stats, emoji share grid.
  *Route wiring is three files, not one — see the T39 note before starting.*

- [ ] **T39 · Wire the route in all three places**
  `src/App.jsx` (lazy import + `<Route>`), `scripts/prerenderRoutes.mjs`
  (`STATIC_ROUTES`) and `src/routeMeta.js` (title + description).
  **Missing the `prerenderRoutes.mjs` entry is a hard 404, not a bad title** —
  `public/_redirects` no longer carries the SPA catch-all (it was removed
  deliberately; it made every typo return the homepage with HTTP 200, which
  Google treats as a soft 404). Verify by byte size and markup, not exit code.
  *Also decide:* the brief calls the mode ClashDoku but proposes the pill
  "Grid" and the route `/clashroyale/grid`. Pick one and make all three agree.

## Blocked on account access — not code

- [ ] **T20 · Submit the sitemap in Google Search Console**
  Cloudflare's managed `robots.txt` intercepts `/robots.txt` and serves its own
  AI-crawler-blocking version, so our `Sitemap:` line never reaches crawlers.
  Proven: `/robots.txt` has no Sitemap line, `/robots.txt?x=1` (which bypasses
  the interception) has it. The deployment is correct.
  *Fix:* add `clash.ac` as a **Domain** property in Search Console, verify with
  a TXT record in Cloudflare DNS, then submit `sitemap.xml`.
  Live sitemap is correct and complete: **130 URLs, 122 card pages.**

- [ ] **T21 · EU consent banner (CMP)**
  Google requires a *certified* consent management platform to serve
  personalised ads in the EEA, UK and Switzerland. Google's own is free and is
  **delivered through the AdSense script already on the page** — a dashboard
  task with no code change.
  *Owner:* AdSense → Privacy & messaging → GDPR → create message → publish.
  A hand-rolled banner would not satisfy the certified-CMP requirement and
  would look compliant without being so, so nothing has been built.
  *Follow-up once published:* a "Privacy options" footer link that reopens the
  dialog. It calls a function the CMP defines, so it would be a dead link until
  the message exists.
  Until then `/privacy` states the position honestly: no banner means the ads
  served are non-personalised.

- [ ] **T8 · Resubmit to AdSense.** Site side is done. Best after T20 and T21.

---

## `p6-code-migration` — maintenance debt

- [ ] **T9 · Migrate `ClassicGame.jsx` onto `useDailyModeGame`**
  **The highest-value item on this board, and the case got stronger on
  2026-08-02.** Classic predates the shared hook and reimplements daily-state,
  storage-key and stats logic inline across ~800 lines. Two real user-facing
  bugs were found during `p7` that existed *only* because of that duplication:
  - **T26** — progress was never saved unless you won, so leaving Classic
    mid-game lost the board. Description was fine; the hook already guarded
    correctly at `useDailyModeGame.js:72`.
  - **T27** — Classic carried its own copy of `CRBackground`, so a change to
    the shared one landed on every route except the homepage.
  Both were invisible until something forced a comparison. Assume more.

- [ ] **T24f · Guess tiles + motion** *(carried over from `p7`)*
  Gradient fill, darker border and inner shadow per state; a distinct treatment
  for higher/lower arrow tiles versus plain wrong; staggered reveal. Hover lift
  and transitions on interactive elements, all behind `motion-safe:`.
  **Deliberately left for this branch** — the tiles live in `ClassicGame`,
  which T9 rewrites wholesale, so doing it on `p7` meant building them twice.
  **Do not touch the higher/lower arrow direction logic** — `RushGame.jsx:91`
  documents why it looks inverted.

- [ ] **T11 · Wire lint into CI**
  0 errors, 7 warnings, but `npm run lint` still is not run by CI so it can rot
  again. Warnings are unused vars in `ClassicGame`, `RushGame`,
  `WinPanelCompact`, plus one `exhaustive-deps`.

- [ ] **T22 · Collapse `CardPortrait` and `CardThumb` into `CardArt`**
  Three near-identical components render card art. `CardArt` is the shared one;
  `ClassicGame` still has its own `CardPortrait` and `CardThumb` is a third.
  Left alone so far because consolidating means touching the game board.

- [ ] **T10 · Collapse the slugify implementations**
  `slug` (routes), `slugifyCardName` (images), `deckshopSlug` (outbound), and an
  inline copy in `ClassicGame`. They agree today; nothing enforces that.

- [ ] **T12 · Decide the fate of the Brawl Stars scaffold**
  `src/components/brawlstars/`, `src/data/brawlers.json`,
  `src/utils/brawlstars/gamelogic.js`. No route, nothing imports them. Wire up
  or delete — it currently misleads anyone reading the tree.

---

## UI/UX — remaining

- [ ] **T23 · Furnace renders small on the game board** *(owner picking up)*
  The only square source image (850×850; everything else is portrait) and its
  artwork fills 44% of the canvas against a median of 80%. The card guide trims
  padding under a 60% threshold; `ClassicGame` uses the full-size asset, so it
  is still small there. Fixing it properly means editing the source image.

- [ ] **T34 · Mobile pass at 390 px — never verified by anyone**
  Three `p7` changes take a different path on small screens and none has been
  looked at: the diamond overlay falls back to `scroll` + `100vw auto` below
  768 px, heading sizes step down, and the nav pills now carry icons on a
  narrow row. Build-verified only, which proves nothing about how it looks.

- [ ] **T35 · `ModeHero` is Classic-only**
  Description, Rush and Memory still lead with `ModeIntro`, which carries its
  own `<h1>`, so dropping `ModeHero` in would give them two. If the chip row is
  wanted there, `ModeIntro` has to hand over its heading first.

---

## Optional, not blocking

- [ ] **T16b · Strategy articles.** Rarity explainers, arena progression, elixir
  economy. Would add depth; the site no longer needs them to clear the
  thin-content bar.

- [ ] **T17 · Rush leaderboard** *(deferred by owner 2026-08-01)*
  Needs a backend, which the Scope rule in `CLAUDE.md` forbids without an
  explicit decision. The reference mock showed invented numbers; publishing
  fake engagement figures was rejected outright.

- [ ] **T13 · Prune stale branches** *(surveyed 2026-08-02)*
  **`origin/bug-description-game-copy` is the open PR showing in GitHub
  Desktop, and it is obsolete.** It fixed Description's share text producing
  blank emojis, but that fix is already on `main` — `shareTextOverride` exists
  at `DescriptionGame.jsx:269` and `WinPanelCompact.jsx:128`, so the work
  landed some other way. The branch is 2 ahead / 58 behind and would conflict
  across three files `p7` just rewrote, to re-apply something already there.
  *Recommended:* close the PR unmerged, delete the branch.
  **Fully merged, safe to delete now:** `feature/rushmode`, `p5-adsense`,
  `p7-ui-polish` (local).
  **Have unmerged commits — check before deleting:**
  `feature-mobile-responsiveness` (7 — possibly relevant to **T34**),
  `pr4-gameplay-polish` (3), `p3-og-meta` (1),
  `bug-description-game-copy` (2, superseded per above).

---

## Durable notes from the `p7` work

Not tasks — decisions and traps that would otherwise be rediscovered the hard
way. Everything else about `p7` is in git.

- **Gold is an action colour, never a heading colour.** Owner rejected gold
  headings on sight. Confining it to the submit button and the active nav pill
  also sidesteps a collision: the accent and the "close match" tile state were
  the same amber, so a gold button read as a partial match.
- **Tile hues are Supercell's and do not move.** Green/amber/red come from the
  games. When the accent needed separating from the tiles, the *accent* moved.
- **`shadow-glow-gold` duplicates `gold.DEFAULT` by necessity** — a box-shadow
  cannot reference a colour token. If the accent moves, move both.
- **Never render a date-derived value during the prerender pass.**
  `getDayIndex()` reads `new Date()`, so the build date would be baked into the
  shipped HTML, indexed by crawlers, and mismatched on hydrate. `ModeHero`
  renders the day chip from `useEffect`. Same reason the blob field is
  hand-placed rather than generated.
- **Do not fade prerendered images in from `opacity-0` via React state.** The
  HTML would ship with every image invisible and depend on JS to reveal them.
  `CardArt` paints its placeholder *underneath* instead. Also: `onLoad` never
  fires for an image the browser decoded before hydration, so it checks
  `img.complete` on mount.
- **`backdrop-blur` does not scale to lists.** It makes the compositor sample
  everything behind the element. `PANEL_CARD` is the blur-free variant; use it
  for anything rendered many times on one page.
- **`min-h` does not align a grid** — a minimum still lets a row grow.
  `grid-auto-rows` plus `line-clamp` is what actually guarantees equal boxes.
- **No backticks inside the `<style>` template literals** in `CRBackground` —
  one closes the string and breaks the build.
- **Verify prerender by byte size and markup, not by exit code.** A route that
  throws still exits 0. Grep the built HTML for `<!--$!-->` and check `<h1>`
  counts; a green build proves nothing.
- **Icons: measure ink coverage, not just canvas size.** Two correctly-made
  96×96 files can carry very different visual weight — the mode icons range
  from 39% to 74% ink, which is why they need per-icon size overrides.

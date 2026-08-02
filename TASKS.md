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

- **T36 · Which 4 Tier 2 tags ship first?** Tier 1 alone produces zero grids
  that pass the quality filter, so this decides whether the mode is playable,
  not how deep it is. Candidates, minus the redundant "Champion ability":
  splash damage · spawns units · win condition · flying unit · has Evolution ·
  ranged · melee · multi-unit · death effect.
  *Recommended four:* **win condition, splash damage, flying unit, spawns
  units.** They are the ones players already have a mental list for, which
  keeps the data entry arguable rather than arbitrary, and they spread across
  types instead of clustering in troops.
  *Avoid at launch:* **has Evolution** (needs upkeep every time Supercell ships
  one) and **ranged/melee** (a near-partition of troops, so it behaves like a
  second `targets` axis rather than a new one).

- **T36 · `Spirit Empress` has `cost: "3 / 6"`.** Pick 3 or 6 and document it.

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
  - **`Spirit Empress` has `cost: "3 / 6"`.** Pick one and document it.
  - **Drop `Training Camp` as a category** — 8 cards, same thinness problem.
    That removes the `arena` family from the generator altogether.
  - **`Champion` is thin at 8** but survives, because it still pairs with the
    large categories. Expect it to appear only against Troop / Hits air / cost
    buckets.

  **Measured pool, Tier 1 only** (18 categories, Mirror excluded, MIN=4, no
  attribute family more than twice): **6,322 grids — and none of them are
  usable.** The brief's own quality filter demands at least one Tier 2/3
  category per grid, which no Tier-1-only grid can satisfy. Every one of the
  6,322 is `Common × Troop`-shaped: a database query, not a puzzle.
  **Tier 2 is therefore not polish. It is the launch requirement.**

  **Tier 2 sensitivity — MODELLED, NOT MEASURED.** The booleans do not exist in
  `cards.json` yet, so this cannot be measured until this task is done. Numbers
  below use synthetic membership at plausible sizes with type restrictions
  where the brief implies them:

  | Tier 2 tags | Categories | Total grids | Passing quality filter |
  |---|---|---|---|
  | 0 | 18 | 6,322 | **0** |
  | 2 | 20 | 16,162 | 9,840 |
  | 4 | 22 | 24,722 | 18,400 |
  | 6 | 24 | 51,482 | 45,160 |
  | 9 | 27 | 167,538 | 161,216 |

  **These are upper bounds.** Synthetic tags are uncorrelated with cost and
  rarity; real ones correlate hard (splash clusters in spells, win conditions
  in cost 5+), which shrinks intersections. The shape is trustworthy, the
  magnitude is not. Re-run for real once the tags are authored.

  *Why it grows faster than the category count:* after dropping arena, Tier 1
  has only **5 families** (rarity, cost, type, year, targets), and the
  max-two-per-family rule over 6 headers forces at least 3 distinct families
  per grid. That is the binding constraint. Each Tier 2 tag is its own
  independent family, so adding them relaxes it rather than just adding
  options.

  **Ship 4 Tier 2 tags, not 9.** Four gets ~18k filter-passing grids, which is
  decades. Nine is solving a problem we do not have, and every tag is manual
  data entry that has to stay correct as Supercell ships cards.

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

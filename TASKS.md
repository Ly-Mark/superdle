# TASKS

Working board for Clashdle. Maintained by Claude Code — see the "Task board
protocol" section of `CLAUDE.md` for the update rules.

**Last updated:** 2026-08-03
**Current branch:** `main` — `p8-clashdoku` merged via **PR #13** on
2026-08-03. T36 and T37 are on `main`; T38–T40 are open and need a new branch
cut from `main`.
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
- **Min 5 answers per cell.** Raised from 4 on 2026-08-03: 44 category pairs
  sat exactly on the old floor, so one mis-tagged card could take a player's
  real options to 3, and the most exposed categories are hand-authored. 6 is
  the next step but it kills `Champion`.
- **No uniqueness scoring.** A flat points system instead. Uniqueness needs
  crowd data, and inventing "obscurity weights" and showing them as a percentage
  is the same fake-number objection that killed T17.
- **Axis feedback on a wrong guess** — show which of the row/column matched and
  which did not. Our twist on PokeDoku's silent miss.
- **Its own data file.** Nothing about this mode goes in `cards.json`.
- **`targets` stays**, collapsed to `Can attack air` / `Attacks ground only` /
  `Attacks buildings only`. An exact partition; no card attacks air alone.
  **The labels say "attacks" deliberately** — "Ground only" read as though it
  meant where a card walks, which is the `flying` axis. Goblin Gang is not in
  it, because its spear goblins shoot air.
- **No category may appear twice in one grid.** Six distinct headers, so
  `Common × Common` can never occur. This is what the enumeration assumes.
- **Both Spirit Empress variants may be used in the same grid.** They are
  different deployments with distinct names; blocking it would mean a
  special-case rule for one card.
- **`Royal family` ships — 15 cards, supplied by owner as a closed list.**
  Knight, Mega Knight, Golden Knight, Royal Recruits, Royal Giant, Royal
  Delivery, Royal Hogs, Royal Ghost, Prince, Dark Prince, Princess, Little
  Prince, Archer Queen, Skeleton King, Spirit Empress.
  **Not derivable from names** — Knight and Mega Knight are in and carry no
  "Royal" prefix, so this list has to be maintained by hand.
  Deliberately crosses `Human`: Royal Ghost is undead, Royal Hogs are animals.
- **`Flying` is a plain boolean, not a partition.** The split is 14/75 and
  `Grounded` would be a strict subset of `Troop`.
- **Splash is two tags, not one** — `groundSplash` (38) and `airSplash` (26),
  split by what a card splashes *against*. Not nested: Witch and Magic Archer
  splash air but not ground.
- **Cost buckets are `≤2 / 3 / 4 / 5+`.** `Spirit Empress` deploys as ground
  for 3 or flying for 6, so it ships as **two entries** sharing one art slug.
- **Stop adding categories at 38.** Each day draws 6, so every new tag makes
  the existing ones rarer in rotation and the soft ones dilute the crisp ones.
  *Rejected as duplicates:* anti-air troop (= `Hits air` ∩ `Troop`), air troop
  (= `flying`), low elixir cycle (= `Cost ≤2`), building chaser (a superset of
  `Buildings only` — a replacement at best, not an addition).
  *Rejected on audience:* the eight bait categories, which are deck-archetype
  vocabulary a casual daily player will not have.
- **Tank killers are on probation — first thing to cut if the game feels
  unfair.** Every other tag describes a property of the card; these describe a
  *matchup*. Wizard is a tank killer because splash clears the tank's support,
  Goblin Drill because it pulls as a building, Bandit arguably not at all.
  Sound deck advice, none of it readable off the card, and a puzzle category
  has to be guessable. **If they go, drop both tags whole rather than editing
  the membership** — trimming turns deckshop's list into an unauditable blend
  of their opinion and ours.

- **Every category carries a player-facing `definition`**, and the validator
  fails without one. A guessing game cannot have fuzzy chips: if a player has
  to wonder what a category means, a wrong guess feels arbitrary rather than
  earned. **The UI must surface these on tap or hover** — that is a T38
  requirement, not a nice-to-have.

**Measured pool: 985,910 grids at MIN=5**, every filter applied — family cap
and cross-axis nesting. `scripts/validateClashdoku.mjs` is the only number
worth quoting; earlier board figures predate one filter or the other. Roughly
2,700 years. `Champion` is the rarest chip at about once every 1000 days, which
is accepted: rarity is fine, absence is not.

- [ ] **T40 · Spot-check category membership**
  The rules are proven; the *memberships* are not, and a wrong tag shows up as
  a guess that feels arbitrary rather than as a failure. Nothing automated can
  catch it — the data is self-consistent either way.
  **Audit the judgement-based lists only.** Everything else came from the wiki
  or deckshop.pro: the four families (`goblin`, `undead`, `human`, `royal`) and
  the two tank-killer tags are the ones that are still opinion.
  ```
  node scripts/playClashdoku.mjs --card "goblin gang"   # one card, every category it hits
  node scripts/playClashdoku.mjs --odd                  # every card carrying a judged tag
  node scripts/playClashdoku.mjs --day 42 --reveal      # a whole grid with its answers
  ```
  *Known fuzzy edges already documented in the definitions, not bugs:* spirits
  count as ranged (the wiki gives them 2.5 tiles); the giants are Human but
  Guards are not; Goblin Gang can attack air because of its spear goblins.

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

## Done

Delete these once they are stale — git has the history.

- [x] **T37 · Grid generator** *(2026-08-03)* — `src/utils/clashdoku/grid.js`,
  categories in `categories.js`, PRNG in `src/utils/prng.js`.
  **Selection is rejection sampling, not enumeration.** ~55M possible draws,
  985,910 legal; drawing six categories from a seeded stream and retrying
  costs ~36 draws and 0.015ms, against seconds to enumerate. Uniform over
  legal grids, so it is not a biased shortcut. This was the open design
  question and it is closed.
  `MIN_ANSWERS` is 5. Difficulty bands are score thresholds (Hard ≤ 99,
  Medium ≤ 145) taken from real percentiles — **re-measure if the floor or the
  category list moves**, since stale thresholds mislabel silently.
  Verified: 0 degenerate cells, 0 unsolvable grids, spacing holds, every
  category appears. `scripts/validateClashdoku.mjs` and
  `scripts/testClashdokuGrid.mjs` both exit non-zero on failure.
  **Playable now:** `node scripts/playClashdoku.mjs` (`--day`, `--reveal`,
  `--scan`, `--card`, `--odd`).

- [x] **T36 · ClashDoku data file** *(2026-08-02)* —
  `scripts/buildClashdokuData.mjs` → `src/data/clashdoku.json`. 121 entries,
  38 categories, 1,519,184 valid grids at MIN=4.
  **`clashdoku.json` is generated output; edits to it are overwritten.** Change
  the lists in the script, which also carries the reasoning for every contested
  call. It refuses to write rather than emit bad data on five distinct
  problems. Sources are external almost throughout — wiki for arena order,
  spawners and stats; deckshop.pro for win conditions, splash, tanks and tank
  killers. Only the four families remain judgement.
  `node scripts/buildClashdokuData.mjs --arenas` reprints the arena table.

---

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
  `p7-ui-polish`, `p8-clashdoku` (all confirmed via
  `git branch -r --merged origin/main`).
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

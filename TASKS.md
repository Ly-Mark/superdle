# TASKS

Working board for Clashdle. Maintained by Claude Code — see the "Task board
protocol" section of `CLAUDE.md` for the update rules.

**Last updated:** 2026-08-02
**Current branches:** `p6-code-migration` (debt) and `p7-ui-polish` (look and
feel), both cut from `p5-adsense` HEAD. `p5-adsense` merged to `main` via #7,
#8, #10; its last commit (this board) is not yet on `main`.
**Current state:** Everything on the site side is done and live. What remains
needs AdSense/Search Console access, or is maintenance debt.

**Branch split — which work goes where:**
- `p6-code-migration` — T9, T11, T22, T10, T12. Refactors only; **no visible
  change to any page.** Landing this first keeps p7's diffs readable.
- `p7-ui-polish` — T24, T14, T23. Visual only; no behaviour change.
- The two collide in `ClassicGame.jsx` (T9 rewrites it, T24 restyles it) and in
  the card-art components (T22 collapses them, T24 restyles them). **Merge p6
  first**, then rebase p7.

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Open decisions

- **Mode icons — RESOLVED, waiting on files from owner.** Source is the
  **official Supercell fankit**, which the card art already comes from, so the
  provenance concern below is answered: fankit assets are licensed for exactly
  this. Owner will produce them in Photoshop.
  *Agreed concepts:* Classic = target · Description = scroll · Memory = book ·
  Rush = crossed swords or the Prince's helm.
  *Spec so they drop straight in:*
  - `public/games/clashroyale/icons/mode-{classic,description,memory,rush}.png`
    (matches the existing `icons/elixir.png`).
  - **96×96**, square, transparent background. They render at 20–24 px, so
    96 keeps them sharp at 3× DPR and still tiny on disk.
  - Keep the artwork tight to the canvas — under ~10% padding. `CardArt`
    exists because the card PNGs have wildly inconsistent internal padding
    (see T23, Furnace); do not repeat that here.
  - Silhouettes should read at 20 px. Detail that only works large will turn
    to mud in the nav pill.
  - Then: swap the `icon` field in `GAME_MODES` (`GameModeNav.jsx`) from emoji
    to `<img>`. Keep them `aria-hidden`, since the text label sits beside them.
  *Note on Nougat Extra Black* (also in the fankit): fine for artwork rendered
  to an image in Photoshop. **Not** used as a webfont — self-hosting a `.woff2`
  redistributes the font software to every visitor, which is a different act
  from using it in a graphic and is not clearly covered. Lilita One (SIL OFL,
  and Brawl Stars uses it) is the webfont instead.

- ~~**Clash Royale assets as mode icons — blocks nothing, needs a source.**~~
  *(superseded by the entry above; kept for the policy findings)*
  Owner asked whether `GameModeNav`'s emoji could be Supercell art instead.
  **The policy permits it.** Read 2026-08-02 at
  supercell.com/en/fan-content-policy — asset use "must be limited to
  displaying, identifying and discussing only Supercell's products", with
  "non-commercial fan-generated online guides and guide apps, fan pages" given
  as permitted examples. Ads are an **explicit** exception to the no-fee rule
  ("monetization of your Fan Content through ads, by donations or by
  coaching"), so AdSense is not a problem. The footer disclaimer at
  `SiteFooter.jsx:70` reads as "substantially similar" to the required notice.
  Also noted for future ideas: no blockchain/NFTs, no physical merch without a
  written agreement, no cheats/mods/bots.
  **The blocker is provenance, not permission.** The policy grants rights to
  Supercell's assets; it does not make any particular *copy* legitimately
  obtained. This project already paid for that distinction once — all 121
  `hint2`/`hint3` texts were rewritten because the originals came from the CR
  wiki (CC BY-SA, unattributed, not covered by the Fan Content Policy).
  Sourcing icons from a wiki would repeat it in image form.
  *Already held legitimately:* 122 card PNGs, 121 thumbs, the diamond
  backgrounds, and `public/games/clashroyale/icons/elixir.png` (tracked, used
  at `DescriptionGame.jsx:186`).
  *Needed from owner:* the icon files, or a source that can be vouched for.
  Not sourcing game-client assets unilaterally.
  *Worth weighing:* there are no official Supercell icons for Classic /
  Description / Rush / Memory — those are Clashdle's concepts. Any asset is a
  metaphor, and emoji may read more clearly than repurposed game art.

- **Heading font — DECIDED 2026-08-02: system body + display headings.**
  Owner picked the ~15–20 KB compromise: system stack for body text, one
  single-weight Latin-subset display face for `h1`/`h2` only. Remaining
  sub-question is which face — see T24e.
  *Original option list, kept for the reasoning:*
  Ranked by weight:
  - **System stack, 0 KB, 0 requests** — `system-ui, -apple-system,
    "Segoe UI", Roboto, sans-serif`. Segoe UI Variable on Windows, SF Pro on
    Apple, Roboto on Android; all three are modern screen faces. Zero CLS
    risk, nothing to self-host, nothing to review. Cost: the site looks
    slightly different per OS, so it can't be signed off on one machine.
  - **System body + one display face for headings only, ~15–20 KB**
    *(recommended)* — single-weight Latin-subset woff2 on `h1`/`h2` alone.
    Character where it counts, almost nothing paid for it.
  - **Self-hosted Inter, ~25–35 KB** — only worth it if cross-OS consistency
    matters more than bytes. Inter is close enough to Segoe UI and SF that
    most visitors would not see the difference.
  The earlier framing still stands: Poppins / Montserrat / Oswald are all
  neutral UI sans faces, so picking one answers a different question than
  `redesign-brief.md`'s complaint #4 (*"nothing matches the energy of the
  hand-drawn wordmark"*) — it makes the site cleanly generic rather than
  characterful. Both are defensible; it is a taste call, not a technical one.
  *Not blocking anything before T24e*, which ships a compare page so this gets
  decided by looking.

---

## Blocked on account access — not code

- [ ] **T20 · Submit the sitemap in Google Search Console**
  Cloudflare's managed `robots.txt` intercepts `/robots.txt` and serves its
  own AI-crawler-blocking version, so our `Sitemap:` line never reaches
  crawlers. Proven: `/robots.txt` has no Sitemap line, `/robots.txt?x=1`
  (which bypasses the interception) has it. The deployment is correct.
  *Fix:* add `clash.ac` as a **Domain** property in Search Console, verify
  with a TXT record in Cloudflare DNS, then submit `sitemap.xml`.
  The live sitemap is correct and complete: **130 URLs, 122 card pages.**

- [ ] **T21 · EU consent banner (CMP)**
  Google requires a *certified* consent management platform to serve
  personalised ads in the EEA, UK and Switzerland. Google's own is free, and
  it is **delivered through the AdSense script already on the page** — so
  this is entirely a dashboard task with no code change.
  *Owner:* AdSense → Privacy & messaging → GDPR → create message → publish.
  A hand-rolled banner would not satisfy the certified-CMP requirement and
  would look compliant without being so, so nothing has been built.
  *Follow-up once published:* a "Privacy options" link in the footer letting
  EU users reopen the dialog. It calls a function the CMP defines, so it
  would be a dead link until the message exists.
  Until then `/privacy` states the position honestly: if you do not see a
  banner, the ads you are served are non-personalised.

- [ ] **T8 · Resubmit to AdSense**
  Everything on the site side is done. Best done after T20 and T21.

---

## Maintenance debt — `p6-code-migration`. Real, none of it urgent

- [ ] **T9 · Migrate `ClassicGame.jsx` onto `useDailyModeGame`**
  Classic predates the shared hook and reimplements daily-state, storage-key
  and stats logic inline across ~800 lines. Description already uses the
  hook. **Any change to daily-state behaviour has to be made twice**, and a
  bug fixed in one will survive in the other. The highest-value item here.

- [ ] **T11 · Wire lint into CI**
  Errors are cleared (0 errors, 7 warnings) but `npm run lint` still is not
  run by CI, so it can rot again. The 7 warnings are unused vars in
  `ClassicGame`, `RushGame`, `WinPanelCompact`, plus one `exhaustive-deps`.

- [ ] **T22 · Collapse `CardPortrait` and `CardThumb` into `CardArt`**
  Three near-identical components render card art. `CardArt` is the shared
  one and already used by the guide; `ClassicGame` still has its own
  `CardPortrait`, and `CardThumb` is a third. Left alone so far because
  consolidating means touching the game board.

- [ ] **T10 · Collapse the slugify implementations**
  `slug` (routes), `slugifyCardName` (images), `deckshopSlug` (outbound), and
  an inline copy in `ClassicGame`. They agree today; nothing enforces that.

- [ ] **T12 · Decide the fate of the Brawl Stars scaffold**
  `src/components/brawlstars/`, `src/data/brawlers.json`,
  `src/utils/brawlstars/gamelogic.js`. No route, nothing imports them. Wire
  up or delete — right now it misleads anyone reading the tree.

- [ ] **T23 · Furnace renders small on the game board** *(owner picking up; belongs on `p7-ui-polish`)*
  Furnace is the only square source image (850x850, everything else is
  portrait) and its artwork fills 44% of the canvas against a median of 80%.
  The card guide handles it by trimming padding under a 60% threshold;
  `ClassicGame` uses the full-size asset, so it is still small there. Fixing
  it properly means editing the source image.

---

## UI/UX polish — `p7-ui-polish`

- [ ] **T24 · Give the site a design system, then apply it**
  The site reads flat next to modern sites. The measurable cause, not a taste
  judgement: `tailwind.config.js` has an **empty `theme.extend`**. There are no
  tokens at all — colours are inline hexes (`#0b1f3a`, `#0b3a82`, `#0c59b6` in
  `CRBackground`), and the only depth on the page is three `blur-xl` blobs.
  No shadow scale, no radius scale, no type scale, so nothing establishes
  hierarchy or elevation.
  *Ordered plan — each step is shippable on its own:*
  1. **Tokens first.** Fill `theme.extend` with the colours already in use, plus
     a shadow, radius and type scale. Purely additive; changes nothing yet.
  2. **Replace inline hexes** with the tokens. Should be a no-op visually —
     that is how you know step 1 captured the real palette.
  3. **Elevation and surface.** The guess rows, the tiles and the win panel are
     all flat fills on a flat gradient. Layered shadows and a defined card
     surface are what actually reads as "modern".
  4. **Type scale.** Sizes are currently picked per-component.
  5. **Motion.** Tile reveal and row entry. Keep every one behind
     `motion-safe:` — `CRBackground` already sets that precedent.
  *Constraint:* visual only. No behaviour, storage-key or daily-logic changes —
  those belong to T9 on `p6-code-migration`.
  *Verify with `npm run build && npm run preview`*, not `npm run dev` — the
  prerender/hydrate path is the one that ships. **Every group below ends with
  that check**, not just the last one.

  Split into shippable groups, easiest and lowest-risk first. Derived from
  `redesign-brief.md`, with its corrections recorded under T24x.

  - [x] **T24a · Design tokens.** Filled the empty `theme.extend` with
    `brand`, `gold`, `state`, `panel`, a shadow scale, `rounded-panel`, and an
    inert `font-display` stack. Names Tailwind doesn't ship, so nothing is
    overridden. **Verified a true no-op:** Tailwind emits only used utilities,
    and `f5c542` / `d99a1a` / `Lilita` all appear 0 times in the built CSS.
    All routes prerendered (no `<!--$!-->`; home 20 KB, cards 200 KB, rush
    15.5 KB). *(brief task 1)*
  - [~] **T24b · Panel treatment + gold consolidation.** Shared container
    style; collapse the five ad-hoc golds onto one token. First group where
    the site stops looking flat. *(brief tasks 2, 4)*
    **First cut is in and awaiting a look:** `Panel.jsx` applied to
    `HintsPanel` in `ClassicGame` only — one surface, chosen because it nests
    a panel inside a panel and so exercises both `base` and `raised` at once.
    Nothing else is converted yet. If the treatment lands, roll it out to the
    inline legend (`ClassicGame:254`), Rush stat tiles, the accordions and the
    guide cards. If it doesn't, one file gets reverted instead of forty.
    *Review 1 (owner):* raised/nested panel **approved**. Gold on the panel
    title **rejected** — reverted to `text-blue-100`. Gold is therefore an
    action colour only (submit button, active nav pill), not a heading colour,
    which also sidesteps the amber collision entirely. Do not reintroduce gold
    headings during the rollout.
    *Review 2 (owner):* the base panel's glow is hard to read; the raised one
    is clear. Expected — the base sits on the page gradient **and** the three
    animated blobs, so its shadow has nothing quiet to cast onto, whereas the
    raised panel sits on the base's flat fill. Deliberately **not** tuned yet:
    the fix is either a stronger `shadow-panel` or a calmer background (the
    brief's dot overlay), and the second would fix it for every panel at once.
    Decide after more surfaces are converted.
    *Review 3 (owner):* drop shadow now reads clearly on Rush; rollout
    approved, background overlay approved to try.
    *Rollout complete.* Every `bg-white/10 backdrop-blur-lg border rounded-2xl`
    panel in `src/components/clashroyale/` now uses the shared treatment:
    `HintsPanel`, `InlineLegend`, the Rush header + 3 stat tiles, the Rush
    end-of-run summary and breakdown, `DescriptionGame`, `MemoryGame` (x2) and
    `WinPanelCompact`. The `brawlstars/` copies were left alone — no route
    imports them (see T12).
    Deeply-nested call sites use the exported `PANEL_BASE` / `PANEL_RAISED`
    class strings rather than the `<Panel>` component: swapping a `className`
    is one line, whereas converting the tag means locating its closing tag
    several levels down for no gain. Use `<Panel>` for new code.
    *Background overlay (brief task 1, second half):* `CRBackground` gains a
    CSS dot grid and a vignette. Radial-gradients, not images, so no extra
    request.
    *Review 4 (owner):* dots approved. Wanted a darker gradient, flagged that
    the background image changes size between modes, and asked for more blobs,
    smaller and better scattered but **fixed** in place. All three done:
    - **Gradient darkened** `#0b1f3a/#0b3a82/#0c59b6` → `#08182d/#0a2e65/#0b4a96`.
      (First attempt went to `#04101f/#082247/#0a3a76`; owner called it too
      dark, so it sits at the midpoint between original and that.)
      The gradient is CSS, not an image — only the diamond overlay is an asset,
      so this was a three-value edit. `brand.*` tokens updated to match; the
      old trio is kept as `brand.*Legacy`.
    - **Size shift fixed.** The diamond layer used `background-size: cover` on
      a container whose height is content-driven, so it scaled up on tall
      routes (Memory, card guide) and visibly jumped between modes. Now
      `background-attachment: fixed`, which sizes against the viewport. Below
      `768px` it falls back to `scroll` + `100vw auto`, because fixed
      attachment is a repaint cost on mobile and is unreliable on iOS Safari.
    - **Blob field reworked** — 3 → 9, sizes `w-80` down to `w-28`, irregular
      positions. Hand-placed in a `BLOBS` const, **not** generated: the layout
      must be identical on every route, and anything random would also differ
      between the build-time prerender pass and the browser hydrate, which
      React reports as a mismatch. Verified identical across four routes.
      Pulse keyframes sit inside `prefers-reduced-motion: no-preference`.
  - [x] **T24c · Guide polish.** Thumbnail placeholder (see T24x). Isolated
    pages, no game logic. *(brief task 10)*
    `CardArt` now paints a pulsing placeholder underneath the image, so the
    121 lazy thumbnails have a visible resting state instead of reading as
    broken. Two things worth keeping in mind if this is touched again:
    - The image is **not** faded in from `opacity-0` by React state. These
      pages are prerendered, so that markup would ship with every image
      invisible and depend on JS to reveal them. The placeholder is painted
      first and therefore sits underneath; the image covers it as it arrives,
      with no JS in the path. Verified: 0 occurrences of `opacity-0` on card
      art in the built HTML, 121 placeholders present.
    - `onLoad` does not fire for an image the browser has already decoded,
      which is likely here since the HTML is prerendered and hydration comes
      later. An effect checks `imgRef.current.complete` on mount to cover it.
    Guide rows use the new `PANEL_CARD` export — the panel treatment **without**
    `backdrop-blur`. The blur makes the compositor sample everything behind the
    element, which is fine for a handful of panels on a game screen and not
    fine for 121 rows on one page.
    Rush stat tiles (brief task 8) were **done early in T24b** — they were
    already being converted to panels, and the unevenness turned out to be the
    same root cause: three flex children under `items-center`, each sizing to
    its own content, where Time and Score carry a line of sub-text and Round
    carries none. Now an equal-width grid, 2 columns below `sm` (Round is
    hidden there) and 3 above.
  - [x] **T24d · Hero, mode identity, accordion.** Pill-badge row, per-mode
    icons, styled accordion. Absorbs **T14**. Countdown cut — see T24x.
    *(brief tasks 6, 7, 9)*
    - **`ModeHero`** — new component above the board on Classic: chip row,
      the page `<h1>`, one-line subhead. **Fixes T25.**
    - **The day chip is client-only, and must stay that way.** `getDayIndex()`
      reads `new Date()`, so rendering it during the build-time prerender
      would bake the *build* date into the shipped HTML — wrong for every
      visitor, indexed that way by crawlers, and a hydration mismatch when the
      client computes the real value. It renders from `useEffect`. Verified:
      `Day #` appears **0** times in the prerendered HTML.
    - **`GameModeNav`** — emoji icon per mode, gold active pill with glow,
      hover lift. Emoji rather than an icon set: no dependency, no sprite, no
      request, and the hint buttons already do this.
    - **T14 resolved without merging the two navs.** `SiteHeader`'s links are
      part of what makes every URL reachable from every other for crawlers, so
      removing them would cost more than the duplication does. Instead the two
      now have visibly different jobs: the header is thin site-wide text nav,
      `GameModeNav` is the iconned in-game switcher.
    - **`HowToPlay`** — panel rows, gold numbered chips, rotating chevron.
      Still native `<details>`, so the crawlability guarantee holds.
    - Caught during verification: `shadow-glow-gold` still hardcoded the old
      `#f5c542` after `gold.DEFAULT` moved to `#ffd23f`. A box-shadow can't
      reference a colour token, so the value is necessarily duplicated —
      **if the accent moves again, move both.**
    - *Not applied to Description/Rush/Memory:* they already carry an `<h1>`
      via `ModeIntro`, and dropping `ModeHero` in would give them two. If the
      chip row is wanted there, `ModeIntro` needs to hand over its heading
      first.
  - [x] **T24e · Typography.** *(brief task 5)* — **done**
    Body: system stack (`system-ui, -apple-system, "Segoe UI", …`) in
    `src/index.css`. 0 bytes, 0 requests.
    Headings: **Lilita One**, self-hosted, `h1`/`h2` only via `font-display`.
    **10.6 KB** — the Latin subset alone; latin-ext is deliberately not
    shipped, since no copy on the site needs it and it would roughly double
    the cost. Licence ships beside it at `/fonts/OFL.txt`, as the OFL requires.
    - `font-display: swap`, not `optional`: the face is far heavier and
      narrower than any system fallback, so `optional` would show the fallback
      on a first visit and the real face only on the next — which reads as a
      bug. The file is preloaded in `index.html` to keep the swap short.
    - The preload carries `crossorigin` even though it is same-origin. Without
      it the browser fetches the file twice.
    - `/fonts/*` added to `public/_headers` with a one-year immutable cache.
      Fonts live in `public/`, so they are not content-hashed by the build;
      immutable is still right because the filename carries family, subset and
      weight, so swapping the face means a new filename.
    - Headings sit at weight 400 — Lilita One's only weight. Bolding would
      trigger a synthetic bold.
    - `fontFamily.body` removed from `tailwind.config.js`: it named Inter,
      which is no longer shipped, so it would have resolved on almost nobody's
      machine. `sans` still untouched.

  - [ ] **T24f · Guess tiles + motion.** Last: collides with T9, which
    rewrites `ClassicGame` wholesale. **Do not touch the higher/lower arrow
    direction logic** — `RushGame.jsx:91` documents why it looks inverted.
    *(brief tasks 3, 11)*

- [ ] **T24x · Corrections to `redesign-brief.md`** — record, don't re-litigate
  - **"Card Guide thumbnails render as blank squares" is wrong.** 121 `.webp`
    thumbs exist and are tracked; live URLs return 200 (`archers.webp` 7852b).
    `CardArt.jsx:38` also has a `.png` and a text fallback. The real issue:
    `CardsIndex` renders 121 images at `loading="lazy"` with no placeholder and
    no reserved aspect box, so below-fold cards are empty until scrolled and a
    screenshot pass catches them mid-load. Fixed in T24c as a placeholder.
  - **"No accent colour exists" is wrong.** `amber-500` ×7, `amber-600` ×5,
    `amber-300` ×2, plus `yellow-400` and `orange-500`. T24b is a
    consolidation, not an introduction — which is why it's cheap.
  - **Gold and "close" are currently the same amber.** The brief lists
    `--accent-gold` and `--partial` separately but never flags the collision.
    A gold button reads as a "close match" tile. `state.close` is shifted off
    **Resolved:** the tile hues are Supercell's family and are the game's
    established vocabulary, so `state.close` stays `amber-500`/`600` and the
    *accent* moved instead — `gold` is lighter and toward yellow (~46) against
    amber-500's more orange (~38). Check the two side by side during T24b.
  - **Countdown-to-next-card cut from T24d.** `getDailyCard` is local-date
    based, `getDayIndex()` in `shareText.js` is UTC based. A visible countdown
    forces a choice between them and would expose the disagreement near
    midnight. That's a behaviour decision, not a visual one.
  - **`#00d8ff`** was in use and unmentioned by the brief; captured as
    `brand.cyan`.

- [x] **T27 · `ClassicGame` had its own copy of `CRBackground`** *(found during
  T24b; fixed)*
  Classic was the **only** route not using `CRBackground` — it carried an
  inline duplicate of the same gradient, diamond overlay and blob stack.
  Every other route (Description, Memory, Rush, `InfoPage`, `CardDetail`,
  `CardsIndex`) used the shared component. Caught because the new dot texture
  appeared on all four modes *except the homepage*.
  *Fixed:* Classic now wraps in `<CRBackground>`; only the Classic-specific
  flip-animation CSS stays inline. Removes ~35 lines of duplicated markup and
  is a small down-payment on **T9**.

- [x] **T26 · Classic lost all in-progress state on a mode switch** *(reported
  by owner during T24b review; fixed same turn)*
  Leaving Classic mid-game for another mode and coming back showed an empty
  board. **Cause:** the save effect in `ClassicGame.jsx` opened with
  `if (!isWon) return;`, so an unfinished game was never written to
  localStorage at all — only completed ones were. Switching modes unmounts the
  component, and the restore effect then found nothing to restore.
  Description was unaffected: `useDailyModeGame.js:72` guards on
  `!isWon && guesses.length === 0`, i.e. it persists in-progress games.
  **This is the exact failure `CLAUDE.md` warns about** — daily-state logic
  exists twice and a fix to one never reached the other. It is the strongest
  argument yet for **T9** on `p6-code-migration`.
  *Fixed:* guard now matches the hook. `revealedHints` is persisted too (it
  was also being lost) and restored defensively, since saves written before
  this change have no such key. Stats can't double-count on the
  newly-reachable "restore an unfinished game" path — `markAttempt` and
  `updateStatsOnWin` are both idempotent per `dayKey` (`stats.js:37`, `:57`).

- [x] **T25 · `<h1>` sat fourth in the DOM on `/`** *(found during T24b, fixed
  in T24d)*
  Was `h2 h2 h3 h1 h2 …`; now `h1 h2 h2 h3 h2 …` with exactly one `<h1>`, and
  every other route verified at one `<h1>` too. `ModeHero` carries it above the
  board; `HomeContent`'s copy is demoted to `<h2>` with its wording unchanged,
  since that is the phrase the page ranks on. The wordmark image dropped to
  `alt=""` / `aria-hidden` so a screen reader no longer announces "Clashdle"
  twice in a row.

- [x] **T14 · `SiteHeader` / `GameModeNav` overlap** *(resolved in T24d)*
  Both render the same four mode links on game pages. **Resolved by
  differentiating, not merging.** `SiteHeader`'s links are part of what makes
  every URL reachable from every other one for crawlers, so deleting them
  would cost more than the redundancy does. The header is now thin site-wide
  text nav; `GameModeNav` is the iconned in-game switcher with a gold active
  pill. They no longer read as the same control twice.

- [x] **T28 · Navigation kept the previous page's scroll position** *(reported
  by owner; fixed)*
  Following a "Pairs with" link from halfway down a card page landed halfway
  down the next one. **Cause:** the app had **no scroll handling at all.** A
  browser restores scroll on a real page load, but a client-side route change
  is not one — React Router swaps the tree and leaves the offset alone.
  *Fixed:* `ScrollToTop` in `components/layout/`, rendered once in `App.jsx`
  outside `<Routes>`. Not `<ScrollRestoration>` — that ships with the data
  routers (`createBrowserRouter`) and this app uses the component `<Routes>`
  API. Back/forward (`POP`) is left alone so the browser's remembered position
  still wins, and a URL with a `#hash` is left alone so in-page anchors work.

- [x] **T29 · Card pages: elixir icon, and counters/synergies grouped by type**
  *(requested by owner)*
  - Elixir cost in `CardChip` now carries `icons/elixir.png` — the official
    fankit asset already in the tree, used the same way in `DescriptionGame`.
    `aria-hidden` with the number as adjacent text, so a screen reader reads
    "Archers 3" rather than naming the icon.
  - Counters and "pairs with" were one undifferentiated wall of up to two dozen
    chips. Now split into **Units / Spells / Buildings**, straight off the
    `type` field that already exists in `cards.json` (Troops 88, Spells 21,
    Building 12) — no new taxonomy invented. Order is fixed so the same heading
    sits in the same place on every card page; empty groups are dropped;
    headings are hidden entirely when there is only one group, where they would
    just restate what every chip shows. Unknown types fall into "Other" rather
    than being silently dropped.

- [x] **T30 · Memory: uneven boxes, and finds that did not register**
  *(reported by owner)*
  - **Uneven boxes.** The list used `columns-2` — CSS multi-column, which sizes
    every cell to its own content, so "Goblin Demolisher" made a taller box
    than "Bats" and the grid came out ragged. Now a real grid with a
    `min-h-[2.75rem]` floor, so one- and two-line cells match and every box is
    the same size. The name cell gained `min-w-0` so long names wrap inside
    their column instead of widening it.
  - **Finds now register.** A correct guess plays a one-shot `mem-pop` on that
    cell — scale plus an expanding emerald ring. **Transform and box-shadow
    only**, both GPU-composited and neither triggering layout, because Memory
    can fire this many times in quick succession and speed was the explicit
    constraint. Behind `motion-safe:`. No timer per guess: the animation is CSS
    and ends by itself, so nothing is scheduled on the hot path.

- [x] **T31 · Guess bar scrolled away on Classic** *(reported by owner)*
  The board grows past a screenful after a few guesses, so reading earlier rows
  took the input off-screen — every guess meant scrolling down, typing, and
  scrolling back. The search row is now `sticky top-12` (directly under
  `SiteHeader`, which is `sticky top-0 h-12`) on a blurred band.
  **Rush has the same layout and probably the same problem — not yet done.**

- [ ] **T13 · Prune stale local branches**
  `bug-description-game-copy`, `feature-mobile-responsiveness`,
  `feature/rushmode`, `p3-og-meta`, `pr4-gameplay-polish`.

---

## Optional, not blocking

- [ ] **T16b · Strategy articles**
  Long-form guides — rarity explainers, arena progression, elixir economy.
  Would add depth, but the site no longer needs them to clear the
  thin-content bar.

- [ ] **T17 · Rush leaderboard** *(deferred by owner 2026-08-01)*
  Needs a backend, which the Scope rule in `CLAUDE.md` forbids without an
  explicit decision. The reference mock showed one with invented numbers;
  publishing fake engagement figures was rejected outright.

---

## Done

Shipped and live across #7, #8 and #10 on 2026-08-01 and 2026-08-02.

**The site went from 4 pages with an empty `#root` to 130 pages and 55,007
visible words.**

- **Build was broken and had never once succeeded.** A bad import path, then
  two stacked crashes underneath it — `new URL(path, '')` at module scope in
  `ClassicGame`, and `localStorage` read during render in `stats.js`. The
  prerender pass fails *silently*: a throw becomes an empty `#root` and the
  build still exits 0.
- **Build never exited.** CI ran 5h59m and was killed at the job limit. React's
  scheduler leaves a `MessagePort` open because the prerender script is bundled
  with browser resolution conditions. Unref'd; build now exits in ~2s.
- **Content:** homepage block, per-mode intros, shared `HowToPlay` on all four
  modes, FAQ, site header, restructured footer, real `<h1>` per route.
- **Card guide:** `/cards` plus all 121 card pages, driven by
  `content/balance-history.md` — fill in a card and its page, route, metadata
  and sitemap entry appear on the next build. `npm run check:cards` catches
  headings whose content is being dropped.
- **Card text:** all 121 cards' `hint2`/`hint3` rewritten. The originals came
  from the Clash Royale wiki (CC BY-SA, unattributed, not covered by the Fan
  Content Policy). Rewritten from each card's own stats.
- **SEO:** per-route canonical, og and twitter tags; sitemap generated from the
  route list; real 404s instead of a soft-200 homepage for every typo'd URL.
- **Accessibility:** `<main>` landmark and a working skip link on every route.
- **Data fixes:** Furnace's type was `"Troop"` singular, so its type tile showed
  red against every card; Royal Recruits' health was `"Medium / Medium"`, so an
  exact match showed yellow; X-Bow cost 9 → 6.
- **Search:** `log` finds The Log, `xbow` finds X-Bow, `giant snowball` finds
  Snowball — without turning `giant` into a list of every Giant.
- **Legal:** Terms gained acceptable use, BC/Vancouver governing law,
  severability. Privacy gained rights, retention, security, and the AdSense
  third-party-vendor cookie disclosure.

Deliberately **not** built, in every case because it would have meant publishing
something untrue: leaderboards, player counts, solve statistics, a "median
guesses" stat, Supercell API tag validation, and a consent banner that isn't one.

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
  - [ ] **T24b · Panel treatment + gold consolidation.** Shared container
    style; collapse the five ad-hoc golds onto one token. First group where
    the site stops looking flat. *(brief tasks 2, 4)*
  - [ ] **T24c · Guide polish.** Thumbnail placeholder (see T24x), Rush stat
    tiles. Isolated pages, no game logic. *(brief tasks 10, 8)*
  - [ ] **T24d · Hero, mode identity, accordion.** Pill-badge row, per-mode
    icons, styled accordion. Absorbs **T14**. Countdown cut — see T24x.
    *(brief tasks 6, 7, 9)*
  - [ ] **T24e · Typography.** Self-hosted **Lilita One** (SIL OFL). Deferred
    behind b/c because it adds the site's first webfont — needs
    `font-display: swap` and a CLS check. *(brief task 5)*
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
    `amber-500` in the token set; keep them visibly apart.
  - **Countdown-to-next-card cut from T24d.** `getDailyCard` is local-date
    based, `getDayIndex()` in `shareText.js` is UTC based. A visible countdown
    forces a choice between them and would expose the disagreement near
    midnight. That's a behaviour decision, not a visual one.
  - **`#00d8ff`** was in use and unmentioned by the brief; captured as
    `brand.cyan`.

- [ ] **T14 · Resolve `SiteHeader` / `GameModeNav` overlap**
  Both render the same four mode links on game pages. Harmless, mildly
  redundant. Decide once you have looked at the two together.

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

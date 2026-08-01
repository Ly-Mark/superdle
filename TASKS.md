# TASKS

Working board for Clashdle. Maintained by Claude Code — see the
"Task board protocol" section of `CLAUDE.md` for the update rules.

**Last updated:** 2026-08-01
**Current branch:** `p5-adsense`
**Current goal:** Get the build green, then land the low-risk content
wins (homepage text, per-mode text, header nav). AdSense resubmission is
explicitly deferred — see D4.

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Now

- [x] **T19 · Finish per-route SEO metadata + accessibility** — **P1**
  *(requested and completed 2026-08-01)*

  Done in four reviewed steps: routeMeta fields -> prerender emits them
  and index.html drops its copies -> `<main>` landmark -> skip link.
  All 8 routes verified: unique canonical, unique og:title, exactly one
  of each tag, one `<main id="main-content" tabindex="-1">`, skip link
  first in DOM order.

  Fixed along the way: **every page was shipping two
  `<meta name="description">` tags** — one static from index.html, one
  per-route from prerender. The plugin *replaces* `head.title` but
  *appends* `head.elements`, so anything emitted from `prerender.jsx`
  must not also live in `index.html`. Noted in a comment there.

  `tabIndex={-1}` on each `<main>` is deliberate: without it some
  browser/screen-reader combinations scroll to the content but leave
  focus on the link, so the next Tab lands back in the nav — a skip
  link that looks like it works and doesn't.

  Not adopted: `react-helmet-async` (see D5).

  **Already done, do not redo:**
  - Per-route `<title>` and `<meta description>` — live for all 8 routes
    via `routeMeta.js` + `prerender.jsx`.
  - Footer disclaimer naming Supercell and linking the Fan Content
    Policy — shipped in b3f910f.
  - `og:image` as an absolute https PNG (`https://clash.ac/og.png`),
    `og:type`, `twitter:card=summary_large_image`, `theme-color` — all
    present in `index.html`.

  **Actually missing:**
  - `canonical` — absent on every route.
  - `og:site_name` — absent.
  - Per-route `og:title` / `og:description` / `og:url` — currently
    identical on all 8 routes because they are hardcoded in
    `index.html`. Every page shares one preview card.
  - Skip-to-content link as the first focusable element.
  - **A `<main>` landmark on the four game routes.** Only `InfoPage` has
    one, so there is currently nothing for a skip link to target. Must
    land before the skip link is meaningful.

  **Two corrections to the request:**
  - `/clashroyale/quote` does not exist. The route is
    `/clashroyale/description` and the component is `DescriptionGame`.
    (Same stale reference that was in the CLAUDE.md header block.)
  - The request names 2 routes; there are 8. Metadata should cover all
    of them or the untouched six keep sharing one preview card.

  **Do NOT use react-helmet-async — see D5.**

  **Deferred until D5 is answered:** the canonical domain. Not guessing
  per instruction.

## Later blockers *(build is green as of 2026-08-01)*

- [x] **T1 · Fix broken prerender import**
  `src/prerender.jsx:5` imported `./seo/routeMeta.js`; the file lives at
  `src/routeMeta.js`. Fixed the import path rather than creating an
  `src/seo/` folder (D1). Stale header comment in `routeMeta.js` also
  corrected.
  *Done when:* `npm run build` exits 0. — build verification in progress.

- [x] **T2 · Commit the in-flight prerender work**
  Done. Merged to `main` via PR #7 (`a6ea66b`) and deployed. `clash.ac`
  now serves 18,119 bytes with 756 words of body text, verified with a
  cache-busted Googlebot fetch — it was 1,932 bytes and an empty `#root`
  this morning.
  `scripts/`, `src/prerender.jsx`, `src/routeMeta.js` are untracked;
  `src/App.jsx`, `src/main.jsx`, `vite.config.js` are modified. All of it
  is one logical change and none of it is committed.
  *Blocked by:* T1.
  *Done when:* `git status` is clean on `p5-adsense` and CI is green.

- [x] **T2a · Make the two dead routes prerender** *(discovered 2026-08-01)*
  With T1 fixed, the first successful build revealed that `/` and
  `/clashroyale/description` **prerendered to an empty `#root`** — React
  emitted its `<!--$!-->` SSR error marker and the Suspense fallback.
  **Two stacked causes, both fixed:**
  1. `shareBase.js` — `PUBLIC_BASE` fell back to `''` with no `window`,
     and `new URL(path, '')` throws `Invalid URL`. Hit at *module scope*
     in `ClassicGame.jsx:16-17` and during render in
     `DescriptionGame.jsx:115`. Now falls back to `https://clash.ac`.
  2. `stats.js` — `useState(() => loadStats(...))` reads `localStorage`
     during render (`ClassicGame.jsx:407`, `useDailyModeGame.js:28`).
     Guarded. This was sitting directly behind cause 1.

  Rush and Memory were unaffected: neither imports `shareBase` nor calls
  `loadStats`. That pattern is what identified the cause.

  *Result:* `/` went 3,560 B → 10,815 B; `/clashroyale/description` went
  3,514 B → 8,140 B. All 8 routes now ship real HTML.

  *Lesson worth keeping:* the prerender pass fails **silently** — a
  throw becomes an empty `#root` and a zero exit code. Never trust a
  green build; check output byte sizes.

  *Watch for:* server renders default stats, client's first render reads
  real ones — possible hydration mismatch. T3 must check.

- [ ] **T3 · Verify hydration actually works**
  Prerendered HTML + `hydrateRoot` has never been exercised. Mismatches
  fail silently in prod but log in the console.
  *Done when:* `npm run build && npm run preview`, then load `/`,
  `/clashroyale/description`, `/clashroyale/rush`, `/clashroyale/memory`
  and confirm zero hydration warnings in the console.

---

## Next — the AdSense content problem

The rejection reason was low value. Root cause: 8 total URLs, 4 of them
boilerplate legal pages, 4 of them JS-driven game screens with no
crawlable text. This section fixes that.

- [ ] **T4 · Build the card pages** (`/cards` index + `/cards/:slug`)
  `scripts/prerenderRoutes.mjs` already has `getCardRoutes()` written and
  gated behind `INCLUDE_CARD_ROUTES = false`, waiting on these pages.
  Takes the site from 8 URLs to ~130.
  *Blocked by:* T1 **and D2** — only 42 unique words exist per card, so
  the content source must be settled before this is worth building.

- [x] **T4a · Homepage content block** (brief §4)
  Shipped as `src/components/layout/HomeContent.jsx`, rendered at the end
  of ClassicGame's main content div. Verified present in `dist/index.html`.
  ~300–400 words of static text below the Classic game on `/`: an `<h1>`,
  "How to play", four game-mode paragraphs with links, "About this site".
  No new routes, no scaled-content risk, applies to the highest-traffic
  URL. Highest value-per-effort item in the brief.
  *Blocked by:* T1.

- [x] **T4b · Per-mode descriptions** (brief §5)
  Shipped as `src/components/layout/ModeIntro.jsx`, used by Description,
  Rush, and Memory. Each carries that route's `<h1>`.
  80–120 unique words above the puzzle on `/clashroyale/description`,
  `/rush`, `/memory`. Stops the three mode routes reading as near-
  duplicates of each other.
  *Blocked by:* T1.

- [x] **T4c · Site header nav** (brief §2)
  Shipped as `src/components/layout/SiteHeader.jsx`, wired into `App.jsx`
  above `<Routes>`, sticky, on every route. `InfoPage`'s bespoke header
  was removed since it would have doubled up. Verified emitting real
  `<a href>` in the prerendered HTML.
  Known overlap: `GameModeNav` still renders the same four mode links on
  game pages. Harmless, but worth collapsing later — see T14.
  `src/components/layout/SiteHeader.jsx`, wired into `App.jsx`. Logo ·
  Classic · Description · Rush · Memory · Card Guide · About.
  Note: `GameModeNav` already renders the four modes as real `<a href>`,
  so this adds the logo, Card Guide, and About. Worth doing as a plain
  usability fix — the site has no header today.
  Reject the brief's "hide it on game pages" suggestion: `/` is a game
  page and is the most important URL to have nav on.

- [ ] **T5 · Flip `INCLUDE_CARD_ROUTES` to `true`**
  One-line change in `scripts/prerenderRoutes.mjs` once T4 lands.
  *Blocked by:* T4.

- [ ] **T6 · Per-card SEO metadata**
  `src/routeMeta.js` is a hardcoded path→meta map. It needs to generate
  titles/descriptions for 121 card routes rather than list them by hand.
  *Blocked by:* T4.

- [ ] **T7 · Generate `sitemap.xml` + link it from `robots.txt`**
  Neither exists today. Should be generated at build time from the same
  `getPrerenderRoutes()` list so it can't drift from the real routes.
  *Done when:* `dist/sitemap.xml` lists every prerendered route and
  `robots.txt` has a `Sitemap:` line.

- [x] **T15 · Borrow the light lifts from the reference mock** *(2026-08-01)*
  Reviewed `clashdle-9v8.pages.dev`, a mock generated for this site by
  another Claude Code user. Adopted, adapted to what actually exists:
  - **Terms** — added Acceptable Use (no scraping, no early answer
    sharing, no automation), Third-party links, Changes to the site,
    Governing law (British Columbia / Vancouver), Severability, Contact.
    Operator named as Mark Ly. IP section now states the card
    descriptions and hints are original writing, not Supercell's text.
  - **Privacy** — added The short version, Your rights (access / erasure
    / objection, all self-serve since data never leaves the browser),
    Data retention, Security. Named the `clashdle:` localStorage prefix.
  - **Footer** — restructured into columns (Play / About) following the
    mock's four-column pattern. Cards/Learn columns wait for those pages.
  - **Homepage** — added a "How it works" FAQ, 4 Q&A.

  **Deliberately NOT copied** — the mock's privacy policy describes a
  stack this site doesn't have: Cloudflare Web Analytics, Google Fonts,
  a Funding Choices consent banner, `@clashdle.app` email addresses,
  24-hour response times, "security monitoring responds within hours".
  Claiming a consent banner that doesn't exist is worse than silence.

- [x] **T18 · Rewrite hint2/hint3 for all 121 cards** *(2026-08-01)*
  **Why:** the owner confirmed the existing `hint2`/`hint3` were taken
  from Fandom/Wikipedia. That text is CC BY-SA — attribution and
  share-alike, neither of which was met — and Supercell's Fan Content
  Policy does not cover it. It also counts as scraped content under
  Google's policies, which would have become the *primary* body copy on
  121 card pages.

  **Approach:** facts aren't copyrightable, only expression. Every clue
  was written fresh from the card's own stats and behaviour rather than
  paraphrased from the wiki sentence-by-sentence.

  **New structure**, mirroring LoLdle's quote/ability/splash:
  - `hint1` — untouched. Supercell in-game flavour text, covered by the
    Fan Content Policy.
  - `hint2` — **how it attacks.** Mechanic only.
  - `hint3` — **appearance**, described in words rather than shown as
    art, which also avoids hosting Supercell imagery.

  **Design rules, agreed with the owner:**
  - Never restate anything on the attribute grid (rarity, cost, type,
    targets, health category, arena, move speed, year) — the player can
    already see it, so it wastes the clue.
  - Troop *count* is fair game; it is not on the grid.
  - **A card's own name must never appear in its own clue.** Enforced
    mechanically, not by eye.
  - Don't reuse a joke already in `hint1`.

  **Tooling:** `scratchpad/applyHints.mjs` + per-batch JSON files. Does
  surgical string replacement, never parse-and-restringify — cards.json
  has mixed 2/4/6-space indentation and CRLF endings, and re-serialising
  rewrites ~254 unrelated lines. Guards: unknown-name abort, name-leak
  abort, exact-single-match requirement, re-parse and card-count check
  before writing.

  **Result:** 240 lines changed, 0 non-hint lines touched, 0 name leaks,
  0 blanks. Poison and Void `hint3` were already correct and unchanged.

  **Does NOT fix thin content.** Unique text per card went 42 -> 45
  words. This was a replacement, not an expansion. D2 still stands.

- [ ] **T16 · Consider the mock's content model**
  The mock answers the thin-content problem with **3 deep hand-written
  card spotlights + 3 authored strategy guides** rather than 121
  templated pages. Given D2 (42 unique words per card), that is the
  better shape. Would supersede T4 if adopted.

- [ ] **T17 · Rush leaderboard** *(deferred by owner, 2026-08-01)*
  The mock has a top-5 leaderboard. Needs a backend, which the Scope rule
  in CLAUDE.md currently forbids. Separate task, separate decision.

- [ ] **T8 · Resubmit to AdSense**
  *Blocked by:* T4–T7.

---

## Later — known debt, none of it blocking

- [ ] **T9 · Migrate `ClassicGame.jsx` onto `useDailyModeGame`**
  Classic (~795 lines) predates the hook and reimplements daily-state,
  storage-key, and stats logic inline. `DescriptionGame` uses the hook.
  Until this lands, every daily-state change must be made twice.

- [ ] **T10 · Collapse the three slugify implementations**
  `utils/slug.js`, `utils/clashroyale/cardImages.js`, and an inline copy
  in `ClassicGame.jsx`. T4 will need slugs and risks adding a fourth.

- [ ] **T11 · Fix the lint error and clear warnings**
  `vite.config.js:12` — `__dirname` is undefined under ESM (`no-undef`),
  plus 7 warnings. Then wire `npm run lint` into CI so it can't rot.

- [ ] **T12 · Decide the fate of the Brawl Stars scaffold**
  `src/components/brawlstars/`, `src/data/brawlers.json`, and
  `src/utils/brawlstars/gamelogic.js` have no route and nothing imports
  them. Either wire up or delete — right now it's dead weight that
  misleads anyone reading the tree.

- [ ] **T14 · Resolve SiteHeader / GameModeNav overlap**
  Both now render Classic/Description/Rush/Memory links on game pages.
  Either drop the mode links from `SiteHeader` (keeping logo + About) or
  retire `GameModeNav`. Cosmetic, not urgent — decide once you've seen
  the two together in the browser.

- [ ] **T13 · Prune stale local branches**
  `bug-description-game-copy`, `feature-mobile-responsiveness`,
  `feature/rushmode`, `p3-og-meta`, `pr4-gameplay-polish` are all merged
  or abandoned.

---

## Open decisions

Items that need your call before the task under them can start.

- **D5 (answered 2026-08-01 — helmet not used): `react-helmet-async` was
  the wrong tool here.**
  Three reasons, in order of weight:
  1. **This site prerenders.** Head tags are emitted at build time from
     `prerender.jsx`'s `head.elements`. Helmet would be a *second*
     mechanism writing to the same place — duplicate or conflicting
     tags — and getting its output into the prerendered HTML means
     wiring `HelmetProvider` context extraction into `prerender.jsx`.
     Client-side tag injection is invisible to a crawler with JS off,
     which is the entire problem T19 exists to solve.
  2. **React 19 hoists document metadata natively.** `<title>`,
     `<meta>`, and `<link>` rendered anywhere in the tree are lifted
     into `<head>` with no library. This project is on React 19.1.
  3. `react-helmet-async` is effectively unmaintained and has peer-dep
     friction with React 19.

  **Recommended instead:** extend `routeMeta.js` with `canonical`,
  `ogTitle`, `ogDescription`, `ogImage`, `siteName`, and emit them from
  `prerender.jsx`. No new dependency, one source of truth, already
  proven to reach the initial HTML. Remove the now-duplicated static
  `og:`/`twitter:` block from `index.html` so tags aren't defined twice.

  *Needs owner sign-off, since the request specified helmet.*

- **D6 (answered 2026-08-01): production domain is `clash.ac`**, confirmed
  by the owner. Canonicals include a **trailing slash** for sub-routes —
  the prerender plugin emits `about/index.html`, so Cloudflare serves it
  at `/about/` and 308s the slash-less form. A canonical on the
  redirecting form points Google at a URL that redirects away.
  *(Fix committed locally as `9dd406b`, not yet merged.)*

- **D1 (answered 2026-08-01):** Fix the import, don't create `src/seo/`.
  The folder would only have justified itself by also holding the sitemap
  generator, and T7 is now deferred. Keeping `src/` flat is the smaller
  change.

- **D2 (blocks T4): RESOLVED AS A CONSTRAINT, not yet a plan.**
  Measured 2026-08-01: `cards.json` carries **42 words of unique text per
  card on average** (min 26, max 65) across `description` + `hint1-3`.
  Any per-card page longer than ~60 words is boilerplate repeated 121
  times — the scaled-content pattern that AdSense penalises. So T4 cannot
  proceed as "generate 121 pages" without first deciding where the
  additional unique content comes from: hand-written commentary,
  cross-card comparison data, or in-game stats not yet in the dataset.

- **D3 / D4 (answered 2026-08-01): take the middle path.**
  An AdSense brief was reviewed on 2026-08-01 — verdict: ~60% sound, but
  §1 (pre-rendering) is already built with a better plugin, §3a's
  `deckshopSlug` already exists, §7's disclosure is already largely
  present, and §3's 121 card pages collide with the D2 word-count
  constraint.
  **Chosen:** fix the build (T1–T3), then land only the low-risk content
  wins (T4a homepage text, T4b per-mode text, T4c header nav). These
  improve the site regardless of whether ads ever come back.
  **Deferred:** T4 card pages, T5, T6, T7, T8 — the expensive, risky half.
  Revisit only when there's an actual intent to resubmit, and only after
  D2 is solved.

---

## Done

*(nothing yet — this board was created 2026-08-01)*

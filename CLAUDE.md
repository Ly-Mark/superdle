# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Daily card selection
- `getDailyCard(cards, modeSalt)` in `utils/clashroyale/gamelogic.js`
- Salts `"classic"` and `"description"` must stay distinct — they're
  what makes each mode's daily answer different. Changing either
  breaks continuity for existing players mid-streak.

# IP boundary (Supercell Fan Content Policy)
- Card names, stats, and data: allowed.
- Do not propose features that recreate Clash Royale gameplay
  mechanics. Puzzle/quiz framing only.

# Scope
- This is a daily-puzzle site. Reject suggestions that add
  accounts, backends, or persistence beyond localStorage unless
  I ask explicitly.

# Modes
Four routes are live in `App.jsx`:
- Classic (`/`) → `ClassicGame.jsx` — daily-state logic inline, not on the hook
- Description (`/clashroyale/description`) → `DescriptionGame.jsx` via `useDailyModeGame.js`
- Rush (`/clashroyale/rush`) → `RushGame.jsx` — session-only, seeded PRNG
- Memory (`/clashroyale/memory`) → `MemoryGame.jsx` — no stats by design

All read `cards.json`. Classic and Description use WinPanelCompact;
`WinModal.jsx` exists but its call sites are currently commented out.

## Task board

**`TASKS.md` is the working board. Read it at the start of a session.**
It holds current priorities, blockers, and open decisions that need my
call — this file holds durable facts about the codebase, that one holds
state.

### Task board protocol

Claude Code maintains `TASKS.md`. The rules:

- **Read it first.** Before proposing work, check the board for what's
  already queued and what's blocked.
- **Update it as work happens, in the same turn** — not at the end of a
  session. Mark `[~]` when starting a task, `[x]` and move to `## Done`
  with a one-line outcome when finishing.
- **Add discovered work as new tasks** rather than silently expanding
  scope of the current one. Note what blocks what.
- **Anything needing my decision goes under `## Open decisions`** with
  the task it blocks — don't guess and don't stall silently.
- **Bump `Last updated` and `Current branch`** on every edit.
- **Delete completed items from `## Done` once they're stale.** The board
  is state, not history — git has the history.
- If the board contradicts the code, the code wins: fix the board and say
  so.

## Commands

```bash
npm run dev      # Vite dev server (empty #root → client render)
npm run build    # Vite build + prerender pass. This is the CI gate.
npm run preview  # Serve dist/ — the only way to exercise prerendered HTML + hydration
npm run lint     # eslint . (flat config)
```

- Node >= 20, npm 10.9.2 (`packageManager` is pinned).
- **There is no test framework.** No test runner, no test files, no `npm test`. CI (`.github/workflows/ci.yml`) runs only `npm ci && npm run build` on every push/PR — a broken build is the only automated failure signal.
- `npm run lint` currently emits warnings and one pre-existing error (`__dirname` in `vite.config.js`); it is not wired into CI. Don't treat a clean lint as a precondition, but don't add new warnings either.
- Verifying a rendering change means `npm run build && npm run preview`, not `npm run dev` — dev never exercises the prerender/hydrate path.

## Deployment

Cloudflare Pages, served at root (`base: '/'`), domain `clash.ac`.

- `public/_redirects` — **no longer holds an SPA fallback.** The
  `/* → /index.html 200` rule was removed on purpose: it made every unmatched
  URL return the homepage with HTTP 200, which Google treats as a soft 404.
  Cloudflare Pages serves `/404.html` with a real 404 for unmatched paths.
  **Consequence: a route in `App.jsx` that is missing from
  `scripts/prerenderRoutes.mjs` 404s on direct navigation.** It is not just a
  missing title any more.
- `public/_headers` — immutable caching for `/assets/*`, security headers.
- `VITE_PUBLIC_BASE_URL` env var supplies the absolute origin for share links (`src/utils/shareBase.js`); falls back to `window.location.origin` in dev.
- Google AdSense loader and `og:`/`twitter:` tags are hardcoded in `index.html`; `public/ads.txt` holds the publisher ID.

## Architecture

React 19 + Vite 8 + react-router-dom 7 + Tailwind 3. No TypeScript. The app is a daily Clash Royale card-guessing game ("Clashdle") with four modes.

### Prerendering + hydration

This is a **prerendered SPA**, not a plain SPA. Understanding this is required before touching entry points.

- `scripts/prerenderRoutes.mjs` — the route list. `STATIC_ROUTES` must be kept in sync by hand with the `<Route>` list in `src/App.jsx`. The `INCLUDE_CARD_ROUTES` flag is **gone** — it was removed so nobody flips it and generates 121 near-identical thin-content pages. Card routes are now real: `/cards` (`CardsIndex.jsx`) and `/cards/:slug` (`CardDetail.jsx`), and a card earns a page only by having written material in `src/content/cardSpotlights.jsx` or `balance-history.md`, which the script reads directly.
- `src/prerender.jsx` — runs at **build time in Node**, never shipped to the browser. Renders `<App>` under `StaticRouter` via `react-dom/static`, so `lazy()` routes resolve before HTML is emitted. Injects `<title>`/`<meta description>` per route.
- `src/routeMeta.js` — per-route title/description map, keyed by path, consumed only by the prerender step. Adding a route means adding an entry here *and* in `prerenderRoutes.mjs`.
- `src/main.jsx` — branches on `rootEl.hasChildNodes()`: `hydrateRoot` for prerendered HTML, `createRoot` in dev. Everything in `main.jsx` is guarded by `typeof window !== 'undefined'`.

### SSR safety — read this before touching any component

**The prerender pass fails silently.** If a route throws during the
build-time render, React catches it at the `<Suspense>` boundary in
`App.jsx`, emits `<!--$!-->` plus an empty `<div>`, and the build still
**exits 0**. A green build does not mean prerendering worked.

To check whether a route actually prerendered:

```bash
npm run build
find dist -name "index.html" -exec ls -la {} \;   # ~3.5 KB == empty #root
grep -o '<div id="root">.\{0,80\}' dist/index.html # '<!--$!-->' == it threw
```

A healthy route is 8 KB+ and its root contains real markup. Two real
bugs found this way on 2026-08-01, both of which had shipped unnoticed:

- `shareBase.js` — `PUBLIC_BASE` fell back to `''` without a `window`,
  and `new URL(path, '')` throws `Invalid URL`. This ran at *module
  scope* in `ClassicGame.jsx`, so merely importing the route killed it.
  The fallback is now the production origin.
- `stats.js` — `useState(() => loadStats(...))` reads `localStorage`
  during render. A `useState` initializer is **not** covered by the
  `hydrated`-flag pattern, which only guards effects.

Rules that follow:

- No `window`, `localStorage`, or `document` at module scope or in a
  `useState`/`useMemo` initializer. Guard with `typeof x !== 'undefined'`
  or move it into `useEffect`.
- Any fallback value fed to `new URL()` must be an absolute URL.
- Prefer failing loudly: if you add a new build-time-reachable helper,
  verify the byte size of every route afterwards.

### Data model

`src/data/cards.json` is the single source of truth for Clash Royale (one object per card). This drives more than it looks like it does:

- **`compareAttributes` in `src/utils/clashroyale/gamelogic.js` iterates `Object.keys(target)`**, skipping only `card`, `healthValue`, and anything prefixed `hint`. Adding a field to `cards.json` silently turns it into a compared, color-coded game attribute. Adding a non-gameplay field requires extending that skip list.
- Comparison semantics: `year`/`cost`/`arena` compare numerically and return `higher`/`lower` (naming describes the *guess*, so share-text arrows are inverted in `shareText.js` — see the comment there). `moveSpeed` uses substring matching for `Fast` vs `Very Fast`. Everything else is set comparison after `normalizeMulti` splits on `/`, `&`, `,` → `correct` / `close` / `wrong`.
- Card art lives at `public/games/clashroyale/cards/<slug>.png`. `CardThumb` tries `.webp`, `.png`, `.jpg` in that order.

### Daily puzzle determinism

`getDailyCard(cards, modeSalt)` sums the char codes of `new Date().toDateString() + modeSalt` and takes `% cards.length`.

- It is **local-date based**, not UTC. `getDayIndex()` in `shareText.js` is UTC-based off a fixed epoch — the two can disagree near midnight.
- **Adding or removing a card changes the answer for every past and future day**, because the modulus divisor changes. Treat `cards.json` length changes as a breaking change to stored progress (the daily-state restore guards against it by comparing `data.card !== targetCard.card` and discarding).
- Rush derives per-round targets with `getRushCard(cards, roundIndex)` → salt `rush-${i}`, and shuffles with a seeded xmur3/mulberry32 PRNG so a run is stable.

### localStorage conventions

- Daily progress: `clashdle:<mode>:<YYYY-MM-DD>` → `{ card, isWon, guesses, ts }`.
- Stats: `clashdle:stats:<mode>:v1` (`classic`, `description`; Rush has session-only stats, Memory opts out).
- `src/utils/clashroyale/migrateStorage.js` runs on **every** page load from `main.jsx`. Each migration is guarded by its own flag key and leaves old keys in place. Add new migrations as independently-flagged functions rather than extending an existing one.

### Component layout

- `src/components/clashroyale/` — the four modes. `CRBackground` (gradient + diamond overlay shell), `GameModeNav` (mode tabs), `CardThumb`, `WinPanelCompact`, `WinModal` are shared.
- `src/components/layout/` — `SiteFooter` (rendered once in `App.jsx`, outside `<Routes>`), `InfoPage` (shell for the static pages).
- `src/pages/` — About/Privacy/Terms/Contact, all built on `InfoPage`. These exist for AdSense eligibility.
- All route components are `lazy()`-loaded in `App.jsx`; unknown paths redirect to `/`.

### Known duplication — check before adding a third copy

- **Slugify exists three times**: `src/utils/slug.js` (`slug` for routes/sitemap, `deckshopSlug` for deckshop.pro links), `src/utils/clashroyale/cardImages.js` (`slugifyCardName`, handles `P.E.K.K.A` → `pekka`, used for image paths), and an inline copy in `ClassicGame.jsx`. Image paths need the `cardImages.js` variant.
- **`ClassicGame.jsx` predates `useDailyModeGame.js`** and reimplements the same daily-state, storage-key, and stats logic inline (~795 lines). `DescriptionGame.jsx` uses the hook. New daily modes should use the hook; changes to daily-state behavior must be applied in both places until Classic is migrated.

### Inactive code

`src/components/brawlstars/Classicgame.jsx`, `src/data/brawlers.json`, and `src/utils/brawlstars/gamelogic.js` are a scaffolded second game with **no route wired up**. Nothing imports them. Don't assume changes there affect the running app.
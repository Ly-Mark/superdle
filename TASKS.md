# TASKS

Working board for Clashdle. Maintained by Claude Code — see the "Task board
protocol" section of `CLAUDE.md` for the update rules.

**Last updated:** 2026-08-02
**Current branch:** `p5-adsense` (merged to `main` via #7, #8, #10)
**Current state:** Everything on the site side is done and live. What remains
needs AdSense/Search Console access, or is maintenance debt.

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

## Maintenance debt — real, none of it urgent

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

- [ ] **T23 · Furnace renders small on the game board** *(owner picking up)*
  Furnace is the only square source image (850x850, everything else is
  portrait) and its artwork fills 44% of the canvas against a median of 80%.
  The card guide handles it by trimming padding under a 60% threshold;
  `ClassicGame` uses the full-size asset, so it is still small there. Fixing
  it properly means editing the source image.

---

## Cosmetic

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

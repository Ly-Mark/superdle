# Clashdle (clash.ac) Visual Refresh — Task Brief

Goal: modernize the current site's look. Not a 1:1 copy of the mockup at
`clashdle-9v8.pages.dev` — we keep our layout and blue identity, but borrow its
**depth techniques** (glows, layered containers, pill badges) and its **organization**.

---

## Why the current site feels flat

1. **Monochrome navy.** Background, panels, stat boxes, and footer are all
   near-identical shades of blue. No accent color exists outside the small
   orange crown in the logo — nothing draws the eye.
2. **No layering/depth.** Panels are flat fills with faint borders. No glows,
   no shadows, no border highlights — containers don't separate from the
   background.
3. **Flat guess tiles.** The green/yellow/red result tiles (the core of the
   game) are solid rectangles with no gradient, border, shadow, or reveal
   animation. Red also does double duty for both "wrong" and higher/lower arrows.
4. **Generic typography.** Default bold sans headings; nothing matches the
   energy of the hand-drawn wordmark.
5. **Dead hero space.** A large empty rounded box holds a single line of text.
   No day number, countdown, or streak info.
6. **Anonymous mode pills.** Classic/Description/Rush/Memory are identical gray
   pills — no icons, no per-mode identity.
7. **Uneven stat boxes** on Rush (TIME/SCORE/ROUND differ in size/alignment).
8. **Card Guide thumbnails render as blank squares** — check image paths/lazy
   loading. Real card art is free visual richness.

## What to borrow from the mockup (and what to skip)

Borrow:
- **Gold accent color** (#f5c542-ish) on CTAs, active nav pill, headings
  keywords, submit button — the blue+gold pairing is Clash Royale's identity.
- **Container treatment:** rounded (~16px) panels with a subtle 1px border in a
  lighter tint, faint outer glow/shadow, slightly lighter fill than the page bg.
  Header row inside panel: gold section title left, meta (Guesses/Status) right.
- **Pill badges** row above the page title: day number chip, "DAILY PUZZLE
  LIVE" status chip (green dot), solved-count chip. Small, bordered, glowing.
- **Chunky rounded display font** for headings (mockup uses one like Lilita
  One / Baloo 2 — pick from Google Fonts), with two-tone headings
  (white + gold keyword).
- **Gold submit button** attached inside the input's right edge.
- **Mode cards** with an icon tile, per-mode blurb, and their own bordered
  container (home/landing organization); active mode gets a gold border glow.
- **Subtle background texture:** dark gradient + faint dot/pattern overlay
  instead of a flat fill.
- **Styled accordion** for "How to play" (numbered, bordered card, chevron,
  animated open/close) instead of plain `+` rows.

Skip / keep ours:
- Keep the **blue** base palette (not the mockup's purple), our hand-drawn
  wordmark, our routes/layout, and our copy. No illustrated hero scene needed.

## Tasks (priority order)

1. **Design tokens.** Create CSS variables: `--bg-top/--bg-bottom` (blue
   gradient), `--panel`, `--panel-border`, `--accent-gold`, `--accent-gold-dark`,
   `--success/--partial/--miss`, radii, shadows/glows. Apply gradient + faint
   dot-pattern background site-wide.
2. **Panel component.** Shared container style: rounded 16px, 1px light border,
   soft outer glow, slight inner top highlight. Apply to game panel, Rush stat
   card, accordions, card-guide cards.
3. **Guess tiles.** Gradient fill + darker border + inner shadow per state;
   distinct style for higher/lower arrow tiles (neutral bg + arrow) vs plain
   wrong (red). Staggered flip/pop reveal animation (~100ms delay per tile).
4. **Gold accent pass.** Active nav/mode pill gold, submit button gold with
   hover lift, section headings gold, win state gold glow.
5. **Typography.** Add display font (Baloo 2 or Lilita One) for headings,
   Inter/system for body. Two-tone heading treatment.
6. **Hero rework.** Replace empty box with compact header: pill badge row
   (Day #, status, solved count if available), title, one-line subhead.
   Add countdown-to-next-card.
7. **Mode pills → mode identity.** Icon per mode; active state gold-bordered
   with glow. (Optionally a mode-card grid on the landing page like the mockup.)
8. **Rush stat tiles.** Three equal-width tiles, huge gold numbers, small
   uppercase labels.
9. **Accordion restyle.** Numbered chip, panel styling, chevron, animated
   expand/collapse.
10. **Fix Card Guide images** (blank thumbnails) and give guide cards the
    shared panel treatment + rarity-colored accents.
11. **Motion polish.** Hover lift on pills/buttons (translateY + shadow),
    transitions on all interactive elements, respect `prefers-reduced-motion`.
12. **Verify.** Mobile (390px) pass, contrast check (WCAG AA), Lighthouse.

Reference for feel (not copying): loldle.net (tile depth/animation),
clashroyale.com (blue+gold), pokedoku.com (spacing/restraint),
clashdle-9v8.pages.dev (glows, pills, container organization).
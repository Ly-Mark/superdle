/** @type {import('tailwindcss').Config} */

// Design tokens for the visual refresh (TASKS.md T24a).
//
// Everything here is ADDITIVE and uses names Tailwind does not already ship
// (`brand`, `gold`, `state`, `panel`, `glow`). Nothing existing is overridden,
// so adding this file changes no pixels — that is deliberate. T24b then swaps
// the inline literals over to these names, and that swap should also be a
// visual no-op. If it isn't, the token below is wrong, not the component.
//
// Values were taken from what the tree already uses, not invented:
//   #08182d / #0a2e65 / #0b4a96  CRBackground gradient stops. Darkened in
//                                T24b so the dot texture and panel shadows
//                                have something to read against, then pulled
//                                back to the midpoint on review — the first
//                                attempt read as too heavy. The original
//                                lighter trio is kept as *Legacy below.
//   #00d8ff                      lone cyan accent already in use
//   emerald/amber/red 500+600    the guess-tile states
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The blue identity. `deep` → `bright` is the page gradient,
        // darkest to lightest.
        brand: {
          deep: '#08182d',
          mid: '#0a2e65',
          bright: '#0b4a96',
          cyan: '#00d8ff',
          // The original, lighter gradient. Kept because it is still the
          // reference for anything that needs to sit against the old look.
          deepLegacy: '#0b1f3a',
          midLegacy: '#0b3a82',
          brightLegacy: '#0c59b6',
        },

        // The accent. This has to stay visibly apart from `state.close`
        // below, because a gold button in the same amber as a partial-match
        // tile reads as a "close match" to anyone who has played a round.
        //
        // The separation is made HERE, not there: the tile greens, ambers and
        // reds are Supercell's hue family and are the game's established
        // vocabulary, so the accent moves and the tiles stay put. This gold
        // is pulled lighter and toward yellow (hue ~46) against amber-500's
        // more orange ~38. Verify the two side by side in T24b.
        gold: {
          DEFAULT: '#ffd23f',
          bright: '#ffe27a',
          dark: '#e0a815',
        },

        // Guess-tile result states. Named for what they mean, not what
        // colour they are, so the meaning survives a repaint.
        state: {
          correct: '#10b981',      // emerald-500
          correctDark: '#059669',  // emerald-600
          close: '#f59e0b',        // amber-500
          closeDark: '#d97706',    // amber-600
          wrong: '#ef4444',        // red-500
          wrongDark: '#dc2626',    // red-600
        },

        // Container fills. Panels sit slightly lighter than the page so they
        // separate from the gradient without a hard edge.
        panel: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          raised: 'rgba(255,255,255,0.10)',
          border: 'rgba(255,255,255,0.18)',
        },
      },

      // Depth. The site currently has exactly one elevation (three blurred
      // blobs), which is the main reason it reads flat.
      boxShadow: {
        panel: '0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
        'panel-lg': '0 12px 40px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.14)',
        tile: '0 2px 6px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)',
        // Keep this in step with `gold.DEFAULT` above — it is #ffd23f as rgb.
        // A box-shadow cannot reference a Tailwind colour token, so the value
        // is duplicated here by necessity; if the accent moves, move both.
        'glow-gold': '0 0 0 1px rgba(255,210,63,0.40), 0 0 18px rgba(255,210,63,0.28)',
        lift: '0 8px 20px rgba(0,0,0,0.34)',
      },

      // `rounded-xl` (48 uses) is already the de facto default; `panel` matches
      // the brief's ~16px container radius.
      borderRadius: {
        panel: '1rem',
      },

      // Body text is NOT set here — it is the system stack, applied to <body>
      // in `src/index.css`. `sans` is deliberately left alone so Tailwind's
      // default keeps working for anything that opts in explicitly.
      //
      // Only `display` is a real webfont: Lilita One, self-hosted, headings
      // only. Its fallbacks are the system stack rather than Inter, since no
      // Inter file is shipped and naming it would just be a stack entry that
      // resolves on almost nobody's machine.
      fontFamily: {
        display: [
          '"Lilita One"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

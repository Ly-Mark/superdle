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
//   #04101f / #082247 / #0a3a76  CRBackground gradient stops (darkened in
//                                T24b so the dot texture and panel shadows
//                                have something to read against; the original
//                                lighter trio is kept as *Legacy below)
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
          deep: '#04101f',
          mid: '#082247',
          bright: '#0a3a76',
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
        'glow-gold': '0 0 0 1px rgba(245,197,66,0.40), 0 0 18px rgba(245,197,66,0.28)',
        lift: '0 8px 20px rgba(0,0,0,0.34)',
      },

      // `rounded-xl` (48 uses) is already the de facto default; `panel` matches
      // the brief's ~16px container radius.
      borderRadius: {
        panel: '1rem',
      },

      // Declared now so T24e only has to add the @font-face rules and swap a
      // couple of classes. Nothing references these yet and no font file is
      // loaded, so both stacks fall through to the system fallback — this is
      // inert until T24e.
      //
      // `sans` is NOT overridden here on purpose: doing so would repaint every
      // page the moment this file is saved, which would break T24a's no-op
      // guarantee. T24e makes that switch deliberately.
      fontFamily: {
        // Body. Inter with a Segoe UI fallback, per the owner's stack.
        body: ['Inter', '"Segoe UI"', 'system-ui', 'Arial', 'sans-serif'],
        // Headings. UNDECIDED — see T24e on the board. Lilita One is the
        // placeholder, not a settled choice.
        display: ['"Lilita One"', 'Inter', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

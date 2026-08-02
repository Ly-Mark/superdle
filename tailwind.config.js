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
//   #0b1f3a / #0b3a82 / #0c59b6  CRBackground.jsx:11 gradient stops
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
          deep: '#0b1f3a',
          mid: '#0b3a82',
          bright: '#0c59b6',
          cyan: '#00d8ff',
        },

        // The accent. NOTE: this deliberately sits brighter and more
        // saturated than `state.close` below. The two are currently the same
        // amber in the tree, which means a gold submit button reads as a
        // "close match" tile to anyone who has played a round. Keep them
        // visibly apart — if you tune one, check it against the other.
        gold: {
          DEFAULT: '#f5c542',
          bright: '#ffd968',
          dark: '#c99a24',
        },

        // Guess-tile result states. Named for what they mean, not what
        // colour they are, so the meaning survives a repaint.
        state: {
          correct: '#10b981',      // emerald-500
          correctDark: '#059669',  // emerald-600
          close: '#d99a1a',        // shifted off amber-500 (#f59e0b) to
          closeDark: '#a97612',    // clear the gold accent above
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

      // Declared now so T24e only has to add the @font-face and swap a class.
      // Nothing references `font-display` yet, and with no font loaded it
      // would fall through this stack anyway — so this is inert until then.
      fontFamily: {
        display: ['"Lilita One"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

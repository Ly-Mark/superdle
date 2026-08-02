// src/components/clashroyale/ModeHero.jsx
// The compact page header for the four game modes (TASKS.md T24d).
//
// Replaces the arrangement where the only heading above the board was a
// decorative wordmark image and the page's real <h1> sat near the bottom of
// the document, below the board, the rules and the legend (T25).
import { useEffect, useState } from 'react';

// A small bordered chip. `tone` picks the accent; `dot` prefixes a status dot.
function Pill({ children, tone = 'neutral', dot = false }) {
    const tones = {
        neutral: 'border-white/20 text-blue-100/90 bg-white/5',
        live: 'border-emerald-400/30 text-emerald-100 bg-emerald-400/10',
        gold: 'border-gold/40 text-gold bg-gold/10',
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                tones[tone] ?? tones.neutral
            }`}
        >
            {dot && (
                <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                />
            )}
            {children}
        </span>
    );
}

export default function ModeHero({
    title,
    subhead,
    // Function returning the day number. Called on the client only — see below.
    getDayNumber,
    // Extra chips, rendered after the built-in ones.
    children,
}) {
    // The day number is rendered after mount, never during the build-time
    // prerender. `getDayIndex()` reads `new Date()`, so rendering it in the
    // prerender pass would bake the BUILD date into the shipped HTML: the
    // number would be wrong for every visitor, it would be what crawlers
    // index, and it would disagree with what the client computes on hydrate,
    // which React reports as a mismatch. Deferring costs one frame and the
    // chip is not content anyone needs in the initial HTML.
    const [dayNumber, setDayNumber] = useState(null);

    useEffect(() => {
        if (typeof getDayNumber === 'function') {
            try {
                setDayNumber(getDayNumber());
            } catch {
                /* leave the chip out rather than render a broken one */
            }
        }
    }, [getDayNumber]);

    return (
        <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                {dayNumber != null && <Pill tone="gold">Day #{dayNumber}</Pill>}
                <Pill tone="live" dot>
                    Daily puzzle live
                </Pill>
                {children}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {title}
            </h1>

            {subhead && (
                <p className="mt-2 text-sm sm:text-base text-blue-100/80 max-w-xl mx-auto">
                    {subhead}
                </p>
            )}
        </div>
    );
}

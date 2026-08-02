// src/components/layout/HowToPlay.jsx
// Shared "How to play" block for every mode. Replaces four separate hand-rolled
// panels that had drifted apart in both wording and layout.
//
// Built on native <details>/<summary> for the same reason as the homepage FAQ:
// the text stays in the initial HTML and is readable by a crawler even while
// collapsed. A JavaScript accordion would mount its panel on click and hide all
// of this from anyone — human or bot — without JS.
//
// `steps` is [{ heading, body }]. `body` may be a string or JSX.
//
// Open by default: a new player shouldn't have to click three times to find out
// how the game works. They still collapse, so a returning player can fold them
// away. `open` only sets the initial state — the browser tracks it after that.
import { PANEL_CARD } from '../clashroyale/Panel.jsx';

export default function HowToPlay({ tagline, steps, defaultOpen = true }) {
    // Still native <details>, only restyled (T24d, brief task 9). The step
    // number becomes a gold chip, each step sits in a panel row, and the "+"
    // becomes a rotating chevron. Nothing here mounts on click, so the
    // crawlability guarantee in the header comment is unchanged.
    return (
        <section className="max-w-2xl mx-auto mt-8 text-left">
            <h2 className="font-display text-xl text-white tracking-wide">How to play</h2>
            {tagline && (
                <p className="text-sm text-blue-200/70 italic mt-1 mb-3">{tagline}</p>
            )}

            <ol className="space-y-2">
                {steps.map(({ heading, body }, i) => (
                    <li key={heading}>
                        <details
                            className={`${PANEL_CARD} group px-3 py-2.5 transition-colors open:bg-white/[0.08]`}
                            open={defaultOpen}
                        >
                            <summary className="cursor-pointer list-none flex items-start gap-3 text-white font-semibold marker:content-['']">
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 w-6 h-6 rounded-full bg-gold/15 border border-gold/40 text-gold flex items-center justify-center text-xs font-bold"
                                >
                                    {i + 1}
                                </span>
                                <span className="flex-1">{heading}</span>
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 text-blue-300 transition-transform duration-200 group-open:rotate-180 leading-none"
                                >
                                    ⌄
                                </span>
                            </summary>
                            <div className="mt-2 pl-9 pr-8 text-sm text-blue-100/80 leading-relaxed">
                                {body}
                            </div>
                        </details>
                    </li>
                ))}
            </ol>
        </section>
    );
}

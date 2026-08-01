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
export default function HowToPlay({ tagline, steps }) {
    return (
        <section className="max-w-2xl mx-auto mt-8 text-left">
            <h2 className="text-lg font-bold text-white">How to play</h2>
            {tagline && (
                <p className="text-sm text-blue-200/70 italic mt-1 mb-3">{tagline}</p>
            )}

            <ol className="divide-y divide-white/10 border-y border-white/10">
                {steps.map(({ heading, body }, i) => (
                    <li key={heading}>
                        <details className="group py-3">
                            <summary className="cursor-pointer list-none flex items-start gap-3 text-white font-semibold marker:content-['']">
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs"
                                >
                                    {i + 1}
                                </span>
                                <span className="flex-1">{heading}</span>
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 text-blue-300 transition-transform group-open:rotate-45"
                                >
                                    +
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

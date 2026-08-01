// src/components/layout/ModeIntro.jsx
// Per-mode explainer that sits above the puzzle. Exists so each mode route
// ships unique text in the initial HTML instead of reading as a near-duplicate
// of the homepage. Carries the page's <h1> — the wordmark image is decorative
// and deliberately not a heading.
export default function ModeIntro({ title, children }) {
    return (
        <section className="max-w-2xl mx-auto mb-6 text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h1>
            <div className="text-sm text-blue-100/80 leading-relaxed space-y-2">
                {children}
            </div>
        </section>
    );
}

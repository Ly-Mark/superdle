// src/components/layout/HomeContent.jsx
// Static prose block below the Classic game on "/". This is the text Googlebot
// sees on the site's most-visited URL, so every word of it must be present in
// the initial HTML — no tabs, no accordions, no "show more".
// The homepage <h1> is NOT here — it moved to ModeHero above the board in
// T24d so it leads the document. This block opens with an <h2>.
import { Link } from 'react-router-dom';

const h2 = 'text-lg font-bold text-white mt-6 mb-2';
const linkCls = 'text-blue-300 hover:text-blue-200 underline';

// Rendered with native <details>/<summary>. That matters: the answers stay in
// the initial HTML and are crawlable even when collapsed. A JS accordion that
// mounts its panel on click would hide this text from a bot with JS disabled,
// which is the whole thing we're trying to avoid.
const FAQ = [
    {
        q: 'Do I need an account?',
        a: 'No. Clashdle has no sign-in at all. Your streaks and stats live in your own browser, which does mean they don’t follow you to another device, and clearing your browser data will reset them.',
    },
    {
        q: 'How is the daily card chosen?',
        a: 'It’s derived from the date, so everyone playing on the same day gets the same card — there’s no randomness and nothing personalised. Each mode uses a different daily card, so playing Classic doesn’t spoil Description.',
    },
    {
        q: 'When does the puzzle reset?',
        a: 'At midnight in your own local time, not a fixed global cutoff. Finish today’s card and the next one is waiting when the date rolls over.',
    },
    {
        q: 'How many cards are there?',
        a: '121, covering every rarity from Common through Champion. That’s the same pool every mode draws from, including Memory — which asks you to name all of them.',
    },
];

export default function HomeContent() {
    return (
        <section className="max-w-2xl mx-auto px-4 mt-12 text-blue-100/85 leading-relaxed text-sm sm:text-base">
            {/* Demoted from <h1> to <h2> in T24d/T25. The page's single <h1>
                now sits in ModeHero above the board, where a top-level heading
                belongs; this block used to carry it from near the bottom of
                the document, below the board, the rules and the legend. The
                wording is unchanged — it is the phrase the page ranks on. */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Clashdle — Daily Clash Royale Card Guessing Game
            </h2>

            {/* No "How to play" section here. The <HowToPlay> block higher up the
                page covers it in more detail and is checked against the code —
                this used to duplicate it, less accurately. */}

            <h2 className={h2}>Game modes</h2>
            <p>
                <strong className="text-white">Classic</strong> — the daily puzzle
                described above. One card, unlimited guesses, attribute comparison after
                each one.
            </p>
            <p className="mt-2">
                <strong className="text-white">
                    <Link to="/clashroyale/description" className={linkCls}>Description</Link>
                </strong>{' '}
                — instead of stats, you get the card&apos;s description and have to name
                it from that alone.
            </p>
            <p className="mt-2">
                <strong className="text-white">
                    <Link to="/clashroyale/rush" className={linkCls}>Rush</Link>
                </strong>{' '}
                — no daily limit. Ninety seconds, as many cards as you can get through,
                with bonuses for speed and streaks.
            </p>
            <p className="mt-2">
                <strong className="text-white">
                    <Link to="/clashroyale/memory" className={linkCls}>Memory</Link>
                </strong>{' '}
                — nothing is hidden and nothing is scored against a clock but you. Type
                out every card you can recall before time runs out.
            </p>

            <h2 className={h2}>About this site</h2>
            <p>
                Clashdle is a free fan project, built by one developer and run in your
                browser. There&apos;s no account to make and nothing to install — your
                stats and streaks are stored locally on your own device. It isn&apos;t
                affiliated with Supercell. You can read more on the{' '}
                <Link to="/about" className={linkCls}>about page</Link>.
            </p>

            <h2 className={h2}>Common questions</h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
                {FAQ.map(({ q, a }) => (
                    <details key={q} className="group py-3">
                        <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-white font-semibold marker:content-['']">
                            <span>{q}</span>
                            <span
                                aria-hidden="true"
                                className="shrink-0 text-blue-300 transition-transform group-open:rotate-45"
                            >
                                +
                            </span>
                        </summary>
                        <p className="mt-2 pr-8">{a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

// src/pages/CardsIndex.jsx
// The card guide index. One page listing all 121 cards, grouped by rarity.
//
// Deliberately ONE page rather than 121. There are only ~45 words of unique
// text per card in cards.json, so a page per card would be mostly boilerplate
// repeated 121 times — the thin-content pattern that gets sites rejected. A
// single reference page carrying the whole roster is genuinely useful and
// carries no such risk. Individual card pages come later, hand-written, for a
// handful of cards that can support real writing.
//
// No filtering or sorting controls on purpose: everything is in the initial
// HTML, so the whole roster is readable without JavaScript.
import CRBackground from '../components/clashroyale/CRBackground.jsx';
import cardsData from '../data/cards.json';
import CardArt from '../components/clashroyale/CardArt.jsx';

const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary', 'Champion'];

const RARITY_BLURB = {
    Common: 'The cards you meet first. Cheap, plentiful, and the backbone of most decks long after you stop noticing them.',
    Rare: 'A step up in cost and staying power. Many are the reliable middle of a deck rather than its centrepiece.',
    Epic: 'Higher variance. These tend to do one thing dramatically well, which also makes them easier to play around.',
    Legendary: 'Built around a distinctive mechanic rather than raw stats — invisibility, a dash, a beam that ramps up.',
    Champion: 'The newest class, and the only cards with an activated ability you spend extra elixir on. One per deck.',
};

const grouped = RARITY_ORDER.map((rarity) => ({
    rarity,
    cards: cardsData
        .filter((c) => c.rarity === rarity)
        .sort((a, b) => a.card.localeCompare(b.card)),
})).filter((g) => g.cards.length > 0);

const total = cardsData.length;

export default function CardsIndex() {
    return (
        <CRBackground>
            <main
                id="main-content"
                tabIndex={-1}
                className="max-w-4xl w-full mx-auto px-4 py-8 text-white/90"
            >
                <h1 className="text-3xl font-bold text-white mb-4">
                    Clash Royale Card Guide
                </h1>

                <div className="space-y-4 leading-relaxed max-w-2xl">
                    <p>
                        Every card in Clash Royale, all {total} of them, in one place. This
                        is the reference behind the daily puzzles — the same roster every
                        mode on this site draws from.
                    </p>
                    <p>
                        Each entry lists the attributes the guessing games compare against.{' '}
                        <strong className="text-white">Elixir</strong> is what it costs to
                        play, from 1 to 9.{' '}
                        <strong className="text-white">Type</strong> separates troops,
                        buildings and spells.{' '}
                        <strong className="text-white">Arena</strong> is where the card
                        unlocks as you climb, so it doubles as a rough age indicator —
                        Training Camp cards have been in the game since launch.{' '}
                        <strong className="text-white">Year</strong> is when it was
                        released.
                    </p>
                    <p>
                        Cards are grouped by rarity below, then alphabetically. If
                        you&apos;re here after a puzzle, the descriptions are the same ones
                        used in{' '}
                        <a
                            href="/clashroyale/description/"
                            className="text-blue-300 hover:text-blue-200 underline"
                        >
                            Description mode
                        </a>
                        .
                    </p>
                </div>

                {grouped.map(({ rarity, cards }) => (
                    <section key={rarity} className="mt-10">
                        <h2 className="text-2xl font-bold text-white">
                            {rarity}{' '}
                            <span className="text-base font-normal text-white/50">
                                — {cards.length} cards
                            </span>
                        </h2>
                        <p className="text-sm text-blue-100/70 mt-1 mb-4 max-w-2xl">
                            {RARITY_BLURB[rarity]}
                        </p>

                        <ul className="grid gap-3 sm:grid-cols-2">
                            {cards.map((c) => (
                                <li
                                    key={c.card}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Same treatment as the game board, via the shared
                                            component: square box, object-cover, zoomed past
                                            the baked-in border. `thumb` serves the 160px
                                            copies since this page renders all 121. */}
                                        <CardArt name={c.card} variant="thumb" sizeClass="w-16 h-16" />
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-white">{c.card}</h3>
                                            <p className="text-xs text-blue-200/70 mt-0.5">
                                                {c.cost} elixir · {c.type}
                                            </p>
                                            <p className="text-xs text-blue-200/70">
                                                {c.arena} · {c.year}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-blue-100/80 mt-3 leading-relaxed">
                                        {c.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <p className="mt-12 text-xs text-white/50 max-w-2xl">
                    Card names and in-game text are property of Supercell Oy. Clashdle is a
                    fan project and is not affiliated with or endorsed by Supercell.
                </p>
            </main>
        </CRBackground>
    );
}

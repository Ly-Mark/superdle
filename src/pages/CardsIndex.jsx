// src/pages/CardsIndex.jsx
// The card guide index. One page listing all 121 cards, grouped by rarity.
//
// Deliberately ONE page rather than 121. There are only ~45 words of unique
// text per card in cards.json, so a page per card would be mostly boilerplate
// repeated 121 times — the thin-content pattern that gets sites rejected.
// Individual pages exist only for cards with real written material behind
// them; see src/content/balance-history.md and cardSpotlights.jsx.
//
// The filter box is progressive: the complete list is rendered server-side and
// is in the initial HTML, and the box only hides rows from it. With JavaScript
// off the input does nothing and the whole roster is still there, which is the
// point — this page exists to be read by crawlers as much as by people.
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CRBackground from '../components/clashroyale/CRBackground.jsx';
import CardArt from '../components/clashroyale/CardArt.jsx';
import cardsData from '../data/cards.json';
import { slug } from '../utils/slug.js';
import { cardHasPage } from '../utils/clashroyale/cardPages.js';
import { normalizeCardName } from '../utils/clashroyale/cardSearch.js';
import { PANEL_CARD } from '../components/clashroyale/Panel.jsx';
import ElixirCost from '../components/clashroyale/ElixirCost.jsx';

const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary', 'Champion'];

const RARITY_BLURB = {
    Common: 'The cards you meet first. Cheap, plentiful, and the backbone of most decks long after you stop noticing them.',
    Rare: 'A step up in cost and staying power. Many are the reliable middle of a deck rather than its centrepiece.',
    Epic: 'Higher variance. These tend to do one thing dramatically well, which also makes them easier to play around.',
    Legendary: 'Built around a distinctive mechanic rather than raw stats — invisibility, a dash, a beam that ramps up.',
    Champion: 'The newest class, and the only cards with an activated ability you spend extra elixir on. One per deck.',
};

const ALL = RARITY_ORDER.map((rarity) => ({
    rarity,
    cards: cardsData
        .filter((c) => c.rarity === rarity)
        .sort((a, b) => a.card.localeCompare(b.card)),
})).filter((g) => g.cards.length > 0);

const total = cardsData.length;
const withPages = cardsData.filter((c) => cardHasPage(c.card)).length;

function CardRow({ card }) {
    const hasPage = cardHasPage(card.card);

    const body = (
        <>
            <div className="flex items-start gap-3">
                <CardArt name={card.card} variant="thumb" sizeClass="w-16 h-16" />
                <div className="min-w-0">
                    <h3 className="font-semibold text-white">
                        {card.card}
                        {hasPage && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-blue-300/80">
                                Guide
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-blue-200/70 mt-0.5 flex items-center gap-1.5">
                        <ElixirCost cost={card.cost} unit />
                        <span aria-hidden="true">·</span>
                        <span>{card.type}</span>
                    </p>
                    <p className="text-xs text-blue-200/70">
                        {card.arena} · {card.year}
                    </p>
                </div>
            </div>
            <p className="text-sm text-blue-100/80 mt-3 leading-relaxed">
                {card.description}
            </p>
        </>
    );

    return (
        <li className={`${PANEL_CARD} transition-shadow hover:shadow-panel-lg`}>
            {hasPage ? (
                <Link
                    to={`/cards/${slug(card.card)}`}
                    className="block p-4 rounded-panel hover:bg-white/5 transition-colors"
                >
                    {body}
                </Link>
            ) : (
                <div className="p-4">{body}</div>
            )}
        </li>
    );
}

export default function CardsIndex() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const q = normalizeCardName(query);

    // Substring, not prefix. This is a reference page, not the guessing game —
    // here you want "goblin" to surface every Goblin.
    const groups = useMemo(() => {
        if (!q) return ALL;
        return ALL.map((g) => ({
            ...g,
            cards: g.cards.filter((c) => normalizeCardName(c.card).includes(q)),
        })).filter((g) => g.cards.length > 0);
    }, [q]);

    const matches = groups.reduce((n, g) => n + g.cards.length, 0);

    // Enter jumps straight to the card when the search names exactly one that
    // has a page — the quickest path from "I want Knight" to Knight's page.
    const onSubmit = (e) => {
        e.preventDefault();
        const hits = groups.flatMap((g) => g.cards).filter((c) => cardHasPage(c.card));
        if (hits.length >= 1) navigate(`/cards/${slug(hits[0].card)}`);
    };

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
                        play, from 1 to 9. <strong className="text-white">Type</strong>{' '}
                        separates troops, buildings and spells.{' '}
                        <strong className="text-white">Arena</strong> is where the card
                        unlocks as you climb, so it doubles as a rough age indicator —
                        Training Camp cards have been in the game since launch.{' '}
                        <strong className="text-white">Year</strong> is when it was
                        released.
                    </p>
                    <p>
                        {withPages} cards have a full guide of their own, marked{' '}
                        <span className="text-[10px] uppercase tracking-wide text-blue-300/80">
                            Guide
                        </span>{' '}
                        below — click through for balance history, counters and pairings.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="mt-8 max-w-md" role="search">
                    <label htmlFor="card-search" className="block text-sm text-blue-100/80 mb-2">
                        Find a card
                    </label>
                    <input
                        id="card-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Start typing a card name…"
                        autoComplete="off"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/95 text-gray-900 font-medium border-2 border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-400/40"
                    />
                    <p className="text-xs text-blue-200/70 mt-2" aria-live="polite">
                        {q
                            ? `${matches} of ${total} cards match${matches ? ' — press Enter to open the first guide' : ''}`
                            : `Showing all ${total} cards`}
                    </p>
                </form>

                {groups.length === 0 && (
                    <p className="mt-8 text-blue-100/80">
                        No card matches that. Check the spelling, or{' '}
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="text-blue-300 hover:text-blue-200 underline"
                        >
                            clear the search
                        </button>
                        .
                    </p>
                )}

                {groups.map(({ rarity, cards }) => (
                    <section key={rarity} className="mt-10">
                        <h2 className="text-2xl font-bold text-white">
                            {rarity}{' '}
                            <span className="text-base font-normal text-white/50">
                                — {cards.length} card{cards.length === 1 ? '' : 's'}
                            </span>
                        </h2>
                        {!q && (
                            <p className="text-sm text-blue-100/70 mt-1 mb-4 max-w-2xl">
                                {RARITY_BLURB[rarity]}
                            </p>
                        )}

                        <ul className={`grid gap-3 sm:grid-cols-2 ${q ? 'mt-4' : ''}`}>
                            {cards.map((c) => (
                                <CardRow key={c.card} card={c} />
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

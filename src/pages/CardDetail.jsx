// src/pages/CardDetail.jsx
// A single card's page.
//
// A card earns a page once it has written material — either a hand-written
// spotlight (src/content/cardSpotlights.jsx) or research in
// src/content/balance-history.md. Cards with neither redirect to the index
// rather than render a stub, because a page that only restates the stats table
// is exactly the thin content this whole effort exists to remove.
import { Link, useParams, Navigate } from 'react-router-dom';
import CRBackground from '../components/clashroyale/CRBackground.jsx';
import CardArt from '../components/clashroyale/CardArt.jsx';
import cardsData from '../data/cards.json';
import { slug } from '../utils/slug.js';
import { CARD_SPOTLIGHTS } from '../content/cardSpotlights.jsx';
import { getCardContent, formatBalanceDate } from '../utils/clashroyale/cardContent.js';
import { normalizeCardName } from '../utils/clashroyale/cardSearch.js';
import { cardHasPage } from '../utils/clashroyale/cardPages.js';

const linkCls = 'text-blue-300 hover:text-blue-200 underline';
const panel = 'bg-white/5 border border-white/10 rounded-xl p-5 mt-6';
const h2 = 'text-lg font-bold text-white mb-3';

const byName = new Map(cardsData.map((c) => [c.card, c]));

// Match on the normalised name rather than the exact string. The research file
// is hand-written, so it says "P.E.K.K.A." where cards.json says "PEKKA" — an
// exact match would drop those to plain text and lose the art. Normalising also
// covers "The Log" and "X-Bow".
const byNormalised = new Map(
    cardsData.map((c) => [normalizeCardName(c.card), c.card])
);

// Counters and synergies mix two kinds of entry: card names, and phrases like
// "Air troops like Minions, Bats...". Split them so the names can be shown with
// their art, the way the arena list does, and the rest stay as prose rather
// than being force-matched into something they aren't.
function splitEntries(items = []) {
    const cards = [];
    const notes = [];
    for (const t of items) {
        // Resolve to the canonical name so the chip, the link and the artwork
        // all agree even when the file spells it differently.
        const canonical = byNormalised.get(normalizeCardName(t));
        if (canonical) cards.push(canonical);
        else notes.push(t);
    }
    return { cards, notes };
}

// The art and the name are one link, not a link sitting next to a picture —
// the image is the obvious thing to click. CardArt renders alt="" because the
// name is right beside it, so the link still has readable text and a screen
// reader doesn't hear the name twice.
function CardChip({ name }) {
    const card = byName.get(name);
    const hasPage = cardHasPage(name);

    const inner = (
        <>
            <CardArt name={name} variant="thumb" sizeClass="w-10 h-10" />
            <span>
                <span className={hasPage ? linkCls : 'text-white'}>{name}</span>
                {card && <span className="text-blue-200/60"> · {card.cost}</span>}
            </span>
        </>
    );

    return (
        <li className="text-sm">
            {hasPage ? (
                <Link
                    to={`/cards/${slug(name)}`}
                    className="flex items-center gap-2 rounded-lg -m-1 p-1 hover:bg-white/5 transition-colors"
                >
                    {inner}
                </Link>
            ) : (
                <span className="flex items-center gap-2 p-1">{inner}</span>
            )}
        </li>
    );
}

function EntryPanel({ heading, intro, items }) {
    const { cards, notes } = splitEntries(items);
    if (!cards.length && !notes.length) return null;
    return (
        <section className={panel}>
            <h2 className={h2}>{heading}</h2>
            {intro && <p className="text-sm text-blue-100/70 mb-4">{intro}</p>}

            {cards.length > 0 && (
                <ul className="flex flex-wrap gap-x-5 gap-y-3">
                    {cards.map((n) => <CardChip key={n} name={n} />)}
                </ul>
            )}

            {notes.length > 0 && (
                <ul className={`space-y-1.5 text-sm text-blue-100/85 ${cards.length ? 'mt-4 pt-4 border-t border-white/10' : ''}`}>
                    {notes.map((t) => (
                        <li key={t} className="flex gap-2">
                            <span aria-hidden="true" className="text-white/30">•</span>
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function CardDetail() {
    const { slug: wanted } = useParams();
    const card = cardsData.find((c) => slug(c.card) === wanted);
    const spotlight = card ? CARD_SPOTLIGHTS[card.card] : null;
    const content = card ? getCardContent(card.card) : null;

    if (!card || (!spotlight && !content)) return <Navigate to="/cards" replace />;

    // Only the five that tell you something at a glance. Labelled, because
    // "Arena 7" and "2018" mean nothing on their own. The full attribute set is
    // on the card guide index and in the game itself.
    const stats = [
        ['Elixir', card.cost],
        ['Rarity', card.rarity],
        ['Type', card.type],
        ['Arena', card.arena],
        ['Released', card.year],
    ];

    const sameArena = cardsData
        .filter((c) => c.card !== card.card && c.arena === card.arena)
        .slice(0, 6);

    return (
        <CRBackground>
            <main
                id="main-content"
                tabIndex={-1}
                className="max-w-3xl w-full mx-auto px-4 py-8 text-white/90"
            >
                <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-5">
                    <Link to="/" className="hover:text-white">Home</Link>
                    <span className="mx-2">›</span>
                    <Link to="/cards" className="hover:text-white">Card guide</Link>
                    <span className="mx-2">›</span>
                    <span className="text-white/80">{card.card}</span>
                </nav>

                {/* Hero: art, name, and the stats inline rather than as a table */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-4">
                    <CardArt name={card.card} sizeClass="w-20 h-20 sm:w-24 sm:h-24" />
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            {card.card}
                        </h1>
                        <ul className="flex flex-wrap gap-2 mt-3">
                            {stats.map(([label, value]) => (
                                <li
                                    key={label}
                                    className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 leading-tight"
                                >
                                    <span className="block text-[10px] uppercase tracking-wide text-blue-200/60">
                                        {label}
                                    </span>
                                    <span className="block text-sm font-semibold text-white">
                                        {value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm text-blue-100/75 mt-3 leading-relaxed">
                            {card.description}
                        </p>
                    </div>
                </div>

                {spotlight?.intro && (
                    <section className={panel}>
                        <div className="leading-relaxed">{spotlight.intro}</div>
                    </section>
                )}

                {spotlight?.sections?.map(({ heading, body }) => (
                    <section key={heading} className={panel}>
                        <h2 className={h2}>{heading}</h2>
                        <div className="leading-relaxed text-sm text-blue-100/85">{body}</div>
                    </section>
                ))}

                {content?.notes?.length > 0 && (
                    <section className={panel}>
                        <h2 className={h2}>How it plays</h2>
                        <ul className="space-y-2 text-sm text-blue-100/85">
                            {content.notes.map((t) => (
                                <li key={t} className="flex gap-2">
                                    <span aria-hidden="true" className="text-white/30">•</span>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <EntryPanel
                    heading={`Counters to ${card.card}`}
                    intro={`Cards that deal with ${card.card} efficiently.`}
                    items={content?.counters}
                />

                <EntryPanel
                    heading={`Pairs with ${card.card}`}
                    intro={`Cards commonly played alongside ${card.card}.`}
                    items={content?.synergies}
                />

                {content?.balance?.length > 0 && (
                    <section className={panel}>
                        <h2 className={h2}>Balance history</h2>
                        <ol className="space-y-2 text-sm border-l border-white/15 pl-4">
                            {content.balance.map((e) => (
                                <li key={e.date + e.text}>
                                    <span className="text-blue-200/70 tabular-nums">
                                        {formatBalanceDate(e.date)}
                                    </span>
                                    <span className="mx-2 text-white/30">—</span>
                                    <span className="text-blue-100/85">{e.text}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {sameArena.length > 0 && (
                    <section className={panel}>
                        <h2 className={h2}>Also unlocks in {card.arena}</h2>
                        <p className="text-sm text-blue-100/70 mb-3">
                            Cards that become available at the same point, which makes them
                            rough contemporaries.
                        </p>
                        <ul className="flex flex-wrap gap-x-5 gap-y-3">
                            {sameArena.map((c) => (
                                <CardChip key={c.card} name={c.card} />
                            ))}
                        </ul>
                    </section>
                )}

                {spotlight?.links?.length > 0 && (
                    <section className={panel}>
                        <h2 className={h2}>Elsewhere</h2>
                        <ul className="space-y-3 text-sm">
                            {spotlight.links.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                                        {l.label}
                                    </a>
                                    {l.note && (
                                        <span className="block text-xs text-white/50 mt-0.5">{l.note}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-white/50 mt-3">
                            Independent fan sites, not affiliated with Clashdle.
                        </p>
                    </section>
                )}

                <section className={panel}>
                    <h2 className={h2}>Play it</h2>
                    <p className="text-sm text-blue-100/85">
                        {card.card} is in the pool for every mode here.{' '}
                        <Link to="/" className={linkCls}>Classic</Link>,{' '}
                        <Link to="/clashroyale/description" className={linkCls}>Description</Link>,{' '}
                        <Link to="/clashroyale/rush" className={linkCls}>Rush</Link> and{' '}
                        <Link to="/clashroyale/memory" className={linkCls}>Memory</Link> all draw
                        from the same {cardsData.length} cards.
                    </p>
                </section>

                <p className="mt-10 text-xs text-white/50">
                    Card names and in-game text are property of Supercell Oy. Clashdle is a
                    fan project and is not affiliated with or endorsed by Supercell.
                </p>
            </main>
        </CRBackground>
    );
}

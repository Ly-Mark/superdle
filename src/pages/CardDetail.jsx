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

const linkCls = 'text-blue-300 hover:text-blue-200 underline';
const panel = 'bg-white/5 border border-white/10 rounded-xl p-5 mt-6';
const h2 = 'text-lg font-bold text-white mb-3';

const byName = new Map(cardsData.map((c) => [c.card, c]));

// Counters and synergies are free text — some entries are a card name, others
// are phrases like "Air troops like Minions, Bats...". Link only exact matches,
// and only to cards that actually have a page.
function Entry({ text }) {
    const target = byName.get(text);
    if (target && getCardContent(text)) {
        return (
            <Link to={`/cards/${slug(text)}`} className={linkCls}>
                {text}
            </Link>
        );
    }
    return <>{text}</>;
}

function BulletPanel({ heading, items, intro }) {
    if (!items?.length) return null;
    return (
        <section className={panel}>
            <h2 className={h2}>{heading}</h2>
            {intro && <p className="text-sm text-blue-100/70 mb-3">{intro}</p>}
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm text-blue-100/85">
                {items.map((t) => (
                    <li key={t} className="flex gap-2">
                        <span aria-hidden="true" className="text-white/30">•</span>
                        <span><Entry text={t} /></span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function CardDetail() {
    const { slug: wanted } = useParams();
    const card = cardsData.find((c) => slug(c.card) === wanted);
    const spotlight = card ? CARD_SPOTLIGHTS[card.card] : null;
    const content = card ? getCardContent(card.card) : null;

    if (!card || (!spotlight && !content)) return <Navigate to="/cards" replace />;

    // Only the five that actually tell you something at a glance. The full
    // attribute set is on the card guide index and in the game itself.
    const stats = [
        `${card.cost} elixir`,
        card.rarity,
        card.type,
        card.arena,
        `Released ${card.year}`,
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
                            {stats.map((s) => (
                                <li
                                    key={s}
                                    className="text-xs bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-blue-100/90"
                                >
                                    {s}
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

                <BulletPanel
                    heading="What answers it"
                    items={content?.counters}
                    intro="Cards and approaches that deal with it efficiently."
                />

                <BulletPanel
                    heading="What it works with"
                    items={content?.synergies}
                    intro="Cards it is commonly paired with."
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
                        <ul className="flex flex-wrap gap-3">
                            {sameArena.map((c) => (
                                <li key={c.card} className="flex items-center gap-2 text-sm">
                                    <CardArt name={c.card} variant="thumb" sizeClass="w-10 h-10" />
                                    <span>
                                        {getCardContent(c.card) ? (
                                            <Link to={`/cards/${slug(c.card)}`} className={linkCls}>
                                                {c.card}
                                            </Link>
                                        ) : (
                                            <span className="text-white">{c.card}</span>
                                        )}
                                        <span className="text-blue-200/60"> · {c.cost}</span>
                                    </span>
                                </li>
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

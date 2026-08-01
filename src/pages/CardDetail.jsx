// src/pages/CardDetail.jsx
// A single card's page. Only cards listed in cardSpotlights.jsx get one — see
// the rule in that file about what may and may not be claimed here.
import { Link, useParams, Navigate } from 'react-router-dom';
import CRBackground from '../components/clashroyale/CRBackground.jsx';
import CardArt from '../components/clashroyale/CardArt.jsx';
import cardsData from '../data/cards.json';
import { slug } from '../utils/slug.js';
import { CARD_SPOTLIGHTS } from '../content/cardSpotlights.jsx';
import { getBalanceHistory, formatBalanceDate } from '../utils/clashroyale/balanceHistory.js';

const linkCls = 'text-blue-300 hover:text-blue-200 underline';
const h2 = 'text-xl font-bold text-white mt-10 mb-3';

const STAT_ROWS = [
    ['Rarity', (c) => c.rarity],
    ['Elixir cost', (c) => c.cost],
    ['Type', (c) => c.type],
    ['Targets', (c) => c.targets],
    ['Hitpoints', (c) => (c.healthValue ? c.healthValue.toLocaleString('en-GB') : '—')],
    ['Health', (c) => c.healthCategory],
    ['Move speed', (c) => c.moveSpeed],
    ['Arena', (c) => c.arena],
    ['Released', (c) => c.year],
];

export default function CardDetail() {
    const { slug: wanted } = useParams();
    const card = cardsData.find((c) => slug(c.card) === wanted);
    const spotlight = card ? CARD_SPOTLIGHTS[card.card] : null;

    // Unknown card, or a card without written copy: send them to the index
    // rather than render a stub. Only spotlighted cards are prerendered, so
    // this is really a guard for hand-typed URLs.
    if (!card || !spotlight) return <Navigate to="/cards" replace />;

    const history = getBalanceHistory(card.card);

    // Cards sharing this one's arena — computed from the data rather than
    // claimed. "Unlocks in the same arena" is a fact; "pairs well with" is not.
    const sameArena = cardsData
        .filter((c) => c.card !== card.card && c.arena === card.arena)
        .slice(0, 6);

    return (
        <CRBackground>
            <main
                id="main-content"
                tabIndex={-1}
                className="max-w-2xl w-full mx-auto px-4 py-8 text-white/90"
            >
                <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-6">
                    <Link to="/" className="hover:text-white">Home</Link>
                    <span className="mx-2">›</span>
                    <Link to="/cards" className="hover:text-white">Card guide</Link>
                    <span className="mx-2">›</span>
                    <span className="text-white/80">{card.card}</span>
                </nav>

                <div className="flex items-start gap-4">
                    <CardArt name={card.card} sizeClass="w-24 h-24" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">{card.card}</h1>
                        <p className="text-blue-200/80 mt-1">
                            {card.rarity} · {card.cost} elixir · {card.type}
                        </p>
                    </div>
                </div>

                <div className="mt-6 leading-relaxed">{spotlight.intro}</div>

                <h2 className={h2}>Stats</h2>
                <table className="w-full text-sm border-y border-white/10">
                    <tbody className="divide-y divide-white/10">
                        {STAT_ROWS.map(([label, get]) => (
                            <tr key={label}>
                                <th scope="row" className="text-left font-normal text-blue-200/70 py-2 pr-4 w-40">
                                    {label}
                                </th>
                                <td className="py-2 text-white">{get(card)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {spotlight.sections.map(({ heading, body }) => (
                    <section key={heading}>
                        <h2 className={h2}>{heading}</h2>
                        <div className="leading-relaxed">{body}</div>
                    </section>
                ))}

                {/* Only renders once someone fills in src/content/balance-history.md.
                    An empty section is worse than no section. */}
                {history.length > 0 && (
                    <section>
                        <h2 className={h2}>Balance history</h2>
                        <ul className="space-y-2 text-sm border-l border-white/15 pl-4">
                            {history.map((e) => (
                                <li key={e.date + e.text}>
                                    <span className="text-blue-200/70">
                                        {formatBalanceDate(e.date)}
                                    </span>
                                    <span className="mx-2 text-white/30">—</span>
                                    <span>{e.text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {sameArena.length > 0 && (
                    <section>
                        <h2 className={h2}>Also unlocks in {card.arena}</h2>
                        <p className="text-sm text-blue-100/70 mb-3">
                            Cards that become available at the same point, which makes them
                            roughly contemporaries.
                        </p>
                        <ul className="flex flex-wrap gap-3">
                            {sameArena.map((c) => (
                                <li key={c.card} className="flex items-center gap-2 text-sm">
                                    <CardArt name={c.card} variant="thumb" sizeClass="w-10 h-10" />
                                    <span>
                                        <span className="text-white">{c.card}</span>
                                        <span className="text-blue-200/60"> · {c.cost}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {spotlight.links?.length > 0 && (
                    <section>
                        <h2 className={h2}>Elsewhere</h2>
                        <ul className="space-y-3 text-sm">
                            {spotlight.links.map((l) => (
                                <li key={l.href}>
                                    <a
                                        href={l.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={linkCls}
                                    >
                                        {l.label}
                                    </a>
                                    {l.note && (
                                        <span className="block text-xs text-white/50 mt-0.5">
                                            {l.note}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-white/50 mt-3">
                            Independent fan sites, not affiliated with Clashdle.
                        </p>
                    </section>
                )}

                <section>
                    <h2 className={h2}>Play it</h2>
                    <p className="text-sm">
                        {card.card} is in the pool for every mode on this site.{' '}
                        <Link to="/" className={linkCls}>Classic</Link>,{' '}
                        <Link to="/clashroyale/description" className={linkCls}>Description</Link>,{' '}
                        <Link to="/clashroyale/rush" className={linkCls}>Rush</Link> and{' '}
                        <Link to="/clashroyale/memory" className={linkCls}>Memory</Link> all
                        draw from the same {cardsData.length} cards.
                    </p>
                </section>

                <p className="mt-12 text-xs text-white/50">
                    Card names and in-game text are property of Supercell Oy. Clashdle is a
                    fan project and is not affiliated with or endorsed by Supercell.
                </p>
            </main>
        </CRBackground>
    );
}

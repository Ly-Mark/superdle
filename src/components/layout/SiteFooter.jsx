// src/components/layout/SiteFooter.jsx
// Column layout borrowed from the reference mock. Only routes that actually
// exist are linked — a "Cards" / "Learn" column goes in here once those pages
// are built. Linking to non-existent routes would hit the catch-all redirect
// in App.jsx and read as a soft 404.
import { Link } from 'react-router-dom';

const linkClass = 'text-white/70 hover:text-white transition-colors';
const colHeading = 'text-white font-semibold text-sm mb-2';

const COLUMNS = [
    {
        heading: 'Play',
        links: [
            { label: 'Classic', to: '/' },
            { label: 'Description', to: '/clashroyale/description' },
            { label: 'Rush', to: '/clashroyale/rush' },
            { label: 'Memory', to: '/clashroyale/memory' },
        ],
    },
    {
        heading: 'About',
        links: [
            { label: 'The project', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Privacy', to: '/privacy' },
            { label: 'Terms', to: '/terms' },
        ],
    },
];

export default function SiteFooter() {
    return (
        <footer className="w-full mt-8 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-x-16 gap-y-6">
                    {/* Brand column */}
                    <div className="max-w-xs">
                        <img
                            src="/wordmark.png"
                            alt="Clashdle"
                            className="h-10 w-auto mb-3"
                        />
                        <p className="text-sm text-white/70 leading-relaxed">
                            Four daily Clash Royale puzzles drawn from all 121 cards. Built
                            and run by one player in Vancouver, played worldwide.
                        </p>
                    </div>

                    {COLUMNS.map(({ heading, links }) => (
                        <nav key={heading}>
                            <h2 className={colHeading}>{heading}</h2>
                            <ul className="space-y-1 text-sm">
                                {links.map(({ label, to }) => (
                                    <li key={to}>
                                        <Link to={to} className={linkClass}>{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <p className="text-xs text-white/60 max-w-lg">
                        Clashdle is a fan project, not affiliated with, endorsed, sponsored,
                        or specifically approved by Supercell. Clash Royale and related
                        assets are property of Supercell Oy. Card names and in-game text are
                        used under the{' '}
                        <a
                            href="https://supercell.com/en/fan-content-policy/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white/80 transition-colors"
                        >
                            Supercell Fan Content Policy
                        </a>
                        .
                    </p>

                    <p className="text-xs text-white/50 whitespace-nowrap">
                        © 2026 Mark Ly
                    </p>
                </div>
            </div>
        </footer>
    );
}

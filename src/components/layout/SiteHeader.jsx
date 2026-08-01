// src/components/layout/SiteHeader.jsx
// Site-wide nav. Renders on every route, including the info pages, so that
// every URL links out to every other one — React Router's NavLink emits a
// real <a href>, which is what makes these crawlable.
import { Link, NavLink } from 'react-router-dom';

const NAV = [
    { label: 'Classic', path: '/', end: true },
    { label: 'Description', path: '/clashroyale/description' },
    { label: 'Rush', path: '/clashroyale/rush' },
    { label: 'Memory', path: '/clashroyale/memory' },
    { label: 'About', path: '/about' },
];

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b1f3a]/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
                <Link
                    to="/"
                    className="text-white font-extrabold tracking-tight text-lg shrink-0 hover:text-blue-200 transition-colors"
                >
                    Clashdle
                </Link>

                <nav className="flex items-center gap-x-4 gap-y-1 flex-wrap justify-end text-sm">
                    {NAV.map(({ label, path, end }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={end}
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-white font-semibold'
                                    : 'text-white/70 hover:text-white transition-colors'
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}

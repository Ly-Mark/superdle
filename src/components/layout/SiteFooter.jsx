// src/components/layout/SiteFooter.jsx
import { Link } from 'react-router-dom';

const linkClass = 'text-white/70 hover:text-white transition-colors';

export default function SiteFooter() {
    return (
        <footer className="w-full mt-8 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center gap-4 text-center sm:text-left sm:flex-row sm:justify-between sm:items-start">
                <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                    <Link to="/about"   className={linkClass}>About</Link>
                    <Link to="/privacy" className={linkClass}>Privacy</Link>
                    <Link to="/terms"   className={linkClass}>Terms</Link>
                    <Link to="/contact" className={linkClass}>Contact</Link>
                </nav>

                <p className="text-xs text-white/60 max-w-md">
                    Clashdle is a fan project. Not affiliated with, endorsed, sponsored, or
                    specifically approved by Supercell. Clash Royale and related assets are
                    property of Supercell Oy.
                </p>

                <p className="text-xs text-white/50 whitespace-nowrap">
                    © 2026 Clashdle
                </p>
            </div>
        </footer>
    );
}
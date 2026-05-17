// src/components/layout/InfoPage.jsx
import { Link } from 'react-router-dom';
import CRBackground from '../clashroyale/CRBackground.jsx';

export default function InfoPage({ title, children }) {
    return (
        <CRBackground>
            <header className="w-full px-4 py-4 border-b border-white/10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        to="/"
                        className="text-white font-bold text-lg hover:text-white/80 transition-colors"
                    >
                        Clashdle
                    </Link>
                    <Link
                        to="/"
                        className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                        ← Back to game
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl w-full mx-auto px-4 py-8 text-white/90">
                <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
                <div className="space-y-4 leading-relaxed">
                    {children}
                </div>
            </main>
        </CRBackground>
    );
}
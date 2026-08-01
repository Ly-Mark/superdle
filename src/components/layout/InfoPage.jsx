// src/components/layout/InfoPage.jsx
import { Link } from 'react-router-dom';
import CRBackground from '../clashroyale/CRBackground.jsx';

export default function InfoPage({ title, children }) {
    return (
        <CRBackground>
            {/* No local header — SiteHeader in App.jsx now covers every route. */}
            <main className="max-w-2xl w-full mx-auto px-4 py-8 text-white/90">
                <p className="mb-4">
                    <Link
                        to="/"
                        className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                        ← Back to game
                    </Link>
                </p>
                <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
                <div className="space-y-4 leading-relaxed">
                    {children}
                </div>
            </main>
        </CRBackground>
    );
}
// src/components/clashroyale/WinModal.jsx
import React, { useMemo, useState } from 'react';
import useNextMidnightCountdown from '../../hooks/useNextMidnightCountdown.js';
import { buildShareText, copyToClipboard } from '../../utils/clashroyale/shareText.js';

const StatPill = ({ label, value }) => (
    <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-blue-100 text-sm font-semibold">
        <span className="opacity-80">{label}:</span> <span className="ml-1">{value}</span>
    </div>
);

const Distribution = ({ guessDist }) => {
    const entries = Object.entries(guessDist || {}).sort((a,b) => Number(a[0])-Number(b[0]));
    if (entries.length === 0) {
        return <p className="text-blue-100/80 text-sm">Play a few days to see your distribution.</p>;
    }
    const max = Math.max(...entries.map(([,v]) => v));
    return (
        <div className="space-y-1">
            {entries.map(([k,v]) => {
                const w = max ? Math.max(6, Math.round((v / max) * 100)) : 6;
                return (
                    <div key={k} className="flex items-center gap-2 text-blue-100 text-sm">
                        <div className="w-6 text-right">{k}</div>
                        <div className="flex-1 h-5 bg-white/10 rounded-lg overflow-hidden">
                            <div className="h-full bg-emerald-500/80" style={{ width: `${w}%` }} />
                        </div>
                        <div className="w-6 text-left">{v}</div>
                    </div>
                );
            })}
        </div>
    );
};

// Shared inner content used by both inline panel and modal
function WinContent({ title = 'Victory!', dayIndex, dayKey, guesses, attributes, stats, shareUrl = '' }) {
    const { h, m, s } = useNextMidnightCountdown();
    const [copied, setCopied] = useState(false);

    const shareText = useMemo(() => buildShareText({
        dayIndex,
        guessCount: guesses.length,
        attributes,
        guesses,
        url: shareUrl
    }), [dayIndex, guesses, attributes, shareUrl]);

    return (
        <>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-2xl font-extrabold text-white">🎉 {title}</h3>
            </div>

            {/* Share block */}
            <div className="mt-2 bg-white/10 border border-white/20 rounded-xl p-4">
                <pre className="text-sm text-white/90 whitespace-pre-wrap leading-6">{shareText}</pre>
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={async () => { const ok = await copyToClipboard(shareText); setCopied(!!ok); }}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                    >
                        {copied ? 'Copied ✅' : 'Copy Results'}
                    </button>
                    <a
                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                        target="_blank" rel="noreferrer"
                    >
                        Share on X
                    </a>
                </div>
            </div>

            {/* Countdown + Stats */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                    <p className="text-sm text-blue-100/80 mb-1">Next daily in</p>
                    <p className="text-3xl font-black text-white tabular-nums">{h}:{m}:{s}</p>
                    <p className="text-xs text-blue-100/70 mt-1">({dayKey})</p>
                </div>

                <div className="rounded-xl bg-white/10 border border-white/20 p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <StatPill label="Played" value={stats.played} />
                        <StatPill label="Wins" value={stats.wins} />
                        <StatPill label="Win %"
                                  value={stats.played ? Math.round((stats.wins / stats.played) * 100) : 0} />
                        <StatPill label="Streak" value={stats.currentStreak} />
                        <StatPill label="Max" value={stats.maxStreak} />
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-blue-100/80 mb-2">Guess distribution</p>
                        <Distribution guessDist={stats.guessDist} />
                    </div>
                </div>
            </div>
        </>
    );
}

/** Inline card version (use this to replace your green banner) */
export function WinPanelInline(props) {
    return (
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <WinContent {...props} />
        </div>
    );
}

/** Modal shell (unchanged behavior) */
export default function WinModal({ isOpen, onClose, ...props }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-xl mx-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
                <div className="absolute top-3 right-3">
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25">✕</button>
                </div>
                <WinContent {...props} />
            </div>
        </div>
    );
}

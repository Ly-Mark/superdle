import React, { useMemo, useState } from 'react';
import useNextMidnightCountdown from '../../hooks/useNextMidnightCountdown.js';
import { buildShareText, copyToClipboard } from '../../utils/clashroyale/shareText.js';

// map statuses -> emojis
const TILE = { correct: '🟩', partial: '🟨', incorrect: '🟥', higher: '🔺', lower: '🔻' };
const toEmoji = (s) => TILE[s] || TILE.incorrect;

// thresholds for distribution colors
const GREEN_MAX = 4;
const YELLOW_MAX = 7;

const StatPillSm = ({ label, value }) => (
    <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-blue-100 text-xs font-semibold">
        <span className="opacity-80">{label}:</span>
        <span className="ml-1 text-white">{value}</span>
    </div>
);

const barColorClass = (n) => (n <= GREEN_MAX ? 'bg-emerald-500/85' : n <= YELLOW_MAX ? 'bg-amber-500/85' : 'bg-rose-500/85');

const MiniDistribution = ({ guessDist }) => {
    const entries = useMemo(() => Object.entries(guessDist || {}).sort((a,b) => Number(a[0]) - Number(b[0])), [guessDist]);
    if (entries.length === 0) return <p className="text-blue-100/70 text-xs">Play a few days to see distribution.</p>;
    const max = Math.max(...entries.map(([,v]) => v));
    return (
        <div className="mt-1">
            <div className="flex items-end justify-center gap-2 h-16">
                {entries.map(([k,v]) => {
                    const h = max ? Math.max(6, Math.round((v / max) * 56)) : 6;
                    return (
                        <div key={k} className="flex flex-col items-center w-6">
                            <div className={`w-4 rounded ${barColorClass(Number(k))}`} style={{ height: `${h}px` }} />
                            <span className="mt-1 text-[10px] text-blue-100/80">{k}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GridPreview = ({ guesses, attributes, maxRows = 8, latestOnTop = true }) => {
    // ClassicGame stores newest at the front; latestOnTop=true uses order as-is.
    const ordered = latestOnTop ? guesses : [...guesses].reverse();
    const rows = ordered.slice(0, maxRows);
    const extra = Math.max(0, ordered.length - rows.length);
    const matrix = useMemo(() => rows.map(g => attributes.map(a => toEmoji(g.comparison?.[a.key]))), [rows, attributes]);
    if (matrix.length === 0) return null;
    return (
        <div className="text-center">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${attributes.length}, 1rem)` }}>
                {matrix.map((row, ri) =>
                    row.map((cell, ci) => (
                        <div key={`${ri}-${ci}`} className="w-4 h-4 text-[12px] leading-4 text-center select-none">
                            {cell}
                        </div>
                    ))
                )}
            </div>
            {extra > 0 && <div className="mt-2 text-xs text-blue-100/80 font-medium">+ {extra} more</div>}
        </div>
    );
};

// timezone helpers
const getLocalIanaTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
const getUtcOffsetLabel = () => {
    const mins = new Date().getTimezoneOffset();
    const sign = mins > 0 ? '-' : '+';
    const abs = Math.abs(mins);
    const h = String(Math.floor(abs / 60)).padStart(2, '0');
    const m = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${h}:${m}`;
};

export default function WinPanelCompact({
                                            cardName,
                                            dayIndex,
                                            dayKey,
                                            guesses,
                                            attributes,
                                            stats,
                                            onOpenStats,                // optional
                                            shareUrl = '',
                                            nextModeHref = '/clashroyale/quote',
                                        }) {
    const { h, m, s } = useNextMidnightCountdown();
    const [copied, setCopied] = useState(false);
    const tz = getLocalIanaTz();
    const utcOff = getUtcOffsetLabel();

    const shareText = useMemo(() => buildShareText({
        dayIndex, guessCount: guesses.length, attributes, guesses, url: shareUrl
    }), [dayIndex, guesses, attributes, shareUrl]);

    const slug = useMemo(() => String(cardName).toLowerCase().replace(/[^a-z0-9]+/g, '-'), [cardName]);

    return (
        <div className="mx-auto my-4 overflow-x-auto" style={{maxWidth: '100%'}}>
            <div
                className="w-[704px] h-[704px] mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl p-4 overflow-hidden">

                {/* centered win message */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-4">
                        <div
                            className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden ring-1 ring-white/30 bg-white/5">
                            <img
                                src={`/games/clashroyale/cards/${slug}.webp`}
                                onError={(e) => {
                                    e.currentTarget.src = `/games/clashroyale/cards/${slug}.png`;
                                }}
                                alt={cardName}
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ transform: 'scale(1.35)', transformOrigin: 'center', objectPosition: 'center 60%' }}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                            <div className="text-left">
                                <div
                                    className="text-white font-extrabold leading-tight text-xs md:text-sm uppercase tracking-wide">
                                    positive elixir trade
                                </div>
                                <div className="text-white font-black leading-tight text-xl">
                                    You guessed <span
                                    className="font-bold">{cardName}</span> in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}
                                </div>
                            </div>
                    </div>

                        <div className="mt-2">
                            <div className="text-xs text-blue-100/80">Next daily in</div>
                            <div className="text-2xl font-black text-white tabular-nums">{h}:{m}:{s}</div>
                            <div className="text-[11px] text-blue-100/70 mt-1">
                                Time zone: <span className="font-semibold">{tz}</span> (Midnight at {utcOff})
                            </div>
                            <div className="text-[10px] text-blue-100/60">({dayKey})</div>
                        </div>
                    </div>

                    {/* grid preview (centered, non-full width) */}
                    <div className="mt-3 flex justify-center">
                    <div
                        className="inline-block rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3">
                        <GridPreview guesses={guesses} attributes={attributes} maxRows={8} latestOnTop/>
                    </div>
                </div>

                {/* centered actions */}
                <div className="mt-3 flex justify-center gap-2">
                    <button
                        onClick={async () => {
                            const ok = await copyToClipboard(shareText);
                            setCopied(!!ok);
                        }}
                        className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                    >
                        {copied ? 'Copied ✅' : 'Copy'}
                    </button>
                    <a
                        className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                        target="_blank" rel="noreferrer"
                    >
                        Share
                    </a>
                    {onOpenStats && (
                        <button onClick={onOpenStats}
                                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-blue-100 font-semibold">
                            Details
                        </button>
                    )}
                </div>

                {/* inline stats (pills centered above chart) */}
                <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3 max-w-[640px] mx-auto">
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                        <StatPillSm label="Played" value={stats.played}/>
                        <StatPillSm label="Wins" value={stats.wins}/>
                        <StatPillSm label="Win %"
                                    value={stats.played ? Math.round((stats.wins / stats.played) * 100) : 0}/>
                        <StatPillSm label="Streak" value={stats.currentStreak}/>
                        <StatPillSm label="Max" value={stats.maxStreak}/>
                    </div>
                    <p className="text-blue-100/80 text-xs mb-3 text-center">Guess distribution</p>
                    <MiniDistribution guessDist={stats.guessDist}/>
                </div>

                {/* next mode teaser */}
                <div
                    className="mt-4 flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-3 max-w-[640px] mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        <div className="text-blue-100 text-sm">
                            <div className="font-semibold text-white">Next mode</div>
                            <div className="opacity-80">Quote — guess with in-game quotes</div>
                        </div>
                    </div>
                    <a href={nextModeHref}
                       className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold">
                        Play
                    </a>
                </div>
            </div>
        </div>
    );
}

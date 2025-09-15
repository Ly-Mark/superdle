import React, { useState, useEffect, useMemo } from 'react';
import cardsData from '../../data/cards.json';
import { getDailyCard, compareAttributes, getAttributeColor } from '../../utils/clashroyale/gamelogic.js';


import WinModal from '../../components/clashroyale/WinModal.jsx';
import WinPanelCompact from '../../components/clashroyale/WinPanelCompact.jsx';
import { loadStats, markAttempt, updateStatsOnWin } from '../../utils/clashroyale/stats.js';

import { getDayIndex, buildShareText, copyToClipboard } from "../../utils/clashroyale/shareText.js";
import { buildUrl } from "../../utils/shareBase.js";


/* -------------------------------------------------------
   Daily-state helpers (persist win until next day)
------------------------------------------------------- */
const STORAGE_PREFIX = 'clashle:classic';
const getLocalDayKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const storageKeyForToday = () => `${STORAGE_PREFIX}:${getLocalDayKey()}`;

/* -------------------------------------------------------
   Shared slugify for image filenames
------------------------------------------------------- */
const slugify = (name) =>
    String(name)
        .toLowerCase()
        .replace(/p\.?\s*e\.?\s*k\.?\s*k\.?\s*a/gi, 'pekka') // Mini P.E.K.K.A → pekka
        .replace(/&/g, 'and')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

/* -------------------------------------------------------
   Attribute tile (FIXED)
------------------------------------------------------- */
const AttributeCard = ({ attribute, value, status, isFlipping, delay = 0 }) => {
    // State now depends on `isFlipping`. If not flipping, show the back immediately.
    const [showBack, setShowBack] = useState(!isFlipping);
    const [isVisible, setIsVisible] = useState(!isFlipping);

    useEffect(() => {
        // Effect now only runs when isFlipping is true.
        if (isFlipping) {
            let mounted = true;
            const visibilityTimer = setTimeout(() => { if (mounted) setIsVisible(true); }, delay);
            const flipTimer = setTimeout(() => { if (mounted) setShowBack(true); }, delay + 200);
            return () => { mounted = false; clearTimeout(visibilityTimer); clearTimeout(flipTimer); };
        }
    }, [isFlipping, delay]);

    const cardColor = getAttributeColor(status);
    const flipClass = isFlipping ? 'animate-flip' : '';
    const opacityClass = isVisible ? 'opacity-100' : 'opacity-0';

    return (
        <div className={`relative w-20 h-20 perspective-1000 transition-opacity duration-500 ${opacityClass}`}>
            <div className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${flipClass} ${showBack ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 w-full h-full bg-gray-300 border-2 border-gray-400 rounded-lg flex items-center justify-center backface-hidden">
                    <span className="text-lg text-gray-600 font-semibold">?</span>
                </div>
                {/* Back */}
                <div className={`absolute inset-0 w-full h-full ${cardColor} rounded-lg flex items-center justify-center backface-hidden rotate-y-180 text-white font-bold text-sm px-1 text-center shadow-lg border-2 overflow-hidden`}>
                    {(attribute === 'year' || attribute === 'cost' || attribute === 'arena') && (status === 'higher' || status === 'lower') ? (
                        <div className="relative flex items-center justify-center w-full h-full">
                            <div className={`absolute inset-0 flex items-center justify-center ${status === 'lower' ? 'pt-2' : ''}`}>
                                <span className={`text-7xl text-red-900 opacity-50 leading-none ${status === 'higher' ? '' : 'transform rotate-180'}`}>▼</span>
                            </div>
                            <span className="relative z-10 break-words font-bold text-white">{value}</span>
                        </div>
                    ) : (
                        <span className="break-words">{value}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

/* -------------------------------------------------------
   Card portrait (zoom crop + border + gloss + fallback)
------------------------------------------------------- */
const DEFAULT_GAME = 'clashroyale';
const DEFAULT_ZOOM = 1.40; // crop baked-in borders a bit

const CardPortrait = ({ name, game = DEFAULT_GAME, zoom = DEFAULT_ZOOM, focus = 'center' }) => {
    const slug = useMemo(() => slugify(name), [name]);

    const sources = useMemo(
        () => [
            `/games/${game}/cards/${slug}.webp`,
            `/games/${game}/cards/${slug}.png`,
            `/games/${game}/cards/${slug}.jpg`,
        ],
        [game, slug]
    );

    const [idx, setIdx] = useState(0);
    const [failedAll, setFailedAll] = useState(false);

    const handleError = () => {
        setIdx((prev) => {
            const next = prev + 1;
            if (next >= sources.length) { setFailedAll(true); return prev; }
            return next;
        });
    };

    return (
        <div
            className="
        relative w-20 h-20 rounded-xl overflow-hidden
        shadow-[0_8px_18px_rgba(0,0,0,0.35)]
        ring-1 ring-white/20
        bg-white/5
      "
        >
            {/* IMAGE (zoom-cropped) or TEXT FALLBACK */}
            {!failedAll ? (
                <img
                    src={sources[idx]}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center', objectPosition: focus }}
                    onError={handleError}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center px-1">
          <span className="text-[11px] font-bold text-gray-100 text-center leading-tight">
            {name}
          </span>
                </div>
            )}

            {/* INNER STROKE (premium frame) */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/25 mix-blend-screen" />

            {/* GLOSS HIGHLIGHT */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0) 55%)',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 48%, 0% 70%)',
                    mixBlendMode: 'screen',
                    opacity: 0.65,
                }}
            />

            {/* INNER SHADOW */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                    boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.06)',
                }}
            />
        </div>
    );
};

/* -------------------------------------------------------
   Suggestion item with thumbnail + text (fallback safe)
------------------------------------------------------- */
const getThumbSources = (game, slug) => ([
    `/games/${game}/cards/${slug}.webp`,
    `/games/${game}/cards/${slug}.png`,
    `/games/${game}/cards/${slug}.jpg`,
]);

const SuggestionItem = ({ name, onClick, isFirst, game = 'clashroyale' }) => {
    const slug = useMemo(() => slugify(name), [name]);
    const sources = useMemo(() => getThumbSources(game, slug), [game, slug]);

    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    const handleError = () => {
        setIdx((i) => {
            const next = i + 1;
            if (next >= sources.length) {
                setFailed(true);
                return i;
            }
            return next;
        });
    };

    return (
        <div
            onClick={onClick}
            className={`px-3 py-2 cursor-pointer transition-colors duration-200 border-b border-blue-100 last:border-b-0
                  flex items-center justify-between
                  ${isFirst ? 'bg-blue-100 hover:bg-blue-150' : 'hover:bg-blue-50'}`}
            role="option"
            aria-selected={false}
        >
            {/* Left: avatar + name */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-white/40 bg-gray-200 shrink-0">
                    {!failed ? (
                        <img
                            src={sources[idx]}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ transform: 'scale(1.35)', transformOrigin: 'center' }} // crop borders a bit
                            loading="lazy"
                            decoding="async"
                            onError={handleError}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                            {name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <span className="font-semibold text-gray-800 truncate">{name}</span>
            </div>

            {/* Right: Enter hint for the first suggestion */}
            {isFirst && (
                <span className="ml-2 text-xs text-blue-600 font-medium">↵ Enter</span>
            )}
        </div>
    );
};

/* -------------------------------------------------------
   Legend
------------------------------------------------------- */
const InlineLegend = ({ onClose }) => (
    <div className="w-96 mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white underline underline-offset-4">Color Indicators</h3>
            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors">✕</button>
        </div>
        <div className="flex justify-center space-x-3 mb-3">
            <div className="text-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg mb-1 border-2 border-emerald-600"></div>
                <span className="text-white text-xs font-medium">Correct</span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-amber-500 rounded-lg mb-1 border-2 border-amber-600"></div>
                <span className="text-white text-xs font-medium">Partial</span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600"></div>
                <span className="text-white text-xs font-medium">Incorrect</span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">▲</span>
                </div>
                <span className="text-white text-xs font-medium">Higher</span>
            </div>
            <div className="text-center">
                <div className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">▼</span>
                </div>
                <span className="text-white text-xs font-medium">Lower</span>
            </div>
        </div>
    </div>
);

/* -------------------------------------------------------
   Hints panel (stable two-row, aligned)
------------------------------------------------------- */
const HINT_DEFS = [
    { key: 'hint1', name: 'Quote',  threshold: 6,  icon: '💬' },
    { key: 'hint2', name: 'Hint 1', threshold: 12, icon: '💡' },
    { key: 'hint3', name: 'Hint 2', threshold: 18, icon: '💡' },
];

const HintCircleButton = ({ name, icon, threshold, guessesCount, revealed, canReveal, onReveal, isWon }) => {
    const isUnlocked = guessesCount >= threshold;
    const textColor   = isUnlocked ? (revealed ? 'text-blue-100' : 'text-white') : 'text-gray-300';
    const bgColor     = isUnlocked ? 'bg-white/20' : 'bg-gray-700/50';
    const borderColor = isUnlocked ? 'border-white/30' : 'border-gray-600';
    const hoverClass  = canReveal ? 'hover:scale-105 hover:bg-white/30' : '';
    const cursorClass = canReveal ? 'cursor-pointer' : 'cursor-not-allowed';

    return (
        <button
            type="button"
            onClick={() => canReveal && onReveal()}
            disabled={!canReveal}
            className={`flex flex-col items-center justify-center w-28 h-28 rounded-full shadow-lg transition-all duration-300
                  ${bgColor} ${borderColor} border-2 ${hoverClass} ${cursorClass} relative text-center p-2`}
            aria-disabled={!canReveal}
            aria-label={name}
        >
            <div className="text-4xl mb-1">{icon}</div>
            <p className={`font-semibold text-xs ${textColor} leading-tight mb-1`}>{name}</p>
            <p className={`text-xs ${textColor} leading-tight`}>
                {isUnlocked ? (revealed ? 'Revealed' : (isWon ? '—' : 'Click to Reveal')) : `In ${threshold - guessesCount} tries`}
            </p>
            {!isUnlocked && !revealed && <div className="absolute inset-0 rounded-full bg-black/30 pointer-events-none" />}
        </button>
    );
};

const HintsPanel = ({
                        targetCard,
                        guessesCount,
                        revealedHints,
                        onReveal,
                        isWon
                    }) => {
    const revealedList = HINT_DEFS.filter(h => revealedHints[h.key]);

    return (
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <p className="text-blue-200 text-2xl font-medium mb-4">
                Guess today's Clash Royale Card
            </p>

            {/* Circles row */}
            {guessesCount >= 2 && (
                <div className="flex flex-wrap justify-center items-start gap-4">
                    {HINT_DEFS.map(h => {
                        const revealed  = !!revealedHints[h.key];
                        const canReveal = !isWon && !revealed && guessesCount >= h.threshold;
                        return (
                            <HintCircleButton
                                key={h.key}
                                name={h.name}
                                icon={h.icon}
                                threshold={h.threshold}
                                guessesCount={guessesCount}
                                revealed={revealed}
                                canReveal={canReveal}
                                isWon={isWon}
                                onReveal={() => onReveal(h.key)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Revealed area */}
            {guessesCount >= 2 && (
                <div className="mt-4 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-lg text-left">
                    <div className="max-h-40 overflow-y-auto pr-1 space-y-4">
                        {revealedList.length === 0 ? (
                            <p className="text-blue-200/80 text-sm text-center">
                                Reveal hints to see them here.
                            </p>
                        ) : (
                            revealedList.map(h => (
                                <div key={h.key}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{h.icon}</span>
                                        <span className="text-blue-100 font-semibold">{h.name}:</span>
                                    </div>
                                    <p className="ml-10 text-blue-100 text-sm leading-relaxed">
                                        {targetCard[h.key]}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const makeSolvedRow = (card) => ({
    ...card,
    comparison: compareAttributes(card, card),
});

/* -------------------------------------------------------
   Main game
------------------------------------------------------- */
const ClassicGame = () => {
    const [targetCard] = useState(() => getDailyCard(cardsData));
    const [guesses, setGuesses] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [flippingRows, setFlippingRows] = useState(new Set());
    const [showLegend, setShowLegend] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [guessQueue, setGuessQueue] = useState([]);
    const [revealedHints, setRevealedHints] = useState({ hint1: false, hint2: false, hint3: false });

    const [stats, setStats] = useState(() => loadStats());
    const [showWinModal, setShowWinModal] = useState(false);
    const dayKey = useMemo(() => getLocalDayKey(), []);
    const dayIndex = useMemo(() => getDayIndex(), []);

    const CLASH_ROYALE_CLASSIC_ROUTE = '/';
    const shareUrl = useMemo(() => buildUrl(CLASH_ROYALE_CLASSIC_ROUTE), []);

    const handleShare = async () => {
        const text = buildShareText({
                  dayIndex,
                  guessCount: guesses.length,
                  attributes,
                  guesses,
                  url: shareUrl, // optional since buildShareText can build it too, but explicit is fine
                });
        if (navigator.share) {
            try { await navigator.share({ text }); return; } catch {}
        }
        const ok = await copyToClipboard(text);
    };

    const ENABLE_DAILY_LOCK = false;

    // ---- Restore today's state (if lock is ON) or start fresh (if OFF) ----
    useEffect(() => {
        if (!ENABLE_DAILY_LOCK) {
            try { localStorage.removeItem(storageKeyForToday()); } catch {}
            setIsWon(false);
            setGuesses([]);
            setGuessQueue([]);
            setRevealedHints({ hint1: false, hint2: false, hint3: false });
            return;
        }

        try {
            const raw = localStorage.getItem(storageKeyForToday());
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data?.card || data.card !== targetCard.card) return;

            let hydrated = Array.isArray(data.guesses) ? data.guesses.slice() : [];

            // This logic correctly ensures the "all green" solved row is present on load.
            const hasSolved = hydrated.some(g => g?.card === targetCard.card);
            if (data.isWon && !hasSolved) {
                hydrated.unshift(makeSolvedRow(targetCard));
            } else {
                hydrated = hydrated.map(g =>
                    (g?.card === targetCard.card && !g.comparison) ? makeSolvedRow(targetCard) : g
                );
            }

            setGuesses(hydrated);
            setIsWon(!!data.isWon);
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ENABLE_DAILY_LOCK, targetCard.card]);


    // ---- Save today's result when the player wins ----
    useEffect(() => {
        if (!ENABLE_DAILY_LOCK) return;
        if (!isWon) return;

        try {
            // Ensure the final saved state has a fully solved row if it's missing for any reason
            const hasSolved = guesses.some(g => g.card === targetCard.card);
            const toSave = hasSolved ? guesses : [makeSolvedRow(targetCard), ...guesses];

            localStorage.setItem(storageKeyForToday(), JSON.stringify({
                card: targetCard.card,
                isWon: true,
                guesses: toSave,
                ts: Date.now(),
            }));
        } catch {}
        // The dependency array here is correct and won't cause a loop.
    }, [ENABLE_DAILY_LOCK, isWon, guesses, targetCard.card]);


    // exclude already guessed/queued from suggestions
    const guessedSet = new Set(guesses.map(g => g.card.trim().toLowerCase()));
    const queuedSet  = new Set(guessQueue.map(g => g.card.trim().toLowerCase()));

    const filteredCards = cardsData.filter(card => {
        const name = card.card.trim().toLowerCase();
        return (
            name.startsWith(inputValue.trim().toLowerCase()) &&
            !guessedSet.has(name) &&
            !queuedSet.has(name)
        );
    });

    useEffect(() => {
        if (!isAnimating && guessQueue.length > 0) {
            const nextGuess = guessQueue[0];
            setGuessQueue(prev => prev.slice(1));
            processGuess(nextGuess);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAnimating, guessQueue]);

    useEffect(() => {
        if (!isWon) return;
        // Update local stats for today (idempotent per dayKey)
        const updated = updateStatsOnWin(guesses.length, dayKey);
        setStats(updated);
        setShowWinModal(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWon]);

    const attributes = useMemo(() => ([
        { key: 'rarity',          label: 'Rarity' },
        { key: 'cost',            label: 'Cost' },
        { key: 'type',            label: 'Type' },
        { key: 'targets',         label: 'Targets' },
        { key: 'healthCategory',  label: 'Health' },
        { key: 'arena',           label: 'Arena' },
        { key: 'moveSpeed',       label: 'Speed' },
        { key: 'year',            label: 'Year' }
    ]), []);

    const processGuess = (card) => {
        setIsAnimating(true);
        const comparison = compareAttributes(card, targetCard);
        const newGuess = { ...card, comparison };
        setGuesses(prev => [newGuess, ...prev]);

        setFlippingRows(new Set([0]));

        const lastCardDelay = (attributes.length - 1) * 500;
        const flipDuration = 700;
        const buffer = 300;
        const totalAnimationTime = lastCardDelay + flipDuration + buffer;

        setTimeout(() => {
            setFlippingRows(new Set());
            setIsAnimating(false);
            if (card.card === targetCard.card) setTimeout(() => setIsWon(true), 500);
        }, totalAnimationTime);
    };

    const handleGuess = (card) => {
        if (ENABLE_DAILY_LOCK && isWon) return; // only block when lock is ON
        if (guesses.length === 0) setStats(markAttempt(dayKey)); // mark "played" on first guess of the day

        const name = card.card.trim().toLowerCase();
        const alreadyGuessed = guesses.some(g => g.card.trim().toLowerCase() === name);
        const alreadyQueued  = guessQueue.some(g => g.card.trim().toLowerCase() === name);
        if (alreadyGuessed || alreadyQueued) return;

        setInputValue('');
        setShowSuggestions(false);

        if (isAnimating) {
            setGuessQueue(prev => (prev.some(g => g.card.trim().toLowerCase() === name) ? prev : [...prev, card]));
        } else {
            processGuess(card);
        }
    };

    const handleRevealHint = (hintKey) => setRevealedHints(prev => ({ ...prev, [hintKey]: true }));

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-[#0b1f3a] via-[#0b3a82] to-[#0c59b6]">
            {/* CSS blocks */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .animate-flip { animation: flip 0.6s ease-in-out; }
                @keyframes flip {
                    0% { transform: rotateY(0deg); }
                    50% { transform: rotateY(90deg) scale(0.95); }
                    100% { transform: rotateY(180deg); }
                }
                /* Diamond IMAGE overlay styles */
                .diamond-img {
                    background-image: url('/bg/clashroyale/diamonds-1280.png');
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: cover;
                    opacity: 0.28;
                    mix-blend-mode: overlay;
                }
                @supports (background-image: image-set(url('/bg/clashroyale/diamonds-640.png') 1x)) {
                    .diamond-img {
                        background-image: image-set(
                                url('/bg/clashroyale/diamonds-640.png') 1x,
                                url('/bg/clashroyale/diamonds-1280.png') 2x,
                                url('/bg/clashroyale/diamonds-1920.png') 3x
                        );
                    }
                }
                @media (min-width: 1536px) {
                    .diamond-img { opacity: 0.24; }
                }
            `}</style>

            {/* Diamond IMAGE overlay (above blobs, below content) */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10 diamond-img" />

            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_12s_ease-in-out_infinite]"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_14s_ease-in-out_infinite_2s]"></div>
                <div
                    className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_16s_ease-in-out_infinite_4s]"></div>
            </div>


            {/* Main content */}
            <div className="relative z-20 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              CLASHDLE
            </span>
                    </h1>

                    {/* Hints */}
                    <HintsPanel
                        targetCard={targetCard}
                        guessesCount={guesses.length}
                        revealedHints={revealedHints}
                        onReveal={handleRevealHint}
                        isWon={isWon}
                    />

                    <div className="mt-4 flex justify-center space-x-4 text-sm text-blue-300">
                        <span>Guesses: {guesses.length}</span>
                        <span>•</span>
                        <span>Status: {isWon ? '🎉 Victory!' : '🎯 Guessing...'}</span>
                        {guessQueue.length > 0 && (<><span>•</span><span>Queue: {guessQueue.length}</span></>)}
                    </div>
                </div>

                {/* Main Game */}
                <div className="max-w-6xl mx-auto px-4">
                    {/* Search */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="relative w-96">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && filteredCards.length > 0 && !isWon) {
                                        e.preventDefault();
                                        handleGuess(filteredCards[0]);
                                    }
                                    if (e.key === 'Escape') setShowSuggestions(false);
                                }}
                                placeholder="Enter card name..."
                                disabled={isWon}
                                className="w-full px-6 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">🔍</span>
                                </div>
                            </div>
                        </div>

                        {showSuggestions && inputValue.length > 0 && filteredCards.length > 0 && !isWon && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 mt-2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                {filteredCards.slice(0, 8).map((card, index) => (
                                    <SuggestionItem
                                        key={card.card}
                                        name={card.card}
                                        isFirst={index === 0}
                                        onClick={() => handleGuess(card)}
                                        game="clashroyale"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Victory */}
                    {/*{isWon && (*/}
                    {/*    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl">*/}
                    {/*        <div className="text-center">*/}
                    {/*            <h2 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h2>*/}
                    {/*            <p className="text-emerald-100 text-lg">*/}
                    {/*                You guessed <span className="font-bold">{targetCard.card}</span> in {guesses.length} tries!*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    {isWon && (
                        <WinPanelCompact
                            cardName={targetCard.card}
                            dayIndex={dayIndex}
                            dayKey={dayKey}
                            guesses={guesses}
                            attributes={attributes}
                            stats={stats}
                            onOpenStats={() => setShowWinModal(true)} // keeps your modal for deeper stats if you like
                            // shareUrl="https://your-domain.com"
                            // nextModeHref="/clashroyale/quote"
                            shareUrl={shareUrl}
                            onShare={handleShare}
                        />
                    )}


                    {/* Guess Grid */}
                    <div className="flex flex-col items-center">
                        {guesses.length > 0 && (
                            <div className="mb-4">
                                <div className="grid grid-cols-[repeat(9,5rem)] gap-1">
                                    <div className="text-center text-base font-bold text-white pb-2">
                                        <span className="inline-block border-b-4 border-white pb-2 w-20">Card</span>
                                    </div>
                                    {attributes.map(attr => (
                                        <div key={attr.key} className="text-center text-base font-bold text-white pb-2">
                                            <span className="inline-block border-b-4 border-white pb-2 w-20">{attr.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {guesses.map((guess, rowIndex) => (
                                <div key={`${guess.card}-${rowIndex}`} className="grid grid-cols-[repeat(9,5rem)] gap-1">
                                    <CardPortrait name={guess.card} zoom={1.30} focus="center 60%" />
                                    {attributes.map((attr, attrIndex) => (
                                        <AttributeCard
                                            key={`${attr.key}-${rowIndex}`}
                                            attribute={attr.key}
                                            value={guess[attr.key]}
                                            status={guess.comparison ? guess.comparison[attr.key] : ''}
                                            isFlipping={flippingRows.has(rowIndex)}
                                            delay={attrIndex * 500}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    {guesses.length === 0 && (
                        <div className="w-96 mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mt-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center underline decoration-2 underline-offset-4">
                                How to Play
                            </h2>
                            <div className="text-blue-200 space-y-2">
                                <p>• Guess the daily Clash Royale card in unlimited tries</p>
                                <p>• Refreshes Daily</p>
                                <p>• <span className="inline-block w-4 h-4 bg-emerald-500 rounded mr-2"></span> Green = Correct</p>
                                <p>• <span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span> Red = Wrong</p>
                                <p>• <span className="inline-block w-4 h-4 bg-amber-500 rounded mr-2"></span> Yellow = Partial</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                {showLegend && <InlineLegend onClose={() => setShowLegend(false)} />}

            </div>
            <WinModal
                isOpen={showWinModal}
                onClose={() => setShowWinModal(false)}
                dayIndex={dayIndex}
                dayKey={dayKey}
                guesses={guesses}
                attributes={attributes}
                stats={stats}
                // shareUrl="https://your-domain.com" // set this when ready
                shareUrl={shareUrl}
                onShare={handleShare}
            />

        </div>


    );
};

export default ClassicGame;
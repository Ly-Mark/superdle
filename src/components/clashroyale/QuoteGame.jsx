import React, { useMemo, useState, useEffect } from "react";
// import WinModal from "../../components/clashroyale/WinModal.jsx";
import WinPanelCompact from "../../components/clashroyale/WinPanelCompact.jsx";
import { buildShareText, copyToClipboard } from "../../utils/clashroyale/shareText.js";
import { buildUrl } from "../../utils/shareBase.js";

import { useDailyModeGame } from "./useDailyModeGame.js";

/* ------------ same slugify + SuggestionItem from Classic (copy/paste) ------------ */
const slugify = (name) =>
    String(name)
        .toLowerCase()
        .replace(/p\.?\s*e\.?\s*k\.?\s*k\.?\s*a/gi, "pekka")
        .replace(/&/g, "and")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const getThumbSources = (game, slug) => [
    `/games/${game}/cards/${slug}.webp`,
    `/games/${game}/cards/${slug}.png`,
    `/games/${game}/cards/${slug}.jpg`,
];

const SuggestionItem = ({ name, onClick, isFirst, game = "clashroyale" }) => {
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
        ${isFirst ? "bg-blue-100 hover:bg-blue-150" : "hover:bg-blue-50"}`}
            role="option"
            aria-selected={false}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-white/40 bg-gray-200 shrink-0">
                    {!failed ? (
                        <img
                            src={sources[idx]}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ transform: "scale(1.35)", transformOrigin: "center" }}
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

            {isFirst && <span className="ml-2 text-xs text-blue-600 font-medium">↵ Enter</span>}
        </div>
    );
};

const GuessTile = ({ name, isCorrect, game = "clashroyale" }) => {
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
            className={`w-full rounded-xl border-2 shadow-lg overflow-hidden
        ${isCorrect ? "bg-emerald-500/85 border-emerald-200/60" : "bg-red-500/75 border-white/30"}`}
        >
            <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-16 h-16 rounded-md overflow-hidden ring-2 ring-white/30 bg-black/20">
                    {!failed ? (
                        <img
                            src={sources[idx]}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ transform: "scale(1.35)", transformOrigin: "center" }}
                            loading="lazy"
                            decoding="async"
                            onError={handleError}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                            {name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="mt-2 text-white font-extrabold text-lg drop-shadow">
                    {name}
                </div>
            </div>
        </div>
    );
};

/* ------------ Description mode UI ------------ */

const HINT_UNLOCK_AT = 5; // guesses needed before hint button enabled

export default function QuoteGame() {
    const {
        targetCard,
        guesses,
        inputValue,
        setInputValue,
        showSuggestions,
        setShowSuggestions,
        filteredCards,
        isWon,
        stats,
        // showWinModal,
        // setShowWinModal,
        dayKey,
        dayIndex,
        handleGuess,
    } = useDailyModeGame({
        storagePrefix: "clashle:description",
        enableDailyLock: true,
        modeSalt: "description",
    });

    // single elixir hint (persisted in same day storage via guesses/isWon already,
    const hintStorageKey = useMemo(() => `clashle:description:hint:${dayKey}`, [dayKey]);
    const [hintRevealed, setHintRevealed] = useState(false);
    const [hintJustUnlocked, setHintJustUnlocked] = useState(false);
    const canRevealHint = !isWon && !hintRevealed && guesses.length >= HINT_UNLOCK_AT;

    const triesRemaining = Math.max(0, HINT_UNLOCK_AT - guesses.length);

    const hintText = hintRevealed
        ? "Clue revealed"
        : (canRevealHint ? "Reveal clue" : `Reveal Clue In ${triesRemaining} ${triesRemaining === 1 ? "try" : "tries"}`);


    useEffect(() => {
        try {
            const raw = localStorage.getItem(hintStorageKey);
            if (!raw) return;
            setHintRevealed(JSON.parse(raw) === true);
        } catch {}
    }, [hintStorageKey]);

    useEffect(() => {
        try {
            localStorage.setItem(hintStorageKey, JSON.stringify(hintRevealed));
        } catch {}
    }, [hintStorageKey, hintRevealed]);

    useEffect(() => {
        if (canRevealHint) {
            setHintJustUnlocked(true);
            const t = setTimeout(() => setHintJustUnlocked(false), 900);
            return () => clearTimeout(t);
        }
    }, [canRevealHint]);

    const shareUrl = useMemo(() => buildUrl("/clashroyale/quote"), []);
    const attributes = useMemo(
        () => [
            // Description mode doesn’t use the Classic grid, but WinModal/ShareText want attributes sometimes.
            // Provide empty list to stay safe.
        ],
        []
    );

    const handleShare = async () => {
        const text = buildShareText({
            dayIndex,
            guessCount: guesses.length,
            attributes: [], // no attribute tiles in this mode yet
            guesses: [],    // no grid share yet
            url: shareUrl,
        });

        if (navigator.share) {
            try {
                await navigator.share({ text });
                return;
            } catch {}
        }
        await copyToClipboard(text);
    };

    const prompt = targetCard.description || targetCard.hint1 || "No description available.";

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-[#0b1f3a] via-[#0b3a82] to-[#0c59b6]">
            <style>{`
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
            {/* Diamond IMAGE overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-10 diamond-img"
            />

            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_12s_ease-in-out_infinite]"
                />
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_14s_ease-in-out_infinite_2s]"
                />
                <div
                    className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_16s_ease-in-out_infinite_4s]"
                />
            </div>


            <div className="relative z-20 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              CLASHDLE
            </span>
                    </h1>

                    {/* Prompt panel styled similarly to Classic hints panel */}
                    <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <p className="text-blue-200 text-2xl md:text-3xl font-semibold mb-4">
                            Which card is...
                        </p>

                        <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-6 md:p-8 shadow-lg min-h-[180px] md:min-h-[220px] flex items-center">
                            <p className="text-white text-2xl md:text-3xl leading-snug font-semibold text-center w-full">
                                “{prompt}”
                            </p>

                        </div>

                        {/* Single hint */}
                        <div className="mt-5 flex flex-col items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => canRevealHint && setHintRevealed(true)}
                                disabled={!canRevealHint || hintRevealed}
                                className={[
                                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                                    canRevealHint && !hintRevealed ? "bg-white/20 hover:bg-white/30 cursor-pointer" : "bg-gray-700/50 cursor-not-allowed opacity-80",
                                    hintJustUnlocked ? "hint-pop animate-pulse" : "",
                                ].join(" ")}
                                aria-label="Reveal hint"
                            >
                                <img
                                    src="/games/clashroyale/icons/elixir.png"
                                    alt="Elixir hint"
                                    draggable={false}
                                    className={[
                                        "w-10 h-10 transition-all duration-500",
                                        canRevealHint ? "grayscale-0 opacity-100" : "grayscale opacity-60",
                                        hintJustUnlocked ? "scale-110" : "scale-100",
                                    ].join(" ")}
                                />
                            </button>

                            <div className={`text-m ${canRevealHint ? "text-blue-100" : "text-blue-200/80"}`}>
                                {hintText}
                            </div>

                            {(hintRevealed || isWon) && (
                                <div className="mt-2 px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white font-semibold">
                                    Elixir Cost: {targetCard.cost}
                                </div>
                            )}
                        </div>



                        <div className="mt-4 flex justify-center space-x-4 text-sm text-blue-300">
                            <span>Guesses: {guesses.length}</span>
                            <span>•</span>
                            <span>Status: {isWon ? "🎉 Victory!" : "🎯 Guessing..."}</span>
                        </div>
                    </div>
                </div>

                {/* Search (same behavior as Classic) */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative mb-8 flex justify-center">
                        <div className="relative w-96">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && filteredCards.length > 0 && !isWon) {
                                        e.preventDefault();
                                        handleGuess(filteredCards[0]);
                                    }
                                    if (e.key === "Escape") setShowSuggestions(false);
                                }}
                                placeholder="Enter card name..."
                                disabled={isWon}
                                className="w-full px-6 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
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

                    {/* Guess History (tiles) */}
                    {guesses.length > 0 && (
                        <div className="max-w-md mx-auto mt-6 space-y-3">
                            {guesses.map((g, i) => (
                                <GuessTile
                                    key={`${g.card}-${i}`}
                                    name={g.card}
                                    isCorrect={g.card === targetCard.card}
                                    game="clashroyale"
                                />
                            ))}
                        </div>
                    )}

                    {/* Win panel (reuse existing component) */}
                    {isWon && (
                        <WinPanelCompact
                            cardName={targetCard.card}
                            dayIndex={dayIndex}
                            dayKey={dayKey}
                            guesses={guesses}
                            attributes={[]} // no classic attributes in this mode
                            stats={stats}
                            // onOpenStats={() => setShowWinModal(true)}
                            shareUrl={buildUrl("/clashroyale/quote")}
                            nextModeHref="/"
                            onShare={handleShare}
                        />
                    )}
                </div>

                {/*<WinModal*/}
                {/*    isOpen={showWinModal}*/}
                {/*    onClose={() => setShowWinModal(false)}*/}
                {/*    dayIndex={dayIndex}*/}
                {/*    dayKey={dayKey}*/}
                {/*    guesses={guesses}*/}
                {/*    attributes={[]} // no attribute grid*/}
                {/*    stats={stats}*/}
                {/*    shareUrl={buildUrl("/clashroyale/quote")}*/}
                {/*    onShare={handleShare}*/}
                {/*/>*/}
            </div>
        </div>
    );
}

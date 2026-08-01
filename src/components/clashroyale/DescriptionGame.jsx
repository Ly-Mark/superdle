import React, { useMemo, useState, useEffect } from "react";
import ClashroyaleBackground from "../../components/clashroyale/CRBackground.jsx";
import CardThumb from "../../components/clashroyale/CardThumb.jsx";
import WinPanelCompact from "../../components/clashroyale/WinPanelCompact.jsx";
import { buildUrl } from "../../utils/shareBase.js";
import GameModeNav from "./GameModeNav";
import ModeIntro from "../layout/ModeIntro.jsx";

import { useDailyModeGame } from "./useDailyModeGame.js";

const SuggestionItem = ({ name, onClick, isFirst, game = "clashroyale" }) => {
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
                <CardThumb name={name} game={game} />
                <span className="font-semibold text-gray-800 truncate">{name}</span>
            </div>

            {isFirst && <span className="ml-2 text-xs text-blue-600 font-medium">↵ Enter</span>}
        </div>
    );
};


const GuessTile = ({ name, isCorrect, game = "clashroyale" }) => {
    return (
        <div
            className={`w-full rounded-xl border-2 shadow-lg overflow-hidden
        ${isCorrect ? "bg-emerald-500/85 border-emerald-200/60" : "bg-red-500/75 border-white/30"}`}
        >
            <div className="flex flex-col items-center justify-center py-2">
                <CardThumb
                    name={name}
                    game={game}
                    className="relative w-16 h-16 rounded-md overflow-hidden ring-2 ring-white/30 bg-black/20"
                    fallbackClassName="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white"
                />

                <div className="mt-2 text-white font-extrabold text-lg drop-shadow">
                    {name}
                </div>
            </div>
        </div>
    );
};


/* ------------ Description mode UI ------------ */

const HINT_UNLOCK_AT = 5; // guesses needed before hint button enabled

export default function DescriptionGame() {
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
        storagePrefix: "clashdle:description",
        enableDailyLock: true,
        modeSalt: "description",
    });

    // single elixir hint (persisted in same day storage via guesses/isWon already,
    const hintStorageKey = useMemo(() => `clashdle:description:hint:${dayKey}`, [dayKey]);
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

    const shareUrl = useMemo(() => buildUrl("/clashroyale/description"), []);

    const shareText = useMemo(() => {
        const tries = guesses.length;
        const tiles = [...guesses].reverse()
            .map((g) => (g.card === targetCard.card ? '🟩' : '🟥'))
            .join('');
        const header = `CLASHDLE #${dayIndex} — ${tries} ${tries === 1 ? 'try' : 'tries'}`;
        return `${header}\n${tiles}\n${shareUrl}`;
    }, [guesses, targetCard.card, dayIndex, shareUrl]);

    const prompt = targetCard.description || targetCard.hint1 || "No description available.";

    return (
        <ClashroyaleBackground>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Decorative wordmark — the real <h1> is in ModeIntro below. */}
                    <div className="mb-4">
                        <img
                            src="/wordmark.png"
                            alt="Clashdle"
                            className="mx-auto min-h-36 sm:h-28 md:h-28 w-auto"
                        />
                    </div>
                    <GameModeNav />

                    <ModeIntro title="Description Mode — Guess the Card from Its Description">
                        <p>
                            Description mode gives you a card&apos;s flavour text instead of its
                            stats. You get a short line describing what the card does, and you
                            have to name it. It&apos;s a different kind of recall from Classic —
                            attribute comparison won&apos;t help you here, so it rewards players
                            who actually read card text rather than memorising elixir costs. One
                            hint unlocks after a few guesses if you stall. Like Classic, the card
                            changes daily, and your progress is saved if you close the tab and
                            come back.
                        </p>
                    </ModeIntro>
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
                        <div className="relative w-full max-w-sm sm:max-w-md">
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

                            {showSuggestions && inputValue.length > 0 && filteredCards.length > 0 && !isWon && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
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
                    </div>

                    {/* Win panel (reuse existing component) */}
                    {isWon && (
                        <WinPanelCompact
                            cardName={targetCard.card}
                            dayIndex={dayIndex}
                            dayKey={dayKey}
                            guesses={guesses}
                            attributes={[]}
                            stats={stats}
                            currentMode="description"
                            shareUrl={shareUrl}
                            shareTextOverride={shareText}
                        />
                    )}

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

                </div>
            </div>
        </ClashroyaleBackground>
);
}

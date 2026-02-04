// src/components/clashroyale/RushGame.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../../data/cards.json";
import { getRushCard } from "../../utils/clashroyale/gamelogic.js";

// If Classic has shared UI pieces you can import (AutocompleteInput, GuessRow, etc.),
// use them here. If not, keep this self-contained and we’ll refactor later.

const DEFAULT_DURATION = 120; // seconds

export default function RushGame() {
    const cards = useMemo(() => cardsData, []);
    const [duration] = useState(DEFAULT_DURATION);

    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);

    const [roundIndex, setRoundIndex] = useState(0);
    const targetCard = useMemo(() => getRushCard(cards, roundIndex), [cards, roundIndex]);

    const [score, setScore] = useState(0);

    // Round state
    const [guesses, setGuesses] = useState([]); // store guessed card objects (or names)
    const [inputValue, setInputValue] = useState("");

    // Prevent interval duplication in dev StrictMode
    const intervalRef = useRef(null);

    // --- TIMER ---
    useEffect(() => {
        if (!isRunning) return;

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    // stop at 0
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [isRunning]);

    useEffect(() => {
        if (timeLeft === 0) setIsRunning(false);
    }, [timeLeft]);

    // --- HELPERS ---
    const normalize = (s) => (s ?? "").toLowerCase().trim();

    const filteredSuggestions = useMemo(() => {
        const q = normalize(inputValue);
        if (!q) return cards.slice(0, 12);
        return cards
            .filter((c) => normalize(c.card).includes(q))
            .slice(0, 12);
    }, [cards, inputValue]);

    function resetRound(nextRoundIndex) {
        setGuesses([]);
        setInputValue("");
        setRoundIndex(nextRoundIndex);
    }

    function submitGuess(cardName) {
        if (!isRunning) return;
        const match = cards.find((c) => normalize(c.card) === normalize(cardName));
        if (!match) return;

        setGuesses((g) => [match, ...g]);

        const isCorrect = normalize(match.card) === normalize(targetCard.card);
        if (isCorrect) {
            setScore((s) => s + 1);
            resetRound(roundIndex + 1);
        } else {
            setInputValue("");
        }
    }

    function onPlayAgain() {
        setScore(0);
        setRoundIndex(0);
        setGuesses([]);
        setInputValue("");
        setTimeLeft(duration);
        setIsRunning(true);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="mx-auto max-w-3xl px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Rush Mode</h1>
                        <p className="text-sm text-white/70">Guess as many as you can before time runs out.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                            <div className="text-xs text-white/60">Time</div>
                            <div className="text-lg font-semibold tabular-nums">{timeLeft}s</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                            <div className="text-xs text-white/60">Score</div>
                            <div className="text-lg font-semibold tabular-nums">{score}</div>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-6">
                    <div className="flex gap-2">
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                            value={inputValue}
                            disabled={!isRunning}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitGuess(inputValue);
                            }}
                            placeholder={isRunning ? "Type a card name…" : "Time’s up!"}
                        />
                        <button
                            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:hover:bg-white/10"
                            disabled={!isRunning}
                            onClick={() => submitGuess(inputValue)}
                        >
                            Guess
                        </button>
                    </div>

                    {/* Suggestions */}
                    {isRunning && filteredSuggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filteredSuggestions.map((c) => (
                                <button
                                    key={c.card}
                                    className="text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1"
                                    onClick={() => submitGuess(c.card)}
                                >
                                    {c.card}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Guesses */}
                <div className="space-y-2">
                    {guesses.map((g, idx) => {
                        const correct = normalize(g.card) === normalize(targetCard.card);
                        return (
                            <div
                                key={`${g.card}-${idx}`}
                                className={`rounded-2xl border px-4 py-3 ${
                                    correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                                }`}
                            >
                                {/* No flip animation: instant colored tile */}
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">{g.card}</div>
                                    <div className="text-xs text-white/70">{correct ? "Correct" : "Wrong"}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* End state */}
                {!isRunning && (
                    <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
                        <div className="text-xl font-bold">Time’s up!</div>
                        <div className="text-white/80 mt-1">Final score: <span className="font-semibold">{score}</span></div>

                        <button
                            className="mt-4 rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10"
                            onClick={onPlayAgain}
                        >
                            Play again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

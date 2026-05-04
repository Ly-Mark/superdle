import React, { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../../data/cards.json";
import GameModeNav from "./GameModeNav";
import CRBackground from "../../components/clashroyale/CRBackground.jsx";
import CardThumb from "../../components/clashroyale/CardThumb.jsx";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
const normalize = (s) => (s ?? "").toLowerCase().trim();
const RARITY_ORDER = ["Common", "Rare", "Epic", "Legendary", "Champion"];

const DEFAULT_DURATION = 2 * 60; // seconds

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// very small “fuzzy” for singular/plural
function pluralVariants(key) {
    const variants = new Set([key]);

    // if user typed singular, try plural
    variants.add(`${key}s`);
    variants.add(`${key}es`);

    // if user typed plural, try singular-ish
    if (key.endsWith("s")) variants.add(key.slice(0, -1));
    if (key.endsWith("es")) variants.add(key.slice(0, -2));

    // ies -> y (fairly common)
    if (key.endsWith("ies")) variants.add(key.slice(0, -3) + "y");

    return Array.from(variants);
}

const MIN_FUZZY_LEN = 6;          // avoid fuzzing short generic inputs
const MAX_EDIT_DISTANCE = 2;      // 1–2 is “typos”, 3+ gets too loose

// small, fast Levenshtein (edit distance)
function levenshtein(a, b) {
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;

    // ensure b is the shorter for less memory
    if (bl > al) return levenshtein(b, a);

    let prev = Array(bl + 1);
    for (let j = 0; j <= bl; j++) prev[j] = j;

    for (let i = 1; i <= al; i++) {
        let cur = [i];
        const ca = a.charCodeAt(i - 1);
        for (let j = 1; j <= bl; j++) {
            const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
            cur[j] = Math.min(
                prev[j] + 1,      // delete
                cur[j - 1] + 1,   // insert
                prev[j - 1] + cost // substitute
            );
        }
        prev = cur;
    }
    return prev[bl];
}


export default function MemoryGame() {
    const cards = useMemo(() => cardsData, []);

    const [inputValue, setInputValue] = useState("");
    const [foundSet, setFoundSet] = useState(() => new Set());
    const [message, setMessage] = useState("");

    // Timer: doesn’t start until first guess
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
    const [hasStarted, setHasStarted] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const cardMap = useMemo(() => {
        const m = new Map();
        for (const c of cards) m.set(normalize(c.card), c);
        return m;
    }, [cards]);

    const normalizedNames = useMemo(() => {
        // array of normalized names for fuzzy scanning
        return cards.map((c) => normalize(c.card));
    }, [cards]);

    const grouped = useMemo(() => {
        const groups = new Map();
        for (const c of cards) {
            const rarity = c.rarity || "Unknown";
            if (!groups.has(rarity)) groups.set(rarity, []);
            groups.get(rarity).push(c);
        }
        for (const [r, list] of groups.entries()) {
            list.sort((a, b) => a.card.localeCompare(b.card));
            groups.set(r, list);
        }
        return groups;
    }, [cards]);

    const rarities = useMemo(() => {
        const existing = Array.from(grouped.keys());
        return [
            ...RARITY_ORDER.filter((r) => existing.includes(r)),
            ...existing.filter((r) => !RARITY_ORDER.includes(r)).sort(),
        ];
    }, [grouped]);

    const totalCount = cards.length;
    const foundCount = foundSet.size;
    const isGameOver = timeLeft === 0;

    // Timer ticking
    useEffect(() => {
        if (!isRunning) return;

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
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

    const resolveCard = (raw) => {
        const key = normalize(raw);
        if (!key) return null;

        // 1) exact + plural variants (keep current behavior)
        const keysToTry = pluralVariants(key);
        for (const k of keysToTry) {
            const hit = cardMap.get(k);
            if (hit) return hit;
        }

        // 2) conservative fuzzy fallback (typos only)
        // Guardrails:
        // - avoid fuzzing very short inputs (e.g., "hog", "goblin")
        // - require exactly ONE close match
        if (key.length < MIN_FUZZY_LEN) return null;

        let best = null;
        let bestDist = Infinity;
        let tie = false;

        for (const candidate of normalizedNames) {
            // quick length gate: if lengths differ too much, skip
            const lenDiff = Math.abs(candidate.length - key.length);
            if (lenDiff > MAX_EDIT_DISTANCE) continue;

            const d = levenshtein(key, candidate);
            if (d < bestDist) {
                bestDist = d;
                best = candidate;
                tie = false;
            } else if (d === bestDist) {
                // two equally good matches => ambiguous => no award
                tie = true;
            }
        }

        if (!best || tie || bestDist > MAX_EDIT_DISTANCE) return null;
        return cardMap.get(best) || null;
    };

    const submitGuess = (raw) => {
        const trimmed = normalize(raw);
        if (!trimmed) return;

        // Start timer on first attempt (whether correct or not)
        if (!hasStarted) {
            setHasStarted(true);
            setIsRunning(true);
        }
        if (!isRunning && timeLeft === 0) return;

        const card = resolveCard(raw);
        if (!card) {
            setMessage("Not a card name.");
            return;
        }

        const k = normalize(card.card);
        if (foundSet.has(k)) {
            setMessage("Already found!");
            return;
        }

        const next = new Set(foundSet);
        next.add(k);
        setFoundSet(next);
        setMessage(`✅ Found: ${card.card}`);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        submitGuess(inputValue);
        setInputValue("");
    };

    const onReset = () => {
        setFoundSet(new Set());
        setInputValue("");
        setMessage("");
        setTimeLeft(DEFAULT_DURATION);
        setHasStarted(false);
        setIsRunning(false);
    };

    return (
        <CRBackground>
            <div className="container mx-auto px-4 py-8">
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              CLASHDLE
            </span>
                    </h1>
                    <GameModeNav />
                </div>

                {/* ONE centered top panel (instructions + input + stats) */}
                <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 mb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr_1fr] gap-4 items-start">

                        {/* Instructions square */}
                        <div className="bg-white/5 border border-white/15 rounded-2xl p-4">
                            <h2 className="text-lg font-bold text-white mb-3 underline decoration-2 underline-offset-4">
                                How to Play
                            </h2>
                            <div className="text-blue-200 space-y-2 text-sm">
                                <p>• Type card names from memory</p>
                                <p>• Timer starts on first guess ⏱️</p>
                            </div>
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={onSubmit}
                            className="bg-white/5 border border-white/15 rounded-2xl p-4"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={timeLeft > 0 ? "Type a card name…" : "Time’s up!"}
                                    autoComplete="off"
                                    spellCheck={false}
                                    disabled={timeLeft === 0}
                                    className="min-w-0 flex-1 px-5 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={timeLeft === 0}
                                    className="px-5 py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 shadow-xl disabled:opacity-60 disabled:hover:bg-white/10"
                                >
                                    Enter
                                </button>
                            </div>

                            {message && <div className="mt-2 text-sm text-blue-100/90">{message}</div>}
                            {!hasStarted && (
                                <div className="mt-2 text-xs text-blue-100/70">
                                    Timer begins when you make your first guess.
                                </div>
                            )}
                        </form>

                        {/* Progress + Timer */}
                        <div className="bg-white/5 border border-white/15 rounded-2xl p-4 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xs text-blue-100/80">Time</div>
                                    <div className="text-3xl font-black tabular-nums text-white">
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-blue-100/80">Found</div>
                                    <div className="text-3xl font-black tabular-nums text-white">
                                        {foundCount}
                                        <span className="text-white/50 text-lg font-bold">/{totalCount}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onReset}
                                className="mt-4 w-full px-4 py-3 rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-200/30 text-emerald-50 font-black shadow-lg"
                            >
                                New Game
                            </button>

                            {isGameOver && (
                                <div className="mt-3 text-sm text-blue-100/90">
                                    Final score: <span className="font-bold tabular-nums">{foundCount}</span>
                                    <span className="text-blue-100/60"> / {totalCount}</span>
                                    <div className="text-xs text-blue-100/70 mt-1">
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Rarities: no internal scrollbars, everything visible in-page */}
                <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rarities.map((rarity) => {
                        const list = grouped.get(rarity) || [];
                        const foundInRarity = list.reduce(
                            (acc, c) => acc + (foundSet.has(normalize(c.card)) ? 1 : 0),
                            0
                        );

                        return (
                            <div
                                key={rarity}
                                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3"
                            >
                                <div className="flex items-baseline justify-between mb-3">
                                    <div className="text-lg font-bold text-white">{rarity}</div>
                                    <div className="text-xs text-blue-100/80 tabular-nums">
                                        {foundInRarity} / {list.length}
                                    </div>
                                </div>

                                <div className="columns-2 2xl:columns-3 gap-2">
                                    {list.map((c) => {
                                        const isFound = foundSet.has(normalize(c.card));
                                        const isMissed = isGameOver && !isFound;

                                        return (
                                            <div
                                                key={c.card}
                                                className={`break-inside-avoid rounded-lg border px-2 py-1 flex items-start gap-2 leading-tight ${
                                                    isFound
                                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                                        : isMissed
                                                            ? "bg-red-500/15 border-red-300/30"
                                                            : "bg-black/15 border-white/10"
                                                }`}
                                            >
                                                {/* Thumb / placeholder */}
                                                {isFound || isMissed ? (
                                                    <CardThumb
                                                        name={c.card}
                                                        className="relative w-6 h-6 rounded-md overflow-hidden ring-1 ring-white/20 bg-white/5 shrink-0"
                                                        fallbackClassName="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/70"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-md bg-white/5 ring-1 ring-white/10 shrink-0 flex items-center justify-center">
                                                        <span className="text-[10px] text-white/25">•</span>
                                                    </div>
                                                )}

                                                {/* Name / placeholder */}
                                                <div className="text-sm font-semibold text-white/95 whitespace-normal break-words">
                                                    {isFound || isMissed ? (
                                                        <span className={isMissed ? "text-red-100" : ""}>{c.card}</span>
                                                    ) : (
                                                        <div className="mt-1 h-2 rounded bg-white/15 w-full max-w-[180px]" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        );
                    })}
                </div>

                {foundCount === totalCount && (
                    <div className="max-w-xl mx-auto mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                        <div className="text-2xl font-black">Perfect!</div>
                        <div className="text-blue-100/90 mt-1">You found every card.</div>
                    </div>
                )}
            </div>
        </CRBackground>
    );
}

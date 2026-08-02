import React, { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../../data/cards.json";
import GameModeNav from "./GameModeNav";
import ModeIntro from "../layout/ModeIntro.jsx";
import { exactKeysFor, normalizeCardName } from "../../utils/clashroyale/cardSearch.js";
import HowToPlay from "../layout/HowToPlay.jsx";
import { MEMORY_HOW_TO_PLAY } from "./modeHowToPlay.jsx";
import CRBackground from "../../components/clashroyale/CRBackground.jsx";
import CardThumb from "../../components/clashroyale/CardThumb.jsx";
import { PANEL_BASE } from "./Panel.jsx";

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
    // Normalised key of the most recent find — drives the reveal pop.
    const [justFound, setJustFound] = useState(null);
    const [message, setMessage] = useState("");

    // Timer: doesn’t start until first guess
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
    const [hasStarted, setHasStarted] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const cardMap = useMemo(() => {
        const m = new Map();
        for (const c of cards) {
            m.set(normalize(c.card), c);
            // Also accept the normalised form and any aliases, so "log" resolves
            // to The Log, "xbow" to X-Bow, and "giant snowball" to Snowball.
            // Same rule the guessing modes use, rather than a second dialect.
            for (const k of exactKeysFor(c.card)) m.set(k, c);
        }
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

        // 1) exact + plural variants (keep current behavior), then the same
        //    forms with articles and punctuation stripped so "log" and "xbow"
        //    resolve the way they do in the guessing modes.
        const keysToTry = [
            ...pluralVariants(key),
            ...pluralVariants(normalizeCardName(raw)),
        ];
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

        // Marks the cell that just flipped so it can play a one-shot pop. Kept
        // as a plain key rather than a timer-cleared flag: the animation is
        // CSS and ends on its own, and holding a timeout per guess would add
        // work to the one path in this mode that has to stay fast.
        setJustFound(k);
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
            <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-8">
                {/* Title */}
                <div className="text-center mb-6">
                    {/* Decorative wordmark — the real <h1> is in ModeIntro below. */}
                    <div className="mb-2">
                        <img
                            src="/wordmark.png"
                            alt="Clashdle"
                            className="mx-auto min-h-36 sm:h-28 md:h-28 w-auto"
                        />
                    </div>
                    <GameModeNav />

                    <ModeIntro title="Memory Mode — Name Every Clash Royale Card">
                        <p>
                            Type every Clash Royale card you can remember in two minutes. All
                            121 of them: 29 Commons, 30 Rares, 33 Epics, 21 Legendaries and 8
                            Champions. Wrong answers cost you nothing.
                        </p>
                        <p>
                            Nothing is hidden here — it&apos;s pure recall, and most people
                            stall somewhere short of half.
                        </p>
                    </ModeIntro>
                </div>

                {/* ONE centered top panel (instructions + input + stats) */}
                <div className={`${PANEL_BASE} max-w-5xl mx-auto p-5 mb-6`}>
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
                                className={`${PANEL_BASE} p-3`}
                            >
                                <div className="flex items-baseline justify-between mb-3">
                                    <div className="text-lg font-bold text-white">{rarity}</div>
                                    <div className="text-xs text-blue-100/80 tabular-nums">
                                        {foundInRarity} / {list.length}
                                    </div>
                                </div>

                                {/* Every box is exactly the same size, and it
                                    takes all three of these to guarantee it:

                                    - a grid, not `columns-2`. CSS multi-column
                                      sizes each cell to its own content.
                                    - `auto-rows-[2.75rem]`, not a `min-h` on
                                      the cell. A minimum still lets a row grow:
                                      "Goblin Demolisher" wrapping to three
                                      lines dragged its whole row taller. A
                                      fixed track height cannot.
                                    - `line-clamp-2` on the name, so a name that
                                      would need a third line is truncated
                                      rather than overflowing a fixed-height box.

                                    Two columns at every width. Three columns
                                    inside an already-narrow rarity panel left
                                    too little room for the longer names, which
                                    is what forced the third line in the first
                                    place. */}
                                <div className="grid grid-cols-2 gap-2 auto-rows-[2.75rem]">
                                    {list.map((c) => {
                                        const key = normalize(c.card);
                                        const isFound = foundSet.has(key);
                                        const isMissed = isGameOver && !isFound;
                                        const isJustFound = key === justFound;

                                        return (
                                            <div
                                                key={c.card}
                                                className={`rounded-lg border px-2 py-1 flex items-center gap-2 leading-tight overflow-hidden transition-colors duration-200 ${
                                                    isFound
                                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                                        : isMissed
                                                            ? "bg-red-500/15 border-red-300/30"
                                                            : "bg-black/15 border-white/10"
                                                } ${isJustFound ? "motion-safe:animate-[mem-pop_450ms_ease-out]" : ""}`}
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

                                                {/* Name / placeholder.
                                                    min-w-0 lets the flex child
                                                    shrink so long names wrap
                                                    inside the cell instead of
                                                    pushing it wider than its
                                                    grid column. */}
                                                <div className="min-w-0 flex-1 text-sm font-semibold text-white/95 break-words line-clamp-2">
                                                    {isFound || isMissed ? (
                                                        // title so a clamped name is still readable on hover
                                                        <span className={isMissed ? "text-red-100" : ""} title={c.card}>{c.card}</span>
                                                    ) : (
                                                        <div className="h-2 rounded bg-white/15 w-full max-w-[180px]" />
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

                <HowToPlay {...MEMORY_HOW_TO_PLAY} />

                {foundCount === totalCount && (
                    <div className="max-w-xl mx-auto mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                        <div className="text-2xl font-black">Perfect!</div>
                        <div className="text-blue-100/90 mt-1">You found every card.</div>
                    </div>
                )}
            </main>
        </CRBackground>
    );
}

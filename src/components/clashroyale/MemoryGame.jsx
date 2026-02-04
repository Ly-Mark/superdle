import React, { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../../data/cards.json";

/* -------------------------------------------------------
   Shared slugify (copied from ClassicGame)
------------------------------------------------------- */
const slugify = (name) =>
    String(name)
        .toLowerCase()
        .replace(/p\.?\s*e\.?\s*k\.?\s*k\.?\s*a/gi, "pekka")
        .replace(/&/g, "and")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

/* -------------------------------------------------------
   Card image (try webp/png/jpg)
------------------------------------------------------- */
const CardThumb = ({ name, game = "clashroyale" }) => {
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
            if (next >= sources.length) {
                setFailedAll(true);
                return prev;
            }
            return next;
        });
    };

    return (
        <div className="relative w-6 h-6 rounded-md overflow-hidden ring-1 ring-white/20 bg-white/5 shrink-0">
            {!failedAll ? (
                <img
                    src={sources[idx]}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: "scale(1.15)", transformOrigin: "center" }}
                    onError={handleError}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/70">
                    {name.slice(0, 2).toUpperCase()}
                </div>
            )}
        </div>
    );
};

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
const normalize = (s) => (s ?? "").toLowerCase().trim();
const RARITY_ORDER = ["Common", "Rare", "Epic", "Legendary", "Champion"];

const DEFAULT_DURATION = 900; // seconds

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

        // Try exact + plural variants
        const keysToTry = pluralVariants(key);
        for (const k of keysToTry) {
            const hit = cardMap.get(k);
            if (hit) return hit;
        }
        return null;
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
        <div className="min-h-screen relative bg-gradient-to-br from-[#0b1f3a] via-[#0b3a82] to-[#0c59b6]">
            <style>{`
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }

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
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-10 diamond-img"
            />


            <div className="relative z-20 container mx-auto px-4 py-8">
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              CLASHDLE
            </span>
                    </h1>
                    <div className="text-blue-200/90 font-semibold">Memory Mode</div>
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
                                    className="w-full px-5 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
                                className="mt-4 px-5 py-3 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 shadow-xl"
                            >
                                Reset
                            </button>

                            {timeLeft === 0 && (
                                <div className="mt-3 text-sm text-blue-100/90">
                                    Final score: <span className="font-bold tabular-nums">{foundCount}</span>
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

                                        return (
                                            <div
                                                key={c.card}
                                                className={`break-inside-avoid rounded-lg border px-2 py-1 flex items-start gap-2 leading-tight ${
                                                    isFound
                                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                                        : "bg-black/15 border-white/10"
                                                }`}
                                            >
                                                {/* Checkbox/thumb */}
                                                {isFound ? (
                                                    <CardThumb name={c.card} />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-md bg-white/5 ring-1 ring-white/10 shrink-0 flex items-center justify-center">
                                                        <span className="text-[10px] text-white/25">•</span>
                                                    </div>
                                                )}

                                                {/* Full name (no truncate) */}
                                                <div className="text-sm font-semibold text-white/95 whitespace-normal break-words">
                                                    {isFound ? (
                                                        c.card
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
        </div>
    );
}

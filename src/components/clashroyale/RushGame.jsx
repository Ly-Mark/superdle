// src/components/clashroyale/RushGame.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../../data/cards.json";
import { compareAttributes, getAttributeColor } from "../../utils/clashroyale/gamelogic.js";
import GameModeNav from "./GameModeNav";
import ModeIntro from "../layout/ModeIntro.jsx";
import CRBackground from "../../components/clashroyale/CRBackground.jsx";
import CardThumb from "../../components/clashroyale/CardThumb.jsx";

/* -------------------------------------------------------
   Seeded shuffle helpers (stable per run)
------------------------------------------------------- */
const xmur3 = (str) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    };
};

const mulberry32 = (a) => {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const seededShuffle = (arr, seedStr) => {
    const seedFn = xmur3(seedStr);
    const rand = mulberry32(seedFn());
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/* -------------------------------------------------------
   Attribute tile (Rush: NO flip)
------------------------------------------------------- */
const AttributeCard = ({ attribute, value, status }) => {
    const cardColor = getAttributeColor(status);

    return (
        <div className="relative w-[3.25rem] h-[3.25rem] md:w-[4.5rem] md:h-[4.5rem] lg:w-20 lg:h-20">
            <div
                className={`w-full h-full ${cardColor} rounded-lg flex items-center justify-center text-white font-bold text-[10px] leading-tight sm:text-xs md:text-xs lg:text-sm px-1 text-center shadow-lg border-2 overflow-hidden`}
            >
                {(attribute === "year" || attribute === "cost" || attribute === "arena") &&
                (status === "higher" || status === "lower") ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                        <div
                            className={`absolute inset-0 flex items-center justify-center ${
                                status === "lower" ? "pt-2" : ""
                            }`}
                        >
              <span
                  className={`text-7xl text-red-900 opacity-50 leading-none ${
                      status === "higher" ? "" : "transform rotate-180"
                  }`}
              >
                ▼
              </span>
                        </div>
                        <span className="relative z-10 break-words font-bold text-white">{value}</span>
                    </div>
                ) : (
                    <span className="break-words">{value}</span>
                )}
            </div>
        </div>
    );
};

/* -------------------------------------------------------
   Emoji row (mobile-only) — tappable to expand full values
------------------------------------------------------- */
// Note: 'higher' = player's guess > target → render ▼ (target is lower, guess lower).
// 'lower' = player's guess < target → render ▲. The status names describe the guess; the arrows describe the target.
const TILE_EMOJI = { correct: '🟩', close: '🟨', wrong: '🟥', higher: '🔻', lower: '🔺' };
const toEmoji = (s) => TILE_EMOJI[s] || TILE_EMOJI.wrong;

// Tile size for emoji squares — also used by the mobile header.
// Scales up on larger phones (390px+) so we don't waste horizontal space.
const MOBILE_TILE = 'w-7 h-7 [@media(min-width:390px)]:w-8 [@media(min-width:390px)]:h-8 [@media(min-width:430px)]:w-9 [@media(min-width:430px)]:h-9';
const MOBILE_NAME = 'w-16 h-7 [@media(min-width:390px)]:w-20 [@media(min-width:390px)]:h-8 [@media(min-width:430px)]:w-24 [@media(min-width:430px)]:h-9';
const MOBILE_GAP  = 'gap-[3px] [@media(min-width:390px)]:gap-1';

const EmojiRow = ({ guess, attributes, selected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`flex items-center ${MOBILE_GAP} w-full justify-center px-1 py-1.5 rounded
                    border-l-2 transition-colors
                    ${selected
            ? 'bg-white/10 border-blue-300/70'
            : 'border-transparent hover:bg-white/5 active:bg-white/10'}`}
        aria-pressed={selected}
        aria-label={`${guess.card}, ${selected ? 'currently selected' : 'tap to view details'}`}
    >
        <div className={`${MOBILE_NAME} rounded bg-white/10 border border-white/20 flex items-center justify-center px-1`}>
            <span className="text-[10px] font-semibold text-white/90 truncate leading-none">
                {guess.card}
            </span>
        </div>
        {attributes.map((attr) => (
            <div
                key={attr.key}
                className={`${MOBILE_TILE} flex items-center justify-center text-[14px] leading-none select-none`}
            >
                {toEmoji(guess.comparison?.[attr.key])}
            </div>
        ))}
    </button>
);

const DetailPanel = ({ guess, attributes }) => {
    if (!guess) return null;
    return (
        <div className="w-full max-w-sm mx-auto mb-2 rounded-lg bg-white/10 border border-white/20 p-2">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/15">
                <span className="text-[11px] font-bold text-white tracking-wide truncate">
                    {guess.card}
                </span>
                <span className="text-[9px] text-blue-100/50 uppercase tracking-wider ml-2">
                    Details
                </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {attributes.map((attr) => {
                    const status = guess.comparison?.[attr.key];
                    const colorClass =
                        status === 'correct' ? 'text-emerald-300' :
                            status === 'close'   ? 'text-amber-300'   :
                                'text-rose-300';
                    const arrow = status === 'higher' ? ' ▼' : status === 'lower' ? ' ▲' : '';
                    return (
                        <div key={attr.key} className="flex justify-between text-[10px] leading-none py-0.5">
                            <span className="text-blue-100/70 mr-1 shrink-0">{attr.label}</span>
                            <span className={`${colorClass} font-semibold text-right truncate`}>
                                {guess[attr.key]}{arrow}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* -------------------------------------------------------
   Card portrait (supports icon mode)
------------------------------------------------------- */
const CardPortrait = ({
                          name,
                          game = "clashroyale",
                          zoom = 1.4,
                          focus = "center",
                          sizeClass = 'w-[3.25rem] h-[3.25rem] md:w-[4.5rem] md:h-[4.5rem] lg:w-20 lg:h-20',
                          variant = "full", // "full" | "icon"
                      }) => {
    const baseFrame =
        variant === "icon"
            ? `relative ${sizeClass} rounded-xl overflow-hidden ring-1 ring-white/20 bg-white/5`
            : `relative ${sizeClass} rounded-xl overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.35)] ring-1 ring-white/20 bg-white/5`;

    return (
        <div className={baseFrame}>
            <CardThumb
                name={name}
                game={game}
                // CardThumb renders its own wrapper div; we want it to fill THIS wrapper.
                // So we make CardThumb wrapper match the parent and position absolute image.
                className="absolute inset-0"
                imgClassName="absolute inset-0 w-full h-full object-cover"
                fallbackClassName="absolute inset-0 flex items-center justify-center px-1"
                scale={zoom}
                alt={name}
            />

            {/* Only add gloss/shadow for full portraits */}
            {variant !== "icon" && (
                <>
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/25 mix-blend-screen" />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0) 55%)",
                            clipPath: "polygon(0% 0%, 100% 0%, 100% 48%, 0% 70%)",
                            mixBlendMode: "screen",
                            opacity: 0.65,
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{
                            boxShadow:
                                "inset 0 -10px 20px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                    />
                </>
            )}
        </div>
    );
};

/* -------------------------------------------------------
   Suggestion item with thumbnail + text (fallback safe)
------------------------------------------------------- */
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


/* -------------------------------------------------------
   Full-screen reward burst (emoji confetti)
------------------------------------------------------- */
const EmojiBurst = ({ burstId }) => {
    if (!burstId) return null;

    const items = ["🎉", "✨", "💥", "🔥", "🏆", "⚡️", "💫", "😄", "🎊", "🥳"];

    return (
        <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center">
            <div className="relative w-[min(520px,90vw)] h-[240px]">
                {items.map((emo, i) => (
                    <span
                        key={`${burstId}-${i}`}
                        className="absolute text-4xl animate-emoji-pop"
                        style={{
                            left: `${8 + i * 8}%`,
                            top: `${20 + (i % 4) * 12}%`,
                            animationDelay: `${i * 55}ms`,
                        }}
                    >
            {emo}
          </span>
                ))}
            </div>
        </div>
    );
};

const TimeBonusPop = ({ pop }) => {
    if (!pop) return null;
    return (
        <div key={pop.id} className="pointer-events-none absolute -right-2 -top-2 z-10">
            <div className="time-pop px-2 py-1 rounded-xl bg-emerald-500/25 border border-emerald-200/30 text-emerald-50 font-black text-sm shadow-lg">
                +{pop.seconds}s
            </div>
        </div>
    );
};


/* -------------------------------------------------------
   Rush constants
------------------------------------------------------- */
const RUSH_SECONDS = 1 * 90;
const TIME_BONUS_MAX = 30;  // seconds
const TIME_BONUS_MIN = 8;   // seconds
const TIME_BONUS_STEP = 4; // seconds

// ---- Scoring (Rush) ----
const BASE_POINTS = 100;

// No penalties: floor at 1.0x for 6+
const getGuessMultiplier = (attempts) => {
    if (attempts <= 1) return 3.0;
    if (attempts === 2) return 2.2;
    if (attempts === 3) return 1.6;
    if (attempts === 4) return 1.3;
    if (attempts === 5) return 1.1;
    return 1.0;
};

const getSpeedBonus = (seconds) => {
    if (seconds < 15) return 75;
    if (seconds < 25) return 50;
    if (seconds < 40) return 25;
    return 0;
};

const getStreakBonus = (nextStreak) => {
    if (nextStreak === 3) return 100;
    if (nextStreak === 5) return 300;
    if (nextStreak === 7) return 700;
    return 0;
};

const calcCardPoints = ({ attempts, seconds, nextStreak }) => {
    const mult = getGuessMultiplier(attempts);
    const base = Math.round(BASE_POINTS * mult);
    const speed = getSpeedBonus(seconds);
    const streakBonus = getStreakBonus(nextStreak);
    return { base, mult, speed, streakBonus, total: base + speed + streakBonus };
};


const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const getTimeBonusForAttempts = (attempts) => {
    return clamp(
        TIME_BONUS_MAX - (attempts - 1) * TIME_BONUS_STEP,
        TIME_BONUS_MIN,
        TIME_BONUS_MAX
    );
};

const ATTRIBUTES = [
    { key: "rarity", label: "Rarity" },
    { key: "cost", label: "Cost" },
    { key: "type", label: "Type" },
    { key: "targets", label: "Targets" },
    { key: "healthCategory", label: "Health" },
    { key: "arena", label: "Arena" },
    { key: "moveSpeed", label: "Speed" },
    { key: "year", label: "Year" },
];

/* -------------------------------------------------------
   Rush Game
------------------------------------------------------- */
const RushGame = () => {
    // Run identity so we can "New Run" by changing the seed
    const [runId, setRunId] = useState(0);

    // Arcade run seed (new each refresh/run)
    const runSeed = useMemo(() => {
        try {
            const a = new Uint32Array(2);
            crypto.getRandomValues(a);
            return `rush|run:${runId}:${a[0]}-${a[1]}`;
        } catch {
            return `rush|run:${runId}:${Date.now()}-${Math.random()}`;
        }
    }, [runId]);

    // Per-target tracking
    const [roundGuesses, setRoundGuesses] = useState(0);
    const [roundStartElapsed, setRoundStartElapsed] = useState(0); // seconds elapsed when round started
    const [roundStats, setRoundStats] = useState([]); // [{ card, attempts, seconds, points }]

    // Shuffled order for THIS RUN
    const runOrder = useMemo(() => seededShuffle(cardsData, runSeed), [runSeed]);

    const [roundIndex, setRoundIndex] = useState(0);

    const targetCard = useMemo(() => {
        const idx = roundIndex % runOrder.length;
        return runOrder[idx];
    }, [roundIndex, runOrder]);

    const [guesses, setGuesses] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);

    // When a new guess comes in (or the board resets after a correct answer),
    // clear manual expansion so the new latest auto-expands.
    useEffect(() => {
        setExpandedRowId(null);
    }, [guesses.length]);

    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Timer: starts only after first guess
    const [hasStarted, setHasStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(RUSH_SECONDS);
    const timeLeftRef = useRef(timeLeft);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    const isTimeUp = timeLeft <= 0;

    useEffect(() => {
        if (!isTimeUp) return;
        // only set once
        setFinalTarget((prev) => prev ?? targetCard);
    }, [isTimeUp, targetCard]);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

// optional: totals for end-screen breakdown
    const [scoreParts, setScoreParts] = useState({
        base: 0,
        speed: 0,
        streak: 0,
    });

    const [lastCorrect, setLastCorrect] = useState(null);
    const [burstId, setBurstId] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");
    const [timePop, setTimePop] = useState(null); // { id, seconds }

    const [correctHistory, setCorrectHistory] = useState([]);
    const [finalTarget, setFinalTarget] = useState(null);

    // Countdown
    useEffect(() => {
        if (!hasStarted) return;
        if (isTimeUp) return;

        const t = setInterval(() => {
            setTimeLeft((s) => Math.max(0, s - 1));
        }, 1000);

        return () => clearInterval(t);
    }, [hasStarted, isTimeUp]);

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");
    const elapsed = RUSH_SECONDS - timeLeft; // seconds since start of timer

    const idlePrompt =
        hasStarted && !isTimeUp && guesses.length === 0
            ? "🎯 Next card ready — start typing!"
            : "";

    const filteredCards = useMemo(() => {
        const guessedSet = new Set(guesses.map((g) => g.card.trim().toLowerCase()));
        const q = inputValue.trim().toLowerCase();
        if (!q) return [];
        return cardsData.filter((card) => {
            const name = card.card.trim().toLowerCase();
            return name.startsWith(q) && !guessedSet.has(name);
        });
    }, [guesses, inputValue]);

    const startTimerIfNeeded = () => {
        if (!hasStarted) {
            setHasStarted(true);
            setRoundStartElapsed(0);
        }
    };

    const advanceRound = () => {
        setGuesses([]);
        setInputValue("");
        setShowSuggestions(false);
        setRoundGuesses(0);
        setRoundStartElapsed(elapsed);
        setRoundIndex((r) => r + 1);
    };

    const handleGuess = (card) => {
        if (isTimeUp) return;

        startTimerIfNeeded();

        const name = card.card.trim().toLowerCase();
        if (guesses.some((g) => g.card.trim().toLowerCase() === name)) return;

        const comparison = compareAttributes(card, targetCard);
        const newGuess = { ...card, comparison };

        setGuesses((prev) => [newGuess, ...prev]);
        setInputValue("");
        setShowSuggestions(false);

        if (card.card === targetCard.card) {
            const attemptsThisRound = roundGuesses + 1; // include this correct guess
            const secondsThisRound = Math.max(0, elapsed - roundStartElapsed);

            // streak counts only if solved in <= 2 guesses
            const qualifiesForStreak = attemptsThisRound <= 2;
            const nextStreak = qualifiesForStreak ? streak + 1 : 0;

            const pts = calcCardPoints({
                attempts: attemptsThisRound,
                seconds: secondsThisRound,
                nextStreak,
            });

            // apply score
            setScore((s) => s + pts.total);

            // update streak
            setStreak(nextStreak);

            // optional: breakdown totals for end screen
            setScoreParts((p) => ({
                base: p.base + pts.base,
                speed: p.speed + pts.speed,
                streak: p.streak + pts.streakBonus,
            }));

            setLastCorrect(card);
            setCorrectHistory((prev) => [...prev, card].slice(-14));

            // store stats for end screen charts + breakdown per card
            setRoundStats((prev) => [
                ...prev,
                {
                    card: targetCard.card,
                    attempts: attemptsThisRound,
                    seconds: secondsThisRound,
                    points: pts.total,

                    // breakdown
                    basePoints: pts.base,
                    multiplier: pts.mult,
                    speedBonus: pts.speed,
                    streakAfter: nextStreak,
                    streakBonus: pts.streakBonus,
                },
            ]);

            // your existing status message can be upgraded:
            const streakTag = qualifiesForStreak ? ` 🔥 Streak: ${nextStreak}` : "";
            setStatusMsg(`⚡ +${pts.total} points${streakTag}`);
            setTimeout(() => setStatusMsg(""), 1100);

            setBurstId((b) => b + 1);

            // keep your time bonus code (if you have it)
            const timeBonus = getTimeBonusForAttempts(attemptsThisRound);

            // cap total timer extension to +120s beyond starting time (tweak as you like)
            const TIME_CAP = RUSH_SECONDS + 120;

            setTimeLeft((t) => clamp(t + timeBonus, 0, TIME_CAP));

            // optional: show your pop
            setTimePop({ id: Date.now(), seconds: timeBonus });
            setTimeout(() => setTimePop(null), 900);


            setTimeout(() => {
                if (timeLeftRef.current > 0) advanceRound();
            }, 350);
        }
        setRoundGuesses((n) => n + 1);
    };

    const resetStateForReplay = () => {
        setFinalTarget(null);
        setRoundIndex(0);
        setGuesses([]);
        setInputValue("");
        setShowSuggestions(false);

        setHasStarted(false);
        setTimeLeft(RUSH_SECONDS);

        setScore(0);
        setLastCorrect(null);
        setBurstId(0);
        setStatusMsg("");

        setCorrectHistory([]);
        setRoundStats([]);

        setRoundGuesses(0);
        setRoundStartElapsed(0);
        setStreak(0);
        setScoreParts({ base: 0, speed: 0, streak: 0 });
    };

    const handleNewRun = () => {
        // New seed / new runOrder
        resetStateForReplay();
        setRunId((r) => r + 1);
    };

    const totalCorrect = roundStats.length;
    const totalAttempts = roundStats.reduce((sum, r) => sum + r.attempts, 0);
    const avgAttempts = totalCorrect ? (totalAttempts / totalCorrect).toFixed(2) : "—";
    const avgSeconds = totalCorrect
        ? Math.round(roundStats.reduce((sum, r) => sum + r.seconds, 0) / totalCorrect)
        : 0;

    const maxAttempts = Math.max(1, ...roundStats.map((r) => r.attempts));
    const maxSeconds = Math.max(1, ...roundStats.map((r) => r.seconds));



    return (
          <CRBackground>
                <EmojiBurst burstId={burstId} />

               <style>{`
      @keyframes emojiPop {
        0%   { transform: translateY(20px) scale(0.6); opacity: 0; }
        20%  { opacity: 1; }
        60%  { transform: translateY(-20px) scale(1.05); opacity: 1; }
        100% { transform: translateY(-50px) scale(0.9); opacity: 0; }
      }
      .animate-emoji-pop { animation: emojiPop 900ms ease-out forwards; }

      @keyframes timePop {
        0%   { transform: translateY(8px) scale(0.95); opacity: 0; }
        15%  { opacity: 1; }
        60%  { transform: translateY(-14px) scale(1.05); opacity: 1; }
        100% { transform: translateY(-26px) scale(1.0); opacity: 0; }
      }
      .time-pop { animation: timePop 900ms ease-out forwards; }
    `}</style>
              <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-4 sm:py-8">
                  {/* Header */}
                  <div className="text-center mb-4 sm:mb-8">
                      {/* Decorative wordmark — the real <h1> is in ModeIntro below. */}
                      <div className="mb-2 sm:mb-4">
                          <img
                              src="/wordmark.png"
                              alt="Clashdle"
                              className="mx-auto min-h-36 sm:h-28 md:h-28 w-auto"
                          />
                      </div>
                    <GameModeNav />

                    <ModeIntro title="Rush Mode — Timed Clash Royale Card Guessing">
                        <p>
                            Rush mode drops the one-a-day format. You start with ninety
                            seconds, but the clock isn&apos;t fixed — every card you get right
                            adds time back. Solve one on your first guess and you earn a full
                            thirty seconds; take more attempts and the reward tapers down to a
                            floor of eight. That turns Rush into a survival run rather than a
                            sprint: keep answering well and you keep playing, up to a ceiling of
                            three and a half minutes on the clock. Points follow the same logic,
                            with a multiplier for fewer guesses plus bonuses for speed and for
                            streaks at three, five, and seven. The timer starts on your first
                            guess, not on page load.
                        </p>
                    </ModeIntro>

                    <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
                        <p className="text-blue-200 text-xl sm:text-2xl font-medium mb-2 sm:mb-3">Rush Mode</p>

                        <div className="flex items-center justify-center gap-4 text-blue-100">
                            <div className="relative px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                                <TimeBonusPop pop={timePop} />

                                <div className="text-xs uppercase tracking-wide text-blue-200/80">Time</div>
                                <div className={`text-3xl font-black ${isTimeUp ? "text-red-200" : "text-white"}`}>
                                    {mm}:{ss}
                                </div>
                                {!hasStarted && !isTimeUp && (
                                    <div className="text-xs text-blue-200/80 mt-1">Starts on first guess</div>
                                )}
                            </div>


                            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                                <div className="text-xs uppercase tracking-wide text-blue-200/80">Score</div>
                                <div className="text-3xl font-black text-white">{score}</div>
                                <div className="text-xs text-blue-200/80 mt-1">100 base • bonuses for speed & streak</div>
                            </div>

                            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hidden sm:block">
                                <div className="text-xs uppercase tracking-wide text-blue-200/80">Round</div>
                                <div className="text-3xl font-black text-white">{roundIndex + 1}</div>
                            </div>

                            {hasStarted && !isTimeUp && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Restart the run? Your current score will be lost.')) {
                                            handleNewRun();
                                        }
                                    }}
                                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-blue-100 text-xs font-semibold self-stretch flex items-center"
                                    title="Restart this run"
                                >
                                    ↻ Restart
                                </button>
                            )}
                        </div>

                        {lastCorrect && !isTimeUp && (
                            <div className="mt-3 text-emerald-200 font-semibold">
                                ✅ Correct: {lastCorrect.card}
                            </div>
                        )}



                        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-200/90">
                            Correct guess clears the board, adds time and starts a new target.
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="max-w-6xl mx-auto px-4">

                    {/* End of run summary (wide, uncluttered) */}
                    {isTimeUp && finalTarget && (
                        <div className="max-w-6xl mx-auto mb-6">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5">
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

                                    {/* Left: charts + scrollable breakdown */}
                                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-white font-black text-lg">Breakdown</div>
                                            <div className="text-blue-100/70 text-xs">
                                                {totalCorrect ? `${totalCorrect} cards` : "No correct guesses"}
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            {/* Attempts chart */}
                                            <div className="rounded-xl bg-white/10 border border-white/10 p-3">
                                                <div className="text-blue-50 font-bold text-sm mb-2">Attempts per correct</div>

                                                <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                                                    {roundStats.map((r, i) => (
                                                        <div key={`${r.card}-a-${i}`} className="flex items-center gap-3">
                                                            <CardPortrait name={r.card} variant="icon" sizeClass="w-9 h-9" zoom={1.05} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between text-xs text-blue-100/80 mb-1">
                                                                    <span className="truncate pr-2">{r.card}</span>
                                                                    <span className="text-white font-black tabular-nums">{r.attempts}</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                                                    <div
                                                                        className="h-2 rounded-full bg-white/60"
                                                                        style={{ width: `${(r.attempts / maxAttempts) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {roundStats.length === 0 && (
                                                        <div className="text-blue-100/70 text-sm">No data.</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Time chart */}
                                            <div className="rounded-xl bg-white/10 border border-white/10 p-3">
                                                <div className="text-blue-50 font-bold text-sm mb-2">Seconds per correct</div>

                                                <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                                                    {roundStats.map((r, i) => (
                                                        <div key={`${r.card}-t-${i}`} className="flex items-center gap-3">
                                                            <CardPortrait name={r.card} variant="icon" sizeClass="w-9 h-9" zoom={1.05} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between text-xs text-blue-100/80 mb-1">
                                                                    <span className="truncate pr-2">{r.card}</span>
                                                                    <span className="text-white font-black tabular-nums">{r.seconds}s</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                                                    <div
                                                                        className="h-2 rounded-full bg-white/60"
                                                                        style={{ width: `${(r.seconds / maxSeconds) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {roundStats.length === 0 && (
                                                        <div className="text-blue-100/70 text-sm">No data.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scrollable list */}
                                        {roundStats.length > 0 && (
                                            <div className="mt-4 rounded-xl bg-white/10 border border-white/10 overflow-hidden">
                                                <div className="px-3 py-2 text-blue-50 font-bold text-sm border-b border-white/10">
                                                    Cards (scroll)
                                                </div>
                                                <div className="max-h-44 overflow-y-auto">
                                                    {roundStats.map((r, i) => (
                                                        <div
                                                            key={`${r.card}-row-${i}`}
                                                            className="px-3 py-2 flex items-center justify-between border-b border-white/5 last:border-b-0"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <CardPortrait name={r.card} variant="icon" sizeClass="w-8 h-8" zoom={1.05} />
                                                                <div className="text-blue-50 text-sm font-semibold truncate">{r.card}</div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-blue-100/80">
                      <span className="tabular-nums">
                        <span className="text-blue-50 font-bold">{r.attempts}</span> tries
                      </span>
                                                                <span className="tabular-nums">
                        <span className="text-blue-50 font-bold">{r.seconds}</span>s
                      </span>
                                                                <span className="tabular-nums text-emerald-100 font-bold">+{r.points}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}


                                    </div>
                                    {/* LEFT: headline + key stats + CTA */}
                                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                                        <div className="text-white text-2xl font-black">Results</div>

                                        {finalTarget && (
                                            <div className="mt-3 rounded-xl bg-white/10 border border-white/15 p-3 flex items-center gap-3">
                                                <CardPortrait name={finalTarget.card} variant="icon" sizeClass="w-12 h-12" zoom={1.05} />
                                                <div className="min-w-0">
                                                    <div className="text-blue-100/80 text-xs font-semibold uppercase tracking-wide">The card was</div>
                                                    <div className="text-white font-black text-lg truncate">{finalTarget.card}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                                                <span className="text-blue-100/80 text-sm font-semibold">Score</span>
                                                <span className="text-white text-xl font-black tabular-nums">{score}</span>
                                            </div>

                                            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                                                <span className="text-blue-100/80 text-sm font-semibold">Correct</span>
                                                <span className="text-white text-xl font-black tabular-nums">{totalCorrect}</span>
                                            </div>

                                            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                                                <span className="text-blue-100/80 text-sm font-semibold">Avg Attempts</span>
                                                <span className="text-white text-xl font-black tabular-nums">{avgAttempts}</span>
                                            </div>

                                            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                                                <span className="text-blue-100/80 text-sm font-semibold">Avg Time</span>
                                                <span className="text-white text-xl font-black tabular-nums">{avgSeconds}s</span>
                                            </div>
                                        </div>

                                        <div className="text-blue-100/80 text-sm mt-2">
                                            <div>💎 Card Points: <span className="font-bold text-white">{scoreParts.base}</span></div>
                                            <div>⚡ Speed Bonuses: <span className="font-bold text-white">{scoreParts.speed}</span></div>
                                            <div>🔥 Streak Bonuses: <span className="font-bold text-white">{scoreParts.streak}</span></div>
                                        </div>


                                        <button
                                            onClick={handleNewRun}
                                            className="mt-4 w-full px-5 py-3.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-400/40 text-white font-bold text-base shadow-md shadow-emerald-900/30 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                                        >
                                            New Game →
                                        </button>

                                        <div className="mt-3 text-xs text-blue-100/70">
                                            Tip: speed + precision wins. Try to reduce attempts per card.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-4 flex justify-center px-4">
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
                                    if (e.key === "Enter" && filteredCards.length > 0 && !isTimeUp) {
                                        e.preventDefault();
                                        handleGuess(filteredCards[0]);
                                    }
                                    if (e.key === "Escape") setShowSuggestions(false);
                                }}
                                placeholder={isTimeUp ? "Time’s up" : "Enter card name..."}
                                disabled={isTimeUp}
                                className="w-full px-6 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">🔍</span>
                                </div>
                            </div>

                            {showSuggestions && filteredCards.length > 0 && !isTimeUp && (
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

                    {/* Correct strip */}
                    {correctHistory.length > 0 && (
                        <div className="max-w-3xl mx-auto mb-6">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                                <div className="text-blue-100 font-semibold mb-2">Correct Cards</div>

                                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 justify-start">
                                    {correctHistory.map((c, i) => (
                                        <div
                                            key={`${c.card}-${i}`}
                                            className="shrink-0 w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/20 bg-white/5"
                                            title={c.card}
                                        >
                                            <CardPortrait
                                                name={c.card}
                                                variant="icon"
                                                sizeClass="w-12 h-12"
                                                zoom={1.25}
                                                focus="center 60%"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guess Grid */}
                    <div className="flex flex-col items-center">
                        {(hasStarted || correctHistory.length > 0) && (
                            <div className="hidden sm:block mb-4 overflow-x-auto overflow-y-hidden w-full">
                                <div className="mx-auto" style={{ width: 'fit-content' }}>
                                    <div className="grid grid-cols-[repeat(9,3.25rem)] md:grid-cols-[repeat(9,4.5rem)] lg:grid-cols-[repeat(9,5rem)] gap-1">
                                        <div className="text-center text-base font-bold text-white pb-2">
                                            <span className="inline-block border-b-2 sm:border-b-4 border-white pb-1 sm:pb-2 w-[3.25rem] md:w-[4.5rem] lg:w-20 text-[10px] leading-tight md:text-sm lg:text-base">Card</span>
                                        </div>
                                        {ATTRIBUTES.map((attr) => (
                                            <div key={attr.key} className="text-center text-base font-bold text-white pb-2">
                                                <span className="inline-block border-b-2 sm:border-b-4 border-white pb-1 sm:pb-2 w-[3.25rem] md:w-[4.5rem] lg:w-20 text-[10px] leading-tight md:text-sm lg:text-base">{attr.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Keep-going banner */}
                        {(statusMsg || idlePrompt) && (
                            <div className="max-w-xl mx-auto mb-4 text-center">
                                <div
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-lg font-bold
        ${
                                        statusMsg
                                            ? "bg-emerald-500/20 border-emerald-300/30 text-emerald-100 animate-pulse"
                                            : "bg-white/10 border-white/20 text-blue-100"
                                    }`}
                                >
                                    {statusMsg || idlePrompt}
                                </div>
                            </div>
                        )}

                        {/* Mobile: pinned detail panel above the emoji row list. */}
                        <div className="sm:hidden w-full flex flex-col items-center px-2">
                            {guesses.length > 0 && (() => {
                                // Latest guess is at index 0 (newest-first ordering).
                                const latestRowId = `${guesses[0].card}-0`;
                                // null = use default (latest is the selected one).
                                // any other string = user has selected a different row.
                                const effectiveSelected = expandedRowId ?? latestRowId;
                                // Find which guess corresponds to the selected rowId, for the panel.
                                const selectedGuess =
                                    guesses.find((g, idx) => `${g.card}-${idx}` === effectiveSelected) ??
                                    guesses[0];

                                return (
                                    <>
                                        <DetailPanel guess={selectedGuess} attributes={ATTRIBUTES} />
                                        <div className="w-full max-w-sm mx-auto space-y-0.5">
                                            {guesses.map((guess, idx) => {
                                                const rowId = `${guess.card}-${idx}`;
                                                const isSelected = effectiveSelected === rowId;
                                                return (
                                                    <EmojiRow
                                                        key={rowId}
                                                        guess={guess}
                                                        attributes={ATTRIBUTES}
                                                        selected={isSelected}
                                                        onSelect={() => setExpandedRowId(rowId)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Desktop: full text for every row, with scroll fallback if needed */}
                        <div className="hidden sm:block overflow-x-auto overflow-y-hidden w-full">
                            <div className="mx-auto space-y-4" style={{ width: 'fit-content' }}>
                                {guesses.map((guess, rowIndex) => (
                                    <div key={`${guess.card}-${rowIndex}`} className="grid grid-cols-[repeat(9,3.25rem)] md:grid-cols-[repeat(9,4.5rem)] lg:grid-cols-[repeat(9,5rem)] gap-1">
                                        <CardPortrait name={guess.card} zoom={1.3} focus="center 60%" />
                                        {ATTRIBUTES.map((attr) => (
                                            <AttributeCard
                                                key={`${attr.key}-${rowIndex}`}
                                                attribute={attr.key}
                                                value={guess[attr.key]}
                                                status={guess.comparison ? guess.comparison[attr.key] : ""}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* Instructions */}
                    {guesses.length === 0 && correctHistory.length === 0 && (
                        <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mt-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center underline decoration-2 underline-offset-4">
                                How to Play (Rush)
                            </h2>
                            <div className="text-blue-200 space-y-2">
                                <p>• Timer starts on your first guess</p>
                                <p>• Correct guess = base points + bonuses</p>
                                <p>• Correct clears board and starts a new target</p>
                                <p>• Tiles reveal instantly (no flip)</p>
                            </div>
                        </div>
                    )}
                </div>
          </main>
</CRBackground>
    );
};

export default RushGame;

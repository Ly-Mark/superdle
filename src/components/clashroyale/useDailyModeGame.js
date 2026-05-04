import { useEffect, useMemo, useState } from "react";
import cardsData from "../../data/cards.json";
import { getDailyCard } from "../../utils/clashroyale/gamelogic.js";
import { loadStats, markAttempt, updateStatsOnWin } from "../../utils/clashroyale/stats.js";
import { getDayIndex } from "../../utils/clashroyale/shareText.js";

const getLocalDayKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export function useDailyModeGame({
                                     storagePrefix,        // e.g. "clashdle:classic" or "clashdle:description"
                                     enableDailyLock = true,
                                     modeSalt = "classic",
                                     statsMode = modeSalt, // localStorage key suffix for per-mode stats
                                 }) {
    const [targetCard] = useState(() => getDailyCard(cardsData, modeSalt));
    const [guesses, setGuesses] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [hydrated, setHydrated] = useState(false);


    const [stats, setStats] = useState(() => loadStats(statsMode));
    // const [showWinModal, setShowWinModal] = useState(false);

    const dayKey = useMemo(() => getLocalDayKey(), []);
    const dayIndex = useMemo(() => getDayIndex(), []);

    const storageKeyForToday = useMemo(() => `${storagePrefix}:${getLocalDayKey()}`, [storagePrefix]);

    // restore
    useEffect(() => {
        if (!enableDailyLock) {
            setHydrated(true);
            return;
        }

        try {
            const raw = localStorage.getItem(storageKeyForToday);
            if (!raw) {
                setHydrated(true);
                return;
            }

            const data = JSON.parse(raw);
            if (!data?.card || data.card !== targetCard.card) {
                setHydrated(true);
                return;
            }

            setGuesses(Array.isArray(data.guesses) ? data.guesses : []);
            setIsWon(!!data.isWon);
        } catch {
            // ignore
        } finally {
            setHydrated(true);
        }
    }, [enableDailyLock, storageKeyForToday, targetCard.card]);

    // save (save always so refresh keeps guesses)
    useEffect(() => {
        if (!enableDailyLock) return;
        if (!hydrated) return;

        // Don't overwrite storage with blank state on first mount
        if (!isWon && guesses.length === 0) return;

        try {
            localStorage.setItem(
                storageKeyForToday,
                JSON.stringify({
                    card: targetCard.card,
                    isWon,
                    guesses,
                    ts: Date.now(),
                })
            );
        } catch {}
    }, [enableDailyLock, hydrated, storageKeyForToday, isWon, guesses, targetCard.card]);


    // suggestions
    const guessedSet = useMemo(
        () => new Set(guesses.map((g) => String(g.card).trim().toLowerCase())),
        [guesses]
    );

    const filteredCards = useMemo(() => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return [];
        return cardsData.filter((c) => {
            const name = String(c.card).trim().toLowerCase();
            return name.startsWith(q) && !guessedSet.has(name);
        });
    }, [inputValue, guessedSet]);

    const handleGuess = (cardObj) => {
        if (enableDailyLock && isWon) return;

        if (guesses.length === 0) {
            setStats(markAttempt(statsMode, dayKey));
        }

        const name = String(cardObj.card).trim().toLowerCase();
        if (guessedSet.has(name)) return;

        setGuesses((prev) => [cardObj, ...prev]);
        setInputValue("");
        setShowSuggestions(false);

        if (cardObj.card === targetCard.card) {
            setIsWon(true);
        }
    };

    useEffect(() => {
        if (!isWon) return;
        const updated = updateStatsOnWin(statsMode, guesses.length, dayKey);
        setStats(updated);
        // setShowWinModal(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWon]);

    return {
        cardsData,
        targetCard,
        guesses,
        setGuesses,
        inputValue,
        setInputValue,
        showSuggestions,
        setShowSuggestions,
        filteredCards,
        isWon,
        setIsWon,
        stats,
        // showWinModal,
        // setShowWinModal,
        dayKey,
        dayIndex,
        handleGuess,
    };
}

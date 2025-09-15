// Lightweight local stats for daily mode
const STATS_KEY = 'clashle:stats:v1';

const safeParse = (raw, fallback) => {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

const defaultStats = () => ({
    played: 0,         // unique days with at least one guess
    wins: 0,           // unique days with a win
    currentStreak: 0,
    maxStreak: 0,
    guessDist: {},     // { "1": 3, "2": 10, ... }
    attemptedDays: {}, // { "YYYY-MM-DD": true }
    lastWinDayKey: null
});

export function loadStats() {
    return safeParse(localStorage.getItem(STATS_KEY), defaultStats());
}

export function saveStats(stats) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

export function markAttempt(dayKey) {
    const s = loadStats();
    if (!s.attemptedDays[dayKey]) {
        s.attemptedDays[dayKey] = true;
        s.played += 1;
        saveStats(s);
    }
    return s;
}

const getYesterdayKey = (dayKey) => {
    const [y,m,d] = dayKey.split('-').map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() - 1);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const dd = String(dt.getDate()).padStart(2,'0');
    return `${yy}-${mm}-${dd}`;
};

export function updateStatsOnWin(guessesCount, dayKey) {
    const s = loadStats();
    if (s.lastWinDayKey === dayKey) return s; // idempotent per day

    s.wins += 1;

    // streaks are based on *winning* on consecutive days
    const yKey = getYesterdayKey(dayKey);
    if (s.lastWinDayKey === yKey) s.currentStreak += 1;
    else s.currentStreak = 1;

    s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
    s.lastWinDayKey = dayKey;

    const k = String(guessesCount);
    s.guessDist[k] = (s.guessDist[k] || 0) + 1;

    saveStats(s);
    return s;
}

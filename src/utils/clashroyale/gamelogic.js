// gamelogic.js - Clash Royale version

export const getDailyCard = (cards) => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cards[seed % cards.length];
};

const normalizeMulti = (val) =>
    String(val)
        .toLowerCase()
        .replace(/\s+and\s+/g, '/')   // "Air and Ground" → "Air/Ground" (safety)
        .replace(/\s*&\s*/g, '/')     // "Air & Ground"   → "Air/Ground"
        .split(/[\/,]+/)              // split on "/", "&", ","
        .map(s => s.trim())
        .filter(Boolean);

export const compareAttributes = (guess, target) => {
    const comparison = {};

    Object.keys(target).forEach(key => {
        // skip non-gameplay fields
        if (key === 'card' || key === 'healthValue' || key.startsWith('hint')) return;

        const guessValue  = guess[key];
        const targetValue = target[key];

        // Numeric-ish attributes
        if (key === 'year' || key === 'cost' || key === 'arena') {
            const guessStr  = String(guessValue);
            const targetStr = String(targetValue);

            // special "Other"
            if (guessStr === 'Other' || targetStr === 'Other') {
                comparison[key] = (guessStr === targetStr) ? 'correct' : 'wrong';
            }
            // multi-value numeric like "3 / 6"
            else if (guessStr.includes(' / ') || targetStr.includes(' / ')) {
                const gSet = guessStr.split(' / ').map(s => s.trim());
                const tSet = targetStr.split(' / ').map(s => s.trim());
                const sameLen = gSet.length === tSet.length;
                const sameSet = sameLen && tSet.every(tv => gSet.includes(tv));
                comparison[key] = sameSet ? 'correct' : (gSet.some(gv => tSet.includes(gv)) ? 'close' : 'wrong');
            }
            // standard numeric compare (falls back to exact string match if NaN)
            else {
                const gNum = Number(guessValue);
                const tNum = Number(targetValue);
                if (isNaN(gNum) || isNaN(tNum)) {
                    comparison[key] = guessValue === targetValue ? 'correct' : 'wrong';
                } else if (gNum === tNum) {
                    comparison[key] = 'correct';
                } else {
                    comparison[key] = gNum > tNum ? 'higher' : 'lower';
                }
            }
        }
        // moveSpeed: allow partials like "Fast" vs "Very Fast"
        else if (key === 'moveSpeed') {
            const g = String(guessValue).toLowerCase().trim();
            const t = String(targetValue).toLowerCase().trim();
            if (g === t) {
                comparison[key] = 'correct';
            } else if (g.includes(t) || t.includes(g)) {
                comparison[key] = 'close';
            } else {
                comparison[key] = 'wrong';
            }
        }
        // String / multi-value attributes (e.g., Targets, Type, Rarity, HealthCategory, etc.)
        else {
            const gVals = normalizeMulti(guessValue);
            const tVals = normalizeMulti(targetValue);

            // exact set equality (order-insensitive)
            const sameLen = gVals.length === tVals.length;
            const sameSet = sameLen && tVals.every(tv => gVals.includes(tv));

            if (sameSet) {
                comparison[key] = 'correct'; // e.g., "Air / Ground" vs "Ground / Air"
            } else {
                const overlap = gVals.some(gv => tVals.includes(gv)) || tVals.some(tv => gVals.includes(tv));
                comparison[key] = overlap ? 'close' : 'wrong';
            }
        }
    });

    return comparison;
};

export const getAttributeColor = (status) => {
    switch (status) {
        case 'correct': return 'bg-emerald-500 border-emerald-600';
        case 'close': return 'bg-amber-500 border-amber-600'; // Yellow for partial
        case 'wrong': return 'bg-red-500 border-red-600';
        case 'higher': return 'bg-red-500 border-red-600';
        case 'lower': return 'bg-red-500 border-red-600';
        default: return 'bg-gray-300 border-gray-400';
    }
};
import { buildUrl } from '../shareBase.js';

// Map your comparison statuses to emojis
const TILE = {
    correct: '🟩',
    partial: '🟨',
    incorrect: '🟥',
    higher: '🔺',
    lower: '🔻',
};

const statusToEmoji = (attrKey, status) => {
    if (!status) return TILE.incorrect;
    if (status === 'correct') return TILE.correct;
    if (status === 'partial') return TILE.partial;
    if (status === 'higher')  return TILE.higher;  // for year/cost/arena
    if (status === 'lower')   return TILE.lower;
    return TILE.incorrect;
};

// --- Daily index ---
// Original (UTC-based):
const EPOCH_ISO = '2025-01-01T00:00:00';
export const getDayIndex = (d = new Date()) =>
    Math.floor( (d - new Date(EPOCH_ISO)) / 86400000 );

// export function buildShareText({ dayIndex, guessCount, attributes, guesses, url = '' }) {
//     const header = `CLASHDLE #${dayIndex} — ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}`;
//     // Show guesses earliest -> latest
//     const rows = [...guesses].reverse().map(g =>
//         attributes.map(a => statusToEmoji(a.key, g.comparison?.[a.key])).join('')
//     );
//     const maybeUrl = url ? `\n${url}` : '';
//     return `${header}\n${rows.join('\n')}${maybeUrl}`;
// }
export function buildShareText({
                                   dayIndex,
                                   guessCount,
                                   attributes,
                                   guesses,
                                   url,             // optional; if omitted we’ll fill it with the canonical route
                                   route = '/clash-royale/classic', // default route for this game
                                   query,           // optional object of query params to attach (e.g., { seed })
                               } = {}) {
    const idx = dayIndex ?? getDayIndex();
    const header = `CLASHDLE #${idx} — ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}`;

    // If URL wasn’t provided, build it from route + params
    const finalUrl = url || buildUrl(route, query);

    // NOTE: If your `guesses` array is stored newest-first, keep reverse().
    // If it's already earliest-first, remove the reverse().
    const rows = [...guesses].reverse().map((g) =>
        attributes.map((a) => statusToEmoji(a.key, g.comparison?.[a.key])).join('')
    );

    const maybeUrl = finalUrl ? `\n${finalUrl}` : '';
    return `${header}\n${rows.join('\n')}${maybeUrl}`;
}


export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {}
    // Fallback
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        return true;
    } catch { return false; }
}

// Seeded pseudo-random number generation.
//
// xmur3 hashes a string to a 32-bit seed; mulberry32 turns that seed into a
// deterministic stream of floats in [0, 1). Same string in, same sequence out,
// on every device and every run - which is what makes a "random" daily puzzle
// reproducible without a backend.
//
// NOTE: RushGame.jsx carries its own inline copy of both functions. They are
// identical today and nothing enforces that. Collapsing them is p6 work (see
// T10 for the same problem with slugify) - deliberately not done here, because
// RushGame is one of the files the p6 branch rewrites.

export const xmur3 = (str) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    };
};

export const mulberry32 = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A float stream seeded from a string. */
export const seededRandom = (seedStr) => mulberry32(xmur3(seedStr)());

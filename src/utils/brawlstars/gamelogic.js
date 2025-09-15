// // Utility functions for game logic
//
// export const getDailyBrawler = (brawlers) => {
//     const today = new Date().toDateString();
//     const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     return brawlers[seed % brawlers.length];
// };
//
// export const compareAttributes = (guess, target) => {
//     const comparison = {};
//
//     Object.keys(target).forEach(key => {
//         if (key === 'name') return;
//
//         // Direct match
//         if (guess[key] === target[key]) {
//             comparison[key] = 'correct';
//         } else if (key === 'releaseYear') {
//             // For year, determine if guess is higher or lower than target
//             comparison[key] = guess[key] > target[key] ? 'higher' : 'lower';
//         } else {
//             // Handle categories with multiple attributes (e.g., "Normal / Long")
//             const targetValues = String(target[key]).split(' / ').map(s => s.trim());
//             const guessValues = String(guess[key]).split(' / ').map(s => s.trim());
//
//             // Check if any part of the guess matches any part of the target, or vice versa
//             const isPartialMatch = guessValues.some(gv => targetValues.includes(gv)) ||
//                 targetValues.some(tv => guessValues.includes(tv));
//
//             if (isPartialMatch) {
//                 comparison[key] = 'close';
//             } else {
//                 comparison[key] = 'wrong';
//             }
//         }
//     });
//
//     return comparison;
// };
//
// export const getAttributeColor = (status) => {
//     switch (status) {
//         case 'correct': return 'bg-emerald-500 border-emerald-600';
//         case 'close': return 'bg-amber-500 border-amber-600';
//         case 'wrong': return 'bg-red-500 border-red-600';
//         case 'higher': return 'bg-red-500 border-red-600'; // Guess was too high
//         case 'lower': return 'bg-red-500 border-red-600';  // Guess was too low
//         default: return 'bg-gray-300 border-gray-400';
//     }
// };
// gamelogic.js

// gamelogic.js

export const getDailyBrawler = (brawlers) => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return brawlers[seed % brawlers.length];
};

export const compareAttributes = (guess, target) => {
    const comparison = {};

    Object.keys(target).forEach(key => {
        // Exclude 'name' and any keys ending with 'Hint'
        if (key === 'name' || key.endsWith('Hint')) {
            return;
        }

        const guessValue = guess[key];
        const targetValue = target[key];

        // Handle numeric comparison specifically for 'releaseYear'
        if (key === 'releaseYear') {
            if (guessValue === targetValue) {
                comparison[key] = 'correct';
            } else {
                comparison[key] = guessValue > targetValue ? 'higher' : 'lower';
            }
        }
        // Handle all other string attributes (e.g., Rarity, Gender, Class, Health, Speed, Range, Reload)
        else {
            // Convert values to lowercase arrays for case-insensitive and multi-value comparison
            const targetValuesLower = String(targetValue).split(' / ').map(s => s.trim().toLowerCase());
            const guessValuesLower = String(guessValue).split(' / ').map(s => s.trim().toLowerCase());

            // Check for an exact match (e.g., "Epic" vs "epic")
            // This covers single-value attributes and ensures "correct" status
            if (guessValuesLower.length === 1 && targetValuesLower.length === 1 && guessValuesLower[0] === targetValuesLower[0]) {
                comparison[key] = 'correct';
            }
            // Check for partial matches (e.g., "Normal / Long" vs "Normal")
            else {
                const isPartialMatch = guessValuesLower.some(gv => targetValuesLower.includes(gv)) ||
                    targetValuesLower.some(tv => guessValuesLower.includes(tv));

                if (isPartialMatch) {
                    comparison[key] = 'close'; // This will map to yellow
                } else {
                    comparison[key] = 'wrong'; // This will map to red
                }
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

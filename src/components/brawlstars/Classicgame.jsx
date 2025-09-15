import React, { useState, useEffect } from 'react';
import brawlersData from '../../data/brawlers.json';
import { getDailyBrawler, compareAttributes, getAttributeColor } from '../../utils/brawlstars/gamelogic.js';

// Individual attribute card component with flip animation
const AttributeCard = ({ attribute, value, status, isFlipping, delay = 0, isNewGuess = false }) => {
    const [showBack, setShowBack] = useState(!isNewGuess); // Show back immediately for old guesses
    const [isVisible, setIsVisible] = useState(!isNewGuess); // Start invisible for new guesses

    useEffect(() => {
        if (isFlipping && isNewGuess) {
            // Start the visibility animation at the designated time
            const visibilityTimer = setTimeout(() => {
                setIsVisible(true);
            }, delay);

            // Start the flip animation shortly after becoming visible
            const flipTimer = setTimeout(() => {
                setShowBack(true);
            }, delay + 200);

            return () => {
                clearTimeout(visibilityTimer);
                clearTimeout(flipTimer);
            };
        }
    }, [isFlipping, delay, isNewGuess]);

    const cardColor = getAttributeColor(status);
    const flipClass = isFlipping && isNewGuess ? 'animate-flip' : '';
    const opacityClass = isVisible ? 'opacity-100' : 'opacity-0';

    return (
        <div className={`relative w-20 h-20 perspective-1000 transition-opacity duration-500 ${opacityClass}`}>
            <div className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${flipClass} ${showBack ? 'rotate-y-180' : ''}`}>
                {/* Front face (initially shown) */}
                <div className="absolute inset-0 w-full h-full bg-gray-300 border-2 border-gray-400 rounded-lg flex items-center justify-center backface-hidden">
                    <span className="text-lg text-gray-600 font-semibold">?</span>
                </div>

                {/* Back face (shown after flip) */}
                <div className={`absolute inset-0 w-full h-full ${cardColor} rounded-lg flex items-center justify-center backface-hidden rotate-y-180 text-white font-bold text-sm px-1 text-center shadow-lg border-2 overflow-hidden`}>
                    {attribute === 'releaseYear' && (status === 'higher' || status === 'lower') ? (
                        <div className="relative flex items-center justify-center w-full h-full">
                            {/* Large triangle background */}
                            <div className={`absolute inset-0 flex items-center justify-center ${status === 'lower' ? 'pt-2' : ''}`}>
                                <span className={`text-5xl text-red-900 opacity-50 leading-none ${status === 'higher' ? '' : 'transform rotate-180'}`}>
                                    ▼
                                </span>
                            </div>
                            {/* Year text on top */}
                            <span className="relative z-10 break-words font-bold text-white">{value}</span>
                        </div>
                    ) : (
                        <span className="break-words">{value}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Brawler portrait card (same size as attribute cards)
const BrawlerCard = ({ name }) => {
    return (
        <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-lg">
            <div className="text-center px-1">
                <div className="text-sm font-bold text-gray-800 break-words leading-tight">
                    {name}
                </div>
            </div>
        </div>
    );
};

// Inline Legend Component (not a modal)
const InlineLegend = ({ onClose }) => {
    return (
        <div className="w-96 mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white underline underline-offset-4">Color Indicators</h3>
                <button
                    onClick={onClose}
                    className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="flex justify-center space-x-3 mb-3">
                <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg mb-1 border-2 border-emerald-600"></div>
                    <span className="text-white text-xs font-medium">Correct</span>
                </div>
                <div className="text-center">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg mb-1 border-2 border-amber-600"></div>
                    <span className="text-white text-xs font-medium">Partial</span>
                </div>
                <div className="text-center">
                    <div className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600"></div>
                    <span className="text-white text-xs font-medium">Incorrect</span>
                </div>
                <div className="text-center">
                    <div
                        className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">▲</span>
                    </div>
                    <span className="text-white text-xs font-medium">Higher</span>
                </div>
                <div className="text-center">
                    <div
                        className="w-10 h-10 bg-red-500 rounded-lg mb-1 border-2 border-red-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">▼</span>
                    </div>
                    <span className="text-white text-xs font-medium">Lower</span>
                </div>
            </div>
        </div>
    );
};


const ClassicGame = () => {
    const [targetBrawler] = useState(() => getDailyBrawler(brawlersData));
    const [guesses, setGuesses] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [flippingRows, setFlippingRows] = useState(new Set());
    const [showLegend, setShowLegend] = useState(true);

    const [revealedHints, setRevealedHints] = useState({
        quoteHint: false,
        gadgetHint: false,
        titleHint: false,
    });

    const filteredBrawlers = brawlersData.filter(brawler =>
        brawler.name.toLowerCase().startsWith(inputValue.toLowerCase()) &&
        !guesses.some(guess => guess.name === brawler.name)
    );

    const handleGuess = (brawler) => {
        if (guesses.some(guess => guess.name === brawler.name)) return;

        const comparison = compareAttributes(brawler, targetBrawler);
        const newGuess = { ...brawler, comparison };

        setGuesses(prev => [newGuess, ...prev]);
        setInputValue('');
        setShowSuggestions(false);

        // Trigger flip animation for the new row
        setFlippingRows(new Set([0]));
        setTimeout(() => setFlippingRows(new Set()), 4000); // Extended to cover all animations

        if (brawler.name === targetBrawler.name) {
            setTimeout(() => setIsWon(true), 2500);
        }
    };

    const handleRevealHint = (hintKey) => {
        setRevealedHints(prev => ({ ...prev, [hintKey]: true }));
    };

    const attributes = [
        { key: 'rarity', label: 'Rarity' },
        { key: 'gender', label: 'Gender' },
        { key: 'class', label: 'Class' },
        { key: 'health', label: 'Health' },
        { key: 'speed', label: 'Speed' },
        { key: 'range', label: 'Range' },
        { key: 'reload', label: 'Reload' },
        { key: 'releaseYear', label: 'Year' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            {/* Custom CSS for 3D flip animation */}
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .animate-flip { animation: flip 0.6s ease-in-out; }

                @keyframes flip {
                    0% {
                        transform: rotateY(0deg);
                    }
                    50% {
                        transform: rotateY(90deg) scale(0.95);
                    }
                    100% {
                        transform: rotateY(180deg);
                    }
                }
            `}</style>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>

            {/* Main container for page content */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                            BRAWLDLE
                        </span>
                    </h1>
                    {/* Main "Guess today's Brawler" box - now wider and contains hints */}
                    <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <p className="text-purple-200 text-2xl font-medium mb-4">
                            Guess today's Brawler
                        </p>
                        {/* --- HINT SECTION --- */}
                        {guesses.length >= 2 && ( // Hints appear after 2 guesses
                            <div className="flex justify-center items-center gap-6 mt-4"> {/* Use justify-center with gap */}
                                {/* Quote Hint */}
                                <HintDisplay
                                    hintName="Quote"
                                    hintKey="quoteHint"
                                    unlockedThreshold={6} // Unlocks after 6 guesses
                                    currentGuesses={guesses.length}
                                    revealed={revealedHints.quoteHint}
                                    onReveal={handleRevealHint}
                                    hintText={targetBrawler.quoteHint}
                                    isWon={isWon}
                                />
                                {/* Gadget Hint */}
                                <HintDisplay
                                    hintName="Gadget"
                                    hintKey="gadgetHint"
                                    unlockedThreshold={12} // Unlocks after 12 guesses
                                    currentGuesses={guesses.length}
                                    revealed={revealedHints.gadgetHint}
                                    onReveal={handleRevealHint}
                                    hintText={targetBrawler.gadgetHint}
                                    isWon={isWon}
                                />
                                {/* Title Hint */}
                                <HintDisplay
                                    hintName="Title"
                                    hintKey="titleHint"
                                    unlockedThreshold={18} // Unlocks after 18 guesses
                                    currentGuesses={guesses.length}
                                    revealed={revealedHints.titleHint}
                                    onReveal={handleRevealHint}
                                    hintText={targetBrawler.titleHint}
                                    isWon={isWon}
                                />
                            </div>
                        )}
                        {/* --- END HINT SECTION --- */}
                    </div> {/* End of the main "Guess today's Brawler" box */}


                    <div className="mt-4 flex justify-center space-x-4 text-sm text-purple-300">
                        <span>Guesses: {guesses.length}</span>
                        <span>•</span>
                        <span>Status: {isWon ? '🎉 Victory!' : '🎯 Guessing...'}</span>
                    </div>
                </div>

                {/* Main Game Container - Added px-4 for overall padding */}
                <div className="max-w-5xl mx-auto px-4">
                    {/* Search Input */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="relative w-96">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && filteredBrawlers.length > 0 && !isWon) {
                                        e.preventDefault();
                                        handleGuess(filteredBrawlers[0]);
                                    }
                                    if (e.key === 'Escape') {
                                        setShowSuggestions(false);
                                    }
                                }}
                                placeholder="Enter brawler name..."
                                disabled={isWon}
                                className="w-full px-6 py-4 text-lg font-semibold text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-purple-300 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <div
                                    className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">🔍</span>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && inputValue.length > 0 && filteredBrawlers.length > 0 && !isWon && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 mt-2 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                {filteredBrawlers.slice(0, 8).map((brawler, index) => (
                                    <div
                                        key={brawler.name}
                                        onClick={() => handleGuess(brawler)}
                                        className={`px-6 py-3 cursor-pointer transition-colors duration-200 border-b border-purple-100 last:border-b-0 flex items-center justify-between ${
                                            index === 0
                                                ? 'bg-purple-100 hover:bg-purple-150' // Highlight top suggestion
                                                : 'hover:bg-purple-50'
                                        }`}
                                    >
                                        <span className="font-semibold text-gray-800">{brawler.name}</span>
                                        {index === 0 && (
                                            <span className="ml-2 text-xs text-purple-600 font-medium">↵ Enter</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Victory Message */}
                    {isWon && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h2>
                                <p className="text-emerald-100 text-lg">
                                    You guessed <span
                                    className="font-bold">{targetBrawler.name}</span> in {guesses.length} tries!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* NEW WRAPPER FOR CENTERING THE CARD GRID */}
                    <div className="flex flex-col items-center">
                        {/* Column Headers */}
                        {guesses.length > 0 && (
                            <div className="mb-4">
                                {/* Adjusted grid-cols and gap, removed mx-auto */}
                                <div className="grid grid-cols-[repeat(9,5rem)] gap-1">
                                    <div className="text-center text-base font-bold text-white pb-2">
                                        <span className="inline-block border-b-4 border-white pb-2 w-20">Brawler</span>
                                    </div>
                                    {attributes.map(attr => (
                                        <div key={attr.key} className="text-center text-base font-bold text-white pb-2">
                                            <span
                                                className="inline-block border-b-4 border-white pb-2 w-20">{attr.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Guess Rows */}
                        <div className="space-y-4"> {/* Increased vertical space to 5px */}
                            {guesses.map((guess, rowIndex) => (
                                <div key={`${guess.name}-${rowIndex}`} className="grid grid-cols-[repeat(9,5rem)] gap-1"> {/* Increased horizontal gap, removed mx-auto */}
                                    {/* Brawler portrait (doesn't flip) */}
                                    <BrawlerCard name={guess.name}/>

                                    {/* Attribute cards (each flips individually with staggered timing) */}
                                    {attributes.map((attr, attrIndex) => (
                                        <AttributeCard
                                            key={`${attr.key}-${rowIndex}`}
                                            attribute={attr.key}
                                            value={guess[attr.key]}
                                            status={guess.comparison[attr.key]}
                                            isFlipping={flippingRows.has(rowIndex)}
                                            isNewGuess={rowIndex === 0}
                                            delay={attrIndex * 500}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div> {/* END NEW WRAPPER */}

                    {/* Game Instructions */}
                    {guesses.length === 0 && (
                        <div
                            className="w-96 mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mt-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center underline decoration-2 underline-offset-4">
                                How to Play
                            </h2>
                            <div className="text-purple-200 space-y-2">
                                <p>• Guess the daily Brawler in unlimited tries</p>
                                <p>• Refreshes Daily</p>
                                <p>• <span className="inline-block w-4 h-4 bg-emerald-500 rounded mr-2"></span> Green =
                                    Correct</p>
                                <p>• <span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span> Red = Wrong
                                </p>
                                <p>• <span className="inline-block w-4 h-4 bg-amber-500 rounded mr-2"></span> Yellow =
                                    Partial</p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Inline Legend - shows under instructions initially, then under game area */}
                {showLegend && (
                    <InlineLegend onClose={() => setShowLegend(false)} />
                )}
            </div>
        </div>
    );
};

// Hint Display Component - Modified for clickable circle, integrated text, and countdown
const HintDisplay = ({ hintName, hintKey, unlockedThreshold, currentGuesses, revealed, onReveal, hintText, isWon }) => {
    const isUnlocked = currentGuesses >= unlockedThreshold;
    const canReveal = isUnlocked && !revealed && !isWon;
    const guessesRemaining = unlockedThreshold - currentGuesses;

    const textColor = isUnlocked ? (revealed ? 'text-purple-100' : 'text-white') : 'text-gray-300';
    const bgColor = isUnlocked ? 'bg-white/20' : 'bg-gray-700/50';
    const borderColor = isUnlocked ? 'border-white/30' : 'border-gray-600';
    const hoverClass = canReveal ? 'hover:scale-105 hover:bg-white/30' : '';
    const cursorClass = canReveal ? 'cursor-pointer' : 'cursor-not-allowed';

    let iconContent;
    switch (hintKey) {
        case 'quoteHint': iconContent = '🗣️'; break;
        case 'gadgetHint': iconContent = '🛠️'; break;
        case 'titleHint': iconContent = '👑'; break;
        default: iconContent = '?';
    }

    return (
        <div
            onClick={() => canReveal && onReveal(hintKey)}
            className={`flex flex-col items-center justify-center 
                        w-28 h-28 rounded-full shadow-lg transition-all duration-300
                        ${bgColor} ${borderColor} border-2 ${hoverClass} ${cursorClass}
                        relative text-center p-2
                        ${revealed ? 'bg-white/15' : ''}
                       `}
        >
            {revealed ? (
                <>
                    {/* Display revealed hint */}
                    <p className={`font-semibold text-xs ${textColor} mb-1 leading-tight`}>{hintName} Clue:</p>
                    <p className={`text-sm italic ${textColor} px-1 leading-tight`}>"{hintText}"</p>
                </>
            ) : (
                <>
                    {/* Display unrevealed hint with icon and countdown */}
                    <div className="text-4xl mb-1">{iconContent}</div>
                    <p className={`font-semibold text-xs ${textColor} leading-tight mb-1`}>{hintName} Clue</p>
                    <p className={`text-xs ${textColor} leading-tight`}>
                        {isUnlocked
                            ? 'Click to Reveal'
                            : `In ${guessesRemaining} tries`
                        }
                    </p>
                </>
            )}
            {/* Optional overlay for disabled state, though cursor-not-allowed is often enough */}
            {!canReveal && !revealed && (
                <div className="absolute inset-0 rounded-full bg-black opacity-30"></div>
            )}
        </div>
    );
};


export default ClassicGame;
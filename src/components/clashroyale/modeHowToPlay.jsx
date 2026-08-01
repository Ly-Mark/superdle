// src/components/clashroyale/modeHowToPlay.jsx
// Copy for the per-mode "How to play" blocks, kept in one place so the four
// modes stay consistent.
//
// Every number here is checked against the code, not against how the game
// "should" work:
//   8 attribute tiles      ClassicGame.jsx / RushGame.jsx ATTRIBUTES
//   yellow exists          gamelogic.js returns 'close' -> amber
//   5 guesses to a clue    DescriptionGame.jsx HINT_UNLOCK_AT
//   90s, +30s..+8s, 210s   RushGame.jsx RUSH_SECONDS / TIME_BONUS_*
//   3x..1x, 75/50/25       RushGame.jsx getGuessMultiplier / getSpeedBonus
//   100/300/700 at 3/5/7   RushGame.jsx getStreakBonus
//   streak needs <=2       RushGame.jsx qualifiesForStreak
//   120s, starts on any    MemoryGame.jsx DEFAULT_DURATION / submitGuess
//   29/30/33/21/8 = 121    counted from cards.json
//
// If any of those change, change the wording here too.

export const CLASSIC_HOW_TO_PLAY = {
    tagline: 'Three steps, eight tiles.',
    steps: [
        {
            heading: 'Type a card name and submit',
            body: (
                <>
                    The box autocompletes against all 121 cards as you type. Press Enter
                    to take the top suggestion, or click the one you want. If nothing
                    appears, the name doesn&apos;t match — keep typing or check the
                    spelling. A few shortcuts work: <code>log</code> finds The Log,{' '}
                    <code>xbow</code> finds X-Bow.
                </>
            ),
        },
        {
            heading: 'Read the eight tiles',
            body: (
                <>
                    Each tile compares one attribute against the mystery card.{' '}
                    <strong className="text-emerald-300">Green</strong> means an exact
                    match. <strong className="text-amber-300">Yellow</strong> means a
                    partial match — a card that hits both air and ground when the answer
                    only hits ground. <strong className="text-rose-300">Red</strong> means
                    no match. On Elixir, Arena and Year an arrow points the way:{' '}
                    <strong>▲</strong> the answer is higher than your guess,{' '}
                    <strong>▼</strong> it&apos;s lower.
                </>
            ),
        },
        {
            heading: 'Narrow it down',
            body: (
                <>
                    Unlimited guesses, and cards you&apos;ve already tried are removed
                    from the suggestions so you can&apos;t repeat one by accident. Your
                    score for the day is how many guesses it took. A new card arrives at
                    local midnight.
                </>
            ),
        },
    ],
};

export const DESCRIPTION_HOW_TO_PLAY = {
    tagline: 'The puzzle is the prose. Read it twice.',
    steps: [
        {
            heading: 'Read the description closely',
            body: (
                <>
                    Every word is doing work. &ldquo;Group&rdquo; or &ldquo;swarm&rdquo;
                    points at a multi-unit card. &ldquo;Charges&rdquo; suggests something
                    with a dash. Numbers are the biggest gift: &ldquo;three&rdquo; usually
                    means literally three.
                </>
            ),
        },
        {
            heading: 'Five guesses, then a clue',
            body: (
                <>
                    There are no attribute tiles in this mode — a wrong guess only tells
                    you it was wrong. After five guesses the elixir button unlocks one
                    written clue. One clue, not a series.
                </>
            ),
        },
        {
            heading: 'Keep going until you land it',
            body: (
                <>
                    No fail state and no guess limit. Your score is how many guesses it
                    took. Progress survives closing the tab, and a new description arrives
                    at local midnight.
                </>
            ),
        },
    ],
};

export const RUSH_HOW_TO_PLAY = {
    tagline: 'Type fast. Correct answers buy you clock.',
    steps: [
        {
            heading: 'The clock starts on your first guess',
            body: (
                <>
                    Not on page load. Nothing runs until you submit something, so take a
                    moment to settle before you begin.
                </>
            ),
        },
        {
            heading: 'Speed and accuracy both pay',
            body: (
                <>
                    Each card is worth 100 points multiplied by how few guesses you
                    needed — 3× on the first guess, down to 1× at six or more. Solving
                    under 15 seconds adds 75 bonus points, under 25 adds 50, under 40 adds
                    25. Time comes back too: 30 seconds for a first-guess solve, tapering
                    by 4 for each extra guess down to a floor of 8. The clock caps at
                    three and a half minutes.
                </>
            ),
        },
        {
            heading: 'Streaks need clean solves',
            body: (
                <>
                    A card only extends your streak if you got it in two guesses or fewer.
                    Three in a row is worth 100 bonus points, five is 300, seven is 700. A
                    sloppy solve resets the streak, though it costs you no time.
                </>
            ),
        },
    ],
};

export const MEMORY_HOW_TO_PLAY = {
    tagline: 'One box. Five buckets. Two minutes.',
    steps: [
        {
            heading: 'The clock starts on your first submission',
            body: (
                <>
                    Right or wrong, either one starts it. Nothing counts down before that,
                    so there&apos;s no rush to begin.
                </>
            ),
        },
        {
            heading: 'Misses are free',
            body: (
                <>
                    No penalty and no guess limit — a wrong entry simply tells you it
                    isn&apos;t a card. Correct ones fill a slot in their rarity bucket, so
                    you can see where your gaps are. Shortcuts work here too:{' '}
                    <code>log</code>, <code>xbow</code>, and{' '}
                    <code>giant snowball</code>.
                </>
            ),
        },
        {
            heading: 'Finish the board',
            body: (
                <>
                    Getting all 121 ends the run early. Memory tracks no streaks or win
                    stats — it&apos;s a pure recall drill, and the only score worth
                    beating is your own.
                </>
            ),
        },
    ],
};

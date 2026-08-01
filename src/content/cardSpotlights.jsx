// src/content/cardSpotlights.jsx
// Hand-written copy for individual card pages.
//
// A card only gets a page if there is something worth writing about it. This is
// deliberately a short list, not all 121 — cards.json holds roughly 45 words of
// unique text per card, so generating a page each would be the same boilerplate
// repeated 121 times, which is the thin-content pattern we are trying to avoid.
//
// RULE FOR ANYTHING ADDED HERE: only claims that can be checked. Mechanics,
// stats, release facts, and what the art looks like are all verifiable. What
// the card is "good against", which decks it belongs in, and how the current
// meta treats it are not — nobody working on this site plays at that level, and
// inventing it reads as filler to anyone who does.
//
// `intro`   one short paragraph, sets up why the card is interesting
// `sections` [{ heading, body }] — body may be JSX
// `links`   outbound references, rendered with visible attribution

export const CARD_SPOTLIGHTS = {
    'Goblin Barrel': {
        intro: (
            <>
                Goblin Barrel is filed as a spell, but it does no spell damage. What it
                delivers is three goblins, thrown anywhere on the map — including
                directly behind a tower. Skipping everything in between is the whole
                idea, and it is the reason a 3-elixir card with no direct damage has
                been in the game since 2016.
            </>
        ),
        sections: [
            {
                heading: 'How it works',
                body: (
                    <>
                        <p>
                            The barrel itself does nothing on impact. Everything depends on
                            what comes out of it: three goblins, fast and fragile, that go
                            for whatever is nearest. Because they arrive already past
                            whatever was defending, the question is never whether they can
                            reach the tower — it is whether anything is still alive to stop
                            them.
                        </p>
                        <p className="mt-3">
                            That makes it unusual among cards of its cost. Most things you
                            play have to walk the length of the arena and survive the trip.
                            This does not, which is why it is grouped with spells despite
                            behaving nothing like one.
                        </p>
                    </>
                ),
            },
            {
                heading: 'What it looks like',
                body: (
                    <p>
                        A wooden keg tumbling end over end through the air, painted with a
                        grinning green face. You see it in flight before you see what it
                        contains, which is usually the point at which it is too late to do
                        much about it.
                    </p>
                ),
            },
        ],
        links: [
            {
                href: 'https://www.deckshop.pro/best-decks/with/goblin-barrel',
                label: 'Current decks featuring Goblin Barrel',
                note: 'Deck Shop Pro — community-maintained deck lists',
            },
            {
                href: 'https://www.deckshop.pro/card/detail/goblin-barrel',
                label: 'Full stats and matchups',
                note: 'Deck Shop Pro — detailed card breakdown',
            },
        ],
    },
};

export const SPOTLIGHT_CARDS = Object.keys(CARD_SPOTLIGHTS);

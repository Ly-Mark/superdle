// src/pages/AboutPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

export default function AboutPage() {
    return (
        <InfoPage title="About Clashdle">
            <p>
                Clashdle is a daily guessing game inspired by Wordle, built for fans of
                Clash Royale. Every day there's a new card to guess across four modes:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                    <strong className="text-white">Classic</strong> — guess the daily card
                    from attribute comparisons (elixir cost, rarity, type, year released,
                    arena).
                </li>
                <li>
                    <strong className="text-white">Description</strong> — guess the card
                    from its in-game description.
                </li>
                <li>
                    <strong className="text-white">Rush</strong> — speed mode, 90 seconds
                    to guess as many as you can.
                </li>
                <li>
                    <strong className="text-white">Memory</strong> — recall-based card
                    matching.
                </li>
            </ul>

            <p>
                The site is built and maintained by an independent developer. It's free
                to play, runs in your browser, and saves your stats locally — no account
                required.
            </p>

            <p>
                Clashdle is a fan project. It is not made by, affiliated with, endorsed,
                sponsored, or specifically approved by Supercell. For more information
                see{' '}
                <a
                    href="https://supercell.com/en/fan-content-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                >
                    Supercell&apos;s Fan Content Policy
                </a>
                .
            </p>

            <p>
                Have feedback, bug reports, or suggestions? Head over to the{' '}
                <a href="/contact" className="text-blue-300 hover:text-blue-200 underline">
                    Contact page
                </a>
                .
            </p>
        </InfoPage>
    );
}
// src/pages/TermsPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

const LAST_UPDATED = 'August 1, 2026';
const sectionH2 = 'text-xl font-semibold text-white mt-6 mb-2';
const linkCls = 'text-blue-300 hover:text-blue-200 underline';

export default function TermsPage() {
    return (
        <InfoPage title="Terms of Use">
            <p className="text-sm text-white/60">Last updated: {LAST_UPDATED}</p>

            <p>
                Clashdle (clash.ac) is operated by Mark Ly from Vancouver, British
                Columbia, Canada. By using the site you agree to these terms and to the{' '}
                <a href="/privacy" className={linkCls}>Privacy Policy</a>.
            </p>

            <h2 className={sectionH2}>Use of the site</h2>
            <p>
                Clashdle is provided free of charge for personal use. You agree not to
                misuse the service — including attempting to disrupt it or use it in any
                unlawful way.
            </p>

            <h2 className={sectionH2}>Acceptable use</h2>
            <p>Specifically, you agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
                <li>scrape or download the site at scale, or in a way that degrades it for others;</li>
                <li>publish or share the day&apos;s answers before the puzzle has rolled over;</li>
                <li>use scripts, bots, or automation to play, farm scores, or generate results;</li>
                <li>attempt to probe, disrupt, or gain unauthorised access to the site or its hosting.</li>
            </ul>
            <p className="mt-2">
                Clashdle stores no accounts, so enforcement is limited — but access may be
                blocked where abuse is detected.
            </p>

            <h2 className={sectionH2}>Intellectual property</h2>
            <p>
                The Clashdle game logic, site design, and layout are © 2026 Mark Ly.
                Clash Royale card names, in-game text, and related game assets are the
                property of Supercell Oy. No official artwork, sprites, or sounds are
                reproduced here. Clashdle is a fan
                project created under{' '}
                <a
                    href="https://supercell.com/en/fan-content-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    Supercell&apos;s Fan Content Policy
                </a>{' '}
                and is not affiliated with, endorsed by, sponsored by, or specifically
                approved by Supercell.
            </p>

            <h2 className={sectionH2}>Disclaimer of warranties</h2>
            <p>
                The site is provided &quot;as is&quot; without warranty of any kind. We do not
                guarantee that the service will be uninterrupted, accurate, or
                error-free.
            </p>

            <h2 className={sectionH2}>Limitation of liability</h2>
            <p>
                To the maximum extent permitted by law, the site operator is not liable
                for any damages arising from your use of the site.
            </p>

            <h2 className={sectionH2}>Third-party services and links</h2>
            <p>
                Clashdle relies on third parties including Google (advertising) and
                Cloudflare (hosting), and links out to independent fan sites. We
                don&apos;t control those services or sites and aren&apos;t responsible for
                their content, availability, or practices. Their terms and privacy
                policies govern your use of them.
            </p>

            <h2 className={sectionH2}>Changes to the site</h2>
            <p>
                Game modes, puzzles, and features may be added, changed, or removed at any
                time without notice. Progress and statistics are stored only in your own
                browser, so clearing your browser data — or a change to how a mode
                works — may reset them.
            </p>

            <h2 className={sectionH2}>Changes to these terms</h2>
            <p>
                We may revise these terms at any time. The &quot;Last updated&quot; date
                above reflects the most recent revision, and continued use of the site
                after changes constitutes acceptance.
            </p>

            <h2 className={sectionH2}>Governing law</h2>
            <p>
                These terms are governed by the laws of the Province of British Columbia
                and the federal laws of Canada that apply in it. Any dispute will be heard
                in the courts of Vancouver, British Columbia.
            </p>

            <h2 className={sectionH2}>Severability</h2>
            <p>
                If any part of these terms is found unenforceable, the rest remains in
                effect. Together with the{' '}
                <a href="/privacy" className={linkCls}>Privacy Policy</a>, these terms are
                the entire agreement between you and Clashdle.
            </p>

            <h2 className={sectionH2}>Contact</h2>
            <p>
                Questions about these terms? See the{' '}
                <a href="/contact" className={linkCls}>Contact page</a>.
            </p>
        </InfoPage>
    );
}
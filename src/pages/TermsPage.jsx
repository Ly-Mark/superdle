// src/pages/TermsPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

const LAST_UPDATED = 'May 17, 2026';
const sectionH2 = 'text-xl font-semibold text-white mt-6 mb-2';
const linkCls = 'text-blue-300 hover:text-blue-200 underline';

export default function TermsPage() {
    return (
        <InfoPage title="Terms of Use">
            <p className="text-sm text-white/60">Last updated: {LAST_UPDATED}</p>

            <p>By using Clashdle (clash.ac) you agree to these terms.</p>

            <h2 className={sectionH2}>Use of the site</h2>
            <p>
                Clashdle is provided free of charge for personal use. You agree not to
                misuse the service — including attempting to disrupt it or use it in any
                unlawful way.
            </p>

            <h2 className={sectionH2}>Intellectual property</h2>
            <p>
                The Clashdle game logic, design, and original content are © 2026 the
                site operator. Clash Royale card names, descriptions, artwork, and
                related game assets are the property of Supercell Oy. Clashdle is a fan
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

            <h2 className={sectionH2}>Changes</h2>
            <p>
                We may revise these terms at any time. Continued use of the site after
                changes constitutes acceptance.
            </p>
        </InfoPage>
    );
}
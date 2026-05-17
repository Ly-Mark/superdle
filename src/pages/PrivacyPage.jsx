// src/pages/PrivacyPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

const LAST_UPDATED = 'May 17, 2026';

const sectionH2 = 'text-xl font-semibold text-white mt-6 mb-2';
const linkCls = 'text-blue-300 hover:text-blue-200 underline';

export default function PrivacyPage() {
    return (
        <InfoPage title="Privacy Policy">
            <p className="text-sm text-white/60">Last updated: {LAST_UPDATED}</p>

            <p>
                This Privacy Policy describes how Clashdle ("we", "the site", clash.ac)
                handles information when you use the site.
            </p>

            <h2 className={sectionH2}>Information we collect</h2>
            <p>
                Clashdle does not require an account and we do not collect personally
                identifiable information directly. The site stores your game progress,
                streaks, and statistics in your browser&apos;s localStorage — this data never
                leaves your device.
            </p>

            <h2 className={sectionH2}>Third-party services</h2>
            <p>
                <strong className="text-white">Google AdSense.</strong> We use Google
                AdSense to display advertisements. Google and its partners may use
                cookies and similar technologies to serve ads based on your prior visits
                to this site or other sites. You can opt out of personalized advertising
                by visiting{' '}
                <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    Google&apos;s Ads Settings
                </a>
                . For more information about how Google uses data, see{' '}
                <a
                    href="https://policies.google.com/technologies/partner-sites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    How Google uses information from sites or apps that use our services
                </a>
                .
            </p>

            <p>
                <strong className="text-white">Cloudflare.</strong> The site is hosted on
                Cloudflare, which may collect standard server logs (IP address, user
                agent, request timestamps) for security and performance purposes. See{' '}
                <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    Cloudflare&apos;s Privacy Policy
                </a>
                .
            </p>

            <h2 className={sectionH2}>Cookies</h2>
            <p>
                First-party cookies are not used by Clashdle itself. Third-party cookies
                may be set by Google AdSense and Cloudflare as described above.
            </p>

            <h2 className={sectionH2}>Users in the EEA, UK, and Switzerland</h2>
            <p>
                Where required by law, ad personalization is governed by a consent
                banner. If you are visiting from these regions and do not see a consent
                banner, the ads served to you are non-personalized. You may withdraw
                consent at any time by clearing site data in your browser.
            </p>

            <h2 className={sectionH2}>Children&apos;s privacy</h2>
            <p>
                Clashdle is intended for users aged 13 and over. We do not knowingly
                collect personal information from children under 13. If you believe a
                child under 13 has provided personal information through the site,
                please{' '}
                <a href="/contact" className={linkCls}>
                    contact us
                </a>{' '}
                and we will take appropriate action.
            </p>

            <h2 className={sectionH2}>Changes to this policy</h2>
            <p>
                We may update this Privacy Policy from time to time. The "Last updated"
                date at the top of this page reflects the most recent revision.
            </p>

            <h2 className={sectionH2}>Contact</h2>
            <p>
                Questions about this policy? See the{' '}
                <a href="/contact" className={linkCls}>
                    Contact page
                </a>
                .
            </p>
        </InfoPage>
    );
}
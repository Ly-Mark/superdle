// src/pages/PrivacyPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

const LAST_UPDATED = 'August 1, 2026';

const sectionH2 = 'text-xl font-semibold text-white mt-6 mb-2';
const linkCls = 'text-blue-300 hover:text-blue-200 underline';

export default function PrivacyPage() {
    return (
        <InfoPage title="Privacy Policy">
            <p className="text-sm text-white/60">Last updated: {LAST_UPDATED}</p>

            <p>
                This Privacy Policy describes how Clashdle (&quot;we&quot;, &quot;the
                site&quot;, clash.ac) handles information when you use the site. Clashdle
                is run by Mark Ly from Vancouver, British Columbia, Canada.
            </p>

            <h2 className={sectionH2}>The short version</h2>
            <p>
                There are no accounts and no sign-in. We never ask for your name, email, or
                Clash Royale account. The only data about you is your own puzzle progress,
                and it stays in your browser. Google AdSense serves the ads and Cloudflare
                hosts the site; both may set cookies.
            </p>

            <h2 className={sectionH2}>Information we collect</h2>
            <p>
                Clashdle does not require an account and we do not collect personally
                identifiable information directly. Your daily progress, streaks, and
                statistics are stored in your browser&apos;s localStorage under the{' '}
                <code className="text-blue-200">clashdle:</code> prefix — this data never
                leaves your device and is not transmitted to us or anyone else.
            </p>

            <h2 className={sectionH2}>Third-party services</h2>
            <p>
                <strong className="text-white">Google AdSense.</strong> Google, as a
                third-party vendor, uses cookies to serve ads on Clashdle. Google&apos;s
                use of advertising cookies enables it and its partners to serve ads to
                you based on your visits to Clashdle and other sites on the Internet.
                You may opt out of personalised advertising by visiting{' '}
                <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    Google&apos;s Ads Settings
                </a>
                , or read the{' '}
                <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                >
                    Google ad and content network privacy policy
                </a>
                . For more on what Google collects from sites using its services, see{' '}
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

            <h2 className={sectionH2}>Your rights</h2>
            <p>
                Because your data never leaves your browser, most data-protection rights
                you can exercise yourself, immediately:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                    <strong className="text-white">Access.</strong> Open your browser&apos;s
                    developer tools and inspect localStorage under the{' '}
                    <code className="text-blue-200">clashdle:</code> prefix. That is the
                    complete record.
                </li>
                <li>
                    <strong className="text-white">Erasure.</strong> Clear site data for
                    clash.ac in your browser settings. Nothing is retained elsewhere, so
                    there is nothing for us to delete on your behalf.
                </li>
                <li>
                    <strong className="text-white">Objection to ad personalization.</strong>{' '}
                    Use Google&apos;s Ads Settings, linked above.
                </li>
            </ul>
            <p className="mt-2">
                If you are in the EEA, UK, or Switzerland and want to raise a concern, you
                may also contact your local data-protection authority.
            </p>

            <h2 className={sectionH2}>Data retention</h2>
            <p>
                Your statistics stay in your browser until you clear them — we set no
                expiry. Cloudflare retains standard server logs according to its own
                policy, and any Google advertising cookies follow Google&apos;s documented
                lifetimes. We hold no database and no backups of user data.
            </p>

            <h2 className={sectionH2}>Security</h2>
            <p>
                All traffic is served over HTTPS. There are no logins, no payment
                processing, and no user-generated content on the site, which removes most
                of the risk that would otherwise apply. Clashdle is maintained by one
                person as a side project — please report anything that looks wrong via the{' '}
                <a href="/contact" className={linkCls}>Contact page</a>.
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
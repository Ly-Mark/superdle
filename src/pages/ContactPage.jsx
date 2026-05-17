// src/pages/ContactPage.jsx
import InfoPage from '../components/layout/InfoPage.jsx';

const linkCls = 'text-blue-300 hover:text-blue-200 underline';

export default function ContactPage() {
    return (
        <InfoPage title="Contact">
            <p>
                Got feedback, a bug report, or a feature suggestion? We&apos;d love to hear
                from you.
            </p>

            <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:clashdlecontact@gmail.com" className={linkCls}>
                        clashdlecontact@gmail.com
                    </a>
                </li>
                <li>
                    <strong className="text-white">GitHub:</strong> open an issue at{' '}
                    <a
                        href="https://github.com/Ly-Mark/superdle/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkCls}
                    >
                        github.com/Ly-Mark/superdle
                    </a>
                </li>
            </ul>

            <p>
                Please allow a few days for a response. For takedown or copyright
                concerns, please include &quot;Copyright&quot; in the subject line.
            </p>
        </InfoPage>
    );
}
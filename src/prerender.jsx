// src/prerender.jsx
// Executed at BUILD TIME in Node by vite-prerender-plugin — never shipped to the browser.
import React from 'react';
import { prerender as reactPrerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import { getRouteMeta } from './routeMeta.js';

export async function prerender(data) {
    // react-dom/static's prerender resolves lazy() routes before emitting HTML.
    const { prelude } = await reactPrerender(
        <StaticRouter location={data.url}>
            <App />
        </StaticRouter>
    );
    const html = await new Response(prelude).text();

    const meta = getRouteMeta(data.url);
    return {
        html,
        head: {
            lang: 'en',
            title: meta.title,
            elements: new Set([
                { type: 'meta', props: { name: 'description', content: meta.description } },
            ]),
        },
    };
}
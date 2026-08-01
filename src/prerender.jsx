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

    // NOTE: the plugin REPLACES head.title but APPENDS head.elements. Anything
    // emitted here must not also exist in index.html, or the page ships two of
    // it. That was already happening with the description tag.
    return {
        html,
        head: {
            lang: 'en',
            title: meta.title,
            elements: new Set([
                { type: 'meta', props: { name: 'description', content: meta.description } },
                { type: 'link', props: { rel: 'canonical', href: meta.canonical } },

                { type: 'meta', props: { property: 'og:site_name',   content: meta.siteName } },
                { type: 'meta', props: { property: 'og:type',        content: 'website' } },
                { type: 'meta', props: { property: 'og:url',         content: meta.canonical } },
                { type: 'meta', props: { property: 'og:title',       content: meta.ogTitle } },
                { type: 'meta', props: { property: 'og:description', content: meta.ogDescription } },
                { type: 'meta', props: { property: 'og:image',       content: meta.ogImage } },

                { type: 'meta', props: { name: 'twitter:card',        content: 'summary_large_image' } },
                { type: 'meta', props: { name: 'twitter:title',       content: meta.ogTitle } },
                { type: 'meta', props: { name: 'twitter:description', content: meta.ogDescription } },
                { type: 'meta', props: { name: 'twitter:image',       content: meta.ogImage } },

                { type: 'meta', props: { name: 'theme-color', content: meta.themeColor } },
            ]),
        },
    };
}
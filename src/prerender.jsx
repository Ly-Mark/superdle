// src/prerender.jsx
// Executed at BUILD TIME in Node by vite-prerender-plugin — never shipped to the browser.
import React from 'react';
import { prerender as reactPrerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import { getRouteMeta } from './routeMeta.js';
import cardsData from './data/cards.json';
import { slug } from './utils/slug.js';

// routeMeta.js imports nothing so the sitemap script can load it in plain Node,
// so the card lookup happens here instead, where Vite handles the JSON import.
function cardForUrl(url) {
    const path = url.length > 1 ? url.replace(/\/+$/, '') : url;
    if (!path.startsWith('/cards/')) return null;
    const wanted = path.slice('/cards/'.length);
    return cardsData.find((c) => slug(c.card) === wanted) ?? null;
}

// React's scheduler creates a MessageChannel for task scheduling. The prerender
// script is bundled with browser resolution conditions, so react-dom/static
// resolves to the browser build and that channel is never closed. Its
// MessagePort is a live libuv handle, so `vite build` completes every page and
// then never exits — CI sat for 5h59m before being killed at the job limit.
//
// Unref-ing the port tells Node it does not count toward keeping the process
// alive. Rendering is already awaited and complete by this point, so nothing is
// still relying on it.
function releaseSchedulerHandles() {
    for (const handle of process._getActiveHandles?.() ?? []) {
        if (handle?.constructor?.name === 'MessagePort') handle.unref?.();
    }
}

export async function prerender(data) {
    // react-dom/static's prerender resolves lazy() routes before emitting HTML.
    const { prelude } = await reactPrerender(
        <StaticRouter location={data.url}>
            <App />
        </StaticRouter>
    );
    const html = await new Response(prelude).text();
    releaseSchedulerHandles();

    const meta = getRouteMeta(data.url, cardForUrl(data.url));

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
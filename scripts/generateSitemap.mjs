// scripts/generateSitemap.mjs
// Runs after `vite build`. Writes dist/sitemap.xml.
//
// URLs come from getRouteMeta().canonical rather than being assembled here, so
// the sitemap and the <link rel="canonical"> tags cannot drift apart. That
// matters: a sitemap listing /about while the page canonicalises to /about/
// gives Google two conflicting answers about the same page.
//
// Routes come from getPrerenderRoutes(), the same list that decides what gets
// prerendered, so the sitemap can never advertise a page that was not built.
import { writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrerenderRoutes } from './prerenderRoutes.mjs';
import { getRouteMeta } from '../src/routeMeta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

const routes = getPrerenderRoutes();
const urls = routes.map((route) => getRouteMeta(route).canonical);

// Fail loudly rather than shipping a sitemap that points at pages which do not
// exist. A sitemap full of 404s is worse than no sitemap.
const missing = routes.filter((route) => {
    const file = path.join(DIST, route === '/' ? 'index.html' : `${route}/index.html`);
    return !existsSync(file);
});
if (missing.length) {
    console.error('generateSitemap: no built page for', missing.join(', '));
    process.exit(1);
}

const duplicates = urls.filter((u, i) => urls.indexOf(u) !== i);
if (duplicates.length) {
    console.error('generateSitemap: duplicate URLs', duplicates.join(', '));
    process.exit(1);
}

const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`),
    '</urlset>',
    '',
].join('\n');

writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
console.log(`Sitemap: ${urls.length} URLs -> dist/sitemap.xml`);

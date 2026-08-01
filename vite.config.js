import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import path from 'node:path'
import { getPrerenderRoutes } from './scripts/prerenderRoutes.mjs'

export default defineConfig({
    plugins: [
        react(),
        vitePrerenderPlugin({
            renderTarget: '#root',
            prerenderScript: path.resolve(__dirname, 'src/prerender.jsx'),
            // '/' is prerendered by default; pass the rest explicitly
            additionalPrerenderRoutes: getPrerenderRoutes().filter((r) => r !== '/'),
        }),
    ],
    base: '/', // Cloudflare Pages serves at root
    build: {
        sourcemap: true,
    }
})

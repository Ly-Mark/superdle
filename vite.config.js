import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/', // Cloudflare Pages serves at root
    build: {
        sourcemap: true,
    }
})

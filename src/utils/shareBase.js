// src/utils/shareBase.js
// Uses the CF Pages env var in prod/preview, falls back to current origin in dev.
// The last fallback must be a real absolute URL, not ''. During the build-time
// prerender pass there is no `window`, and `new URL(path, '')` throws
// "Invalid URL" — which killed the whole route and shipped an empty #root.
const PRODUCTION_ORIGIN = 'https://clash.ac';

export const PUBLIC_BASE =
    (import.meta.env && import.meta.env.VITE_PUBLIC_BASE_URL) ||
    (typeof window !== 'undefined' ? window.location.origin : PRODUCTION_ORIGIN);

// Helper to build absolute URLs safely (handles leading/trailing slashes)
export function buildUrl(path = '/', params) {
    const url = new URL(path, PUBLIC_BASE);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v != null) url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}

// src/utils/shareBase.js
// Uses the CF Pages env var in prod/preview, falls back to current origin in dev.
export const PUBLIC_BASE =
    (import.meta.env && import.meta.env.VITE_PUBLIC_BASE_URL) ||
    (typeof window !== 'undefined' ? window.location.origin : '');

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

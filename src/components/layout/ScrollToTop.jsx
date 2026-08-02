// src/components/layout/ScrollToTop.jsx
//
// Resets scroll position on navigation (TASKS.md T28).
//
// The app had no scroll handling at all. A browser restores scroll on a real
// page load, but a client-side route change is not one — React Router swaps
// the tree and leaves the scroll offset alone. So following a "Pairs with"
// link from halfway down a long card page landed you halfway down the next
// one, which reads as a broken link rather than a scroll quirk.
//
// Deliberately not `<ScrollRestoration>`: that ships with the data routers
// (createBrowserRouter), and this app uses the component `<Routes>` API.
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        // Guarded for the build-time prerender pass, which runs in Node.
        if (typeof window === 'undefined') return;

        // Back/forward should feel like back/forward: the browser has a
        // remembered position for those and overriding it is disorienting.
        if (navigationType === 'POP') return;

        // An in-page anchor is an explicit request to go somewhere that is
        // not the top. Let the browser honour it.
        if (hash) return;

        // 'instant' rather than smooth: this fires on every navigation, and
        // animating a full-page scroll before the new route has painted looks
        // like a glitch. It also respects prefers-reduced-motion by default.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash, navigationType]);

    return null;
}

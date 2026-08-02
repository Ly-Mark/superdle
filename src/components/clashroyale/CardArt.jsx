// src/components/clashroyale/CardArt.jsx
// The card portrait treatment used in Classic, extracted so other pages can
// reuse it instead of inventing their own framing.
//
// How the framing works, and why it is done this way:
//   - the box is a fixed square with overflow hidden
//   - object-cover makes the portrait art fill that square, cropping the
//     overflow, so every tile is identically framed regardless of the source
//     dimensions (which run 285x420 to 460x567)
//   - scale(ZOOM) from the centre then zooms past the decorative border baked
//     into some of the source art, so the frame does not show on some cards
//     and not others
//
// Doing this in CSS rather than cropping the files means one number retunes
// every card at once. Cropping per file was tried and misframed a lot of them,
// because the correct crop is not the same for every card.
import { useEffect, useMemo, useRef, useState } from 'react';
import { slugifyCardName } from '../../utils/clashroyale/cardImages.js';

const DEFAULT_ZOOM = 1.4;

export default function CardArt({
    name,
    game = 'clashroyale',
    zoom = DEFAULT_ZOOM,
    focus = 'center',
    // `thumb` uses the 160px webp copies from `npm run thumbs`. Use it anywhere
    // many cards render at once — the full art is 28.9 MB across 121 files.
    variant = 'full',
    sizeClass = 'w-16 h-16',
    className = '',
}) {
    const slug = useMemo(() => slugifyCardName(name), [name]);

    const sources = useMemo(() => {
        const base = `/games/${game}/cards`;
        return variant === 'thumb'
            ? [`${base}/thumb/${slug}.webp`, `${base}/${slug}.png`]
            : [`${base}/${slug}.webp`, `${base}/${slug}.png`, `${base}/${slug}.jpg`];
    }, [game, slug, variant]);

    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    const handleError = () => {
        setIdx((prev) => {
            const next = prev + 1;
            if (next >= sources.length) {
                setFailed(true);
                return prev;
            }
            return next;
        });
    };

    // A cached image can already be complete before React attaches onLoad, in
    // which case the event never fires and the placeholder would sit there
    // forever. This is guaranteed on the prerendered pages: the HTML ships
    // with loaded=false, and by the time hydration runs the browser may well
    // have decoded the image already. Checking `complete` on mount closes it.
    useEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, [idx]);

    return (
        <div
            className={`relative ${sizeClass} shrink-0 rounded-xl overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.35)] ring-1 ring-white/20 bg-white/5 ${className}`}
        >
            {!failed ? (
                <>
                    {/* Placeholder.
                        The card guide renders 121 of these at loading="lazy",
                        so everything below the fold is an empty box until it
                        is scrolled to — which reads as broken images rather
                        than as pending ones, and is what a screenshot pass
                        catches. A visible resting state makes the wait look
                        deliberate. The box already has a fixed size, so this
                        is about perceived state, not layout shift. */}
                    {!loaded && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-white/10 motion-safe:animate-pulse"
                        />
                    )}
                    <img
                        ref={imgRef}
                        src={sources[idx]}
                        // Decorative: the card name is always rendered as real text
                        // beside this, so alt text would make a screen reader say
                        // every name twice.
                        alt=""
                        loading="lazy"
                        decoding="async"
                        // Deliberately NOT faded in from opacity-0 by React
                        // state. These pages are prerendered, so that markup
                        // would ship with every image invisible and rely on JS
                        // running to reveal them — if hydration is slow or
                        // fails, the whole guide looks empty. Instead the
                        // placeholder is painted first and therefore sits
                        // underneath; the image simply covers it as it
                        // arrives, with no JS in the path.
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center',
                            objectPosition: focus,
                        }}
                        onLoad={() => setLoaded(true)}
                        onError={handleError}
                    />
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center px-1">
                    <span className="text-[9px] font-bold text-gray-100 text-center leading-tight">
                        {name}
                    </span>
                </div>
            )}

            {/* Inner stroke */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/25 mix-blend-screen" />

            {/* Gloss highlight */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0) 55%)',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 48%, 0% 70%)',
                    mixBlendMode: 'screen',
                    opacity: 0.65,
                }}
            />

            {/* Inner shadow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                    boxShadow:
                        'inset 0 -10px 20px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.06)',
                }}
            />
        </div>
    );
}

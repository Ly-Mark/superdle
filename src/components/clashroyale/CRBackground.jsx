import React from "react";

/**
 * Shared Clash Royale mode background:
 * - dark blue gradient base (CSS, not an image)
 * - diamond overlay (image-set, viewport-locked)
 * - dot texture + vignette
 * - a fixed, deliberately uneven field of soft blobs
 */

// Blob field.
//
// Hand-placed rather than generated, for two reasons. The obvious one is that
// the layout should be identical on every load and every route — a background
// that reshuffles as you move between modes reads as a glitch. The less
// obvious one is that this component renders at BUILD time in the prerender
// pass and again in the browser on hydrate: anything random would produce
// different markup in the two passes and React would report a mismatch.
//
// The positions are irregular on purpose. An evenly-spaced set reads as a
// pattern, which is exactly what a soft glow field should not do. Sizes run
// large-to-small so the small ones fill the gaps the three big ones leave.
//
// `delay` only staggers the pulse animation; it changes nothing when the user
// has asked for reduced motion, since the animation is behind `motion-safe:`.
const BLOBS = [
    // Three large anchors, roughly the original placement.
    { top: '-8%',  left: '72%', size: 'w-80 h-80',   color: 'bg-blue-500', opacity: 0.14, dur: 12, delay: 0 },
    { top: '68%',  left: '-12%', size: 'w-80 h-80',  color: 'bg-sky-400',  opacity: 0.14, dur: 14, delay: 2 },
    { top: '34%',  left: '48%', size: 'w-80 h-80',   color: 'bg-cyan-400', opacity: 0.12, dur: 16, delay: 4 },

    // Smaller ones scattered through the gaps.
    { top: '12%',  left: '18%', size: 'w-44 h-44',   color: 'bg-sky-300',  opacity: 0.10, dur: 13, delay: 1 },
    { top: '52%',  left: '82%', size: 'w-52 h-52',   color: 'bg-blue-400', opacity: 0.11, dur: 17, delay: 3 },
    { top: '88%',  left: '38%', size: 'w-40 h-40',   color: 'bg-cyan-300', opacity: 0.09, dur: 15, delay: 5 },
    { top: '26%',  left: '4%',  size: 'w-32 h-32',   color: 'bg-blue-300', opacity: 0.09, dur: 19, delay: 2 },
    { top: '4%',   left: '44%', size: 'w-36 h-36',   color: 'bg-sky-500',  opacity: 0.10, dur: 18, delay: 6 },
    { top: '74%',  left: '62%', size: 'w-28 h-28',   color: 'bg-cyan-400', opacity: 0.08, dur: 21, delay: 4 },
];

export default function CRBackground({ children }) {
    return (
        <div className="min-h-screen relative bg-gradient-to-br from-[#08182d] via-[#0a2e65] to-[#0b4a96]">
            <style>{`
        /* The overlay is viewport-locked rather than element-locked.
           It used to be background-size: cover on this container, whose height
           is content-driven — so the diamonds rendered noticeably larger on
           tall routes (Memory, the card guide) than on short ones, and visibly
           changed scale when moving between modes.

           background-attachment: fixed sizes the image against the viewport
           instead, so it is identical on every route. The trade-off is that it
           no longer scrolls with the page and costs a little more to repaint;
           at this opacity that is a fair trade for a decorative texture. If it
           ever needs to scroll again, the alternative is
           background-size: 100vw auto with repeat-y, which keeps the scale
           constant but can show tiling seams. */
        .cr-diamond-img {
          background-image: url('/bg/clashroyale/diamonds-1280.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          background-attachment: fixed;
          opacity: 0.24;
          mix-blend-mode: overlay;
        }

        @supports (background-image: image-set(url('/bg/clashroyale/diamonds-640.png') 1x)) {
          .cr-diamond-img {
            background-image: image-set(
              url('/bg/clashroyale/diamonds-640.png') 1x,
              url('/bg/clashroyale/diamonds-1280.png') 2x,
              url('/bg/clashroyale/diamonds-1920.png') 3x
            );
          }
        }

        @media (min-width: 1536px) {
          .cr-diamond-img { opacity: 0.20; }
        }

        /* background-attachment: fixed is a known repaint cost on mobile and
           behaves inconsistently on iOS Safari. Below the tablet breakpoint,
           fall back to scrolling the texture with the page and anchoring its
           scale to the viewport width instead. */
        @media (max-width: 767px) {
          .cr-diamond-img {
            background-attachment: scroll;
            background-size: 100vw auto;
            background-position: top center;
          }
        }

        /* Dot texture (T24b).
           Panels were casting shadows onto a soft, low-contrast backdrop, so
           the depth barely read. A fine dot grid gives the page a surface with
           a fixed scale, which is what makes a shadow legible: the eye picks
           up the panel interrupting a regular pattern.

           Drawn with a radial-gradient rather than an image so it costs no
           request and stays crisp at any DPR. Tune --dot-a for strength and
           background-size for density.

           No backticks in this block: it lives inside a JS template literal,
           so one would close the string and break the build. */
        .cr-dots {
          --dot-a: 0.055;
          background-image: radial-gradient(
            circle at 1px 1px,
            rgba(255, 255, 255, var(--dot-a)) 1px,
            transparent 0
          );
          background-size: 22px 22px;
        }

        /* Darkens the edges so the centre column reads as lit. Cheap way to
           stop panels floating on an evenly-bright field. */
        .cr-vignette {
          background: radial-gradient(
            ellipse 90% 70% at 50% 40%,
            transparent 40%,
            rgba(2, 8, 20, 0.5) 100%
          );
        }
      `}</style>

            {/* Diamond overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-10 cr-diamond-img"
            />

            {/* Dot texture + vignette. Above the blobs (z-0) so they read as
                page surface, below the content (z-20). */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10 cr-dots" />
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10 cr-vignette" />

            {/* Blob field — see BLOBS above for why it is hand-placed. */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden z-0">
                {BLOBS.map((b, i) => (
                    <div
                        key={i}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply blur-xl ${b.size} ${b.color}`}
                        style={{
                            top: b.top,
                            left: b.left,
                            opacity: b.opacity,
                            animation: `cr-blob-pulse ${b.dur}s ease-in-out ${b.delay}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* The pulse is defined here rather than via motion-safe: because
                the blobs are styled inline. Wrapping the keyframes in the
                reduced-motion query is equivalent and keeps the guarantee. */}
            <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes cr-blob-pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50%      { transform: translate(-50%, -50%) scale(1.12); }
          }
        }

        /* One-shot reveal used when a guess lands (Memory's card cells).
           Transform and box-shadow only — both composite on the GPU and
           neither triggers layout, which matters because Memory can fire this
           many times in quick succession. */
        @keyframes mem-pop {
          0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          35%  { transform: scale(1.06); box-shadow: 0 0 0 6px rgba(16,185,129,0.20); }
          100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>

            {/* Page content */}
            <div className="relative z-20">{children}</div>
        </div>
    );
}

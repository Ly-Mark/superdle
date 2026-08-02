import React from "react";

/**
 * Shared Clash Royale mode background:
 * - blue gradient base
 * - diamond overlay (image-set)
 * - 3 soft animated blobs
 */
export default function CRBackground({ children }) {
    return (
        <div className="min-h-screen relative bg-gradient-to-br from-[#0b1f3a] via-[#0b3a82] to-[#0c59b6]">
            <style>{`
        .cr-diamond-img {
          background-image: url('/bg/clashroyale/diamonds-1280.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          opacity: 0.28;
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
          .cr-diamond-img { opacity: 0.24; }
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
            rgba(3, 12, 28, 0.45) 100%
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

            {/* Background blobs.
                Dropped from opacity-20 to opacity-[0.14]: at full strength they
                put a moving soft-light gradient directly behind the panels, and
                a shadow cast onto something that is itself glowing does not
                read. This is a separate knob from the dot and vignette layers
                above — revert this line alone if the page loses too much life. */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply blur-xl opacity-[0.14] motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply blur-xl opacity-[0.14] motion-safe:animate-[pulse_14s_ease-in-out_infinite_2s]" />
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply blur-xl opacity-[0.14] motion-safe:animate-[pulse_16s_ease-in-out_infinite_4s]" />
            </div>

            {/* Page content */}
            <div className="relative z-20">{children}</div>
        </div>
    );
}

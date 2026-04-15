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
      `}</style>

            {/* Diamond overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-10 cr-diamond-img"
            />

            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_14s_ease-in-out_infinite_2s]" />
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-[pulse_16s_ease-in-out_infinite_4s]" />
            </div>

            {/* Page content */}
            <div className="relative z-20">{children}</div>
        </div>
    );
}

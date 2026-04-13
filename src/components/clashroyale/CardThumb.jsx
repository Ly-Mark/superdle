// src/components/clashroyale/CardThumb.jsx
import React, { useMemo, useState } from "react";
import { getCardThumbSources, slugifyCardName } from "../../utils/clashroyale/cardImages.js";

export default function CardThumb({
                                      name,
                                      game = "clashroyale",
                                      className = "relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-white/40 bg-gray-200 shrink-0",
                                      imgClassName = "absolute inset-0 w-full h-full object-cover",
                                      fallbackClassName = "absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-600",
                                      scale = 1.35,
                                      alt,
                                  }) {
    const slug = useMemo(() => slugifyCardName(name), [name]);
    const sources = useMemo(() => getCardThumbSources(game, slug), [game, slug]);

    const [idx, setIdx] = useState(0);
    const [failed, setFailed] = useState(false);

    const handleError = () => {
        setIdx((i) => {
            const next = i + 1;
            if (next >= sources.length) {
                setFailed(true);
                return i;
            }
            return next;
        });
    };

    const fallbackText = (name?.slice?.(0, 2) || "").toUpperCase();

    return (
        <div className={className}>
            {!failed ? (
                <img
                    src={sources[idx]}
                    alt={alt ?? name}
                    className={imgClassName}
                    style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
                    loading="lazy"
                    decoding="async"
                    onError={handleError}
                />
            ) : (
                <div className={fallbackClassName}>{fallbackText}</div>
            )}
        </div>
    );
}

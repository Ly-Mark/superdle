import { NavLink } from "react-router-dom";

// Per-mode identity (TASKS.md T24d, brief task 7).
//
// This nav and `SiteHeader` both link the same four modes, which reads as an
// accidental duplicate (T14). They are deliberately not merged: the header's
// links are part of what makes every URL reachable from every other one for
// crawlers, and the footer repeats them for the same reason. Instead the two
// are given clearly different jobs — the header is thin site-wide text nav,
// this is the in-game mode switcher: larger, iconned, gold active state.
//
// Icons are official Supercell fankit assets, 96x96 transparent PNGs in
// `public/games/clashroyale/icons/`. Rush still falls back to an emoji until
// its artwork exists — `img` and `emoji` are separate fields so the two can
// coexist without a placeholder image standing in.
//
// Either way the glyph is decorative and hidden from assistive tech, since the
// text label sits right beside it.
const GAME_MODES = [
    { label: "Classic", path: "/", img: "target.png" },
    { label: "Description", path: "/clashroyale/description", img: "scroll.png" },
    { label: "Rush", path: "/clashroyale/rush", emoji: "⚡" },
    { label: "Memory", path: "/clashroyale/memory", img: "book.png" },
];

const ICON_BASE = "/games/clashroyale/icons";

export default function GameModeNav() {
    return (
        <nav aria-label="Game modes" className="flex flex-wrap justify-center gap-2 mt-4 mb-4">
            {GAME_MODES.map(({ label, path, img, emoji }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                        [
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                            "text-sm font-semibold border transition-all duration-200",
                            "motion-safe:hover:-translate-y-0.5",
                            isActive
                                ? "bg-gold/15 border-gold/50 text-gold shadow-glow-gold"
                                : "bg-white/5 border-white/15 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/25",
                        ].join(" ")
                    }
                >
                    {img ? (
                        // Not lazy: these sit at the top of every game page,
                        // so lazy-loading would only delay something already
                        // in the viewport.
                        <img
                            src={`${ICON_BASE}/${img}`}
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            decoding="async"
                            className="w-5 h-5 shrink-0 object-contain"
                        />
                    ) : (
                        <span aria-hidden="true">{emoji}</span>
                    )}
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

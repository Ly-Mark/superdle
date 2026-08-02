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
// `public/games/clashroyale/icons/`. They are decorative and hidden from
// assistive tech, since the text label sits right beside them.
//
// `emoji` is kept as a fallback field for any mode added before its artwork
// exists — Rush ran on one until its icon landed.
// `size` is optical compensation, not a fix for badly-sized files — every icon
// is a correct 96x96 with under 10% padding. What differs is how much of that
// canvas each one actually inks:
//
//   scroll 74%   book 72%   target 71%   rush 39%
//
// Rush is a helm at an angle with a plume, so most of its canvas is empty
// diagonal space. Rendered in the same box as the others it carries about half
// their visual weight and reads as a smudge at nav size. Nudging the box makes
// the four look like one set. Adjust these before touching the artwork.
const GAME_MODES = [
    { label: "Classic", path: "/", img: "target.png", size: "w-[1.3rem] h-[1.3rem]" },
    { label: "Description", path: "/clashroyale/description", img: "scroll.png" },
    { label: "Rush", path: "/clashroyale/rush", img: "rush.png", size: "w-6 h-6" },
    { label: "Memory", path: "/clashroyale/memory", img: "book.png", size: "w-[1.15rem] h-[1.15rem]" },
];

const DEFAULT_ICON_SIZE = "w-5 h-5";

const ICON_BASE = "/games/clashroyale/icons";

export default function GameModeNav() {
    return (
        <nav aria-label="Game modes" className="flex flex-wrap justify-center gap-2 mt-4 mb-4">
            {GAME_MODES.map(({ label, path, img, emoji, size }) => (
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
                            width={24}
                            height={24}
                            decoding="async"
                            className={`${size ?? DEFAULT_ICON_SIZE} shrink-0 object-contain`}
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

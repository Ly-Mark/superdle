import { NavLink } from "react-router-dom";

const GAME_MODES = [
    { label: "Classic", path: "/" },
    { label: "Description", path: "/clashroyale/description" },
    { label: "Rush", path: "/clashroyale/rush" },
    { label: "Memory", path: "/clashroyale/memory" },
];

export default function GameModeNav() {
    return (
        <nav className="flex flex-wrap justify-center gap-2 mt-3 mb-4">
            {GAME_MODES.map(({ label, path }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                        `
                        px-3 py-1.5 rounded-full text-sm font-semibold transition
                        ${isActive
                            ? "bg-white/90 text-slate-900"
                            : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                        }
                        `
                    }
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

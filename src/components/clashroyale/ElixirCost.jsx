// src/components/clashroyale/ElixirCost.jsx
//
// Elixir cost with the drop icon. Extracted once it was wanted in a third
// place — the card-guide rows, the card-detail stat pills, and the counter /
// synergy chips — rather than growing three copies of the same markup.
//
// The icon is an official Supercell fankit asset, the same file
// `DescriptionGame` already uses.
//
// It is `aria-hidden` and the number is plain adjacent text, so a screen
// reader says "3" (or "Elixir 3", from the pill's own label) rather than
// announcing an image. `unit` adds the visible word "elixir" for places like
// the guide rows, where the icon alone would be ambiguous next to the type.
const SRC = '/games/clashroyale/icons/elixir.png';

const SIZES = {
    sm: 'w-3 h-3.5',
    md: 'w-4 h-[1.125rem]',
    lg: 'w-5 h-[1.4rem]',
};

export default function ElixirCost({
    cost,
    size = 'sm',
    unit = false,
    className = '',
}) {
    if (cost == null || cost === '') return null;

    return (
        <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
            <img
                src={SRC}
                alt=""
                aria-hidden="true"
                width={16}
                height={18}
                loading="lazy"
                decoding="async"
                className={`${SIZES[size] ?? SIZES.sm} shrink-0 object-contain`}
            />
            <span className="tabular-nums">{cost}</span>
            {unit && <span>elixir</span>}
        </span>
    );
}

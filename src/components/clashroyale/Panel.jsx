// src/components/clashroyale/Panel.jsx
//
// The shared container treatment (TASKS.md T24b).
//
// The site's panels were flat white-alpha fills with a 1px border, sitting on
// a flat gradient, so nothing separated from the background. Three things fix
// that, and all three matter:
//
//   1. an outer shadow, so the panel casts onto the page
//   2. an inset top highlight, so its top edge catches light
//   3. a fill that is lighter than what sits behind it
//
// (3) is why `raised` exists. A panel nested inside another panel has to step
// up, or the nesting reads as one flat box with a line through it.
//
// Purely presentational — no browser globals, safe under the build-time
// prerender pass.
import React from 'react';

const VARIANTS = {
    // Sits on the page gradient.
    base: 'bg-panel border-panel-border shadow-panel',
    // Sits inside a `base` panel. Lighter fill + brighter border so the
    // nesting is legible.
    raised: 'bg-panel-raised border-white/30 shadow-tile',
};

export default function Panel({
    children,
    variant = 'base',
    // Gold section title, left of the header row.
    title,
    // Free-form node shown right of the title — guess count, status, etc.
    meta,
    // Panels wrapping a whole section should be <section>; the default <div>
    // suits the nested case.
    as: Tag = 'div',
    // Heading level for `title`. Overridable because document heading order is
    // the caller's problem, not this component's — a panel low on a page may
    // need h3 to avoid skipping a level.
    titleAs: TitleTag = 'h2',
    className = '',
    ...rest
}) {
    const hasHeader = Boolean(title || meta);

    // Joined rather than written as a multi-line template literal: a template
    // literal keeps its newlines and indentation, and React emits those
    // verbatim into the class attribute of every panel on the page.
    const classes = [
        'relative rounded-panel border backdrop-blur-lg',
        VARIANTS[variant] ?? VARIANTS.base,
        className,
    ].filter(Boolean).join(' ');

    return (
        <Tag className={classes} {...rest}>
            {hasHeader && (
                <div className="flex items-baseline justify-between gap-3 mb-4">
                    {title && (
                        <TitleTag className="text-gold font-bold tracking-wide text-lg sm:text-xl">
                            {title}
                        </TitleTag>
                    )}
                    {meta && (
                        <div className="text-blue-200/80 text-xs sm:text-sm shrink-0">
                            {meta}
                        </div>
                    )}
                </div>
            )}

            {children}
        </Tag>
    );
}

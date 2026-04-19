import { useId, type ReactNode } from 'react';

export function PlayerEntryScene({
    eyebrow,
    title,
    subtitle,
    topbar = null,
    auxiliary = null,
    footer = null,
    children,
    variant = 'landing',
}: {
    eyebrow?: string;
    title: string;
    subtitle?: ReactNode;
    topbar?: ReactNode;
    auxiliary?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    variant?: 'landing' | 'hub';
}) {
    const headingId = useId();

    return (
        <section
            className={`gd-player-entry-scene is-${variant}`}
            aria-labelledby={headingId}
            data-gd-player-scene={variant}
        >
            {topbar ? <div className="gd-player-entry-topbar">{topbar}</div> : null}

            <header className="gd-player-entry-header">
                {eyebrow ? <p className="gd-scene-eyebrow">{eyebrow}</p> : null}
                <h1 id={headingId}>{title}</h1>
                {subtitle ? <div className="gd-player-entry-subtitle">{subtitle}</div> : null}
            </header>

            {auxiliary ? <div className="gd-player-entry-auxiliary">{auxiliary}</div> : null}

            <div className="gd-player-entry-grid">{children}</div>

            {footer ? <footer className="gd-player-entry-footer">{footer}</footer> : null}
        </section>
    );
}

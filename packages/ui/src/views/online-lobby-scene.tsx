import { useId, type ReactNode } from 'react';

export function OnlineLobbyScene({
    eyebrow,
    title,
    subtitle,
    topbar = null,
    hostPanel,
    joinPanel,
    footer = null,
}: {
    eyebrow?: string;
    title: string;
    subtitle?: ReactNode;
    topbar?: ReactNode;
    hostPanel: ReactNode;
    joinPanel: ReactNode;
    footer?: ReactNode;
}) {
    const headingId = useId();

    return (
        <section className="gd-online-lobby-scene" aria-labelledby={headingId}>
            {topbar ? <div className="gd-player-entry-topbar">{topbar}</div> : null}

            <header className="gd-online-lobby-header">
                {eyebrow ? <p className="gd-scene-eyebrow">{eyebrow}</p> : null}
                <h1 id={headingId}>{title}</h1>
                {subtitle ? <div className="gd-player-entry-subtitle">{subtitle}</div> : null}
            </header>

            <div className="gd-online-lobby-grid">
                <section className="gd-online-lobby-panel is-host">{hostPanel}</section>
                <section className="gd-online-lobby-panel is-join">{joinPanel}</section>
            </div>

            {footer ? <footer className="gd-online-lobby-footer">{footer}</footer> : null}
        </section>
    );
}

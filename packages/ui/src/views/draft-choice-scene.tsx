import { useId, type ReactNode } from 'react';

export function DraftChoiceScene({
    eyebrow,
    title,
    subtitle,
    status = null,
    toolbar = null,
    footer = null,
    children,
}: {
    eyebrow?: string;
    title: string;
    subtitle?: ReactNode;
    status?: ReactNode;
    toolbar?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}) {
    const headingId = useId();

    return (
        <section className="gd-draft-choice-scene" aria-labelledby={headingId}>
            {toolbar ? <div className="gd-draft-choice-toolbar">{toolbar}</div> : null}

            <header className="gd-draft-choice-header">
                {eyebrow ? <p className="gd-scene-eyebrow">{eyebrow}</p> : null}
                <h1 id={headingId}>{title}</h1>
                {subtitle ? <div className="gd-player-entry-subtitle">{subtitle}</div> : null}
                {status ? <div className="gd-draft-choice-status">{status}</div> : null}
            </header>

            <div className="gd-draft-choice-grid">{children}</div>

            {footer ? <footer className="gd-draft-choice-footer">{footer}</footer> : null}
        </section>
    );
}

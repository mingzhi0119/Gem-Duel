'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function ProductEntryLinkCard({
    href,
    title,
    summary,
    meta = null,
    badge = null,
    tone = 'classic',
}: {
    href: string;
    title: string;
    summary: string;
    meta?: ReactNode;
    badge?: ReactNode;
    tone?: 'classic' | 'roguelike' | 'online' | 'local' | 'ai';
}) {
    return (
        <Link href={href} className={`gd-player-entry-link-card is-${tone}`}>
            <div className="gd-player-entry-link-card-head">
                <div className="gd-player-entry-link-card-copy">
                    <strong>{title}</strong>
                    <p className="gd-player-entry-card-summary">{summary}</p>
                </div>
                {badge}
            </div>
            {meta ? <div className="gd-player-entry-card-meta">{meta}</div> : null}
        </Link>
    );
}

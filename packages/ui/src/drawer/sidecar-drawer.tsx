import type { ReactNode } from 'react';

export const SidecarDrawer = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="gd-sidecar-drawer">
        <div className="gd-section-header">
            <h2>{title}</h2>
        </div>
        <div>{children}</div>
    </section>
);

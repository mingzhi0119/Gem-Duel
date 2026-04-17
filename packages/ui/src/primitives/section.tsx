import type { ReactNode } from 'react';

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="gd-section">
        <div className="gd-section-header">
            <h2>{title}</h2>
        </div>
        <div>{children}</div>
    </section>
);

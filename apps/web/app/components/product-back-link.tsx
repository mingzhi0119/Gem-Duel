import Link from 'next/link';
import type { ReactNode } from 'react';

export function ProductBackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="gd-product-back-link">
            <span aria-hidden="true">←</span>
            <span>{children}</span>
        </Link>
    );
}

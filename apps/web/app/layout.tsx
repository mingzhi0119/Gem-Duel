import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import '@gem-duel/ui/styles.css';
import { RuntimeShellBadge } from './components/runtime-shell-badge';
import './globals.css';

export const metadata: Metadata = {
    title: 'Gem Duel Rebuild',
    description: 'Next.js shell for the Gem Duel greenfield rebuild.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <main>
                    <header className="gd-shell-header">
                        <div>
                            <p className="gd-muted">Gem Duel Greenfield Rebuild</p>
                            <h1>Deterministic Core, Shared Web/Desktop Shells</h1>
                            <RuntimeShellBadge />
                        </div>
                        <nav className="gd-action-list">
                            <Link href="/" className="gd-link">
                                Home
                            </Link>
                            <Link href="/play/local" className="gd-link">
                                Local
                            </Link>
                            <Link href="/play/ai" className="gd-link">
                                AI
                            </Link>
                            <Link href="/play/run" className="gd-link">
                                Run
                            </Link>
                            <Link href="/rooms" className="gd-link">
                                Rooms
                            </Link>
                        </nav>
                    </header>
                    {children}
                </main>
            </body>
        </html>
    );
}

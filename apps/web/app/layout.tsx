import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import {
    DEFAULT_RESOLVED_SHELL_THEME,
    DEFAULT_SHELL_STYLE_ID,
    DEFAULT_SHELL_THEME_MODE,
} from '@gem-duel/ui';
import '@gem-duel/ui/styles.css';
import { ShellPresentationSync } from './components/shell-presentation-sync';
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
        <html
            lang="en"
            suppressHydrationWarning
            data-gd-theme-mode={DEFAULT_SHELL_THEME_MODE}
            data-gd-resolved-theme={DEFAULT_RESOLVED_SHELL_THEME}
            data-gd-style={DEFAULT_SHELL_STYLE_ID}
        >
            <body className="gd-app-shell">
                <Suspense fallback={null}>
                    <ShellPresentationSync />
                </Suspense>
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

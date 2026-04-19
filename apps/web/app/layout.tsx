import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import { Suspense, type ReactNode } from 'react';
import {
    DEFAULT_RESOLVED_SHELL_THEME,
    DEFAULT_SHELL_STYLE_ID,
    DEFAULT_SHELL_THEME_MODE,
} from '@gem-duel/ui';
import '@gem-duel/ui/styles.css';
import { ShellPresentationSync } from './components/shell-presentation-sync';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
    title: 'Gem Duel Preview',
    description: 'Player-facing Gem Duel preview shell on the rebuilt shared Web/Desktop stack.',
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
            <body className={`${inter.variable} ${robotoMono.variable} gd-app-shell`}>
                <Suspense fallback={null}>
                    <ShellPresentationSync />
                </Suspense>
                <main>{children}</main>
            </body>
        </html>
    );
}

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    SHELL_PRESENTATION_SYNC_EVENT,
    SHELL_STYLE_QUERY_PARAM,
    SHELL_STYLE_STORAGE_KEY,
    SHELL_THEME_QUERY_PARAM,
    SHELL_THEME_STORAGE_KEY,
    resolveResolvedShellTheme,
    resolveShellPresentation,
} from '@gem-duel/ui';

const PREFERS_DARK_MEDIA = '(prefers-color-scheme: dark)';

export function ShellPresentationSync() {
    const searchParams = useSearchParams();
    const search = searchParams.toString();

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia(PREFERS_DARK_MEDIA);
        const syncRootAttributes = () => {
            const params = new URLSearchParams(window.location.search);
            const storedThemeMode = window.localStorage.getItem(SHELL_THEME_STORAGE_KEY);
            const storedStyleId = window.localStorage.getItem(SHELL_STYLE_STORAGE_KEY);
            const { themeMode, styleId } = resolveShellPresentation({
                requestedThemeMode: params.get(SHELL_THEME_QUERY_PARAM),
                storedThemeMode,
                requestedStyleId: params.get(SHELL_STYLE_QUERY_PARAM),
                storedStyleId,
            });

            root.dataset.gdThemeMode = themeMode;
            root.dataset.gdResolvedTheme = resolveResolvedShellTheme(themeMode, mediaQuery.matches);
            root.dataset.gdStyle = styleId;
            window.localStorage.setItem(SHELL_THEME_STORAGE_KEY, themeMode);
            window.localStorage.setItem(SHELL_STYLE_STORAGE_KEY, styleId);
        };

        syncRootAttributes();

        mediaQuery.addEventListener('change', syncRootAttributes);
        window.addEventListener(SHELL_PRESENTATION_SYNC_EVENT, syncRootAttributes);
        return () => {
            mediaQuery.removeEventListener('change', syncRootAttributes);
            window.removeEventListener(SHELL_PRESENTATION_SYNC_EVENT, syncRootAttributes);
        };
    }, [search]);

    return null;
}

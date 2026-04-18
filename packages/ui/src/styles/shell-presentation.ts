import { DEFAULT_SHELL_STYLE_ID, isShellStyleId, type ShellStyleId } from './style-registry';

export const SHELL_THEME_MODES = ['dark', 'light', 'system'] as const;

export type ShellThemeMode = (typeof SHELL_THEME_MODES)[number];
export type ResolvedShellTheme = 'dark' | 'light';

export const DEFAULT_SHELL_THEME_MODE: ShellThemeMode = 'dark';
export const DEFAULT_RESOLVED_SHELL_THEME: ResolvedShellTheme = 'dark';

export const SHELL_THEME_QUERY_PARAM = 'theme';
export const SHELL_STYLE_QUERY_PARAM = 'style';
export const SHELL_THEME_STORAGE_KEY = 'gd-shell-theme';
export const SHELL_STYLE_STORAGE_KEY = 'gd-shell-style';
export const SHELL_PRESENTATION_SYNC_EVENT = 'gd:shell-presentation-sync';

const SHELL_THEME_MODE_SET = new Set<string>(SHELL_THEME_MODES);

export const isShellThemeMode = (value: string | null | undefined): value is ShellThemeMode =>
    value !== null && value !== undefined && SHELL_THEME_MODE_SET.has(value);

export const resolveShellThemeMode = (value: string | null | undefined): ShellThemeMode =>
    isShellThemeMode(value) ? value : DEFAULT_SHELL_THEME_MODE;

export const resolveResolvedShellTheme = (
    themeMode: ShellThemeMode,
    prefersDark: boolean
): ResolvedShellTheme => {
    if (themeMode === 'system') {
        return prefersDark ? 'dark' : 'light';
    }

    return themeMode;
};

export const resolveShellPresentation = ({
    requestedThemeMode,
    storedThemeMode,
    requestedStyleId,
    storedStyleId,
}: {
    requestedThemeMode?: string | null;
    storedThemeMode?: string | null;
    requestedStyleId?: string | null;
    storedStyleId?: string | null;
}): {
    themeMode: ShellThemeMode;
    styleId: ShellStyleId;
} => ({
    themeMode: isShellThemeMode(requestedThemeMode)
        ? requestedThemeMode
        : isShellThemeMode(storedThemeMode)
          ? storedThemeMode
          : DEFAULT_SHELL_THEME_MODE,
    styleId: isShellStyleId(requestedStyleId)
        ? requestedStyleId
        : isShellStyleId(storedStyleId)
          ? storedStyleId
          : DEFAULT_SHELL_STYLE_ID,
});

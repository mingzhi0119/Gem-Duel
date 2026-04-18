export const SHELL_STYLE_IDS = ['default-tactical'] as const;

export type ShellStyleId = (typeof SHELL_STYLE_IDS)[number];

export interface ShellStyleDefinition {
    id: ShellStyleId;
    label: string;
    cardFrameSilhouette: 'faceted';
    dashboardBackdrop: 'tactical-grid';
    chromeDensity: 'ornate';
}

export const DEFAULT_SHELL_STYLE_ID: ShellStyleId = 'default-tactical';

export const SHELL_STYLE_REGISTRY: Record<ShellStyleId, ShellStyleDefinition> = {
    'default-tactical': {
        id: 'default-tactical',
        label: 'Default Tactical',
        cardFrameSilhouette: 'faceted',
        dashboardBackdrop: 'tactical-grid',
        chromeDensity: 'ornate',
    },
};

export const isShellStyleId = (value: string | null | undefined): value is ShellStyleId =>
    value !== null && value !== undefined && value in SHELL_STYLE_REGISTRY;

export const resolveShellStyleId = (value: string | null | undefined): ShellStyleId =>
    isShellStyleId(value) ? value : DEFAULT_SHELL_STYLE_ID;

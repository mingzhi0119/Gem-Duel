import path from 'node:path';
import { _electron as electron, expect, test, type ElectronApplication } from '@playwright/test';

const PHASE8_SMOKE_SCENARIO = 'take-three-linked-gems';
const PHASE8_SMOKE_HASH = 'fnv1a-4901e416';
const DESKTOP_APP_PATH = path.join(process.cwd(), 'apps', 'desktop');
const DESKTOP_APP_ENV = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)
);

const launchDesktopShell = async (extraEnv: Record<string, string> = {}) =>
    await electron.launch({
        args: [DESKTOP_APP_PATH],
        cwd: process.cwd(),
        env: {
            ...DESKTOP_APP_ENV,
            ...extraEnv,
        },
    });

const waitForDesktopWindow = async (electronApp: ElectronApplication) => {
    const page = await electronApp.firstWindow();
    await expect
        .poll(() => page.url(), {
            message: 'desktop shell should load the bundled standalone web runtime over HTTP',
            timeout: 60_000,
        })
        .toMatch(/^http:\/\/127\.0\.0\.1:\d+(?:\/|$)/);
    return page;
};

const readShellTheme = async (page: Awaited<ReturnType<typeof waitForDesktopWindow>>) =>
    page.evaluate(() => ({
        themeMode: document.documentElement.dataset.gdThemeMode ?? null,
        resolvedTheme: document.documentElement.dataset.gdResolvedTheme ?? null,
    }));

const closeDesktopShell = async (electronApp: ElectronApplication | null) => {
    if (!electronApp) {
        return;
    }

    await electronApp.close();
};

const openArenaControls = async (page: Awaited<ReturnType<typeof waitForDesktopWindow>>) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

const closeArenaControls = async (page: Awaited<ReturnType<typeof waitForDesktopWindow>>) => {
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('boardscene-controls-panel')).toBeHidden();
};

test.describe('Phase 8 desktop shell assembly', () => {
    test('Phase 8 row 1: desktop startup loads the embedded shared web shell over loopback HTTP', async () => {
        let electronApp: ElectronApplication | null = null;

        try {
            electronApp = await launchDesktopShell();
            const page = await waitForDesktopWindow(electronApp);
            await page.waitForLoadState('networkidle');

            await expect(page.getByRole('heading', { name: 'Gem Duel' })).toBeVisible();
            await expect(page.locator('a[href="/play/classic"]')).toBeVisible();
            await expect(page.locator('a[href="/play/roguelike"]')).toBeVisible();
            await expect(page.locator('a[href="/rooms"]')).toBeVisible();
            await expect(
                page.evaluate(
                    () =>
                        typeof (
                            globalThis as typeof globalThis & {
                                desktopShell?: {
                                    getVersion?: unknown;
                                };
                            }
                        ).desktopShell?.getVersion === 'function'
                )
            ).resolves.toBe(true);
        } finally {
            await closeDesktopShell(electronApp);
        }
    });

    test('Phase 8 row 2: desktop shell can drive the classic-local board smoke path', async () => {
        let electronApp: ElectronApplication | null = null;

        try {
            electronApp = await launchDesktopShell({
                GEM_DUEL_DESKTOP_START_PATH: `/play/local?scenario=${PHASE8_SMOKE_SCENARIO}`,
            });
            const page = await waitForDesktopWindow(electronApp);
            await page.waitForURL(new RegExp(`/play/local\\?scenario=${PHASE8_SMOKE_SCENARIO}$`));
            await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
            await expect(page.getByTestId('board-scene')).toBeVisible();
            await expect(page.getByTestId('boardscene-header')).toBeVisible();
            await expect(page.getByTestId('turn-hud')).toBeVisible();
            await expect(page.getByTestId('turn-hud-action-counter')).toBeVisible();
            await expect(page.getByTestId('boardscene-stage')).toBeVisible();
            await expect(page.getByTestId('boardscene-footer')).toBeVisible();
            await expect(page.getByTestId('player-zone-p1')).toBeVisible();
            await expect(page.getByTestId('player-zone-p2')).toBeVisible();
            await expect(page.getByTestId('boardscene-rail')).toBeVisible();
            await openArenaControls(page);
            await expect(page.getByTestId('session-rail')).toBeVisible();

            await page.getByRole('radio', { name: 'Light' }).check();
            await expect
                .poll(() => readShellTheme(page))
                .toMatchObject({
                    themeMode: 'light',
                    resolvedTheme: 'light',
                });

            await closeArenaControls(page);
            await page.getByTestId('board-cell-r2c1').click();
            await page.getByTestId('board-cell-r2c2').click();
            await page.getByTestId('board-cell-r2c3').click();
            await page.getByTestId('selection-confirm').click();

            await expect(page.getByTestId('current-final-state-hash')).toHaveText(
                PHASE8_SMOKE_HASH
            );
        } finally {
            await closeDesktopShell(electronApp);
        }
    });
});

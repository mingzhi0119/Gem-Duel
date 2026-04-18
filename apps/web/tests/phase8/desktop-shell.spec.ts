import path from 'node:path';
import {
    _electron as electron,
    expect,
    test,
    type ElectronApplication,
    type Page,
} from '@playwright/test';

const PHASE8_SMOKE_SCENARIO = 'take-three-linked-gems';
const PHASE8_SMOKE_HASH = 'fnv1a-32b1c890';
const DESKTOP_APP_PATH = path.join(process.cwd(), 'apps', 'desktop');

const launchDesktopShell = async () =>
    await electron.launch({
        args: [DESKTOP_APP_PATH],
        cwd: process.cwd(),
        env: {
            ...process.env,
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

const closeDesktopShell = async (electronApp: ElectronApplication | null) => {
    if (!electronApp) {
        return;
    }

    await electronApp.close();
};

test.describe('Phase 8 desktop shell assembly', () => {
    test('Phase 8 row 1: desktop startup loads the embedded shared web shell over loopback HTTP', async () => {
        let electronApp: ElectronApplication | null = null;

        try {
            electronApp = await launchDesktopShell();
            const page = await waitForDesktopWindow(electronApp);

            await expect(page.getByTestId('runtime-shell-badge')).toContainText('Desktop Shell');
            await expect(
                page.locator('header').getByRole('link', { name: 'Local', exact: true })
            ).toBeVisible();
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
            electronApp = await launchDesktopShell();
            const page = await waitForDesktopWindow(electronApp);
            const origin = new URL(page.url()).origin;
            const scenarioUrl = `${origin}/play/local?scenario=${PHASE8_SMOKE_SCENARIO}`;

            await page.evaluate((nextUrl) => {
                globalThis.location.assign(nextUrl);
            }, scenarioUrl);
            await page.waitForURL(scenarioUrl);
            await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
            await expect(page.getByTestId('board-scene')).toBeVisible();

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

import { expect, test, type Page } from '@playwright/test';

const readShellPresentation = async (page: Page) =>
    page.evaluate(() => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        return {
            themeMode: root.dataset.gdThemeMode ?? null,
            resolvedTheme: root.dataset.gdResolvedTheme ?? null,
            style: root.dataset.gdStyle ?? null,
            background: computedStyle.getPropertyValue('--gd-background').trim(),
        };
    });

test('visual theme foundation defaults to dark tactical on playground', async ({ page }) => {
    await page.goto('/playground/classic-selection');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('playground-scene')).toBeVisible();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'dark',
            resolvedTheme: 'dark',
            style: 'default-tactical',
            background: '#07121f',
        });
});

test('visual theme foundation shares a light override across product entrypoints', async ({
    page,
}) => {
    await page.goto('/play/local?scenario=take-three-linked-gems&theme=light');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('board-scene')).toBeVisible();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'light',
            resolvedTheme: 'light',
            style: 'default-tactical',
            background: '#ebe2d0',
        });

    await page.goto('/play/ai');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('board-scene')).toBeVisible();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'light',
            resolvedTheme: 'light',
            style: 'default-tactical',
            background: '#ebe2d0',
        });
});

test('visual theme foundation follows prefers-color-scheme in system mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/playground/run-sidecar?theme=system');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('playground-scene')).toBeVisible();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'system',
            resolvedTheme: 'dark',
            background: '#07121f',
        });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'system',
            resolvedTheme: 'light',
            background: '#ebe2d0',
        });
});

test('visual theme foundation falls back to default tactical for unknown styles', async ({
    page,
}) => {
    await page.goto('/playground/terminal-victory?style=ornate-lab');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('playground-scene')).toBeVisible();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'dark',
            resolvedTheme: 'dark',
            style: 'default-tactical',
        });
});

test('session rail theme controls persist a selected light theme across product entrypoints', async ({
    page,
}) => {
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('session-rail')).toBeVisible();

    await page.getByRole('radio', { name: 'Light' }).check();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'light',
            resolvedTheme: 'light',
            style: 'default-tactical',
        });

    await page.goto('/play/ai');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('session-rail')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked();

    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'light',
            resolvedTheme: 'light',
            style: 'default-tactical',
            background: '#ebe2d0',
        });
});

import { expect, test, type Page } from '@playwright/test';

const readShellPresentation = async (page: Page) =>
    page.evaluate(() => ({
        themeMode: document.documentElement.dataset.gdThemeMode ?? null,
        resolvedTheme: document.documentElement.dataset.gdResolvedTheme ?? null,
        style: document.documentElement.dataset.gdStyle ?? null,
    }));

const openArenaControls = async (page: Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

const closeArenaControls = async (page: Page) => {
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('boardscene-controls-panel')).toBeHidden();
};

test('Phase 4 hardening: session rail omits save/load and keeps theme controls keyboard-accessible', async ({
    page,
}) => {
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await openArenaControls(page);

    const sessionRail = page.getByTestId('session-rail');
    await expect(sessionRail).toBeVisible();
    await expect(page.getByTestId('session-rail-style')).toContainText('Default Tactical');
    await expect(page.getByTestId('session-rail-style')).toContainText('Current');
    await expect(page.getByTestId('session-rail-style')).not.toContainText(/locked/i);
    await expect(sessionRail.getByRole('button', { name: /save/i })).toHaveCount(0);
    await expect(sessionRail.getByRole('button', { name: /load/i })).toHaveCount(0);
    await expect(page.getByTestId('session-rail-rules')).toHaveAttribute('href', '/rulebook');

    const darkTheme = page.getByRole('radio', { name: 'Dark' });
    const lightTheme = page.getByRole('radio', { name: 'Light' });

    await darkTheme.focus();
    await page.keyboard.press('ArrowRight');
    await expect(lightTheme).toBeChecked();
    await expect(page).toHaveURL(/theme=light/);
    await expect
        .poll(() => readShellPresentation(page))
        .toMatchObject({
            themeMode: 'light',
            resolvedTheme: 'light',
            style: 'default-tactical',
        });

    await closeArenaControls(page);
    await page.getByTestId('board-cell-r2c1').click();
    await expect(page.getByTestId('selection-confirm')).toBeVisible();

    await openArenaControls(page);
    await page.getByTestId('session-rail-restart').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await expect(page.getByTestId('selection-confirm')).toBeDisabled();
    await expect(page.getByTestId('board-cell-r2c1')).toBeEnabled();
});

test('Phase 4 hardening: play surfaces honor zh shell copy without app-wide locale routing', async ({
    page,
}) => {
    await page.goto('/play/local?lang=zh');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await expect(page.getByTestId('board-scene')).toHaveAttribute('lang', 'zh');
    await openArenaControls(page);
    await expect(page.getByTestId('session-rail-style')).toContainText('当前');
    await expect(page.getByTestId('session-rail-style')).toContainText('默认战术壳');
    await expect(page.getByRole('radio', { name: '跟随系统' })).toBeVisible();
    await expect(page.getByRole('link', { name: '规则' })).toBeVisible();
});

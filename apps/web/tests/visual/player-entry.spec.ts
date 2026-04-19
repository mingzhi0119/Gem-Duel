import { expect, test } from '@playwright/test';

const snapshotOptions = {
    animations: 'disabled' as const,
    caret: 'hide' as const,
};

test('visual player entry home screen', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scene = page.locator('.gd-player-entry-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot('home.png', snapshotOptions);
});

test('visual player entry classic hub screen', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/play/classic');
    await page.waitForLoadState('networkidle');

    const scene = page.locator('.gd-player-entry-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot('classic-hub.png', snapshotOptions);
});

test('visual player entry roguelike hub screen', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/play/roguelike');
    await page.waitForLoadState('networkidle');

    const scene = page.locator('.gd-player-entry-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot('roguelike-hub.png', snapshotOptions);
});

test('visual player entry online lobby screen', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');

    const scene = page.locator('.gd-online-lobby-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot('online-lobby.png', snapshotOptions);
});

test('visual player entry run draft screen', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto('/play/run?mode=local');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Choose a Starter Buff' })).toBeVisible();

    const scene = page.locator('.gd-draft-choice-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot('run-draft-local.png', snapshotOptions);
});

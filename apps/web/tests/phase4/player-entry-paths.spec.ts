import { expect, test } from '@playwright/test';

test('Phase 4 entry path: home route links into the classic and roguelike hubs', async ({
    page,
}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Gem Duel' })).toBeVisible();
    await expect(page.locator('a[href="/play/classic"]')).toBeVisible();
    await expect(page.locator('a[href="/play/roguelike"]')).toBeVisible();
    await expect(page.locator('a[href="/rooms"]')).toBeVisible();

    await page.locator('a[href="/play/classic"]').click();
    await expect(page).toHaveURL(/\/play\/classic$/);
});

test('Phase 4 entry path: classic hub links to the local and AI play routes', async ({ page }) => {
    await page.goto('/play/classic');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Select Opponent' })).toBeVisible();
    await expect(page.getByText('Classic Mode')).toBeVisible();
    await expect(page.locator('a[href="/play/local"]')).toBeVisible();
    await expect(page.locator('a[href="/play/ai"]')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();

    await page.locator('a[href="/play/local"]').click();
    await expect(page).toHaveURL(/\/play\/local$/);
});

test('Phase 4 entry path: roguelike hub preserves the run mode query string', async ({ page }) => {
    await page.goto('/play/roguelike');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Select Opponent' })).toBeVisible();
    await expect(page.getByText('Roguelike Mode')).toBeVisible();
    await expect(page.locator('a[href="/play/run?mode=local"]')).toBeVisible();
    await expect(page.locator('a[href="/play/run?mode=ai"]')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();

    await page.locator('a[href="/play/run?mode=local"]').click();
    await expect(page).toHaveURL(/\/play\/run\?mode=local$/);
});

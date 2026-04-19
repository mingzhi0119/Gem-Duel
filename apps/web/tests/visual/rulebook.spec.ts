import { expect, test } from '@playwright/test';

test('visual rulebook desktop route', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto('/rulebook');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('rulebook-shell')).toBeVisible();
    await expect(page.getByTestId('rulebook-shell')).toHaveScreenshot('rulebook-desktop.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

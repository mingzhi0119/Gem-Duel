import { expect, test } from '@playwright/test';

test('phase 4 local board default scene', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);

    await expect(page.getByTestId('board-scene')).toHaveScreenshot(
        'local-board-take-three-linked-gems.png',
        {
            animations: 'disabled',
            caret: 'hide',
        }
    );
});

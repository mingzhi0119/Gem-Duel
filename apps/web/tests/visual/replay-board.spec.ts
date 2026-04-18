import { expect, test } from '@playwright/test';
import { PHASE7_REPLAY_ID } from '../phase7/replay-fixture';

test('phase 7 replay board desktop scene', async ({ page }) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('board-scene')).toHaveScreenshot('replay-board-desktop.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('phase 7 replay board mobile scene', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1500 });
    await page.goto(`/replays/${PHASE7_REPLAY_ID}?lang=zh`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('board-scene')).toHaveScreenshot('replay-board-mobile.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

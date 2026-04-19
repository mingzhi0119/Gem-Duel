import { expect, test } from '@playwright/test';
import { PHASE7_REPLAY_ID } from '../phase7/replay-fixture';

const openArenaControls = async (page: import('@playwright/test').Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

test('phase 7 replay board desktop scene', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`/replays/${PHASE7_REPLAY_ID}`);
    await page.waitForLoadState('networkidle');
    await openArenaControls(page);
    await page.getByTestId('replay-drawer-trigger').click();
    await expect(page.getByTestId('replay-drawer')).toBeVisible();

    await expect(page.getByTestId('board-scene')).toHaveScreenshot('replay-board-16x9.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('phase 7 replay board 16:10 zh scene', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.goto(`/replays/${PHASE7_REPLAY_ID}?lang=zh`);
    await page.waitForLoadState('networkidle');
    await openArenaControls(page);
    await page.getByTestId('replay-drawer-trigger').click();
    await expect(page.getByTestId('replay-drawer')).toBeVisible();

    await expect(page.getByTestId('board-scene')).toHaveScreenshot('replay-board-16x10-zh.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

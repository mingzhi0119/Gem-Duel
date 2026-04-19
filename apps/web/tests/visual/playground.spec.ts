import { expect, test } from '@playwright/test';

const SCENES = [
    'classic-selection',
    'spectator-resync',
    'run-sidecar',
    'terminal-victory',
] as const;

test.describe('phase 3 playground scenes', () => {
    for (const sceneId of SCENES) {
        test(sceneId, async ({ page }) => {
            await page.setViewportSize({ width: 1600, height: 900 });
            await page.goto(`/playground/${sceneId}`);
            await page.waitForLoadState('networkidle');

            if (sceneId === 'classic-selection') {
                await page.getByTestId('replay-drawer-trigger').click();
                await expect(page.getByTestId('replay-drawer')).toBeVisible();
            }

            if (sceneId === 'run-sidecar') {
                await page.getByTestId('ai-trace-drawer-trigger').click();
                await expect(page.getByTestId('ai-trace-drawer')).toBeVisible();
            }
            await expect(page.getByTestId('playground-scene')).toHaveScreenshot(`${sceneId}.png`, {
                animations: 'disabled',
                caret: 'hide',
            });
        });
    }
});

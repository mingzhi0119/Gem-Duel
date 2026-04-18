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
            await page.goto(`/playground/${sceneId}`);
            await page.waitForLoadState('networkidle');

            await expect(page.getByTestId('playground-scene')).toHaveScreenshot(`${sceneId}.png`, {
                animations: 'disabled',
                caret: 'hide',
            });
        });
    }
});

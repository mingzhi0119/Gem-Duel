import { expect, test } from '@playwright/test';
import { PHASE7_REPLAY_ID } from '../phase7/replay-fixture';
import { expectNoSeriousA11yViolations } from './axe';

test('a11y: /replays/[replayId] board scene has no serious violations', async ({ page }) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}?lang=zh`);
    await page.waitForLoadState('networkidle');
    await page.getByTestId('replay-drawer-trigger').click();
    await expect(page.getByTestId('replay-drawer')).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/replays/[replayId]');
});

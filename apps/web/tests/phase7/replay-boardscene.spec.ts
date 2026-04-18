import { expect, test } from '@playwright/test';
import {
    PHASE7_REPLAY_FINAL_HASH,
    PHASE7_REPLAY_FINAL_STEP_INDEX,
    PHASE7_REPLAY_ID,
} from './replay-fixture';

test('Phase 7 row 1: replay route reuses the shared BoardScene with timeline hash controls', async ({
    page,
}) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('replay-client')).toBeVisible();
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByTestId('boardscene-viewer-role')).toHaveText('spectator');
    await expect(page.getByTestId('current-final-state-hash')).toHaveText(PHASE7_REPLAY_FINAL_HASH);
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText(
        `Current Step ${PHASE7_REPLAY_FINAL_STEP_INDEX}`
    );
    await expect(page.getByRole('navigation', { name: 'Replay timeline' })).toBeVisible();

    await page.getByTestId('replay-prev-step').click();

    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('Current Step 2');
    await expect(page.getByTestId('current-final-state-hash')).not.toHaveText(
        PHASE7_REPLAY_FINAL_HASH
    );
});

test('Phase 7 row 2: replay timeline supports keyboard stepping and locale-aware labels', async ({
    page,
}) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}?lang=zh`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('board-scene')).toHaveAttribute('lang', 'zh');
    await expect(page.getByRole('navigation', { name: '回放时间轴' })).toBeVisible();
    await expect(page.getByTestId('replay-locale-switch')).toContainText('语言');

    await page.getByTestId('replay-client').focus();
    await page.keyboard.press('Home');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('当前步骤 0');
    await page.keyboard.press('End');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('当前步骤 3');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('当前步骤 2');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('当前步骤 3');
});

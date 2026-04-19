import { expect, test, type Page } from '@playwright/test';
import {
    PHASE7_REPLAY_FINAL_HASH,
    PHASE7_REPLAY_FINAL_STEP_INDEX,
    PHASE7_REPLAY_ID,
} from './replay-fixture';

const readStageWidth = async (page: Page) => {
    const bounds = await page.getByTestId('boardscene-stage').boundingBox();
    expect(bounds).not.toBeNull();
    return Math.round(bounds!.width);
};

const openArenaControls = async (page: Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

test('Phase 7 row 1: replay route reuses the shared BoardScene with timeline hash controls', async ({
    page,
}) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('replay-client')).toBeVisible();
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByTestId('boardscene-header')).toBeVisible();
    await expect(page.getByTestId('turn-hud')).toBeVisible();
    await expect(page.getByTestId('turn-hud-action-counter')).toBeVisible();
    await expect(page.getByTestId('boardscene-stage')).toBeVisible();
    await expect(page.getByTestId('boardscene-footer')).toBeVisible();
    await expect(page.getByTestId('player-zone-p1')).toBeVisible();
    await expect(page.getByTestId('player-zone-p2')).toBeVisible();
    await expect(page.getByTestId('boardscene-rail')).toBeVisible();
    await expect(page.getByTestId('boardscene-viewer-role')).toHaveText('spectator');
    await expect(page.getByTestId('current-final-state-hash')).toHaveText(PHASE7_REPLAY_FINAL_HASH);

    const stageWidth = await readStageWidth(page);
    await openArenaControls(page);
    await expect(page.getByTestId('replay-drawer-trigger')).toBeVisible();
    await page.getByTestId('replay-drawer-trigger').click();
    await expect(page.getByTestId('replay-drawer')).toBeVisible();
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText(
        `Current Step ${PHASE7_REPLAY_FINAL_STEP_INDEX}`
    );
    await expect(page.getByRole('navigation', { name: 'Replay timeline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous step' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next step' })).toBeVisible();
    await expect(page.getByTestId('current-final-state-hash')).toHaveText(PHASE7_REPLAY_FINAL_HASH);
    await expect(await readStageWidth(page)).toBe(stageWidth);
});

test('Phase 7 row 2: replay timeline supports keyboard stepping and locale-aware labels', async ({
    page,
}) => {
    await page.goto(`/replays/${PHASE7_REPLAY_ID}?lang=zh`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('board-scene')).toHaveAttribute('lang', 'zh');
    await expect(page.getByTestId('turn-hud')).toBeVisible();
    await openArenaControls(page);
    await expect(page.getByTestId('session-rail')).toBeVisible();
    await expect(page.getByTestId('replay-locale-switch')).toContainText('语言');
    await expect(page.getByRole('radio', { name: '跟随系统' })).toBeVisible();
    await expect(page.getByRole('link', { name: '规则' })).toBeVisible();
    await expect(page.getByRole('button', { name: '重载视图' })).toBeVisible();
    await expect(page.getByTestId('replay-drawer-trigger')).toBeVisible();

    await page.getByTestId('replay-drawer-trigger').click();
    await expect(page.getByRole('navigation', { name: '回放时间轴' })).toBeVisible();

    await page.getByTestId('replay-client').focus();
    await page.keyboard.press('Home');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText('当前步骤 0');
    await page.keyboard.press('End');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText(
        `当前步骤 ${PHASE7_REPLAY_FINAL_STEP_INDEX}`
    );
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText(
        `当前步骤 ${PHASE7_REPLAY_FINAL_STEP_INDEX - 1}`
    );
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('replay-selected-step-index')).toHaveText(
        `当前步骤 ${PHASE7_REPLAY_FINAL_STEP_INDEX}`
    );
});

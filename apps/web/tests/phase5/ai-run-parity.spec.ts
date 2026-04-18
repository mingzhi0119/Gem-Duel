import { expect, test, type Page } from '@playwright/test';

const expectBoardSceneLayout = async (page: Page) => {
    await expect(page.getByTestId('boardscene-header')).toBeVisible();
    await expect(page.getByTestId('turn-hud')).toBeVisible();
    await expect(page.getByTestId('turn-hud-action-counter')).toBeVisible();
    await expect(page.getByTestId('boardscene-stage')).toBeVisible();
    await expect(page.getByTestId('boardscene-footer')).toBeVisible();
    await expect(page.getByTestId('player-zone-p1')).toBeVisible();
    await expect(page.getByTestId('player-zone-p2')).toBeVisible();
    await expect(page.getByTestId('boardscene-rail')).toBeVisible();
};

const readStageWidth = async (page: Page) => {
    const bounds = await page.getByTestId('boardscene-stage').boundingBox();
    expect(bounds).not.toBeNull();
    return Math.round(bounds!.width);
};

test('Phase 5 row 1: /play/ai defaults to BoardScene with AI sidecars', async ({ page }) => {
    await page.goto('/play/ai');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expectBoardSceneLayout(page);
    await expect(page.getByText('Classic AI')).toBeVisible();

    const stageWidth = await readStageWidth(page);
    await expect(page.getByTestId('ai-trace-drawer-trigger')).toBeVisible();
    await expect(page.getByTestId('ai-trace-drawer')).toHaveCount(0);

    await page.getByTestId('ai-trace-drawer-trigger').click();

    await expect(page.getByTestId('ai-trace-drawer')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'AI Trace' })).toBeVisible();
    await expect(await readStageWidth(page)).toBe(stageWidth);
});

test('Phase 5 row 2: /play/run switches to the shared board after starter draft', async ({
    page,
}) => {
    await page.goto('/play/run');
    await expect(page.getByRole('heading', { name: 'Roguelike Run' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buff Draft' })).toBeVisible();

    await page.getByRole('button', { name: 'double_agent' }).click();

    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expectBoardSceneLayout(page);
    await expect(page.getByTestId('current-final-state-hash')).toBeVisible();

    const stageWidth = await readStageWidth(page);
    await expect(page.getByTestId('run-sidecar-trigger')).toBeVisible();
    await expect(page.getByTestId('run-status-drawer-trigger')).toBeVisible();
    await expect(page.getByTestId('ai-trace-drawer-trigger')).toBeVisible();

    await page.getByTestId('run-status-drawer-trigger').click();

    await expect(page.getByTestId('run-status-drawer')).toBeVisible();
    await expect(page.getByTestId('run-status-sidecar')).toBeVisible();
    await expect(await readStageWidth(page)).toBe(stageWidth);
});

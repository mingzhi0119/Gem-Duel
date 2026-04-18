import { expect, test, type Page } from '@playwright/test';

import { getLocalPhase4Scenario, type LocalPhase4ScenarioId } from '../../app/play/local/scenarios';

const waitForInteractiveReady = async (page: Page) => {
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
};

const expectCurrentHash = async (page: Page, scenarioId: LocalPhase4ScenarioId) => {
    const scenario = getLocalPhase4Scenario(scenarioId);
    await expect(page.getByTestId('current-final-state-hash')).toHaveText(
        scenario.expectedFinalStateHash
    );
};

const readStageWidth = async (page: Page) => {
    const bounds = await page.getByTestId('boardscene-stage').boundingBox();
    expect(bounds).not.toBeNull();
    return Math.round(bounds!.width);
};

test('Phase 4 row 1: first turn takes 3 linked gems', async ({ page }) => {
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await waitForInteractiveReady(page);
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByTestId('board-cell-r2c1')).toBeEnabled();

    await page.getByTestId('board-cell-r2c1').click();
    await page.getByTestId('board-cell-r2c2').click();
    await page.getByTestId('board-cell-r2c3').click();
    await page.getByTestId('selection-confirm').click();

    await expectCurrentHash(page, 'take-three-linked-gems');
});

test('Phase 4 row 2: buy the first pyramid card', async ({ page }) => {
    await page.goto('/play/local?scenario=buy-first-pyramid-card');
    await waitForInteractiveReady(page);
    await expect(page.getByTestId('market-slot-pyramid-1-1-buy')).toBeEnabled();

    await page.getByTestId('market-slot-pyramid-1-1-buy').click();

    await expectCurrentHash(page, 'buy-first-pyramid-card');
});

test('Phase 4 row 3: use privilege on two cells', async ({ page }) => {
    await page.goto('/play/local?scenario=use-privilege-two-cells');
    await waitForInteractiveReady(page);
    await expect(page.getByTestId('board-cell-r2c2')).toBeEnabled();

    await page.getByTestId('board-cell-r2c2').click();
    await page.getByTestId('board-cell-r2c3').click();
    await page.getByTestId('selection-confirm').click();

    await expectCurrentHash(page, 'use-privilege-two-cells');
});

test('Phase 4 row 4: reserve a blind tier-3 card and take gold', async ({ page }) => {
    await page.goto('/play/local?scenario=reserve-blind-tier3');
    await waitForInteractiveReady(page);
    await expect(page.getByTestId('market-slot-deck-3-reserve')).toBeEnabled();

    await page.getByTestId('market-slot-deck-3-reserve').click();

    await expectCurrentHash(page, 'reserve-blind-tier3');
});

test('Phase 4 row 5: resolve the bonus-token prompt', async ({ page }) => {
    await page.goto('/play/local?scenario=resolve-bonus-token');
    await waitForInteractiveReady(page);
    await expect(page.getByText('Prompts')).toBeVisible();
    await expect(page.getByTestId('board-cell-r2c2')).toBeEnabled();

    await page.getByTestId('board-cell-r2c2').click();

    await expectCurrentHash(page, 'resolve-bonus-token');
});

test('Phase 4 row 6: resolve the gain-royal prompt', async ({ page }) => {
    await page.goto('/play/local?scenario=resolve-gain-royal');
    await waitForInteractiveReady(page);
    await expect(page.getByText('Royal Court')).toBeVisible();
    await expect(page.getByTestId('royal-offer-phase4-royal-queen')).toBeEnabled();

    await page.getByTestId('royal-offer-phase4-royal-queen').click();

    await expectCurrentHash(page, 'resolve-gain-royal');
});

test('Phase 4 row 7: show the terminal victory overlay', async ({ page }) => {
    await page.goto('/play/local?scenario=terminal-victory');
    await waitForInteractiveReady(page);
    const stageWidth = await readStageWidth(page);

    await expect(page.getByTestId('terminal-overlay-trigger')).toBeVisible();
    await page.getByTestId('terminal-overlay-trigger').click();
    await expect(page.getByTestId('terminal-overlay')).toBeVisible();
    await expect(page.getByTestId('terminal-final-state-hash')).toBeVisible();
    await expect(await readStageWidth(page)).toBe(stageWidth);

    await expectCurrentHash(page, 'terminal-victory');
});

test('Phase 4 row 8: preserve the debug shell fallback', async ({ page }) => {
    await page.goto('/play/local?scenario=debug-shell-fallback&shell=debug');
    await waitForInteractiveReady(page);
    await expect(page.getByTestId('phase4-shell-mode')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add red at r2c1' })).toBeVisible();

    await page.getByRole('button', { name: 'Add red at r2c1' }).click();
    await page.getByRole('button', { name: 'Add green at r2c2' }).click();
    await page.getByRole('button', { name: 'Add white at r2c3' }).click();
    await page.getByRole('button', { name: 'Confirm Token Selection' }).click();

    await expectCurrentHash(page, 'debug-shell-fallback');
});

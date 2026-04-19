import { expect, test } from '@playwright/test';

import { listLocalPhase4Scenarios } from '../../app/play/local/scenarios';

const openArenaControls = async (page: import('@playwright/test').Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

for (const scenario of listLocalPhase4Scenarios()) {
    const search = new URLSearchParams({
        scenario: scenario.id,
    });

    if (scenario.id === 'debug-shell-fallback') {
        search.set('shell', 'debug');
    }

    test(`Phase 4 bootstrap resolves ${scenario.id}`, async ({ page }) => {
        await page.goto(`/play/local?${search.toString()}`);

        await expect(page.getByTestId('phase4-scenario-id')).toHaveText(scenario.id);
        await expect(page.getByTestId('phase4-expected-hash')).toHaveText(
            scenario.expectedFinalStateHash
        );
        await expect(page.getByTestId('current-final-state-hash')).toBeVisible();

        if (scenario.id === 'debug-shell-fallback') {
            await expect(page.getByTestId('phase4-shell-mode')).toBeVisible();
            await expect(page.getByText('Available Actions')).toBeVisible();
        } else {
            await expect(page.getByTestId('board-scene')).toBeVisible();
            await expect(page.getByTestId('boardscene-header')).toBeVisible();
            await expect(page.getByTestId('turn-hud')).toBeVisible();
            await expect(page.getByTestId('turn-hud-action-counter')).toBeVisible();
            await expect(page.getByTestId('boardscene-stage')).toBeVisible();
            await expect(page.getByTestId('boardscene-footer')).toBeVisible();
            await expect(page.getByTestId('player-zone-p1')).toBeVisible();
            await expect(page.getByTestId('player-zone-p2')).toBeVisible();
            await expect(page.getByTestId('boardscene-rail')).toBeVisible();
            await openArenaControls(page);
            await expect(page.getByText(scenario.startingFixtureSource)).toBeVisible();
        }
    });
}

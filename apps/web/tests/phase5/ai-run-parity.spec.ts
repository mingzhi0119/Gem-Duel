import { expect, test } from '@playwright/test';

test('Phase 5 row 1: /play/ai defaults to BoardScene with AI sidecars', async ({ page }) => {
    await page.goto('/play/ai');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByText('Classic AI')).toBeVisible();
    await expect(page.getByText('AI Trace')).toBeVisible();
});

test('Phase 5 row 2: /play/run switches to the shared board after starter draft', async ({
    page,
}) => {
    await page.goto('/play/run');
    await expect(page.getByRole('heading', { name: 'Roguelike Run' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buff Draft' })).toBeVisible();

    await page.getByRole('button', { name: 'double_agent' }).click();

    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByTestId('current-final-state-hash')).toBeVisible();
    await expect(page.getByTestId('run-status-sidecar')).toBeVisible();
    await expect(page.getByText('AI Trace')).toBeVisible();
});

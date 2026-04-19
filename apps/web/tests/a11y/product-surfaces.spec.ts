import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './axe';

const createOnlineRoom = async (request: APIRequestContext) => {
    const response = await request.post('/api/rooms', {
        data: {
            mode: 'online',
            seed: 20260417,
            flags: {
                roguelike: false,
                onlineAuthoritative: true,
                aiEnabled: false,
            },
        },
    });

    expect(response.ok()).toBeTruthy();
    const room = (await response.json()) as { roomId: string };
    return room.roomId;
};

const waitForBoard = async (page: Page) => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('board-scene')).toBeVisible();
};

const openArenaControls = async (page: Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

test('a11y: / home entry scene has no serious violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Gem Duel' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/');
});

test('a11y: /play/classic hub scene has no serious violations', async ({ page }) => {
    await page.goto('/play/classic');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Select Opponent' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/classic');
});

test('a11y: /play/roguelike hub scene has no serious violations', async ({ page }) => {
    await page.goto('/play/roguelike');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Select Opponent' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/roguelike');
});

test('a11y: /rooms lobby scene has no serious violations', async ({ page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Online Arena' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/rooms');
});

test('a11y: /rulebook route has no serious violations', async ({ page }) => {
    await page.goto('/rulebook');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Gem Duel Rulebook' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/rulebook');
});

test('a11y: /play/local board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await waitForBoard(page);
    await expectNoSeriousA11yViolations(page, '/play/local');
});

test('a11y: /play/ai board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/ai');
    await waitForBoard(page);
    await openArenaControls(page);
    await page.getByTestId('ai-trace-drawer-trigger').click();
    await expect(page.getByTestId('ai-trace-drawer')).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/ai');
});

test('a11y: /play/run board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/run');
    await expect(page.getByRole('heading', { name: 'Choose a Starter Buff' })).toBeVisible();
    await page.getByRole('button', { name: /double_agent/i }).click();
    await waitForBoard(page);
    await openArenaControls(page);
    await page.getByTestId('run-sidecar-trigger').click();
    await expect(page.getByTestId('run-sidecar-drawer')).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/run');
});

test('a11y: /play/run?mode=local draft scene has no serious violations', async ({ page }) => {
    await page.goto('/play/run?mode=local');
    await expect(page.getByRole('heading', { name: 'Choose a Starter Buff' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/run?mode=local');
});

test('a11y: /rooms/[roomId] bound player surface has no serious violations', async ({
    browser,
    request,
}) => {
    const roomId = await createOnlineRoom(request);
    const context = await browser.newContext();
    const p1 = await context.newPage();
    const p2 = await context.newPage();

    try {
        await p1.goto(`/rooms/${roomId}`);
        await p2.goto(`/rooms/${roomId}`);

        await p1.getByRole('button', { name: 'Join as P1' }).click();
        await p2.getByRole('button', { name: 'Join as P2' }).click();

        await waitForBoard(p1);
        await waitForBoard(p2);
        await expect(p1.getByTestId('boardscene-session-status')).toHaveText('active');
        await expectNoSeriousA11yViolations(p1, '/rooms/[roomId]');
    } finally {
        await context.close();
    }
});

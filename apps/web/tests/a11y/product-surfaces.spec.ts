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

test('a11y: /play/local board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/local?scenario=take-three-linked-gems');
    await expect(page.getByTestId('phase4-interactive-ready')).toHaveCount(1);
    await waitForBoard(page);
    await expectNoSeriousA11yViolations(page, '/play/local');
});

test('a11y: /play/ai board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/ai');
    await waitForBoard(page);
    await page.getByTestId('ai-trace-drawer-trigger').click();
    await expect(page.getByTestId('ai-trace-drawer')).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/ai');
});

test('a11y: /play/run board scene has no serious violations', async ({ page }) => {
    await page.goto('/play/run');
    await expect(page.getByRole('heading', { name: 'Buff Draft' })).toBeVisible();
    await page.getByRole('button', { name: 'double_agent' }).click();
    await waitForBoard(page);
    await page.getByTestId('run-sidecar-trigger').click();
    await expect(page.getByTestId('run-sidecar-drawer')).toBeVisible();
    await expectNoSeriousA11yViolations(page, '/play/run');
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

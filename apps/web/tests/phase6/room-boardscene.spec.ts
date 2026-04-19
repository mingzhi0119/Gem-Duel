import { expect, test, type APIRequestContext, type Browser, type Page } from '@playwright/test';

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

const openRoomPage = async (browser: Browser, roomId: string) => {
    const page = await browser.newPage();
    await page.goto(`/rooms/${roomId}`);
    await expect(page.getByRole('heading', { name: `Room ${roomId}` })).toBeVisible();
    return page;
};

const bindRoomPage = async (
    page: Page,
    actionName: 'Join as P1' | 'Join as P2' | 'Watch Room',
    expectedViewerRole: 'player' | 'spectator'
) => {
    await page.getByRole('button', { name: actionName }).click();
    await expect(page.getByTestId('board-scene')).toBeVisible();
    await expect(page.getByTestId('boardscene-header')).toBeVisible();
    await expect(page.getByTestId('turn-hud')).toBeVisible();
    await expect(page.getByTestId('turn-hud-action-counter')).toBeVisible();
    await expect(page.getByTestId('boardscene-stage')).toBeVisible();
    await expect(page.getByTestId('boardscene-footer')).toBeVisible();
    await expect(page.getByTestId('player-zone-p1')).toBeVisible();
    await expect(page.getByTestId('player-zone-p2')).toBeVisible();
    await expect(page.getByTestId('boardscene-rail')).toBeVisible();
    await expect(page.getByTestId('boardscene-viewer-role')).toHaveText(expectedViewerRole);
};

const openArenaControls = async (page: Page) => {
    await page.getByTestId('boardscene-controls-trigger').click();
    await expect(page.getByTestId('boardscene-controls-panel')).toBeVisible();
};

test('Phase 6 row 1: spectator stream renders BoardScene but stays non-interactive', async ({
    browser,
    request,
}) => {
    const roomId = await createOnlineRoom(request);
    const p1 = await openRoomPage(browser, roomId);
    const p2 = await openRoomPage(browser, roomId);
    const spectator = await openRoomPage(browser, roomId);

    try {
        await bindRoomPage(p1, 'Join as P1', 'player');
        await bindRoomPage(p2, 'Join as P2', 'player');
        await bindRoomPage(spectator, 'Watch Room', 'spectator');

        await expect(spectator.getByTestId('boardscene-viewer-role')).toHaveText('spectator');
        await expect(spectator.getByTestId('current-final-state-hash-unavailable')).toHaveText(
            'Authoritative live stream'
        );
        await openArenaControls(spectator);
        await expect(spectator.getByText('Spectators receive filtered state only')).toBeVisible();
        await expect(spectator.locator('[data-testid^="board-cell-"]:enabled')).toHaveCount(0);
        await expect(spectator.locator('[data-testid="selection-confirm"]')).toBeDisabled();
        await expect(spectator.locator('[data-testid="selection-cancel"]')).toBeDisabled();

        await expect
            .poll(async () => await p2.locator('[data-testid^="board-cell-"]:enabled').count())
            .toBeGreaterThan(0);
        await p2.locator('[data-testid^="board-cell-"]:enabled').first().click();
        await expect(p2.getByTestId('selection-confirm')).toBeEnabled();
        await expect(p1.locator('[data-testid^="board-cell-"]:enabled')).toHaveCount(0);
        await expect(spectator.locator('[data-testid^="board-cell-"]:enabled')).toHaveCount(0);
    } finally {
        await Promise.all([p1.close(), p2.close(), spectator.close()]);
    }
});

test('Phase 6 row 2: out-of-turn player sees the shared board but cannot act', async ({
    browser,
    request,
}) => {
    const roomId = await createOnlineRoom(request);
    const p1 = await openRoomPage(browser, roomId);
    const p2 = await openRoomPage(browser, roomId);

    try {
        await bindRoomPage(p1, 'Join as P1', 'player');
        await bindRoomPage(p2, 'Join as P2', 'player');

        await expect(p1.getByTestId('boardscene-viewer-role')).toHaveText('player');
        await expect(p2.getByTestId('boardscene-viewer-role')).toHaveText('player');
        await expect(p1.locator('[data-testid^="board-cell-"]:enabled')).toHaveCount(0);

        await expect
            .poll(async () => await p2.locator('[data-testid^="board-cell-"]:enabled').count())
            .toBeGreaterThan(0);
        await p2.locator('[data-testid^="board-cell-"]:enabled').first().click();
        await expect(p2.getByTestId('selection-confirm')).toBeEnabled();
        await expect(p1.locator('[data-testid^="board-cell-"]:enabled')).toHaveCount(0);
    } finally {
        await Promise.all([p1.close(), p2.close()]);
    }
});

test('Hardening row: room-status cosmetic badge fanout stays in sync across bound players', async ({
    browser,
    request,
}) => {
    const roomId = await createOnlineRoom(request);
    const p1 = await openRoomPage(browser, roomId);
    const p2 = await openRoomPage(browser, roomId);

    try {
        await bindRoomPage(p1, 'Join as P1', 'player');
        await expect(p1.getByTestId('boardscene-session-status')).toHaveText('waiting-opponent');

        await bindRoomPage(p2, 'Join as P2', 'player');
        await expect(p2.getByTestId('boardscene-session-status')).toHaveText('active');
        await expect(p1.getByTestId('boardscene-session-status')).toHaveText('active');

        await openArenaControls(p2);
        await p2.getByRole('button', { name: 'Leave Stream' }).click();
        await expect(p2.getByRole('heading', { name: 'Join or Watch' })).toBeVisible();
        await expect(p2.getByTestId('board-scene')).toHaveCount(0);
        await expect(p1.getByTestId('boardscene-session-status')).toHaveText('waiting-opponent');
    } finally {
        await Promise.all([p1.close(), p2.close()]);
    }
});

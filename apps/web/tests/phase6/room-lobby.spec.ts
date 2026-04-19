import { expect, test } from '@playwright/test';

test('Phase 6 lobby: /rooms renders the online arena and can open a created room', async ({
    page,
}) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Online Arena' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Host Game' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Join Game' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Room' })).toBeVisible();
    await expect(
        page.locator('.gd-online-lobby-panel.is-join').getByRole('button', { name: 'Open Room' })
    ).toBeDisabled();
    await expect(page.getByRole('textbox', { name: 'Opponent Match ID' })).toBeVisible();

    await page.getByRole('button', { name: 'Create Room' }).click();

    const roomIdLocator = page.getByTestId('online-lobby-room-id');
    await expect(roomIdLocator).toBeVisible();
    const roomId = (await roomIdLocator.textContent())?.trim();

    expect(roomId).toBeTruthy();

    const hostOpenRoomButton = page.locator('.gd-online-lobby-panel.is-host').getByRole('button', {
        name: 'Open Room',
    });
    await expect(hostOpenRoomButton).toBeVisible();
    await hostOpenRoomButton.click();
    await expect(page).toHaveURL(new RegExp(`/rooms/${roomId}$`));
});

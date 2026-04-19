import { describe, expect, it } from 'vitest';

import { createLocalMatchSession } from '../sessions/match';
import { buildRoomUiViewModel, buildVisibleUiViewModel } from './index';

describe('application view-model composition', () => {
    it('scopes authoritative actions to the active player only', () => {
        const session = createLocalMatchSession({
            seed: 20260417,
            flags: {
                roguelike: false,
                onlineAuthoritative: false,
                aiEnabled: false,
            },
        });

        if (!session.ok) {
            throw new Error('Expected local session creation to succeed.');
        }

        const activePlayer = session.value.snapshot().context.currentPlayer;
        const waitingPlayer = activePlayer === 'p1' ? 'p2' : 'p1';
        const activeView = session.value.viewModel(activePlayer);
        const waitingView = session.value.viewModel(waitingPlayer);
        const spectatorView = session.value.viewModel('spectator');

        expect(activeView.availableActions.length).toBeGreaterThan(0);
        expect(waitingView.availableActions).toEqual([]);
        expect(spectatorView.availableActions).toEqual([]);
        expect(activeView.viewerRole).toBe('player');
        expect(activeView.seat).toBe(activePlayer);
        expect(spectatorView.viewerRole).toBe('spectator');
        expect(spectatorView.seat).toBeNull();
        expect(activeView.boardCells).toHaveLength(activeView.snapshot.board.length);
        expect(activeView.playerZones).toHaveLength(2);
    });

    it('builds visible and room-scoped view-models from filtered payloads', () => {
        const session = createLocalMatchSession({
            seed: 20260417,
            flags: {
                roguelike: false,
                onlineAuthoritative: false,
                aiEnabled: false,
            },
        });

        if (!session.ok) {
            throw new Error('Expected local session creation to succeed.');
        }

        const playerView = session.value.viewModel(session.value.snapshot().context.currentPlayer);
        const mirrored = buildVisibleUiViewModel(
            playerView.snapshot,
            playerView.availableActions.slice(0, 1)
        );
        const roomView = buildRoomUiViewModel({
            snapshot: playerView.snapshot,
            availableActions: playerView.availableActions.slice(0, 1),
            status: 'waiting',
        });

        expect(mirrored.snapshot).toEqual(playerView.snapshot);
        expect(mirrored.availableActions).toHaveLength(1);
        expect(mirrored.sessionStatus).toBe('active');
        expect(mirrored.marketSlots.some((slot) => slot.zone === 'pyramid')).toBe(true);
        expect(roomView?.snapshot).toEqual(playerView.snapshot);
        expect(roomView?.availableActions).toHaveLength(1);
        expect(roomView?.sessionStatus).toBe('waiting-opponent');
    });

    it('projects pending board selections without requiring UI-local draft state', () => {
        const session = createLocalMatchSession({
            seed: 20260417,
            flags: {
                roguelike: false,
                onlineAuthoritative: false,
                aiEnabled: false,
            },
        });

        if (!session.ok) {
            throw new Error('Expected local session creation to succeed.');
        }

        const initialView = session.value.viewModel(session.value.snapshot().context.currentPlayer);
        const addAction = initialView.availableActions.find(
            (action) => action.command.type === 'TAKE_TOKENS_ADD_POSITION'
        );

        expect(addAction).toBeDefined();
        if (!addAction) {
            return;
        }

        expect(session.value.dispatch(addAction.command).ok).toBe(true);
        const selectionView = session.value.viewModel(
            session.value.snapshot().context.currentPlayer
        );

        expect(selectionView.selectionDraft).toMatchObject({
            model: 'pending-command',
            commandType: 'TAKE_TOKENS',
        });
        expect(selectionView.selectionDraft?.selectedBoardPositions).toHaveLength(1);
        expect(selectionView.boardCells.some((cell) => cell.selected)).toBe(true);
        expect(
            selectionView.availableActions.some(
                (action) => action.command.type === 'TAKE_TOKENS_CONFIRM'
            )
        ).toBe(true);
    });
});

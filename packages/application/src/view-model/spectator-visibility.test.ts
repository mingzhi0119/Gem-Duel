import { expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';

import { createLocalMatchSession } from '../sessions/match';

const assertSpectatorViewSafe = (serialized: string) => {
    expect(serialized).not.toContain('hiddenState');
    expect(serialized).not.toContain('deckOrder');
    expect(serialized).not.toContain('viewerReserveSlots');
};

test.prop(
    [
        fc.integer({ min: 1, max: 10_000 }),
        fc.array(fc.integer({ min: 0, max: 99 }), { maxLength: 16 }),
    ],
    { numRuns: 25 }
)(
    'spectator view-model never exposes hidden-state or pending-selection drafts across legal local prefixes',
    (seed, choices) => {
        const session = createLocalMatchSession({
            seed,
            flags: {
                roguelike: false,
                onlineAuthoritative: false,
                aiEnabled: false,
            },
        });

        if (!session.ok) {
            throw new Error('Expected local session creation to succeed.');
        }

        const assertCurrentSpectatorView = () => {
            const spectatorView = session.value.viewModel('spectator');

            expect(spectatorView.viewerRole).toBe('spectator');
            expect(spectatorView.seat).toBeNull();
            expect(spectatorView.snapshot.visibility).toBe('spectator');
            expect(spectatorView.snapshot.pendingSelection).toBeNull();
            expect(spectatorView.selectionDraft).toBeNull();
            expect(spectatorView.availableActions).toEqual([]);
            expect(spectatorView.boardCells.some((cell) => cell.selected)).toBe(false);
            for (const zone of spectatorView.playerZones) {
                for (const slot of zone.reserveSlots) {
                    expect(slot).toEqual({
                        occupied: slot.occupied,
                        slotId: slot.slotId,
                    });
                }
            }

            assertSpectatorViewSafe(JSON.stringify(spectatorView));
        };

        assertCurrentSpectatorView();

        for (const choice of choices) {
            const currentPlayer = session.value.snapshot().context.currentPlayer;
            const legalActions = session.value.viewModel(currentPlayer).availableActions;

            if (legalActions.length === 0) {
                break;
            }

            const action = legalActions[choice % legalActions.length];
            if (!action) {
                break;
            }
            const result = session.value.dispatch(action.command);
            if (!result.ok) {
                throw new Error(result.error.message);
            }

            assertCurrentSpectatorView();

            if (result.value.context.phase === 'terminal') {
                break;
            }
        }
    }
);

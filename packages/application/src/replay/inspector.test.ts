import { describe, expect, it } from 'vitest';

import { createLocalMatchSession } from '../sessions/match';
import { buildReplayInspectorModel } from './inspector';

describe('application replay inspection', () => {
    it('builds replay inspector timelines from the authoritative replay bundle', () => {
        const session = createLocalMatchSession({
            seed: 81,
            flags: {
                roguelike: false,
                onlineAuthoritative: false,
                aiEnabled: false,
            },
        });
        if (!session.ok) {
            throw new Error(session.error.message);
        }

        const action = session.value.viewModel(session.value.snapshot().context.currentPlayer)
            .availableActions[0];
        expect(action).toBeDefined();
        if (!action) {
            return;
        }

        const dispatched = session.value.dispatch(action.command);
        expect(dispatched.ok).toBe(true);
        if (!dispatched.ok) {
            return;
        }

        const inspector = buildReplayInspectorModel(session.value.replay());
        expect(inspector.ok).toBe(true);
        if (!inspector.ok) {
            return;
        }

        expect(inspector.value.steps).toHaveLength(session.value.replay().commands.length + 1);
        expect(inspector.value.matchesHash).toBe(true);
        expect(inspector.value.steps.at(-1)?.snapshot.context.step).toBe(
            session.value.snapshot().context.step
        );
    });
});

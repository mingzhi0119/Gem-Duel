import { describe, expect, it } from 'vitest';

import { createAiMatchSession } from '../sessions/match';

const BASE_FLAGS = {
    roguelike: false,
    onlineAuthoritative: false,
    aiEnabled: true,
} as const;

const playToTerminal = (seed: number) => {
    const session = createAiMatchSession({
        seed,
        flags: BASE_FLAGS,
    });
    if (!session.ok) {
        throw new Error(session.error.message);
    }

    for (let step = 0; step < 200; step += 1) {
        const snapshot = session.value.snapshot();
        if (snapshot.context.phase === 'terminal') {
            break;
        }

        const action = session.value.viewModel(snapshot.context.currentPlayer).availableActions[0];
        if (!action) {
            break;
        }

        const result = session.value.dispatch(action.command);
        if (!result.ok) {
            throw new Error(result.error.message);
        }
    }

    return session.value;
};

describe('application AI orchestration', () => {
    it('keeps AI candidate rankings and final hashes deterministic for the same seed', () => {
        const runA = playToTerminal(82);
        const runB = playToTerminal(82);

        expect(runA.snapshot().context.phase).toBe('terminal');
        expect(runB.snapshot().context.phase).toBe('terminal');
        expect(runA.aiTrace()).toEqual(runB.aiTrace());
        expect(runA.replay().finalStateHash).toBe(runB.replay().finalStateHash);
    });
});

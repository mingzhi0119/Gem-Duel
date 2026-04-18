import { describe, expect, it } from 'vitest';

import { createAiMatchSession } from '../sessions/match';

const PHASE5_AI_ROUTE_SEED = 20260416;
const PHASE5_AI_EXPECTED_FINAL_STATE_HASH = 'fnv1a-4b6da5bc';
const PHASE5_AI_EXPECTED_TRACE_LENGTH = 101;

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
    it('locks the Phase 5 /play/ai seed to a deterministic finalStateHash baseline', () => {
        const runA = playToTerminal(PHASE5_AI_ROUTE_SEED);
        const runB = playToTerminal(PHASE5_AI_ROUTE_SEED);

        expect(runA.snapshot().context.phase).toBe('terminal');
        expect(runB.snapshot().context.phase).toBe('terminal');
        expect(runA.aiTrace()).toEqual(runB.aiTrace());
        expect(runA.aiTrace()).toHaveLength(PHASE5_AI_EXPECTED_TRACE_LENGTH);
        expect(runA.aiTrace()[0]).toMatchObject({
            chosenCommandType: 'BEGIN_GEM_SELECTION',
        });
        expect(runA.replay().finalStateHash).toBe(PHASE5_AI_EXPECTED_FINAL_STATE_HASH);
        expect(runA.aiTrace()).toEqual(runB.aiTrace());
        expect(runA.replay().finalStateHash).toBe(runB.replay().finalStateHash);
    });
});

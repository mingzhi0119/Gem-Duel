import { describe, expect, it } from 'vitest';

import { createRunSession } from './run';

const PHASE5_RUN_ROUTE_SEED = 20260417;
const PHASE5_RUN_EXPECTED_STARTER_BUFF = 'down_payment';
const PHASE5_RUN_EXPECTED_FINAL_STATE_HASH = 'fnv1a-eac08cb5';
const PHASE5_RUN_EXPECTED_AI_TRACE_LENGTH = 76;

const playFirstRunMatchToTerminal = (seed: number) => {
    const run = createRunSession({
        seed,
        mode: 'ai',
    });
    if (!run.ok) {
        throw new Error(run.error.message);
    }

    const starterBuff = run.value.state().currentOffer?.options[0];
    if (!starterBuff) {
        throw new Error('missing starter Buff');
    }

    const selected = run.value.selectReward(starterBuff);
    if (!selected.ok) {
        throw new Error(selected.error.message);
    }

    for (let step = 0; step < 400; step += 1) {
        const snapshot = run.value.snapshot();
        if (!snapshot || snapshot.context.phase === 'terminal') {
            break;
        }

        const action = run.value.viewModel(snapshot.context.currentPlayer)?.availableActions[0];
        if (!action) {
            break;
        }

        const result = run.value.dispatch(action.command);
        if (!result.ok) {
            throw new Error(result.error.message);
        }
    }

    return {
        run: run.value,
        starterBuff,
    };
};

describe('application run orchestration', () => {
    it('creates deterministic roguelike draft offers and injects runContext into the spawned match', () => {
        const runA = createRunSession({
            seed: 83,
            mode: 'ai',
        });
        const runB = createRunSession({
            seed: 83,
            mode: 'ai',
        });

        expect(runA.ok).toBe(true);
        expect(runB.ok).toBe(true);
        if (!runA.ok || !runB.ok) {
            return;
        }

        expect(runA.value.state().currentOffer).toEqual(runB.value.state().currentOffer);
        const firstBuff = runA.value.state().currentOffer?.options[0];
        expect(firstBuff).toBeDefined();
        if (!firstBuff) {
            return;
        }

        const selected = runA.value.selectReward(firstBuff);
        expect(selected.ok).toBe(true);
        if (!selected.ok) {
            return;
        }

        const snapshot = runA.value.snapshot();
        expect(snapshot?.runContext).toMatchObject({
            matchIndex: 1,
            wins: 0,
            losses: 0,
        });
        expect(snapshot?.runContext?.activeBuffs.map((buff) => buff.id)).toContain(firstBuff);
    });

    it('locks the Phase 5 /play/run seed, starter buff, and first-match finalStateHash baseline', () => {
        const outcome = playFirstRunMatchToTerminal(PHASE5_RUN_ROUTE_SEED);

        expect(outcome.starterBuff).toBe(PHASE5_RUN_EXPECTED_STARTER_BUFF);
        expect(outcome.run.snapshot()?.context.phase).toBe('terminal');
        expect(outcome.run.replay()?.finalStateHash).toBe(PHASE5_RUN_EXPECTED_FINAL_STATE_HASH);
        expect(outcome.run.aiTrace()).toHaveLength(PHASE5_RUN_EXPECTED_AI_TRACE_LENGTH);
        expect(outcome.run.state()).toMatchObject({
            wins: 1,
            losses: 0,
        });
    });
});

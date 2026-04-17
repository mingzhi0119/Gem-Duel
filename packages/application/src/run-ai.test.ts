import { describe, expect, it } from 'vitest';
import {
    buildReplayInspectorModel,
    createAiMatchSession,
    createLocalMatchSession,
    createRunSession,
} from './index';

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

describe('Step 07 application orchestration', () => {
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

    it('keeps AI candidate rankings and final hashes deterministic for the same seed', () => {
        const runA = playToTerminal(82);
        const runB = playToTerminal(82);

        expect(runA.snapshot().context.phase).toBe('terminal');
        expect(runB.snapshot().context.phase).toBe('terminal');
        expect(runA.aiTrace()).toEqual(runB.aiTrace());
        expect(runA.replay().finalStateHash).toBe(runB.replay().finalStateHash);
    });

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
});

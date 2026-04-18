import { describe, expect, it } from 'vitest';

import { createRunSession } from './run';

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
});

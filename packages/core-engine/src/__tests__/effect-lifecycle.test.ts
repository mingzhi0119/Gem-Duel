import { describe, expect, it } from 'vitest';
import {
    bootstrapMatch,
    completeEffect,
    createMatchActor,
    spawnEffect,
    startEffect,
    readSnapshot,
} from '../index';

const createTestRng = () => ({
    next: () => 0.5,
    nextInt: (maxExclusive: number) => Math.min(maxExclusive - 1, 1),
    fork: () => createTestRng(),
});

const makePorts = () => {
    let counter = 0;
    return {
        rng: createTestRng(),
        clock: {
            now: () => '2026-01-01T00:00:00.000Z',
        },
        id: {
            next: (prefix = 'id') => `${prefix}-${++counter}`,
        },
    };
};

describe('effect lifecycle skeleton', () => {
    it('tracks spawned, started, and completed effects with deterministic metadata', () => {
        const actor = createMatchActor(
            {
                seed: 7,
                mode: 'local',
                flags: { roguelike: false, onlineAuthoritative: false, aiEnabled: false },
            },
            makePorts()
        );

        const bootstrapped = bootstrapMatch(actor, 'local', {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        });
        expect(bootstrapped.ok).toBe(true);
        if (!bootstrapped.ok) {
            return;
        }

        const spawned = spawnEffect(readSnapshot(actor), {
            effectId: 'effect-1',
            parentEffectId: null,
            atom: 'take_extra_turn',
            hookPoint: 'AFTER_EXTRA_TURN',
            source: 'card_ability',
            scope: 'active_player',
            owner: 'p1',
            sequence: 3,
            rngNamespace: 'match/turn-1/effect-1',
        });

        expect(spawned.snapshot.activeEffects).toHaveLength(1);
        expect(spawned.snapshot.activeEffects[0]).toMatchObject({
            effectId: 'effect-1',
            stage: 'scheduled',
            rngNamespace: 'match/turn-1/effect-1',
        });
        expect(spawned.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.spawned',
            parentEffectId: null,
            stage: 'scheduled',
        });

        const started = startEffect(spawned.snapshot, spawned.actor);
        expect(started.snapshot.activeEffects[0]).toMatchObject({
            effectId: 'effect-1',
            stage: 'running',
        });
        expect(started.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.started',
            stage: 'running',
            sequence: 3,
        });

        const completed = completeEffect(started.snapshot, spawned.actor, 'resolved');
        expect(completed.snapshot.activeEffects).toEqual([]);
        expect(completed.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.completed',
            stage: 'completed',
            outcome: 'resolved',
            sequence: 3,
        });
    });
});

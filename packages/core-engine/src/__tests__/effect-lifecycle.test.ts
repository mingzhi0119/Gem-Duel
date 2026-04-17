import { describe, expect, it } from 'vitest';
import {
    createEffectLifecycleActor,
    completeEffect,
    readEffectLifecycle,
    spawnEffect,
    startEffect,
    readSnapshot,
} from '../index';
import { createBootstrappedLocalActor } from './test-ports';

describe('effect lifecycle skeleton', () => {
    it('tracks spawned, started, and completed effects with deterministic metadata', () => {
        const { actor } = createBootstrappedLocalActor(7);

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

        const rehydratedRunningActor = createEffectLifecycleActor(started.effect);
        expect(readEffectLifecycle(rehydratedRunningActor).effect.stage).toBe('running');

        const completed = completeEffect(started.snapshot, rehydratedRunningActor, 'resolved');
        expect(completed.snapshot.activeEffects).toEqual([]);
        expect(completed.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.completed',
            stage: 'completed',
            outcome: 'resolved',
            sequence: 3,
        });
    });
});

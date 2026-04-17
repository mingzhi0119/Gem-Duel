import { ENGINE_VERSION } from '@gem-duel/contracts';
import { describe, expect, it } from 'vitest';
import { createSnapshotHash, dispatchCommand, readSnapshot } from '../index';
import { createBootstrappedLocalActor } from './test-ports';

describe('core engine Step 03 hardening', () => {
    it('produces the same snapshot and finalStateHash for the same command stream', () => {
        const actorA = createBootstrappedLocalActor(7).actor;
        const actorB = createBootstrappedLocalActor(7).actor;

        for (const actor of [actorA, actorB]) {
            expect(dispatchCommand(actor, { type: 'BEGIN_GEM_SELECTION' }).ok).toBe(true);
            expect(dispatchCommand(actor, { type: 'TAKE_GEM', color: 'blue' }).ok).toBe(true);
            expect(dispatchCommand(actor, { type: 'BEGIN_ROYAL_RESOLUTION' }).ok).toBe(true);
            expect(dispatchCommand(actor, { type: 'SELECT_ROYAL', crownsGain: 2 }).ok).toBe(true);
        }

        const snapshotA = readSnapshot(actorA);
        const snapshotB = readSnapshot(actorB);

        expect(snapshotA).toEqual(snapshotB);
        expect(createSnapshotHash(snapshotA)).toBe(createSnapshotHash(snapshotB));
        expect(snapshotA.engineVersion).toBe(ENGINE_VERSION);
    });

    it('represents royal handoff through activeEffects without changing the public phase', () => {
        const { actor, forkNamespaces } = createBootstrappedLocalActor(9);

        const handoff = dispatchCommand(actor, { type: 'BEGIN_ROYAL_RESOLUTION' });
        expect(handoff.ok).toBe(true);
        if (!handoff.ok) {
            return;
        }

        expect(handoff.value.snapshot.context.phase).toBe('turnIdle');
        expect(handoff.value.snapshot.activeEffects).toHaveLength(1);
        expect(handoff.value.snapshot.activeEffects[0]).toMatchObject({
            atom: 'gain_royal',
            stage: 'running',
            owner: 'p1',
        });
        expect(handoff.value.snapshot.eventLog.at(-2)).toMatchObject({
            type: 'effect.spawned',
            atom: 'gain_royal',
            stage: 'scheduled',
        });
        expect(handoff.value.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.started',
            atom: 'gain_royal',
            stage: 'running',
        });
        expect(forkNamespaces).toHaveLength(1);
        expect(forkNamespaces[0]).toContain('royal');
    });

    it('guards SELECT_ROYAL until a royal effect is active and blocks other idle commands while it is pending', () => {
        const { actor } = createBootstrappedLocalActor(11);

        const prematureSelect = dispatchCommand(actor, { type: 'SELECT_ROYAL', crownsGain: 1 });
        expect(prematureSelect.ok).toBe(false);
        if (!prematureSelect.ok) {
            expect(prematureSelect.error.code).toBe('ENGINE_PHASE_GUARD');
        }

        expect(dispatchCommand(actor, { type: 'BEGIN_ROYAL_RESOLUTION' }).ok).toBe(true);

        const blockedBuy = dispatchCommand(actor, { type: 'BEGIN_BUY' });
        expect(blockedBuy.ok).toBe(false);
        if (!blockedBuy.ok) {
            expect(blockedBuy.error.code).toBe('ENGINE_PHASE_GUARD');
        }

        const selectedRoyal = dispatchCommand(actor, { type: 'SELECT_ROYAL', crownsGain: 3 });
        expect(selectedRoyal.ok).toBe(true);
        if (!selectedRoyal.ok) {
            return;
        }

        expect(selectedRoyal.value.snapshot.activeEffects).toEqual([]);
        expect(selectedRoyal.value.snapshot.eventLog.at(-2)).toMatchObject({
            type: 'royal.selected',
            crownsGain: 3,
        });
        expect(selectedRoyal.value.snapshot.eventLog.at(-1)).toMatchObject({
            type: 'effect.completed',
            atom: 'gain_royal',
            outcome: 'resolved',
        });
    });
});

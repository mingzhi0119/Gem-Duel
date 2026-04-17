import { describe, expect, it } from 'vitest';
import { bootstrapMatch, createMatchActor, dispatchCommand, readSnapshot } from '../index';

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

describe('core engine determinism', () => {
    it('produces the same snapshot for the same command stream', () => {
        const portsA = makePorts();
        const portsB = makePorts();
        const actorA = createMatchActor(
            {
                seed: 7,
                mode: 'local',
                flags: { roguelike: false, onlineAuthoritative: false, aiEnabled: false },
            },
            portsA
        );
        const actorB = createMatchActor(
            {
                seed: 7,
                mode: 'local',
                flags: { roguelike: false, onlineAuthoritative: false, aiEnabled: false },
            },
            portsB
        );

        bootstrapMatch(actorA, 'local', {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        });
        bootstrapMatch(actorB, 'local', {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        });

        dispatchCommand(actorA, { type: 'BEGIN_GEM_SELECTION' });
        dispatchCommand(actorA, { type: 'TAKE_GEM', color: 'blue' });
        dispatchCommand(actorB, { type: 'BEGIN_GEM_SELECTION' });
        dispatchCommand(actorB, { type: 'TAKE_GEM', color: 'blue' });

        const snapshotA = readSnapshot(actorA);
        const snapshotB = readSnapshot(actorB);

        expect(snapshotA).toEqual(snapshotB);
        expect(snapshotA.sequence).toBeGreaterThan(0);
        expect(snapshotA.engineVersion).toBe('2026.04-step2-prep');
    });
});

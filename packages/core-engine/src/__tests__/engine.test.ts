import { ENGINE_VERSION, type GameSnapshot } from '@gem-duel/contracts';
import { describe, expect, it } from 'vitest';
import {
    createMatchActorFromSnapshot,
    createSnapshotHash,
    dispatchCommand,
    readSnapshot,
} from '../index';
import { createBootstrappedLocalActor, makeTestPorts } from './test-ports';

const ZERO_INVENTORY = {
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
} as const;

const findFirstTakeablePosition = (snapshot: GameSnapshot) => {
    const cell = snapshot.board.find((entry) => entry.token !== null && entry.token !== 'gold');
    if (!cell) {
        throw new Error('Expected at least one non-gold board token.');
    }
    return cell.positionId;
};

const createRoyalMilestoneActor = (seed = 9) => {
    const { actor } = createBootstrappedLocalActor(seed);
    const snapshot = readSnapshot(actor);

    snapshot.context.currentPlayer = 'p1';
    snapshot.context.phase = 'turnIdle';
    snapshot.context.turn = {
        turnNumber: 1,
        segment: 'optional',
        optionalStep: 'privilege',
        mandatoryActionTaken: false,
        pendingDiscardCount: 0,
    };
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    snapshot.players.p1.tableau = [];
    snapshot.players.p1.royals = [];
    snapshot.players.p1.score = 0;
    snapshot.players.p1.crowns = 0;
    snapshot.royalSupply = [
        {
            royalId: 'royal-3pts',
            points: 3,
            crowns: 0,
            ability: 'none',
            label: 'The Queen',
        },
        {
            royalId: 'royal-scroll',
            points: 2,
            crowns: 0,
            ability: 'scroll',
            label: 'The Judge',
        },
    ];

    const levelOneRow = snapshot.pyramid.find((row) => row.level === 1);
    if (!levelOneRow) {
        throw new Error('Expected a level-1 pyramid row.');
    }

    levelOneRow.slots[0]!.card = {
        cardId: 'test-crown-card',
        level: 1,
        points: 0,
        crowns: 3,
        printedBonusColor: 'blue',
        bonusColor: 'blue',
        bonusCount: 1,
        cost: { ...ZERO_INVENTORY },
        ability: 'none',
    };

    const { ports, forkNamespaces } = makeTestPorts(seed);
    return {
        actor: createMatchActorFromSnapshot(snapshot, ports),
        forkNamespaces,
    };
};

describe('core engine Step 04 classic rules', () => {
    it('produces the same snapshot and finalStateHash for the same command stream', () => {
        const actorA = createBootstrappedLocalActor(7).actor;
        const actorB = createBootstrappedLocalActor(7).actor;

        for (const actor of [actorA, actorB]) {
            const positionId = findFirstTakeablePosition(readSnapshot(actor));
            expect(dispatchCommand(actor, { type: 'BEGIN_GEM_SELECTION' }).ok).toBe(true);
            expect(
                dispatchCommand(actor, { type: 'TAKE_TOKENS', positions: [positionId] }).ok
            ).toBe(true);
        }

        const snapshotA = readSnapshot(actorA);
        const snapshotB = readSnapshot(actorB);

        expect(snapshotA).toEqual(snapshotB);
        expect(createSnapshotHash(snapshotA)).toBe(createSnapshotHash(snapshotB));
        expect(snapshotA.engineVersion).toBe(ENGINE_VERSION);
    });

    it('represents royal handoff through activeEffects without changing the public phase', () => {
        const { actor, forkNamespaces } = createRoyalMilestoneActor(9);

        expect(dispatchCommand(actor, { type: 'BEGIN_BUY' }).ok).toBe(true);
        const buy = dispatchCommand(actor, {
            type: 'BUY_CARD',
            source: { kind: 'pyramid', level: 1, slot: 1 },
        });
        expect(buy.ok).toBe(true);
        if (!buy.ok) {
            return;
        }

        const prompt = buy.value.snapshot.effectPrompts[0];
        expect(buy.value.snapshot.context.phase).toBe('turnIdle');
        expect(buy.value.snapshot.activeEffects).toHaveLength(1);
        expect(buy.value.snapshot.activeEffects[0]).toMatchObject({
            atom: 'gain_royal',
            stage: 'running',
            owner: 'p1',
        });
        expect(prompt).toMatchObject({
            atom: 'gain_royal',
            milestone: 3,
            royalIds: ['royal-3pts', 'royal-scroll'],
        });
        expect(buy.value.snapshot.eventLog.slice(-3)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'effect.spawned',
                    atom: 'gain_royal',
                    stage: 'scheduled',
                }),
                expect.objectContaining({
                    type: 'effect.started',
                    atom: 'gain_royal',
                    stage: 'running',
                }),
                expect.objectContaining({
                    type: 'royal.milestoneReached',
                    player: 'p1',
                    milestone: 3,
                }),
            ])
        );
        expect(forkNamespaces).toHaveLength(1);
        expect(forkNamespaces[0]).toContain('gain_royal');
    });

    it('guards SELECT_ROYAL until a royal effect is active and blocks other idle commands while it is pending', () => {
        const { actor } = createRoyalMilestoneActor(11);

        const prematureSelect = dispatchCommand(actor, {
            type: 'SELECT_ROYAL',
            royalId: 'royal-3pts',
        });
        expect(prematureSelect.ok).toBe(false);
        if (!prematureSelect.ok) {
            expect(prematureSelect.error.code).toBe('ENGINE_PHASE_GUARD');
        }

        expect(dispatchCommand(actor, { type: 'BEGIN_BUY' }).ok).toBe(true);
        const buy = dispatchCommand(actor, {
            type: 'BUY_CARD',
            source: { kind: 'pyramid', level: 1, slot: 1 },
        });
        expect(buy.ok).toBe(true);
        if (!buy.ok) {
            return;
        }

        const blockedBuy = dispatchCommand(actor, { type: 'BEGIN_GEM_SELECTION' });
        expect(blockedBuy.ok).toBe(false);
        if (!blockedBuy.ok) {
            expect(blockedBuy.error.code).toBe('ENGINE_PHASE_GUARD');
        }

        const selectedRoyal = dispatchCommand(actor, {
            type: 'SELECT_ROYAL',
            royalId: 'royal-3pts',
        });
        expect(selectedRoyal.ok).toBe(true);
        if (!selectedRoyal.ok) {
            return;
        }

        expect(selectedRoyal.value.snapshot.activeEffects).toEqual([]);
        expect(selectedRoyal.value.snapshot.effectPrompts).toEqual([]);
        expect(
            selectedRoyal.value.snapshot.players.p1.royals.map((card) => card.royalId)
        ).toContain('royal-3pts');
        expect(selectedRoyal.value.snapshot.eventLog.slice(-2)).toEqual([
            expect.objectContaining({
                type: 'royal.selected',
                royalId: 'royal-3pts',
            }),
            expect.objectContaining({
                type: 'effect.completed',
                atom: 'gain_royal',
                outcome: 'resolved',
            }),
        ]);
        expect(selectedRoyal.value.snapshot.context.currentPlayer).toBe('p2');
    });
});

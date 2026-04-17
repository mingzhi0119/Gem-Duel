import { describe, expect, it } from 'vitest';
import {
    bootstrapMatch,
    buildRunContext,
    createMatchActor,
    createMatchActorFromSnapshot,
    createRunState,
    dispatchCommand,
    finalizeRunMatch,
    getGemLimit,
    readSnapshot,
    selectRunReward,
} from '../index';
import { createDefaultMetaState, createRunContext } from '@gem-duel/domain';
import { DEFAULT_FLAGS, createBootstrappedLocalActor, makeTestPorts } from './test-ports';

const ZERO_INVENTORY = {
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
} as const;

describe('Step 07 run state and buff helpers', () => {
    it('creates deterministic starter offers from meta state', () => {
        const metaState = createDefaultMetaState('local-profile');
        const runA = createRunState({
            seed: 71,
            mode: 'ai',
            metaState,
            ports: makeTestPorts(71).ports,
        });
        const runB = createRunState({
            seed: 71,
            mode: 'ai',
            metaState,
            ports: makeTestPorts(71).ports,
        });

        expect(runA.currentOffer).toEqual(runB.currentOffer);
        expect(runA.currentOffer?.options).toHaveLength(3);
        expect(runA.status).toBe('draft');
    });

    it('applies privilege_favor during setup through the shared effect lifecycle', () => {
        const basePorts = makeTestPorts(72);
        const baseActor = createMatchActor(
            {
                seed: 72,
                mode: 'local',
                flags: DEFAULT_FLAGS,
            },
            basePorts.ports
        );
        const baseStart = bootstrapMatch(baseActor, 'local', DEFAULT_FLAGS);
        expect(baseStart.ok).toBe(true);
        if (!baseStart.ok) {
            return;
        }

        const buffPorts = makeTestPorts(72);
        const buffActor = createMatchActor(
            {
                seed: 72,
                mode: 'local',
                flags: {
                    ...DEFAULT_FLAGS,
                    roguelike: true,
                },
                runContext: createRunContext('run-1', 1, 0, 0, [
                    {
                        id: 'privilege_favor',
                        owner: 'p1',
                        source: 'starter',
                        acquiredAtMatchIndex: 1,
                        state: {},
                    },
                ]),
            },
            buffPorts.ports
        );
        const buffStart = bootstrapMatch(buffActor, 'local', {
            ...DEFAULT_FLAGS,
            roguelike: true,
        });
        expect(buffStart.ok).toBe(true);
        if (!buffStart.ok) {
            return;
        }

        expect(buffStart.value.players.p1.privileges).toBe(
            baseStart.value.players.p1.privileges + 1
        );
        expect(buffStart.value.eventLog).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'privilege.awarded',
                    player: 'p1',
                    source: 'buff_hook',
                }),
            ])
        );
    });

    it('lets down_payment buy a reserved card one basic gem cheaper', () => {
        const { actor, ports } = createBootstrappedLocalActor(73);
        const snapshot = readSnapshot(actor);
        snapshot.context.currentPlayer = 'p1';
        snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
        snapshot.players.p1.reserveSlots[0] = {
            slotId: 'reserve-1',
            sourceLevel: 1,
            card: {
                cardId: 'reserved-discount-card',
                level: 1,
                points: 1,
                crowns: 0,
                printedBonusColor: 'blue',
                bonusColor: 'blue',
                bonusCount: 1,
                cost: {
                    ...ZERO_INVENTORY,
                    red: 1,
                },
                ability: 'none',
            },
        };
        snapshot.runContext = createRunContext('run-1', 1, 0, 0, [
            {
                id: 'down_payment',
                owner: 'p1',
                source: 'starter',
                acquiredAtMatchIndex: 1,
                state: {},
            },
        ]);

        const buffActor = createMatchActorFromSnapshot(snapshot, ports);
        expect(dispatchCommand(buffActor, { type: 'BEGIN_BUY' }).ok).toBe(true);
        const purchased = dispatchCommand(buffActor, {
            type: 'BUY_CARD',
            source: { kind: 'reserve', slotId: 'reserve-1' },
        });
        expect(purchased.ok).toBe(true);
        if (!purchased.ok) {
            return;
        }

        expect(purchased.value.snapshot.players.p1.tableau.map((card) => card.cardId)).toContain(
            'reserved-discount-card'
        );
    });

    it('triggers extortion on every second replenish and persists the counter in runContext', () => {
        const { actor, ports } = createBootstrappedLocalActor(74);
        const snapshot = readSnapshot(actor);
        snapshot.context.currentPlayer = 'p1';
        snapshot.hiddenState.bag = ['blue'];
        snapshot.players.p2.inventory.red = 1;
        snapshot.runContext = createRunContext('run-1', 1, 0, 0, [
            {
                id: 'extortion',
                owner: 'p1',
                source: 'starter',
                acquiredAtMatchIndex: 1,
                state: {
                    replenishCount: 1,
                },
            },
        ]);
        snapshot.board[0]!.token = null;

        const buffActor = createMatchActorFromSnapshot(snapshot, ports);
        const replenished = dispatchCommand(buffActor, { type: 'REPLENISH_BOARD' });
        expect(replenished.ok).toBe(true);
        if (!replenished.ok) {
            return;
        }

        expect(replenished.value.snapshot.effectPrompts[0]).toMatchObject({
            atom: 'take_opponent_token',
        });
        expect(replenished.value.snapshot.runContext?.activeBuffs[0]?.state.replenishCount).toBe(2);
    });

    it('applies deep_pockets and double_agent gem-cap rules deterministically', () => {
        const { actor } = createBootstrappedLocalActor(75);
        const snapshot = readSnapshot(actor);
        snapshot.runContext = createRunContext('run-1', 1, 0, 0, [
            {
                id: 'deep_pockets',
                owner: 'p1',
                source: 'starter',
                acquiredAtMatchIndex: 1,
                state: {},
            },
        ]);
        expect(getGemLimit(snapshot, 'p1')).toBe(12);

        snapshot.runContext.activeBuffs.push({
            id: 'double_agent',
            owner: 'p1',
            source: 'reward',
            acquiredAtMatchIndex: 2,
            state: {},
        });
        expect(getGemLimit(snapshot, 'p1')).toBe(8);
    });

    it('merges match-final buff state back into the run and advances to rewards or terminal status', () => {
        const metaState = createDefaultMetaState('local-profile');
        const ports = makeTestPorts(76).ports;
        const createdRun = createRunState({
            seed: 76,
            mode: 'ai',
            metaState,
            ports,
        });
        const selected = selectRunReward(createdRun, createdRun.currentOffer!.options[0]!);
        expect(selected.ok).toBe(true);
        if (!selected.ok) {
            return;
        }

        const finalSnapshot = createBootstrappedLocalActor(76).actor.getSnapshot().context.match;
        finalSnapshot.context.phase = 'terminal';
        finalSnapshot.context.winner = 'p1';
        finalSnapshot.context.victoryReason = 'points';
        finalSnapshot.runContext = buildRunContext(selected.value);
        finalSnapshot.runContext.activeBuffs[0]!.state = {
            replenishCount: 2,
        };

        const advanced = finalizeRunMatch(
            selected.value,
            finalSnapshot,
            metaState,
            ports,
            '2026-04-17T20:00:00.000Z'
        );
        expect(advanced.ok).toBe(true);
        if (!advanced.ok) {
            return;
        }

        expect(advanced.value.runState.wins).toBe(1);
        expect(advanced.value.runState.currentOffer?.source).toBe('victory');
        expect(advanced.value.runState.ownedBuffs[0]?.state.replenishCount).toBe(2);

        const winningRun = {
            ...advanced.value.runState,
            wins: 2,
            currentOffer: null,
        };
        const won = finalizeRunMatch(
            winningRun,
            finalSnapshot,
            advanced.value.metaState,
            ports,
            '2026-04-17T20:05:00.000Z'
        );
        expect(won.ok).toBe(true);
        if (!won.ok) {
            return;
        }
        expect(won.value.runState.status).toBe('won');
        expect(won.value.metaState.completedRunIds).toContain(won.value.runState.runId);
    });
});

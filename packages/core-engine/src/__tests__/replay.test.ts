import type { GameCommand, GameSnapshot, ReplayBundle, ReplayCommand } from '@gem-duel/contracts';
import { describe, expect, it } from 'vitest';
import {
    buildReplayBundle,
    createMatchActorFromSnapshot,
    createSnapshotHash,
    dispatchCommand,
    readSnapshot,
    verifyReplayBundle,
} from '../index';
import { buildGoldenReplayBundles } from './golden-replay-scenarios';
import { createBootstrappedLocalActor, makeTestPorts } from './test-ports';
import deepPocketsReplay from '../../__replays__/golden/deep-pockets-threshold.step07.json';
import doubleAgentReplay from '../../__replays__/golden/double-agent-privilege-double.step07.json';
import downPaymentReplay from '../../__replays__/golden/down-payment-reserve-buy.step07.json';
import extortionReplay from '../../__replays__/golden/extortion-second-replenish.step07.json';
import privilegeFavorReplay from '../../__replays__/golden/privilege-favor-setup.step07.json';

const ZERO_INVENTORY = {
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
} as const;

const createReplayCommand = (
    snapshotSequence: number,
    issuedBy: 'p1' | 'p2' | null,
    command: GameCommand,
    index: number
): ReplayCommand => ({
    clientCommandId: `test-command-${index + 1}`,
    expectedSeq: snapshotSequence,
    issuedBy,
    command,
});

const createRoyalReplayInitialSnapshot = (seed = 13): GameSnapshot => {
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

    return snapshot;
};

describe('replay helpers', () => {
    it('builds replay bundles from the initial snapshot and verifies the recomputed finalStateHash', () => {
        const initialSnapshot = createRoyalReplayInitialSnapshot(13);
        const { ports } = makeTestPorts(13);
        const actor = createMatchActorFromSnapshot(initialSnapshot, ports);
        const commands: ReplayCommand[] = [];
        const recordedDispatch = (command: GameCommand) => {
            const before = readSnapshot(actor);
            commands.push(
                createReplayCommand(
                    before.sequence,
                    before.context.currentPlayer,
                    command,
                    commands.length
                )
            );
            const result = dispatchCommand(actor, command);
            expect(result.ok).toBe(true);
            return result;
        };

        recordedDispatch({ type: 'BEGIN_BUY' });
        recordedDispatch({ type: 'BUY_CARD', source: { kind: 'pyramid', level: 1, slot: 1 } });
        recordedDispatch({ type: 'SELECT_ROYAL', royalId: 'royal-3pts' });

        const finalSnapshot = readSnapshot(actor);
        const bundle = buildReplayBundle(initialSnapshot, commands, finalSnapshot);
        const verification = verifyReplayBundle(bundle, makeTestPorts(13).ports);

        expect(bundle.initialSnapshot.context.phase).toBe('turnIdle');
        expect(bundle.resultSummary.reason).toBe(finalSnapshot.context.victoryReason);
        expect(bundle.finalStateHash).toBe(createSnapshotHash(finalSnapshot));
        expect(verification.ok).toBe(true);
        if (!verification.ok) {
            return;
        }

        expect(verification.value.matchesHash).toBe(true);
        expect(verification.value.matchesEvents).toBe(true);
        expect(verification.value.replayedSnapshot).toEqual(finalSnapshot);
    });

    it('verifies all committed Step 07 golden replay fixtures', () => {
        const committedBundles = new Map<string, ReplayBundle>([
            ['deep-pockets-threshold.step07.json', deepPocketsReplay as unknown as ReplayBundle],
            [
                'double-agent-privilege-double.step07.json',
                doubleAgentReplay as unknown as ReplayBundle,
            ],
            ['down-payment-reserve-buy.step07.json', downPaymentReplay as unknown as ReplayBundle],
            ['extortion-second-replenish.step07.json', extortionReplay as unknown as ReplayBundle],
            ['privilege-favor-setup.step07.json', privilegeFavorReplay as unknown as ReplayBundle],
        ]);

        for (const scenario of buildGoldenReplayBundles()) {
            const bundle = committedBundles.get(scenario.filename);
            expect(bundle).toBeDefined();
            if (!bundle) {
                return;
            }
            const verification = verifyReplayBundle(bundle, makeTestPorts(bundle.seed).ports);

            expect(verification.ok).toBe(true);
            if (!verification.ok) {
                return;
            }

            expect(verification.value.matchesHash).toBe(true);
            expect(verification.value.matchesEvents).toBe(true);
            expect(verification.value.recomputedFinalStateHash).toBe(bundle.finalStateHash);
        }
    });
});

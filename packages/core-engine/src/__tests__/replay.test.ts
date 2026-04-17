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
import buyChainedAbilityReplay from '../../__replays__/golden/buy-chained-ability.step04.json';
import replenishPrivilegeShiftReplay from '../../__replays__/golden/replenish-privilege-shift.step04.json';
import reserveBlindReplay from '../../__replays__/golden/reserve-blind.step04.json';
import reserveFaceUpReplay from '../../__replays__/golden/reserve-face-up.step04.json';
import royalMilestoneReplay from '../../__replays__/golden/royal-milestone-selection.step04.json';
import takeThreeDiscardReplay from '../../__replays__/golden/take-three-discard.step04.json';

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

    it('verifies all committed Step 04 golden replay fixtures', () => {
        const committedBundles = new Map<string, ReplayBundle>([
            ['buy-chained-ability.step04.json', buyChainedAbilityReplay as ReplayBundle],
            [
                'replenish-privilege-shift.step04.json',
                replenishPrivilegeShiftReplay as ReplayBundle,
            ],
            ['reserve-blind.step04.json', reserveBlindReplay as ReplayBundle],
            ['reserve-face-up.step04.json', reserveFaceUpReplay as ReplayBundle],
            ['royal-milestone-selection.step04.json', royalMilestoneReplay as ReplayBundle],
            ['take-three-discard.step04.json', takeThreeDiscardReplay as ReplayBundle],
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

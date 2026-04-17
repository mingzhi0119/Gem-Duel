import type { GameCommand, ReplayBundle, ReplayCommand } from '@gem-duel/contracts';
import { describe, expect, it } from 'vitest';
import goldenReplayBundle from '../../__replays__/golden/royal-handoff.step03.json';
import {
    buildReplayBundle,
    createMatchActor,
    createSnapshotHash,
    dispatchCommand,
    readSnapshot,
    verifyReplayBundle,
} from '../index';
import { DEFAULT_FLAGS, makeTestPorts } from './test-ports';

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

describe('replay helpers', () => {
    it('builds replay bundles from the initial snapshot and verifies the recomputed finalStateHash', () => {
        const { ports } = makeTestPorts(13);
        const actor = createMatchActor(
            {
                seed: 13,
                mode: 'local',
                flags: DEFAULT_FLAGS,
            },
            ports
        );

        const initialSnapshot = readSnapshot(actor);
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

        recordedDispatch({ type: 'SELECT_MODE', mode: 'local', flags: DEFAULT_FLAGS });
        recordedDispatch({ type: 'START_MATCH' });
        recordedDispatch({ type: 'BEGIN_ROYAL_RESOLUTION' });
        recordedDispatch({ type: 'SELECT_ROYAL', crownsGain: 2 });

        const finalSnapshot = readSnapshot(actor);
        const bundle = buildReplayBundle(initialSnapshot, commands, finalSnapshot);
        const verification = verifyReplayBundle(bundle, makeTestPorts(13).ports);

        expect(bundle.initialSnapshot.context.phase).toBe('initialization');
        expect(bundle.finalStateHash).toBe(createSnapshotHash(finalSnapshot));
        expect(verification.ok).toBe(true);
        if (!verification.ok) {
            return;
        }

        expect(verification.value.matchesHash).toBe(true);
        expect(verification.value.matchesEvents).toBe(true);
        expect(verification.value.replayedSnapshot).toEqual(finalSnapshot);
    });

    it('verifies the committed Step 03 golden replay fixture', () => {
        const bundle = goldenReplayBundle as ReplayBundle;

        const verification = verifyReplayBundle(bundle, makeTestPorts(bundle.seed).ports);
        expect(verification.ok).toBe(true);
        if (!verification.ok) {
            return;
        }

        expect(verification.value.matchesHash).toBe(true);
        expect(verification.value.matchesEvents).toBe(true);
        expect(verification.value.recomputedFinalStateHash).toBe(bundle.finalStateHash);
    });
});

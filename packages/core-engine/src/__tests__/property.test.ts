import type { GameCommand, GameSnapshot } from '@gem-duel/contracts';
import { GameSnapshotSchema } from '@gem-duel/contracts';
import { expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import {
    bootstrapMatch,
    createMatchActor,
    createSnapshotHash,
    dispatchCommand,
    getAllowedCommands,
    readSnapshot,
} from '../index';
import { DEFAULT_FLAGS, makeTestPorts } from './test-ports';

const materializeCommand = (snapshot: GameSnapshot, choice: number): GameCommand | null => {
    const allowedCommands = getAllowedCommands(snapshot);
    if (allowedCommands.length === 0) {
        return null;
    }

    const commandType = allowedCommands[choice % allowedCommands.length];
    switch (commandType) {
        case 'BEGIN_GEM_SELECTION':
        case 'BEGIN_RESERVE':
        case 'BEGIN_BUY':
        case 'BEGIN_PRIVILEGE':
        case 'BEGIN_ROYAL_RESOLUTION':
        case 'ENTER_REPLAY':
        case 'EXIT_REPLAY':
        case 'START_MATCH':
            return { type: commandType };
        case 'TAKE_GEM': {
            const availableColors = (['blue', 'red', 'green', 'white'] as const).filter(
                (color) => snapshot.gemBank[color] > 0
            );
            return {
                type: 'TAKE_GEM',
                color: availableColors[choice % Math.max(availableColors.length, 1)] ?? 'blue',
            };
        }
        case 'RESERVE_CARD':
            return { type: 'RESERVE_CARD', slot: (choice % 3) + 1 };
        case 'BUY_CARD':
            return { type: 'BUY_CARD', scoreGain: (choice % 2) + 1 };
        case 'USE_PRIVILEGE': {
            const availableColors = (
                ['blue', 'white', 'green', 'black', 'red', 'pearl'] as const
            ).filter((color) => snapshot.gemBank[color] > 0);
            return {
                type: 'USE_PRIVILEGE',
                color: availableColors[choice % Math.max(availableColors.length, 1)] ?? 'green',
            };
        }
        case 'SELECT_ROYAL':
            return { type: 'SELECT_ROYAL', crownsGain: (choice % 3) + 1 };
        case 'FINISH_MATCH':
            return { type: 'FINISH_MATCH', winner: choice % 2 === 0 ? 'p1' : 'p2' };
        case 'SELECT_MODE':
            return { type: 'SELECT_MODE', mode: 'local', flags: DEFAULT_FLAGS };
    }

    return null;
};

const runLegalChoices = (seed: number, choices: number[]) => {
    const { ports } = makeTestPorts(seed);
    const actor = createMatchActor(
        {
            seed,
            mode: 'local',
            flags: DEFAULT_FLAGS,
        },
        ports
    );

    const bootstrapped = bootstrapMatch(actor, 'local', DEFAULT_FLAGS);
    if (!bootstrapped.ok) {
        throw new Error(bootstrapped.error.message);
    }

    const snapshots: GameSnapshot[] = [bootstrapped.value];
    const commands: GameCommand[] = [];

    for (const choice of choices) {
        const snapshot = readSnapshot(actor);
        const command = materializeCommand(snapshot, choice);
        if (!command) {
            break;
        }

        const result = dispatchCommand(actor, command);
        if (!result.ok) {
            throw new Error(result.error.message);
        }

        commands.push(command);
        snapshots.push(result.value.snapshot);
        if (result.value.snapshot.context.phase === 'terminal') {
            break;
        }
    }

    return {
        commands,
        snapshots,
        finalSnapshot: readSnapshot(actor),
    };
};

test.prop(
    [
        fc.integer({ min: 1, max: 10_000 }),
        fc.array(fc.integer({ min: 0, max: 99 }), { maxLength: 12 }),
    ],
    { numRuns: 25 }
)(
    'same seed plus the same legal command stream yields the same state and finalStateHash',
    (seed, choices) => {
        const runA = runLegalChoices(seed, choices);
        const runB = runLegalChoices(seed, choices);

        expect(runA.commands).toEqual(runB.commands);
        expect(runA.finalSnapshot).toEqual(runB.finalSnapshot);
        expect(createSnapshotHash(runA.finalSnapshot)).toBe(createSnapshotHash(runB.finalSnapshot));
    }
);

test.prop(
    [
        fc.integer({ min: 1, max: 10_000 }),
        fc.array(fc.integer({ min: 0, max: 99 }), { maxLength: 12 }),
    ],
    { numRuns: 25 }
)(
    'legal prefixes remain schema-valid with monotonic sequence and event ordering',
    (seed, choices) => {
        const run = runLegalChoices(seed, choices);
        let previousSequence = -1;

        for (const snapshot of run.snapshots) {
            expect(GameSnapshotSchema.parse(snapshot).sequence).toBe(snapshot.sequence);
            expect(snapshot.context.step).toBe(snapshot.sequence);
            expect(snapshot.sequence).toBeGreaterThanOrEqual(previousSequence);
            expect(snapshot.eventLog).toHaveLength(snapshot.sequence);
            previousSequence = snapshot.sequence;
        }
    }
);

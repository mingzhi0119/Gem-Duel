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
    validateDispatch,
} from '../index';
import { calculateCardPayment } from '../classic-helpers';
import { DEFAULT_FLAGS, makeTestPorts } from './test-ports';

const findNonGoldBoardPositions = (snapshot: GameSnapshot) =>
    snapshot.board
        .filter((cell) => cell.token !== null && cell.token !== 'gold')
        .map((cell) => cell.positionId);

const findGoldBoardPosition = (snapshot: GameSnapshot) =>
    snapshot.board.find((cell) => cell.token === 'gold')?.positionId ?? null;

const pickReserveSource = (snapshot: GameSnapshot, choice: number) => {
    const pyramidCards = snapshot.pyramid.flatMap((row) =>
        row.slots
            .filter((slot) => slot.card !== null)
            .map((slot) => ({ kind: 'pyramid' as const, level: row.level, slot: slot.slot }))
    );
    const deckLevels = ([1, 2, 3] as const)
        .filter((level) => snapshot.hiddenState.deckOrder[`level${level}`].length > 0)
        .map((level) => ({ kind: 'deck' as const, level }));
    const sources = [...pyramidCards, ...deckLevels];
    return sources[choice % Math.max(sources.length, 1)] ?? null;
};

const pickBuySource = (snapshot: GameSnapshot, choice: number) => {
    const player = snapshot.players[snapshot.context.currentPlayer];
    const affordablePyramidCards = snapshot.pyramid.flatMap((row) =>
        row.slots
            .filter(
                (slot) => slot.card !== null && calculateCardPayment(player, slot.card).affordable
            )
            .map((slot) => ({ kind: 'pyramid' as const, level: row.level, slot: slot.slot }))
    );
    const affordableReserveCards = player.reserveSlots
        .filter((slot) => slot.card !== null && calculateCardPayment(player, slot.card).affordable)
        .map((slot) => ({ kind: 'reserve' as const, slotId: slot.slotId }));
    const sources = [...affordablePyramidCards, ...affordableReserveCards];
    return sources[choice % Math.max(sources.length, 1)] ?? null;
};

const materializeCommand = (snapshot: GameSnapshot, choice: number): GameCommand | null => {
    const allowedCommands = getAllowedCommands(snapshot);
    if (allowedCommands.length === 0) {
        return null;
    }

    const commandType = allowedCommands[choice % allowedCommands.length];
    switch (commandType) {
        case 'REPLENISH_BOARD':
        case 'ENTER_REPLAY':
        case 'EXIT_REPLAY':
        case 'TAKE_TOKENS_CONFIRM':
        case 'TAKE_TOKENS_CANCEL':
        case 'USE_PRIVILEGE_CONFIRM':
        case 'USE_PRIVILEGE_CANCEL':
            return { type: commandType };
        case 'TAKE_TOKENS_ADD_POSITION': {
            const pendingSelection =
                snapshot.pendingSelection?.action === 'TAKE_TOKENS'
                    ? snapshot.pendingSelection
                    : null;
            const positions = findNonGoldBoardPositions(snapshot)
                .filter((position) => !pendingSelection?.selectedPositions.includes(position))
                .map((positionId) => ({
                    type: 'TAKE_TOKENS_ADD_POSITION' as const,
                    positionId,
                }));
            return positions.find((command) => validateDispatch(snapshot, command).ok) ?? null;
        }
        case 'TAKE_TOKENS': {
            const positions = findNonGoldBoardPositions(snapshot);
            return positions[0] ? { type: 'TAKE_TOKENS', positions: [positions[0]] } : null;
        }
        case 'RESERVE_CARD': {
            const goldPosition = findGoldBoardPosition(snapshot);
            const source = pickReserveSource(snapshot, choice);
            return goldPosition && source
                ? {
                      type: 'RESERVE_CARD',
                      goldPosition,
                      source,
                  }
                : null;
        }
        case 'BUY_CARD': {
            const source = pickBuySource(snapshot, choice);
            return source ? { type: 'BUY_CARD', source } : null;
        }
        case 'USE_PRIVILEGE_ADD_POSITION': {
            const pendingSelection =
                snapshot.pendingSelection?.action === 'USE_PRIVILEGE'
                    ? snapshot.pendingSelection
                    : null;
            const positions = findNonGoldBoardPositions(snapshot)
                .filter((position) => !pendingSelection?.selectedPositions.includes(position))
                .map((positionId) => ({
                    type: 'USE_PRIVILEGE_ADD_POSITION' as const,
                    positionId,
                }));
            return positions.find((command) => validateDispatch(snapshot, command).ok) ?? null;
        }
        case 'USE_PRIVILEGE': {
            const positions = findNonGoldBoardPositions(snapshot);
            return positions[0] ? { type: 'USE_PRIVILEGE', positions: [positions[0]] } : null;
        }
        case 'DISCARD_TOKEN': {
            const player = snapshot.players[snapshot.context.currentPlayer];
            const color = (
                ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'] as const
            ).find((entry) => player.inventory[entry] > 0);
            return color ? { type: 'DISCARD_TOKEN', color } : null;
        }
        case 'SELECT_ROYAL': {
            const prompt = snapshot.effectPrompts.find((entry) => entry.atom === 'gain_royal');
            return prompt?.royalIds[0]
                ? { type: 'SELECT_ROYAL', royalId: prompt.royalIds[0] }
                : null;
        }
        case 'TAKE_EFFECT_BOARD_TOKEN': {
            const prompt = snapshot.effectPrompts.find(
                (entry) => entry.atom === 'take_board_token'
            );
            const cell = snapshot.board.find(
                (entry) =>
                    entry.token !== null &&
                    entry.token !== 'gold' &&
                    entry.token !== 'pearl' &&
                    prompt?.allowedColors.includes(entry.token)
            );
            return prompt && cell
                ? {
                      type: 'TAKE_EFFECT_BOARD_TOKEN',
                      effectId: prompt.effectId,
                      positionId: cell.positionId,
                  }
                : null;
        }
        case 'STEAL_OPPONENT_TOKEN': {
            const prompt = snapshot.effectPrompts.find(
                (entry) => entry.atom === 'take_opponent_token'
            );
            return prompt?.allowedColors[0]
                ? {
                      type: 'STEAL_OPPONENT_TOKEN',
                      effectId: prompt.effectId,
                      color: prompt.allowedColors[0],
                  }
                : null;
        }
        case 'SELECT_BONUS_COLOR': {
            const prompt = snapshot.effectPrompts.find(
                (entry) => entry.atom === 'override_bonus_color'
            );
            return prompt?.allowedColors[0]
                ? {
                      type: 'SELECT_BONUS_COLOR',
                      effectId: prompt.effectId,
                      color: prompt.allowedColors[0],
                  }
                : null;
        }
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
        fc.array(fc.integer({ min: 0, max: 99 }), { maxLength: 16 }),
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
        fc.array(fc.integer({ min: 0, max: 99 }), { maxLength: 16 }),
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

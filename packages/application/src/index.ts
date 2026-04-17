import {
    type GameCommand,
    type GameSnapshot,
    type ReplayBundle,
    type ReplayCommand,
    type TypedResult,
    type UiActionDescriptor,
    type UiViewModel,
} from '@gem-duel/contracts';
import { createEnginePorts } from '@gem-duel/adapters';
import {
    buildReplayBundle,
    createMatchActor,
    dispatchCommand,
    readSnapshot,
    type EnginePorts,
} from '@gem-duel/core-engine';
import { type MatchFlags, type GameMode } from '@gem-duel/domain';

export interface MatchSession {
    dispatch(command: GameCommand): TypedResult<GameSnapshot>;
    snapshot(): GameSnapshot;
    replay(): ReplayBundle;
    viewModel(): UiViewModel;
}

export interface MatchSessionInput {
    seed: number;
    mode: GameMode;
    flags: MatchFlags;
}

export interface ShellMatchSessionInput {
    seed: number;
    flags: MatchFlags;
}

const hasPendingRoyalSelection = (snapshot: GameSnapshot) =>
    snapshot.activeEffects.some((effect) => effect.atom === 'gain_royal');

const buildActions = (snapshot: GameSnapshot): UiActionDescriptor[] => {
    switch (snapshot.context.phase) {
        case 'turnIdle':
            if (hasPendingRoyalSelection(snapshot)) {
                return [
                    {
                        id: 'royal-1',
                        label: 'Select Royal (+1 Crown)',
                        command: { type: 'SELECT_ROYAL', crownsGain: 1 },
                    },
                ];
            }
            return [
                {
                    id: 'begin-gems',
                    label: 'Begin Gem Selection',
                    command: { type: 'BEGIN_GEM_SELECTION' },
                },
                { id: 'begin-reserve', label: 'Begin Reserve', command: { type: 'BEGIN_RESERVE' } },
                { id: 'begin-buy', label: 'Begin Buy', command: { type: 'BEGIN_BUY' } },
                {
                    id: 'begin-privilege',
                    label: 'Begin Privilege',
                    command: { type: 'BEGIN_PRIVILEGE' },
                },
                {
                    id: 'begin-royal',
                    label: 'Begin Royal Resolution',
                    command: { type: 'BEGIN_ROYAL_RESOLUTION' },
                },
                { id: 'replay', label: 'Enter Replay', command: { type: 'ENTER_REPLAY' } },
                {
                    id: 'finish',
                    label: 'Finish Match (P1)',
                    command: { type: 'FINISH_MATCH', winner: 'p1' },
                },
            ];
        case 'gemSelection':
            return [
                {
                    id: 'take-blue',
                    label: 'Take Blue Gem',
                    command: { type: 'TAKE_GEM', color: 'blue' },
                },
                {
                    id: 'take-red',
                    label: 'Take Red Gem',
                    command: { type: 'TAKE_GEM', color: 'red' },
                },
            ];
        case 'reserving':
            return [
                {
                    id: 'reserve-1',
                    label: 'Reserve Slot 1',
                    command: { type: 'RESERVE_CARD', slot: 1 },
                },
                {
                    id: 'reserve-2',
                    label: 'Reserve Slot 2',
                    command: { type: 'RESERVE_CARD', slot: 2 },
                },
            ];
        case 'buying':
            return [
                {
                    id: 'buy-1',
                    label: 'Buy Card (+1)',
                    command: { type: 'BUY_CARD', scoreGain: 1 },
                },
                {
                    id: 'buy-2',
                    label: 'Buy Card (+2)',
                    command: { type: 'BUY_CARD', scoreGain: 2 },
                },
            ];
        case 'privilege':
            return [
                {
                    id: 'privilege-green',
                    label: 'Use Privilege on Green',
                    command: { type: 'USE_PRIVILEGE', color: 'green' },
                },
            ];
        case 'replay':
            return [{ id: 'exit-replay', label: 'Exit Replay', command: { type: 'EXIT_REPLAY' } }];
        default:
            return [];
    }
};

const createReplayCommand = (
    snapshot: GameSnapshot,
    command: GameCommand,
    index: number
): ReplayCommand => ({
    clientCommandId: `local-command-${index + 1}`,
    expectedSeq: snapshot.sequence,
    issuedBy: snapshot.context.currentPlayer,
    command,
});

export const buildUiViewModel = (snapshot: GameSnapshot): UiViewModel => ({
    title: `Gem Duel ${snapshot.context.mode.toUpperCase()} Match`,
    subtitle: `Phase: ${snapshot.context.phase} | Turn: ${snapshot.context.currentPlayer}`,
    snapshot,
    availableActions: buildActions(snapshot),
});

export const createMatchSession = (
    input: MatchSessionInput,
    ports: EnginePorts
): TypedResult<MatchSession> => {
    const actor = createMatchActor(input, ports);
    const initialSnapshot = readSnapshot(actor);
    const commandLog: ReplayCommand[] = [];

    const recordedDispatch = (command: GameCommand) => {
        const snapshotBefore = readSnapshot(actor);
        const replayCommand = createReplayCommand(snapshotBefore, command, commandLog.length);
        const result = dispatchCommand(actor, command);
        if (result.ok) {
            commandLog.push(replayCommand);
        }
        return result;
    };

    const selectMode = recordedDispatch({
        type: 'SELECT_MODE',
        mode: input.mode,
        flags: input.flags,
    });
    if (!selectMode.ok) {
        return selectMode;
    }

    const startMatch = recordedDispatch({ type: 'START_MATCH' });
    if (!startMatch.ok) {
        return startMatch;
    }

    return {
        ok: true,
        value: {
            dispatch(command) {
                const result = recordedDispatch(command);
                if (!result.ok) {
                    return result;
                }
                return {
                    ok: true,
                    value: result.value.snapshot,
                };
            },
            snapshot() {
                return readSnapshot(actor);
            },
            replay() {
                return buildReplayBundle(initialSnapshot, [...commandLog], readSnapshot(actor));
            },
            viewModel() {
                return buildUiViewModel(readSnapshot(actor));
            },
        },
    };
};

export const createLocalMatchSession = (input: ShellMatchSessionInput): TypedResult<MatchSession> =>
    createMatchSession(
        {
            seed: input.seed,
            mode: 'local',
            flags: input.flags,
        },
        createEnginePorts(input.seed)
    );

export const createAiMatchSession = (input: ShellMatchSessionInput): TypedResult<MatchSession> =>
    createMatchSession(
        {
            seed: input.seed,
            mode: 'ai',
            flags: input.flags,
        },
        createEnginePorts(input.seed)
    );

import {
    SCHEMA_VERSION,
    type GameCommand,
    type GameSnapshot,
    type ReplayBundle,
    type TypedResult,
    type UiActionDescriptor,
    type UiViewModel,
} from '@gem-duel/contracts';
import {
    bootstrapMatch,
    createMatchActor,
    dispatchCommand,
    readSnapshot,
    type EnginePorts,
} from '@gem-duel/core-engine';
import { RULESET_VERSION, type MatchFlags, type GameMode } from '@gem-duel/domain';

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

const buildActions = (snapshot: GameSnapshot): UiActionDescriptor[] => {
    switch (snapshot.context.phase) {
        case 'turnIdle':
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
                {
                    id: 'begin-buff',
                    label: 'Begin Buff Resolution',
                    command: { type: 'BEGIN_BUFF_RESOLUTION' },
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
        case 'royalResolution':
            return [
                {
                    id: 'royal-1',
                    label: 'Select Royal (+1 Crown)',
                    command: { type: 'SELECT_ROYAL', crownsGain: 1 },
                },
            ];
        case 'buffResolution':
            return [
                {
                    id: 'buff-1',
                    label: 'Resolve Buff (+1 Score)',
                    command: { type: 'RESOLVE_BUFF', scoreGain: 1 },
                },
            ];
        case 'replay':
            return [{ id: 'exit-replay', label: 'Exit Replay', command: { type: 'EXIT_REPLAY' } }];
        default:
            return [];
    }
};

export const buildReplayBundle = (snapshot: GameSnapshot): ReplayBundle => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: RULESET_VERSION,
    seed: snapshot.context.seed,
    initialSnapshot: snapshot,
    events: snapshot.eventLog,
    resultSummary: {
        winner: snapshot.context.winner,
        turns: snapshot.context.step,
    },
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
    const bootstrap = bootstrapMatch(actor, input.mode, input.flags);
    if (!bootstrap.ok) {
        return bootstrap;
    }

    return {
        ok: true,
        value: {
            dispatch(command) {
                const result = dispatchCommand(actor, command);
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
                return buildReplayBundle(readSnapshot(actor));
            },
            viewModel() {
                return buildUiViewModel(readSnapshot(actor));
            },
        },
    };
};

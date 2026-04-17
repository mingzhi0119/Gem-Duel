import {
    type GameCommand,
    type GameSnapshot,
    type ReplayBundle,
    type ReplayCommand,
    type TypedResult,
    type UiActionDescriptor,
    type UiViewModel,
    toPlayerSnapshot,
    toSpectatorSnapshot,
} from '@gem-duel/contracts';
import { createEnginePorts } from '@gem-duel/adapters';
import {
    buildReplayBundle,
    createMatchActor,
    dispatchCommand,
    getAllowedCommands,
    readSnapshot,
    validateDispatch,
    type EnginePorts,
} from '@gem-duel/core-engine';
import { type GameMode, type MatchFlags } from '@gem-duel/domain';

type ViewerId = GameSnapshot['context']['currentPlayer'] | 'spectator';

export interface MatchSession {
    dispatch(command: GameCommand): TypedResult<GameSnapshot>;
    snapshot(): GameSnapshot;
    replay(): ReplayBundle;
    viewModel(viewer?: ViewerId): UiViewModel;
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

const getRoyalPrompt = (snapshot: GameSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<(typeof snapshot.effectPrompts)[number], { atom: 'gain_royal' }> =>
            prompt.atom === 'gain_royal'
    ) ?? null;

const getBoardTokenPrompt = (snapshot: GameSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'take_board_token' }
        > => prompt.atom === 'take_board_token'
    ) ?? null;

const getOpponentTokenPrompt = (snapshot: GameSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'take_opponent_token' }
        > => prompt.atom === 'take_opponent_token'
    ) ?? null;

const getBonusColorPrompt = (snapshot: GameSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'override_bonus_color' }
        > => prompt.atom === 'override_bonus_color'
    ) ?? null;

const appendAction = (
    snapshot: GameSnapshot,
    actions: UiActionDescriptor[],
    id: string,
    label: string,
    command: GameCommand
) => {
    if (validateDispatch(snapshot, command).ok) {
        actions.push({ id, label, command });
    }
};

const getNonGoldBoardCells = (snapshot: GameSnapshot) =>
    snapshot.board.filter((cell) => cell.token !== null && cell.token !== 'gold');

const getGoldBoardCell = (snapshot: GameSnapshot) =>
    snapshot.board.find((cell) => cell.token === 'gold') ?? null;

const getReserveSources = (snapshot: GameSnapshot) => [
    ...snapshot.pyramid.flatMap((row) =>
        row.slots
            .filter((slot) => slot.card !== null)
            .map((slot) => ({ kind: 'pyramid' as const, level: row.level, slot: slot.slot }))
    ),
    ...([1, 2, 3] as const)
        .filter((level) => snapshot.hiddenState.deckOrder[`level${level}`].length > 0)
        .map((level) => ({ kind: 'deck' as const, level })),
];

const getBuySources = (snapshot: GameSnapshot) => [
    ...snapshot.pyramid.flatMap((row) =>
        row.slots
            .filter((slot) => slot.card !== null)
            .map((slot) => ({
                source: { kind: 'pyramid' as const, level: row.level, slot: slot.slot },
                label: slot.card!.cardId,
            }))
    ),
    ...snapshot.players[snapshot.context.currentPlayer].reserveSlots
        .filter((slot) => slot.card !== null)
        .map((slot) => ({
            source: { kind: 'reserve' as const, slotId: slot.slotId },
            label: slot.card!.cardId,
        })),
];

const buildActions = (snapshot: GameSnapshot): UiActionDescriptor[] => {
    const actions: UiActionDescriptor[] = [];

    for (const commandType of getAllowedCommands(snapshot)) {
        switch (commandType) {
            case 'BEGIN_GEM_SELECTION':
                appendAction(snapshot, actions, 'begin-gem-selection', 'Begin Gem Selection', {
                    type: 'BEGIN_GEM_SELECTION',
                });
                break;
            case 'BEGIN_RESERVE':
                appendAction(snapshot, actions, 'begin-reserve', 'Begin Reserve', {
                    type: 'BEGIN_RESERVE',
                });
                break;
            case 'BEGIN_BUY':
                appendAction(snapshot, actions, 'begin-buy', 'Begin Buy', { type: 'BEGIN_BUY' });
                break;
            case 'BEGIN_PRIVILEGE':
                appendAction(snapshot, actions, 'begin-privilege', 'Begin Privilege', {
                    type: 'BEGIN_PRIVILEGE',
                });
                break;
            case 'REPLENISH_BOARD':
                appendAction(snapshot, actions, 'replenish-board', 'Replenish Board', {
                    type: 'REPLENISH_BOARD',
                });
                break;
            case 'ENTER_REPLAY':
                appendAction(snapshot, actions, 'enter-replay', 'Enter Replay', {
                    type: 'ENTER_REPLAY',
                });
                break;
            case 'EXIT_REPLAY':
                appendAction(snapshot, actions, 'exit-replay', 'Exit Replay', {
                    type: 'EXIT_REPLAY',
                });
                break;
            case 'TAKE_TOKENS':
                for (const cell of getNonGoldBoardCells(snapshot)) {
                    appendAction(
                        snapshot,
                        actions,
                        `take-${cell.positionId}`,
                        `Take ${cell.token} at ${cell.positionId}`,
                        { type: 'TAKE_TOKENS', positions: [cell.positionId] }
                    );
                }
                break;
            case 'RESERVE_CARD': {
                const goldCell = getGoldBoardCell(snapshot);
                if (!goldCell) {
                    break;
                }
                for (const source of getReserveSources(snapshot)) {
                    appendAction(
                        snapshot,
                        actions,
                        `reserve-${source.kind}-${source.level}${'slot' in source ? `-${source.slot}` : ''}`,
                        source.kind === 'pyramid'
                            ? `Reserve L${source.level} S${source.slot}`
                            : `Reserve Blind L${source.level}`,
                        {
                            type: 'RESERVE_CARD',
                            goldPosition: goldCell.positionId,
                            source,
                        }
                    );
                }
                break;
            }
            case 'BUY_CARD':
                for (const option of getBuySources(snapshot)) {
                    appendAction(snapshot, actions, `buy-${option.label}`, `Buy ${option.label}`, {
                        type: 'BUY_CARD',
                        source: option.source,
                    });
                }
                break;
            case 'USE_PRIVILEGE':
                for (const cell of getNonGoldBoardCells(snapshot)) {
                    appendAction(
                        snapshot,
                        actions,
                        `privilege-${cell.positionId}`,
                        `Use Privilege on ${cell.positionId}`,
                        { type: 'USE_PRIVILEGE', positions: [cell.positionId] }
                    );
                }
                break;
            case 'DISCARD_TOKEN': {
                const player = snapshot.players[snapshot.context.currentPlayer];
                for (const color of [
                    'blue',
                    'white',
                    'green',
                    'black',
                    'red',
                    'pearl',
                    'gold',
                ] as const) {
                    if (player.inventory[color] <= 0) {
                        continue;
                    }
                    appendAction(snapshot, actions, `discard-${color}`, `Discard ${color}`, {
                        type: 'DISCARD_TOKEN',
                        color,
                    });
                }
                break;
            }
            case 'SELECT_ROYAL': {
                const prompt = getRoyalPrompt(snapshot);
                if (!prompt) {
                    break;
                }
                for (const royalId of prompt.royalIds) {
                    appendAction(
                        snapshot,
                        actions,
                        `select-royal-${royalId}`,
                        `Select Royal ${royalId}`,
                        { type: 'SELECT_ROYAL', royalId }
                    );
                }
                break;
            }
            case 'TAKE_EFFECT_BOARD_TOKEN': {
                const prompt = getBoardTokenPrompt(snapshot);
                if (!prompt) {
                    break;
                }
                for (const cell of snapshot.board) {
                    if (
                        cell.token === null ||
                        cell.token === 'gold' ||
                        cell.token === 'pearl' ||
                        !prompt.allowedColors.includes(cell.token)
                    ) {
                        continue;
                    }
                    appendAction(
                        snapshot,
                        actions,
                        `effect-board-${cell.positionId}`,
                        `Take Bonus Token ${cell.token} at ${cell.positionId}`,
                        {
                            type: 'TAKE_EFFECT_BOARD_TOKEN',
                            effectId: prompt.effectId,
                            positionId: cell.positionId,
                        }
                    );
                }
                break;
            }
            case 'STEAL_OPPONENT_TOKEN': {
                const prompt = getOpponentTokenPrompt(snapshot);
                if (!prompt) {
                    break;
                }
                for (const color of prompt.allowedColors) {
                    appendAction(snapshot, actions, `steal-${color}`, `Steal ${color}`, {
                        type: 'STEAL_OPPONENT_TOKEN',
                        effectId: prompt.effectId,
                        color,
                    });
                }
                break;
            }
            case 'SELECT_BONUS_COLOR': {
                const prompt = getBonusColorPrompt(snapshot);
                if (!prompt) {
                    break;
                }
                for (const color of prompt.allowedColors) {
                    appendAction(
                        snapshot,
                        actions,
                        `bonus-color-${color}`,
                        `Set Bonus Color ${color}`,
                        {
                            type: 'SELECT_BONUS_COLOR',
                            effectId: prompt.effectId,
                            color,
                        }
                    );
                }
                break;
            }
        }
    }

    return actions;
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

const buildVisibleSnapshot = (snapshot: GameSnapshot, viewer: ViewerId) =>
    viewer === 'spectator' ? toSpectatorSnapshot(snapshot) : toPlayerSnapshot(snapshot, viewer);

export const buildUiViewModel = (snapshot: GameSnapshot, viewer: ViewerId = 'p1'): UiViewModel => ({
    title: `Gem Duel ${snapshot.context.mode.toUpperCase()} Match`,
    subtitle: `Phase: ${snapshot.context.phase} | Turn: ${snapshot.context.currentPlayer} | Segment: ${snapshot.context.turn.segment}`,
    snapshot: buildVisibleSnapshot(snapshot, viewer),
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
            viewModel(viewer = 'p1') {
                return buildUiViewModel(readSnapshot(actor), viewer);
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

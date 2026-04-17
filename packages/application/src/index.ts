import {
    type GameCommand,
    type GameSnapshot,
    type ReplayBundle,
    type ReplayCommand,
    type RoomDetail,
    type TypedResult,
    type UiActionDescriptor,
    type UiViewModel,
    type VisibleSnapshot,
    toPlayerSnapshot,
    toSpectatorSnapshot,
} from '@gem-duel/contracts';
import {
    createClockPort,
    createEnginePorts,
    createIdPort,
    createSeededRng,
} from '@gem-duel/adapters';
import {
    attachMatchToRun,
    buildReplayBundle,
    buildRunContext,
    createMatchActor,
    createMatchActorFromSnapshot,
    createRunState as createEngineRunState,
    dispatchCommand,
    finalizeRunMatch,
    getAllowedCommands,
    getPrivilegePositionCap,
    readSnapshot,
    selectRunReward,
    validateDispatch,
    verifyReplayBundle,
    type EnginePorts,
} from '@gem-duel/core-engine';
import {
    createDefaultMetaState,
    createDomainError,
    type BuffId,
    type GameMode,
    type MatchFlags,
    type MetaState,
    type RunContext,
    type RunState,
} from '@gem-duel/domain';

export type ViewerId = GameSnapshot['context']['currentPlayer'] | 'spectator';

export interface MatchSession {
    dispatch(command: GameCommand): TypedResult<GameSnapshot>;
    snapshot(): GameSnapshot;
    replay(): ReplayBundle;
    replayInspector(): TypedResult<ReplayInspectorModel>;
    viewModel(viewer?: ViewerId): UiViewModel;
    aiTrace(): AiDecisionTrace[];
}

export interface MatchSessionInput {
    seed: number;
    mode: GameMode;
    flags: MatchFlags;
    runContext?: RunContext | null;
}

export interface ShellMatchSessionInput {
    seed: number;
    flags: MatchFlags;
    runContext?: RunContext | null;
}

export interface ReplayInspectorStep {
    index: number;
    label: string;
    command: ReplayCommand | null;
    snapshot: GameSnapshot;
}

export interface ReplayInspectorModel {
    finalStateHash: string;
    recomputedFinalStateHash: string;
    matchesHash: boolean;
    matchesEvents: boolean;
    steps: ReplayInspectorStep[];
}

export interface AiDecisionCandidate {
    actionId: string;
    label: string;
    commandType: GameCommand['type'];
    score: number;
}

export interface AiDecisionTrace {
    decisionIndex: number;
    player: ViewerId;
    sequence: number;
    chosenActionId: string;
    chosenCommandType: GameCommand['type'];
    candidates: AiDecisionCandidate[];
}

export interface RunSessionInput {
    seed: number;
    mode: 'local' | 'ai';
    metaState?: MetaState;
}

export interface RunSession {
    state(): RunState;
    metaState(): MetaState;
    match(): MatchSession | null;
    dispatch(command: GameCommand): TypedResult<GameSnapshot>;
    snapshot(): GameSnapshot | null;
    viewModel(viewer?: ViewerId): UiViewModel | null;
    selectReward(buffId: BuffId): TypedResult<RunState>;
    replay(): ReplayBundle | null;
    replayInspector(): TypedResult<ReplayInspectorModel> | null;
    aiTrace(): AiDecisionTrace[];
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

const buildPositionSelections = <T>(positions: T[], maxCount: number) => {
    const selections = positions.map((position) => [position]);
    if (maxCount < 2) {
        return selections;
    }

    for (let left = 0; left < positions.length; left += 1) {
        for (let right = left + 1; right < positions.length; right += 1) {
            const first = positions[left];
            const second = positions[right];
            if (!first || !second) {
                continue;
            }
            selections.push([first, second]);
        }
    }

    return selections;
};

export const buildReplayInspectorModel = (
    bundle: ReplayBundle
): TypedResult<ReplayInspectorModel> => {
    const verification = verifyReplayBundle(bundle, createEnginePorts(bundle.seed));
    if (!verification.ok) {
        return verification;
    }

    const actor = createMatchActorFromSnapshot(
        bundle.initialSnapshot,
        createEnginePorts(bundle.seed)
    );
    const steps: ReplayInspectorStep[] = [
        {
            index: 0,
            label: 'Initial Snapshot',
            command: null,
            snapshot: readSnapshot(actor),
        },
    ];

    for (const [index, replayCommand] of bundle.commands.entries()) {
        const result = dispatchCommand(actor, replayCommand.command);
        if (!result.ok) {
            return result;
        }
        steps.push({
            index: index + 1,
            label: `${replayCommand.command.type} #${index + 1}`,
            command: replayCommand,
            snapshot: result.value.snapshot,
        });
    }

    return {
        ok: true,
        value: {
            finalStateHash: bundle.finalStateHash,
            recomputedFinalStateHash: verification.value.recomputedFinalStateHash,
            matchesHash: verification.value.matchesHash,
            matchesEvents: verification.value.matchesEvents,
            steps,
        },
    };
};

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
                for (const positions of buildPositionSelections(
                    getNonGoldBoardCells(snapshot).map((cell) => cell.positionId),
                    getPrivilegePositionCap(snapshot, snapshot.context.currentPlayer)
                )) {
                    appendAction(
                        snapshot,
                        actions,
                        `privilege-${positions.join('-')}`,
                        `Use Privilege on ${positions.join(', ')}`,
                        { type: 'USE_PRIVILEGE', positions }
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

const hashText = (value: string) => {
    let hash = 2166136261;
    for (const char of value) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const getBuyCardLabel = (
    snapshot: GameSnapshot,
    action: Extract<GameCommand, { type: 'BUY_CARD' }>
) => {
    const source = action.source;
    if (source.kind === 'pyramid') {
        return snapshot.pyramid
            .find((row) => row.level === source.level)
            ?.slots.find((slot) => slot.slot === source.slot)?.card;
    }

    return snapshot.players[snapshot.context.currentPlayer].reserveSlots.find(
        (slot) => slot.slotId === source.slotId
    )?.card;
};

const getReserveCardLabel = (
    snapshot: GameSnapshot,
    action: Extract<GameCommand, { type: 'RESERVE_CARD' }>
) => {
    const source = action.source;
    if (source.kind !== 'pyramid') {
        return null;
    }

    return snapshot.pyramid
        .find((row) => row.level === source.level)
        ?.slots.find((slot) => slot.slot === source.slot)?.card;
};

const scoreAiAction = (
    snapshot: GameSnapshot,
    action: UiActionDescriptor,
    seed: number,
    decisionIndex: number
) => {
    const tieBreaker = (hashText(`${seed}:${decisionIndex}:${action.id}`) % 1000) / 1000;
    const command = action.command;
    switch (command.type) {
        case 'BUY_CARD': {
            const card = getBuyCardLabel(snapshot, command);
            const abilityBonus =
                card?.ability === 'again'
                    ? 30
                    : card?.ability === 'bonus_gem'
                      ? 20
                      : card?.ability === 'steal'
                        ? 18
                        : card?.ability === 'scroll'
                          ? 16
                          : 0;
            return (
                300 +
                (card?.points ?? 0) * 25 +
                (card?.crowns ?? 0) * 20 +
                abilityBonus +
                tieBreaker
            );
        }
        case 'SELECT_ROYAL': {
            const royal = snapshot.royalSupply.find((card) => card.royalId === command.royalId);
            return 280 + (royal?.points ?? 0) * 20 + (royal?.crowns ?? 0) * 16 + tieBreaker;
        }
        case 'TAKE_EFFECT_BOARD_TOKEN':
            return 250 + tieBreaker;
        case 'STEAL_OPPONENT_TOKEN':
            return 240 + tieBreaker;
        case 'SELECT_BONUS_COLOR':
            return 230 + tieBreaker;
        case 'USE_PRIVILEGE':
            return 210 + command.positions.length * 20 + tieBreaker;
        case 'TAKE_TOKENS':
            return 180 + command.positions.length * 18 + tieBreaker;
        case 'RESERVE_CARD': {
            const card = getReserveCardLabel(snapshot, command);
            return 150 + (card?.level ?? command.source.level) * 12 + tieBreaker;
        }
        case 'BEGIN_BUY':
            return 140 + tieBreaker;
        case 'BEGIN_GEM_SELECTION':
            return 120 + tieBreaker;
        case 'BEGIN_RESERVE':
            return 100 + tieBreaker;
        case 'BEGIN_PRIVILEGE':
            return 90 + tieBreaker;
        case 'REPLENISH_BOARD':
            return 40 + tieBreaker;
        case 'DISCARD_TOKEN':
            return (command.color === 'gold' ? 5 : 25) + tieBreaker;
        case 'ENTER_REPLAY':
        case 'EXIT_REPLAY':
            return -100 + tieBreaker;
        default:
            return tieBreaker;
    }
};

const chooseAiAction = (
    snapshot: GameSnapshot,
    actions: UiActionDescriptor[],
    seed: number,
    decisionIndex: number
): { chosen: UiActionDescriptor; trace: AiDecisionTrace } | null => {
    if (actions.length === 0) {
        return null;
    }

    const ranked = [...actions]
        .map((action) => ({
            action,
            score: scoreAiAction(snapshot, action, seed, decisionIndex),
        }))
        .sort((left, right) => right.score - left.score);
    const [chosen] = ranked;
    if (!chosen) {
        return null;
    }

    return {
        chosen: chosen.action,
        trace: {
            decisionIndex,
            player: snapshot.context.currentPlayer,
            sequence: snapshot.sequence,
            chosenActionId: chosen.action.id,
            chosenCommandType: chosen.action.command.type,
            candidates: ranked.map((entry) => ({
                actionId: entry.action.id,
                label: entry.action.label,
                commandType: entry.action.command.type,
                score: Number(entry.score.toFixed(3)),
            })),
        },
    };
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

const buildUiTitle = (snapshot: VisibleSnapshot | GameSnapshot) =>
    `Gem Duel ${snapshot.context.mode.toUpperCase()} Match`;

const buildUiSubtitle = (snapshot: VisibleSnapshot | GameSnapshot) =>
    [
        `Phase: ${snapshot.context.phase}`,
        `Turn: ${snapshot.context.currentPlayer}`,
        `Segment: ${snapshot.context.turn.segment}`,
        snapshot.runContext
            ? `Run ${snapshot.runContext.matchIndex} | W ${snapshot.runContext.wins} | L ${snapshot.runContext.losses}`
            : null,
    ]
        .filter(Boolean)
        .join(' | ');

export const buildVisibleUiViewModel = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[] = []
): UiViewModel => ({
    title: buildUiTitle(snapshot),
    subtitle: buildUiSubtitle(snapshot),
    snapshot,
    availableActions,
});

export const buildRoomUiViewModel = (
    room: Pick<RoomDetail, 'snapshot' | 'availableActions'>
): UiViewModel | null =>
    room.snapshot ? buildVisibleUiViewModel(room.snapshot, room.availableActions) : null;

const canViewerAct = (snapshot: GameSnapshot, viewer: ViewerId) =>
    viewer !== 'spectator' && viewer === snapshot.context.currentPlayer;

export const buildUiViewModel = (snapshot: GameSnapshot, viewer: ViewerId = 'p1'): UiViewModel =>
    buildVisibleUiViewModel(
        buildVisibleSnapshot(snapshot, viewer),
        canViewerAct(snapshot, viewer) ? buildActions(snapshot) : []
    );

export const createMatchSession = (
    input: MatchSessionInput,
    ports: EnginePorts
): TypedResult<MatchSession> => {
    const actor = createMatchActor(input, ports);
    const initialSnapshot = readSnapshot(actor);
    const commandLog: ReplayCommand[] = [];
    const aiDecisionLog: AiDecisionTrace[] = [];

    const recordedDispatch = (command: GameCommand) => {
        const snapshotBefore = readSnapshot(actor);
        const replayCommand = createReplayCommand(snapshotBefore, command, commandLog.length);
        const result = dispatchCommand(actor, command);
        if (result.ok) {
            commandLog.push(replayCommand);
        }
        return result;
    };

    const resolveAiTurns = (): TypedResult<GameSnapshot> => {
        if (input.mode !== 'ai') {
            return {
                ok: true,
                value: readSnapshot(actor),
            };
        }

        while (readSnapshot(actor).context.phase !== 'terminal') {
            const currentSnapshot = readSnapshot(actor);
            if (currentSnapshot.context.currentPlayer !== 'p2') {
                break;
            }

            const aiView = buildUiViewModel(currentSnapshot, 'p2');
            const decision = chooseAiAction(
                currentSnapshot,
                aiView.availableActions,
                input.seed,
                aiDecisionLog.length
            );
            if (!decision) {
                break;
            }

            aiDecisionLog.push(decision.trace);
            const result = recordedDispatch(decision.chosen.command);
            if (!result.ok) {
                return result;
            }
        }

        return {
            ok: true,
            value: readSnapshot(actor),
        };
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

    const aiBootstrap = resolveAiTurns();
    if (!aiBootstrap.ok) {
        return aiBootstrap;
    }

    return {
        ok: true,
        value: {
            dispatch(command) {
                const result = recordedDispatch(command);
                if (!result.ok) {
                    return result;
                }
                const aiResult = resolveAiTurns();
                if (!aiResult.ok) {
                    return aiResult;
                }
                return {
                    ok: true,
                    value: aiResult.value,
                };
            },
            snapshot() {
                return readSnapshot(actor);
            },
            replay() {
                return buildReplayBundle(initialSnapshot, [...commandLog], readSnapshot(actor));
            },
            replayInspector() {
                return buildReplayInspectorModel(
                    buildReplayBundle(initialSnapshot, [...commandLog], readSnapshot(actor))
                );
            },
            viewModel(viewer = 'p1') {
                return buildUiViewModel(readSnapshot(actor), viewer);
            },
            aiTrace() {
                return structuredClone(aiDecisionLog);
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
            runContext: input.runContext ?? null,
        },
        createEnginePorts(input.seed)
    );

export const createAiMatchSession = (input: ShellMatchSessionInput): TypedResult<MatchSession> =>
    createMatchSession(
        {
            seed: input.seed,
            mode: 'ai',
            flags: input.flags,
            runContext: input.runContext ?? null,
        },
        createEnginePorts(input.seed)
    );

const buildRunMatchFlags = (mode: 'local' | 'ai'): MatchFlags => ({
    roguelike: true,
    onlineAuthoritative: false,
    aiEnabled: mode === 'ai',
});

const deriveRunMatchSeed = (seed: number, matchIndex: number) => seed + matchIndex - 1;

export const createRunSession = (input: RunSessionInput): TypedResult<RunSession> => {
    const ports = {
        rng: createSeededRng(input.seed, 'run-root'),
        clock: createClockPort(),
        id: createIdPort('run'),
    } satisfies EnginePorts;
    let currentMetaState = structuredClone(
        input.metaState ?? createDefaultMetaState('local-profile')
    );
    let currentRunState = createEngineRunState({
        seed: input.seed,
        mode: input.mode,
        metaState: currentMetaState,
        ports,
    });
    let currentMatchSession: MatchSession | null = null;

    const startNextMatch = (): TypedResult<RunState> => {
        const matchSeed = deriveRunMatchSeed(input.seed, currentRunState.matchIndex);
        const matchResult = createMatchSession(
            {
                seed: matchSeed,
                mode: input.mode,
                flags: buildRunMatchFlags(input.mode),
                runContext: buildRunContext(currentRunState),
            },
            {
                rng: createSeededRng(
                    matchSeed,
                    `run/${currentRunState.runId}/match/${currentRunState.matchIndex}`
                ),
                clock: ports.clock,
                id: ports.id,
            }
        );

        if (!matchResult.ok) {
            return matchResult;
        }

        currentMatchSession = matchResult.value;
        currentRunState = attachMatchToRun(currentRunState, currentMatchSession.snapshot());
        return {
            ok: true,
            value: currentRunState,
        };
    };

    const finalizeIfTerminal = () => {
        if (!currentMatchSession) {
            return null;
        }

        const snapshot = currentMatchSession.snapshot();
        if (snapshot.context.phase !== 'terminal') {
            return null;
        }

        const finalized = finalizeRunMatch(
            currentRunState,
            snapshot,
            currentMetaState,
            ports,
            ports.clock.now()
        );
        if (!finalized.ok) {
            return finalized;
        }

        currentRunState = finalized.value.runState;
        currentMetaState = finalized.value.metaState;
        return finalized;
    };

    return {
        ok: true,
        value: {
            state() {
                return structuredClone(currentRunState);
            },
            metaState() {
                return structuredClone(currentMetaState);
            },
            match() {
                return currentMatchSession;
            },
            dispatch(command) {
                if (!currentMatchSession) {
                    return {
                        ok: false,
                        error: createDomainError(
                            'ENGINE_PHASE_GUARD',
                            'rules',
                            'There is no active run match to receive commands.'
                        ),
                    };
                }

                const result = currentMatchSession.dispatch(command);
                if (!result.ok) {
                    return result;
                }

                const finalized = finalizeIfTerminal();
                if (finalized && !finalized.ok) {
                    return finalized;
                }

                return result;
            },
            snapshot() {
                return currentMatchSession?.snapshot() ?? null;
            },
            viewModel(viewer = 'p1') {
                return currentMatchSession?.viewModel(viewer) ?? null;
            },
            selectReward(buffId) {
                const selection = selectRunReward(currentRunState, buffId);
                if (!selection.ok) {
                    return selection;
                }

                currentRunState = selection.value;
                return startNextMatch();
            },
            replay() {
                return currentMatchSession?.replay() ?? null;
            },
            replayInspector() {
                return currentMatchSession ? currentMatchSession.replayInspector() : null;
            },
            aiTrace() {
                return currentMatchSession?.aiTrace() ?? [];
            },
        },
    };
};

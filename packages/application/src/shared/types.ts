import type {
    GameCommand,
    GameSnapshot,
    ReplayBundle,
    ReplayCommand,
    TypedResult,
    UiViewModel,
} from '@gem-duel/contracts';
import type {
    BuffId,
    GameMode,
    MatchFlags,
    MetaState,
    RunContext,
    RunState,
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

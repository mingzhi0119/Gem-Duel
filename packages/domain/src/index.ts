export const RULESET_VERSION = '2026.1';
export const GAME_MODES = ['local', 'ai', 'online'] as const;
export const GAME_PHASES = [
    'initialization',
    'modeSelection',
    'turnIdle',
    'gemSelection',
    'reserving',
    'buying',
    'privilege',
    'replay',
    'terminal',
] as const;
export const PLAYER_IDS = ['p1', 'p2'] as const;
export const GEM_COLORS = ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'] as const;
export const BONUS_COLORS = ['blue', 'white', 'green', 'black', 'red'] as const;
export const PRINTED_BONUS_COLORS = [...BONUS_COLORS, 'gold', null] as const;
export const STEALABLE_GEM_COLORS = ['blue', 'white', 'green', 'black', 'red', 'pearl'] as const;
export const CARD_LEVELS = [1, 2, 3] as const;
export const DECK_LEVEL_KEYS = ['level1', 'level2', 'level3'] as const;
export const RESERVE_SLOT_IDS = ['reserve-1', 'reserve-2', 'reserve-3'] as const;
export const TURN_SEGMENTS = ['optional', 'mandatory', 'cleanup'] as const;
export const OPTIONAL_TURN_STEPS = ['privilege', 'replenish', 'done'] as const;
export const JEWEL_CARD_ABILITIES = ['none', 'again', 'steal', 'scroll', 'bonus_gem'] as const;
export const VICTORY_REASONS = ['points', 'crowns', 'singleColor'] as const;
export const BOARD_POSITION_IDS = [
    'r2c2',
    'r2c3',
    'r3c3',
    'r3c2',
    'r3c1',
    'r2c1',
    'r1c1',
    'r1c2',
    'r1c3',
    'r1c4',
    'r2c4',
    'r3c4',
    'r4c4',
    'r4c3',
    'r4c2',
    'r4c1',
    'r4c0',
    'r3c0',
    'r2c0',
    'r1c0',
    'r0c0',
    'r0c1',
    'r0c2',
    'r0c3',
    'r0c4',
] as const;
export const EFFECT_ATOMS = [
    'grant_privilege',
    'take_opponent_token',
    'gain_royal',
    'take_extra_turn',
    'discard_to_limit',
    'take_board_token',
    'override_bonus_color',
] as const;
export const EFFECT_HOOK_POINTS = [
    'BEFORE_USE_PRIVILEGE',
    'AFTER_USE_PRIVILEGE',
    'BEFORE_REPLENISH_BOARD',
    'AFTER_REPLENISH_BOARD',
    'BEFORE_TAKE_TOKENS',
    'AFTER_TAKE_TOKENS',
    'BEFORE_RESERVE_CARD',
    'AFTER_RESERVE_CARD',
    'BEFORE_BUY_CARD',
    'AFTER_BUY_CARD',
    'BEFORE_GAIN_ROYAL',
    'AFTER_GAIN_ROYAL',
    'BEFORE_EXTRA_TURN',
    'AFTER_EXTRA_TURN',
    'BEFORE_DISCARD_TO_LIMIT',
    'AFTER_DISCARD_TO_LIMIT',
    'BEFORE_VICTORY_CHECK',
    'AFTER_VICTORY_CHECK',
    'BEFORE_MATCH_SETUP',
    'AFTER_MATCH_SETUP',
    'BEFORE_BUFF_ACQUISITION',
    'AFTER_BUFF_ACQUISITION',
    'BEFORE_RUN_REWARD_SELECTION',
    'AFTER_RUN_REWARD_SELECTION',
] as const;
export const EFFECT_SOURCES = [
    'optional_action',
    'mandatory_action',
    'card_ability',
    'royal_reward',
    'buff_hook',
    'end_of_turn',
    'run_reward',
] as const;
export const EFFECT_EXECUTION_SCOPES = [
    'active_player',
    'opposing_player',
    'global_match',
    'global_run',
] as const;
export const EFFECT_LIFECYCLE_STAGES = ['scheduled', 'running', 'completed'] as const;
export const EFFECT_OUTCOMES = ['resolved', 'skipped', 'cancelled'] as const;
export const ERROR_CATEGORIES = [
    'validation',
    'rules',
    'conflict',
    'infra',
    'authz',
    'desync',
] as const;

const BOARD_POSITION_COORDINATES = Object.freeze({
    r0c0: { row: 0, col: 0 },
    r0c1: { row: 0, col: 1 },
    r0c2: { row: 0, col: 2 },
    r0c3: { row: 0, col: 3 },
    r0c4: { row: 0, col: 4 },
    r1c0: { row: 1, col: 0 },
    r1c1: { row: 1, col: 1 },
    r1c2: { row: 1, col: 2 },
    r1c3: { row: 1, col: 3 },
    r1c4: { row: 1, col: 4 },
    r2c0: { row: 2, col: 0 },
    r2c1: { row: 2, col: 1 },
    r2c2: { row: 2, col: 2 },
    r2c3: { row: 2, col: 3 },
    r2c4: { row: 2, col: 4 },
    r3c0: { row: 3, col: 0 },
    r3c1: { row: 3, col: 1 },
    r3c2: { row: 3, col: 2 },
    r3c3: { row: 3, col: 3 },
    r3c4: { row: 3, col: 4 },
    r4c0: { row: 4, col: 0 },
    r4c1: { row: 4, col: 1 },
    r4c2: { row: 4, col: 2 },
    r4c3: { row: 4, col: 3 },
    r4c4: { row: 4, col: 4 },
}) satisfies Record<
    (typeof BOARD_POSITION_IDS)[number],
    {
        row: number;
        col: number;
    }
>;

export type RuleSetVersion = typeof RULESET_VERSION;
export type GameMode = (typeof GAME_MODES)[number];
export type GamePhase = (typeof GAME_PHASES)[number];
export type PlayerId = (typeof PLAYER_IDS)[number];
export type GemColor = (typeof GEM_COLORS)[number];
export type BonusColor = (typeof BONUS_COLORS)[number];
export type PrintedBonusColor = BonusColor | 'gold' | null;
export type StealableGemColor = (typeof STEALABLE_GEM_COLORS)[number];
export type CardLevel = (typeof CARD_LEVELS)[number];
export type DeckLevelKey = (typeof DECK_LEVEL_KEYS)[number];
export type ReserveSlotId = (typeof RESERVE_SLOT_IDS)[number];
export type TurnSegment = (typeof TURN_SEGMENTS)[number];
export type OptionalTurnStep = (typeof OPTIONAL_TURN_STEPS)[number];
export type JewelCardAbility = (typeof JEWEL_CARD_ABILITIES)[number];
export type VictoryReason = (typeof VICTORY_REASONS)[number];
export type BoardPositionId = (typeof BOARD_POSITION_IDS)[number];
export type EffectAtom = (typeof EFFECT_ATOMS)[number];
export type EffectHookPoint = (typeof EFFECT_HOOK_POINTS)[number];
export type EffectSource = (typeof EFFECT_SOURCES)[number];
export type EffectExecutionScope = (typeof EFFECT_EXECUTION_SCOPES)[number];
export type EffectLifecycleStage = (typeof EFFECT_LIFECYCLE_STAGES)[number];
export type EffectOutcome = (typeof EFFECT_OUTCOMES)[number];
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export interface DomainError {
    code: string;
    category: ErrorCategory;
    message: string;
    recoverable: boolean;
    details?: Record<string, unknown>;
}

export interface GemInventory {
    blue: number;
    white: number;
    green: number;
    black: number;
    red: number;
    pearl: number;
    gold: number;
}

export interface JewelCardState {
    cardId: string;
    level: CardLevel;
    points: number;
    crowns: number;
    printedBonusColor: PrintedBonusColor;
    bonusColor: BonusColor | null;
    bonusCount: number;
    cost: GemInventory;
    ability: JewelCardAbility;
}

export interface RoyalCardState {
    royalId: string;
    points: number;
    crowns: number;
    ability: JewelCardAbility;
    label: string;
}

export interface BoardCellState {
    positionId: BoardPositionId;
    row: number;
    col: number;
    token: GemColor | null;
}

export interface PyramidSlotState {
    level: CardLevel;
    slot: number;
    card: JewelCardState | null;
}

export interface PyramidRowState {
    level: CardLevel;
    slots: PyramidSlotState[];
}

export interface ReserveSlotState {
    slotId: ReserveSlotId;
    sourceLevel: CardLevel | null;
    card: JewelCardState | null;
}

export interface PublicReserveSlotState {
    slotId: ReserveSlotId;
    occupied: boolean;
}

export interface PlayerState {
    id: PlayerId;
    score: number;
    crowns: number;
    privileges: number;
    inventory: GemInventory;
    reserveSlots: ReserveSlotState[];
    tableau: JewelCardState[];
    royals: RoyalCardState[];
}

export interface PublicPlayerState {
    id: PlayerId;
    score: number;
    crowns: number;
    privileges: number;
    inventory: GemInventory;
    reserveSlots: PublicReserveSlotState[];
    tableau: JewelCardState[];
    royals: RoyalCardState[];
}

export interface MatchFlags {
    roguelike: boolean;
    onlineAuthoritative: boolean;
    aiEnabled: boolean;
}

export interface TurnState {
    turnNumber: number;
    segment: TurnSegment;
    optionalStep: OptionalTurnStep;
    mandatoryActionTaken: boolean;
    pendingDiscardCount: number;
}

export interface MatchContext {
    matchId: string;
    schemaVersion: string;
    rulesetVersion: RuleSetVersion;
    seed: number;
    mode: GameMode;
    phase: GamePhase;
    step: number;
    currentPlayer: PlayerId;
    winner: PlayerId | null;
    victoryReason: VictoryReason | null;
    flags: MatchFlags;
    turn: TurnState;
}

export interface ActiveEffect {
    effectId: string;
    parentEffectId: string | null;
    atom: EffectAtom;
    hookPoint: EffectHookPoint;
    source: EffectSource;
    scope: EffectExecutionScope;
    owner: PlayerId | null;
    sequence: number;
    stage: EffectLifecycleStage;
    rngNamespace: string;
}

export interface RoyalSelectionPrompt {
    effectId: string;
    atom: 'gain_royal';
    milestone: 3 | 6;
    royalIds: string[];
}

export interface BoardTokenPrompt {
    effectId: string;
    atom: 'take_board_token';
    allowedColors: BonusColor[];
    count: number;
}

export interface OpponentTokenPrompt {
    effectId: string;
    atom: 'take_opponent_token';
    targetPlayer: PlayerId;
    allowedColors: StealableGemColor[];
}

export interface BonusColorPrompt {
    effectId: string;
    atom: 'override_bonus_color';
    cardId: string;
    allowedColors: BonusColor[];
}

export interface DiscardPrompt {
    effectId: string;
    atom: 'discard_to_limit';
    remaining: number;
}

export type EffectPrompt =
    | RoyalSelectionPrompt
    | BoardTokenPrompt
    | OpponentTokenPrompt
    | BonusColorPrompt
    | DiscardPrompt;

export interface HiddenState {
    bag: GemColor[];
    deckOrder: Record<DeckLevelKey, string[]>;
    extraTurns: Record<PlayerId, number>;
}

export interface MatchState {
    context: MatchContext;
    board: BoardCellState[];
    pyramid: PyramidRowState[];
    royalSupply: RoyalCardState[];
    privilegeSupply: number;
    players: Record<PlayerId, PlayerState>;
    sequence: number;
    replayCursor: number | null;
    activeEffects: ActiveEffect[];
    effectPrompts: EffectPrompt[];
    hiddenState: HiddenState;
}

export interface RunState {
    runId: string;
    seed: number;
    activeMatchId: string | null;
    buffIds: string[];
    relicIds: string[];
    wins: number;
    losses: number;
    status: 'draft' | 'active' | 'completed';
}

export interface MetaState {
    profileId: string;
    unlockedBuffIds: string[];
    unlockedDifficultyIds: string[];
    completedRunIds: string[];
    totalRuns: number;
    lastUpdatedAt: string | null;
}

export interface NamespacedRng {
    next(): number;
    nextInt(maxExclusive: number): number;
    fork(namespace: string): NamespacedRng;
}

export interface ScoreSummary {
    p1: number;
    p2: number;
}

export const createEmptyInventory = (): GemInventory => ({
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
});

export const createReserveSlots = (): ReserveSlotState[] =>
    RESERVE_SLOT_IDS.map((slotId) => ({
        slotId,
        sourceLevel: null,
        card: null,
    }));

export const createPublicReserveSlots = (): PublicReserveSlotState[] =>
    RESERVE_SLOT_IDS.map((slotId) => ({
        slotId,
        occupied: false,
    }));

export const createPlayerState = (id: PlayerId): PlayerState => ({
    id,
    score: 0,
    crowns: 0,
    privileges: 0,
    inventory: createEmptyInventory(),
    reserveSlots: createReserveSlots(),
    tableau: [],
    royals: [],
});

export const createTurnState = (): TurnState => ({
    turnNumber: 1,
    segment: 'optional',
    optionalStep: 'privilege',
    mandatoryActionTaken: false,
    pendingDiscardCount: 0,
});

export const createEmptyBoard = (): BoardCellState[] =>
    BOARD_POSITION_IDS.map((positionId) => ({
        positionId,
        row: BOARD_POSITION_COORDINATES[positionId].row,
        col: BOARD_POSITION_COORDINATES[positionId].col,
        token: null,
    }));

export const createHiddenState = (): HiddenState => ({
    bag: [],
    deckOrder: {
        level1: [],
        level2: [],
        level3: [],
    },
    extraTurns: {
        p1: 0,
        p2: 0,
    },
});

export const getBoardPositionCoordinate = (positionId: BoardPositionId) =>
    BOARD_POSITION_COORDINATES[positionId];

export const createDomainError = (
    code: string,
    category: ErrorCategory,
    message: string,
    details?: Record<string, unknown>
): DomainError => ({
    code,
    category,
    message,
    recoverable: category !== 'infra',
    details,
});

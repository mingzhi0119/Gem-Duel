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
    'royalResolution',
    'buffResolution',
    'replay',
    'terminal',
] as const;
export const PLAYER_IDS = ['p1', 'p2'] as const;
export const GEM_COLORS = ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'] as const;
export const EFFECT_ATOMS = [
    'grant_privilege',
    'take_opponent_token',
    'gain_royal',
    'take_extra_turn',
    'discard_to_limit',
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
    'BEFORE_ROYAL_RESOLUTION',
    'AFTER_ROYAL_RESOLUTION',
    'BEFORE_BUFF_RESOLUTION',
    'AFTER_BUFF_RESOLUTION',
    'BEFORE_DISCARD_TO_LIMIT',
    'AFTER_DISCARD_TO_LIMIT',
    'BEFORE_VICTORY_CHECK',
    'AFTER_VICTORY_CHECK',
] as const;
export const ERROR_CATEGORIES = [
    'validation',
    'rules',
    'conflict',
    'infra',
    'authz',
    'desync',
] as const;

export type RuleSetVersion = typeof RULESET_VERSION;
export type GameMode = (typeof GAME_MODES)[number];
export type GamePhase = (typeof GAME_PHASES)[number];
export type PlayerId = (typeof PLAYER_IDS)[number];
export type GemColor = (typeof GEM_COLORS)[number];
export type EffectAtom = (typeof EFFECT_ATOMS)[number];
export type EffectHookPoint = (typeof EFFECT_HOOK_POINTS)[number];
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

export interface PlayerState {
    id: PlayerId;
    score: number;
    crowns: number;
    privileges: number;
    reservedCards: number;
    tableauCards: number;
    inventory: GemInventory;
}

export interface MatchFlags {
    roguelike: boolean;
    onlineAuthoritative: boolean;
    aiEnabled: boolean;
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
    flags: MatchFlags;
}

export interface PendingEffect {
    effectId: string;
    atom: EffectAtom;
    hookPoint: EffectHookPoint;
    owner: PlayerId | null;
    sequence: number;
}

export interface HiddenState {
    bag: GemColor[];
    deckOrder: Record<string, string[]>;
    extraTurns: Record<PlayerId, number>;
}

export interface MatchState {
    context: MatchContext;
    gemBank: GemInventory;
    players: Record<PlayerId, PlayerState>;
    sequence: number;
    replayCursor: number | null;
    pendingEffects: PendingEffect[];
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

export const createInitialGemBank = (): GemInventory => ({
    blue: 4,
    white: 4,
    green: 4,
    black: 4,
    red: 4,
    pearl: 2,
    gold: 3,
});

export const createPlayerState = (id: PlayerId): PlayerState => ({
    id,
    score: 0,
    crowns: 0,
    privileges: id === 'p2' ? 1 : 0,
    reservedCards: 0,
    tableauCards: 0,
    inventory: createEmptyInventory(),
});

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

import { z } from 'zod';
import {
    EFFECT_ATOMS,
    EFFECT_HOOK_POINTS,
    ERROR_CATEGORIES,
    GAME_MODES,
    GAME_PHASES,
    GEM_COLORS,
    PLAYER_IDS,
    RULESET_VERSION,
    type DomainError,
    type HiddenState,
    type MatchContext,
    type MatchFlags,
    type MatchState,
    type PendingEffect,
    type PlayerId,
    type PlayerState,
} from '@gem-duel/domain';

export const SCHEMA_VERSION = '2.0.0';
export const ENGINE_VERSION = '2026.04-step2-prep';

export const PlayerIdSchema = z.enum(PLAYER_IDS);
export const GameModeSchema = z.enum(GAME_MODES);
export const GamePhaseSchema = z.enum(GAME_PHASES);
export const GemColorSchema = z.enum(GEM_COLORS);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);
export const EffectAtomSchema = z.enum(EFFECT_ATOMS);
export const EffectHookPointSchema = z.enum(EFFECT_HOOK_POINTS);

export const MatchFlagsSchema = z.object({
    roguelike: z.boolean(),
    onlineAuthoritative: z.boolean(),
    aiEnabled: z.boolean(),
}) satisfies z.ZodType<MatchFlags>;

export const GemInventorySchema = z.object({
    blue: z.number().int().min(0),
    white: z.number().int().min(0),
    green: z.number().int().min(0),
    black: z.number().int().min(0),
    red: z.number().int().min(0),
    pearl: z.number().int().min(0),
    gold: z.number().int().min(0),
});

export const PlayerStateSchema = z.object({
    id: PlayerIdSchema,
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    privileges: z.number().int().min(0),
    reservedCards: z.number().int().min(0),
    tableauCards: z.number().int().min(0),
    inventory: GemInventorySchema,
}) satisfies z.ZodType<PlayerState>;

export const PlayersByIdSchema = z.object({
    p1: PlayerStateSchema,
    p2: PlayerStateSchema,
});

export const MatchContextSchema = z.object({
    matchId: z.string().min(1),
    schemaVersion: z.string().min(1),
    rulesetVersion: z.literal(RULESET_VERSION),
    seed: z.number().int().nonnegative(),
    mode: GameModeSchema,
    phase: GamePhaseSchema,
    step: z.number().int().min(0),
    currentPlayer: PlayerIdSchema,
    winner: PlayerIdSchema.nullable(),
    flags: MatchFlagsSchema,
}) satisfies z.ZodType<MatchContext>;

export const PendingEffectSchema = z.object({
    effectId: z.string().min(1),
    atom: EffectAtomSchema,
    hookPoint: EffectHookPointSchema,
    owner: PlayerIdSchema.nullable(),
    sequence: z.number().int().min(0),
}) satisfies z.ZodType<PendingEffect>;

export const HiddenStateSchema = z.object({
    bag: z.array(GemColorSchema),
    deckOrder: z.record(z.array(z.string().min(1))),
    extraTurns: z.object({
        p1: z.number().int().min(0),
        p2: z.number().int().min(0),
    }),
}) satisfies z.ZodType<HiddenState>;

export const GameCommandSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('SELECT_MODE'),
        mode: GameModeSchema,
        flags: MatchFlagsSchema,
    }),
    z.object({
        type: z.literal('START_MATCH'),
    }),
    z.object({
        type: z.literal('BEGIN_GEM_SELECTION'),
    }),
    z.object({
        type: z.literal('TAKE_GEM'),
        color: GemColorSchema,
    }),
    z.object({
        type: z.literal('BEGIN_RESERVE'),
    }),
    z.object({
        type: z.literal('RESERVE_CARD'),
        slot: z.number().int().min(1).max(3),
    }),
    z.object({
        type: z.literal('BEGIN_BUY'),
    }),
    z.object({
        type: z.literal('BUY_CARD'),
        scoreGain: z.number().int().min(0).max(5),
    }),
    z.object({
        type: z.literal('BEGIN_PRIVILEGE'),
    }),
    z.object({
        type: z.literal('USE_PRIVILEGE'),
        color: GemColorSchema.exclude(['gold']),
    }),
    z.object({
        type: z.literal('BEGIN_ROYAL_RESOLUTION'),
    }),
    z.object({
        type: z.literal('SELECT_ROYAL'),
        crownsGain: z.number().int().min(1).max(3),
    }),
    z.object({
        type: z.literal('BEGIN_BUFF_RESOLUTION'),
    }),
    z.object({
        type: z.literal('RESOLVE_BUFF'),
        scoreGain: z.number().int().min(0).max(3),
    }),
    z.object({
        type: z.literal('ENTER_REPLAY'),
    }),
    z.object({
        type: z.literal('EXIT_REPLAY'),
    }),
    z.object({
        type: z.literal('FINISH_MATCH'),
        winner: PlayerIdSchema,
    }),
]);

export const GameEventSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('match.modeSelected'), mode: GameModeSchema }),
    z.object({ type: z.literal('match.started') }),
    z.object({ type: z.literal('phase.changed'), phase: GamePhaseSchema }),
    z.object({ type: z.literal('gem.taken'), color: GemColorSchema }),
    z.object({ type: z.literal('card.reserved'), slot: z.number().int().min(1).max(3) }),
    z.object({ type: z.literal('card.bought'), scoreGain: z.number().int().min(0) }),
    z.object({ type: z.literal('privilege.used'), color: GemColorSchema }),
    z.object({ type: z.literal('royal.selected'), crownsGain: z.number().int().min(1) }),
    z.object({ type: z.literal('buff.resolved'), scoreGain: z.number().int().min(0) }),
    z.object({
        type: z.literal('effect.enqueued'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
        hookPoint: EffectHookPointSchema,
    }),
    z.object({
        type: z.literal('effect.resolved'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
    }),
    z.object({ type: z.literal('replay.entered') }),
    z.object({ type: z.literal('replay.exited') }),
    z.object({ type: z.literal('match.finished'), winner: PlayerIdSchema }),
]);

const SharedSnapshotSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    engineVersion: z.literal(ENGINE_VERSION),
    context: MatchContextSchema,
    gemBank: GemInventorySchema,
    players: PlayersByIdSchema,
    eventLog: z.array(GameEventSchema),
    replayCursor: z.number().int().min(0).nullable(),
    sequence: z.number().int().min(0),
    pendingEffects: z.array(PendingEffectSchema),
});

export const AuthoritativeSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('authoritative'),
    hiddenState: HiddenStateSchema,
});

export const PlayerSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('player'),
    viewer: PlayerIdSchema,
});

export const SpectatorSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('spectator'),
});

export const VisibleSnapshotSchema = z.union([PlayerSnapshotSchema, SpectatorSnapshotSchema]);

export const GameSnapshotSchema = AuthoritativeSnapshotSchema satisfies z.ZodType<
    MatchState & {
        schemaVersion: typeof SCHEMA_VERSION;
        rulesetVersion: typeof RULESET_VERSION;
        engineVersion: typeof ENGINE_VERSION;
        eventLog: GameEvent[];
        visibility: 'authoritative';
    }
>;

export const ReplayCommandSchema = z.object({
    clientCommandId: z.string().min(1),
    expectedSeq: z.number().int().min(0),
    issuedBy: PlayerIdSchema.nullable(),
    command: GameCommandSchema,
});

export const ReplayBundleSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    engineVersion: z.literal(ENGINE_VERSION),
    seed: z.number().int().nonnegative(),
    initialSnapshot: GameSnapshotSchema,
    commands: z.array(ReplayCommandSchema),
    events: z.array(GameEventSchema),
    finalStateHash: z.string().min(1),
    resultSummary: z.object({
        winner: PlayerIdSchema.nullable(),
        turns: z.number().int().min(0),
        finalSeq: z.number().int().min(0),
    }),
});

export const DomainErrorSchema = z.object({
    code: z.string().min(1),
    category: ErrorCategorySchema,
    message: z.string().min(1),
    recoverable: z.boolean(),
    details: z.record(z.unknown()).optional(),
}) satisfies z.ZodType<DomainError>;

export const TypedResultSuccessSchema = <T extends z.ZodTypeAny>(payload: T) =>
    z.object({
        ok: z.literal(true),
        value: payload,
    });

export const TypedResultFailureSchema = z.object({
    ok: z.literal(false),
    error: DomainErrorSchema,
});

export const RoomSummarySchema = z.object({
    roomId: z.string().min(1),
    hostPlayer: PlayerIdSchema,
    playerCount: z.number().int().min(0).max(2),
    status: z.enum(['waiting', 'active', 'completed']),
    mode: GameModeSchema,
    createdAt: z.string().datetime(),
});

export const RoomDetailSchema = RoomSummarySchema.extend({
    snapshot: VisibleSnapshotSchema.nullable(),
    canJoin: z.boolean(),
    wsUrl: z.string().url(),
});

export const CreateRoomRequestSchema = z.object({
    mode: GameModeSchema.default('online'),
    seed: z.number().int().nonnegative().optional(),
    flags: MatchFlagsSchema,
});

export const JoinRoomRequestSchema = z.object({
    playerName: z.string().min(1),
    preferredSeat: PlayerIdSchema.optional(),
});

export const HealthResponseSchema = z.object({
    service: z.string().min(1),
    status: z.enum(['ok', 'degraded']),
    version: z.string().min(1),
    timestamp: z.string().datetime(),
});

export const ReplayDetailSchema = z.object({
    replayId: z.string().min(1),
    bundle: ReplayBundleSchema,
});

export const MatchCommandEnvelopeSchema = z.object({
    clientCommandId: z.string().min(1),
    expectedSeq: z.number().int().min(0),
    issuedBy: PlayerIdSchema.optional(),
    command: GameCommandSchema,
});

export const RoomWsMessageSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('room.join'),
        roomId: z.string().min(1),
        playerName: z.string().min(1),
        preferredSeat: PlayerIdSchema.optional(),
    }),
    z.object({
        type: z.literal('room.watch'),
        roomId: z.string().min(1),
        spectatorName: z.string().min(1).optional(),
    }),
    z.object({ type: z.literal('room.state'), room: RoomDetailSchema.nullable() }),
    z.object({ type: z.literal('match.command'), command: MatchCommandEnvelopeSchema }),
    z.object({
        type: z.literal('match.patch'),
        seq: z.number().int().min(0),
        snapshot: VisibleSnapshotSchema,
    }),
    z.object({
        type: z.literal('match.resync'),
        lastKnownSeq: z.number().int().min(0),
        snapshot: VisibleSnapshotSchema,
    }),
    z.object({
        type: z.literal('match.observe'),
        seq: z.number().int().min(0),
        snapshot: SpectatorSnapshotSchema,
    }),
    z.object({ type: z.literal('room.leave'), roomId: z.string().min(1) }),
    z.object({
        type: z.literal('room.error'),
        error: DomainErrorSchema,
        seq: z.number().int().min(0).optional(),
    }),
]);

export const openApiDocument = {
    openapi: '3.1.0',
    info: {
        title: 'Gem Duel Contracts',
        version: SCHEMA_VERSION,
    },
    paths: {
        '/api/rooms': {
            post: {
                operationId: 'createRoom',
            },
        },
        '/api/rooms/{roomId}/join': {
            post: {
                operationId: 'joinRoom',
            },
        },
        '/api/rooms/{roomId}': {
            get: {
                operationId: 'getRoom',
            },
        },
        '/api/replays/{replayId}': {
            get: {
                operationId: 'getReplay',
            },
        },
        '/api/health': {
            get: {
                operationId: 'getHealth',
            },
        },
    },
} as const;

export type GameCommand = z.infer<typeof GameCommandSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type GameSnapshot = z.infer<typeof GameSnapshotSchema>;
export type AuthoritativeSnapshot = z.infer<typeof AuthoritativeSnapshotSchema>;
export type PlayerSnapshot = z.infer<typeof PlayerSnapshotSchema>;
export type SpectatorSnapshot = z.infer<typeof SpectatorSnapshotSchema>;
export type VisibleSnapshot = z.infer<typeof VisibleSnapshotSchema>;
export type ReplayCommand = z.infer<typeof ReplayCommandSchema>;
export type ReplayBundle = z.infer<typeof ReplayBundleSchema>;
export type RoomSummary = z.infer<typeof RoomSummarySchema>;
export type RoomDetail = z.infer<typeof RoomDetailSchema>;
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ReplayDetail = z.infer<typeof ReplayDetailSchema>;
export type MatchCommandEnvelope = z.infer<typeof MatchCommandEnvelopeSchema>;
export type RoomWsMessage = z.infer<typeof RoomWsMessageSchema>;

export type TypedResult<T> = { ok: true; value: T } | { ok: false; error: DomainError };

export interface UiActionDescriptor {
    id: string;
    label: string;
    command: GameCommand;
    disabled?: boolean;
}

export interface UiViewModel {
    title: string;
    subtitle: string;
    snapshot: GameSnapshot;
    availableActions: UiActionDescriptor[];
}

const stripHiddenState = (snapshot: AuthoritativeSnapshot) => ({
    schemaVersion: snapshot.schemaVersion,
    rulesetVersion: snapshot.rulesetVersion,
    engineVersion: snapshot.engineVersion,
    context: snapshot.context,
    gemBank: snapshot.gemBank,
    players: snapshot.players,
    eventLog: snapshot.eventLog,
    replayCursor: snapshot.replayCursor,
    sequence: snapshot.sequence,
    pendingEffects: snapshot.pendingEffects,
});

export const toPlayerSnapshot = (
    snapshot: AuthoritativeSnapshot,
    viewer: PlayerId
): PlayerSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'player',
    viewer,
});

export const toSpectatorSnapshot = (snapshot: AuthoritativeSnapshot): SpectatorSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'spectator',
});

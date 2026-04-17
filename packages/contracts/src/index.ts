import { z } from 'zod';
import {
    ERROR_CATEGORIES,
    GAME_MODES,
    GAME_PHASES,
    GEM_COLORS,
    PLAYER_IDS,
    RULESET_VERSION,
    type DomainError,
    type MatchContext,
    type MatchFlags,
    type PlayerState,
} from '@gem-duel/domain';

export const SCHEMA_VERSION = '2.0.0';

export const PlayerIdSchema = z.enum(PLAYER_IDS);
export const GameModeSchema = z.enum(GAME_MODES);
export const GamePhaseSchema = z.enum(GAME_PHASES);
export const GemColorSchema = z.enum(GEM_COLORS);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);

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
    z.object({ type: z.literal('replay.entered') }),
    z.object({ type: z.literal('replay.exited') }),
    z.object({ type: z.literal('match.finished'), winner: PlayerIdSchema }),
]);

export const GameSnapshotSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    context: MatchContextSchema,
    gemBank: GemInventorySchema,
    players: z.record(PlayerIdSchema, PlayerStateSchema),
    eventLog: z.array(GameEventSchema),
    replayCursor: z.number().int().min(0).nullable(),
});

export const ReplayBundleSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    seed: z.number().int().nonnegative(),
    initialSnapshot: GameSnapshotSchema,
    events: z.array(GameEventSchema),
    resultSummary: z.object({
        winner: PlayerIdSchema.nullable(),
        turns: z.number().int().min(0),
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
    snapshot: GameSnapshotSchema.nullable(),
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

export const RoomWsMessageSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('room.join'), roomId: z.string(), playerName: z.string() }),
    z.object({ type: z.literal('room.state'), room: RoomDetailSchema }),
    z.object({ type: z.literal('match.command'), command: GameCommandSchema }),
    z.object({ type: z.literal('match.patch'), snapshot: GameSnapshotSchema }),
    z.object({ type: z.literal('match.resync'), snapshot: GameSnapshotSchema }),
    z.object({ type: z.literal('room.leave'), roomId: z.string() }),
    z.object({
        type: z.literal('room.error'),
        error: DomainErrorSchema,
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
export type ReplayBundle = z.infer<typeof ReplayBundleSchema>;
export type RoomSummary = z.infer<typeof RoomSummarySchema>;
export type RoomDetail = z.infer<typeof RoomDetailSchema>;
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ReplayDetail = z.infer<typeof ReplayDetailSchema>;
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

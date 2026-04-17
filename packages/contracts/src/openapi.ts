import {
    extendZodWithOpenApi,
    OpenAPIRegistry,
    OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
    CreateRoomRequestSchema,
    HealthResponseSchema,
    JoinRoomRequestSchema,
    ReplayDetailSchema,
    RoomDetailSchema,
} from './http';
import {
    DomainErrorSchema,
    GemInventorySchema,
    HiddenStateSchema,
    MatchContextSchema,
    MatchFlagsSchema,
    PendingEffectSchema,
    PlayerStateSchema,
    PlayersByIdSchema,
} from './shared/base';
import { ENGINE_VERSION, SCHEMA_VERSION } from './shared/enums';
import { GameCommandSchema, GameEventSchema } from './game';
import { ReplayBundleSchema, ReplayCommandSchema } from './replay';
import {
    AuthoritativeSnapshotSchema,
    GameSnapshotSchema,
    PlayerSnapshotSchema,
    SpectatorSnapshotSchema,
    VisibleSnapshotSchema,
} from './snapshots';
import {
    MatchCommandEnvelopeSchema,
    MatchCommandMessageSchema,
    MatchObserveMessageSchema,
    MatchPatchMessageSchema,
    MatchResyncMessageSchema,
    RoomErrorMessageSchema,
    RoomJoinMessageSchema,
    RoomLeaveMessageSchema,
    RoomStateMessageSchema,
    RoomWatchMessageSchema,
    RoomWsMessageSchema,
} from './websocket';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.register('MatchFlags', MatchFlagsSchema);
registry.register('GemInventory', GemInventorySchema);
registry.register('PlayerState', PlayerStateSchema);
registry.register('PlayersById', PlayersByIdSchema);
registry.register('MatchContext', MatchContextSchema);
registry.register('PendingEffect', PendingEffectSchema);
registry.register('HiddenState', HiddenStateSchema);
registry.register('DomainError', DomainErrorSchema);
registry.register('GameCommand', GameCommandSchema);
registry.register('GameEvent', GameEventSchema);
registry.register('AuthoritativeSnapshot', AuthoritativeSnapshotSchema);
registry.register('PlayerSnapshot', PlayerSnapshotSchema);
registry.register('SpectatorSnapshot', SpectatorSnapshotSchema);
registry.register('VisibleSnapshot', VisibleSnapshotSchema);
registry.register('GameSnapshot', GameSnapshotSchema);
registry.register('ReplayCommand', ReplayCommandSchema);
registry.register('ReplayBundle', ReplayBundleSchema);
registry.register(
    'RoomSummary',
    RoomDetailSchema.omit({ snapshot: true, canJoin: true, wsUrl: true })
);
registry.register('RoomDetail', RoomDetailSchema);
registry.register('CreateRoomRequest', CreateRoomRequestSchema);
registry.register('JoinRoomRequest', JoinRoomRequestSchema);
registry.register('HealthResponse', HealthResponseSchema);
registry.register('ReplayDetail', ReplayDetailSchema);
registry.register('MatchCommandEnvelope', MatchCommandEnvelopeSchema);
registry.register('RoomJoinMessage', RoomJoinMessageSchema);
registry.register('RoomWatchMessage', RoomWatchMessageSchema);
registry.register('RoomStateMessage', RoomStateMessageSchema);
registry.register('MatchCommandMessage', MatchCommandMessageSchema);
registry.register('MatchPatchMessage', MatchPatchMessageSchema);
registry.register('MatchResyncMessage', MatchResyncMessageSchema);
registry.register('MatchObserveMessage', MatchObserveMessageSchema);
registry.register('RoomLeaveMessage', RoomLeaveMessageSchema);
registry.register('RoomErrorMessage', RoomErrorMessageSchema);
registry.register('RoomWsMessage', RoomWsMessageSchema);

const RoomIdParamsSchema = z.object({
    roomId: z
        .string()
        .min(1)
        .openapi({
            param: {
                name: 'roomId',
                in: 'path',
                required: true,
            },
            example: 'room-1',
        }),
});

const ReplayIdParamsSchema = z.object({
    replayId: z
        .string()
        .min(1)
        .openapi({
            param: {
                name: 'replayId',
                in: 'path',
                required: true,
            },
            example: 'replay-room-1',
        }),
});

registry.registerPath({
    method: 'post',
    path: '/api/rooms',
    operationId: 'createRoom',
    summary: 'Create an authoritative online room.',
    request: {
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: CreateRoomRequestSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Room created.',
            content: {
                'application/json': {
                    schema: RoomDetailSchema,
                },
            },
        },
        400: {
            description: 'Invalid room request.',
            content: {
                'application/problem+json': {
                    schema: DomainErrorSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/rooms/{roomId}/join',
    operationId: 'joinRoom',
    summary: 'Join an existing room.',
    request: {
        params: RoomIdParamsSchema,
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: JoinRoomRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Updated room state.',
            content: {
                'application/json': {
                    schema: RoomDetailSchema,
                },
            },
        },
        404: {
            description: 'Room not found.',
            content: {
                'application/problem+json': {
                    schema: DomainErrorSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/rooms/{roomId}',
    operationId: 'getRoom',
    summary: 'Fetch the filtered room state.',
    request: {
        params: RoomIdParamsSchema,
    },
    responses: {
        200: {
            description: 'Visible room detail.',
            content: {
                'application/json': {
                    schema: RoomDetailSchema,
                },
            },
        },
        404: {
            description: 'Room not found.',
            content: {
                'application/problem+json': {
                    schema: DomainErrorSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/replays/{replayId}',
    operationId: 'getReplay',
    summary: 'Fetch an authoritative replay bundle.',
    request: {
        params: ReplayIdParamsSchema,
    },
    responses: {
        200: {
            description: 'Replay bundle.',
            content: {
                'application/json': {
                    schema: ReplayDetailSchema,
                },
            },
        },
        404: {
            description: 'Replay not found.',
            content: {
                'application/problem+json': {
                    schema: DomainErrorSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/health',
    operationId: 'getHealth',
    summary: 'Return room-service health.',
    responses: {
        200: {
            description: 'Health status.',
            content: {
                'application/json': {
                    schema: HealthResponseSchema,
                },
            },
        },
    },
});

const generator = new OpenApiGeneratorV31(registry.definitions);

export interface OpenApiDocument {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    paths: Record<string, unknown>;
    components?: {
        schemas?: Record<string, unknown>;
    };
    servers?: Array<{
        url: string;
        description: string;
    }>;
    tags?: Array<{
        name: string;
    }>;
}

export const openApiDocument: OpenApiDocument = generator.generateDocument({
    openapi: '3.1.0',
    info: {
        title: 'Gem Duel Contracts',
        version: SCHEMA_VERSION,
        description:
            'Deterministic HTTP and contract surface for Gem Duel Step 02 boundary freeze.',
    },
    servers: [
        {
            url: 'http://localhost:8787',
            description: 'Local room-service development server.',
        },
    ],
    tags: [{ name: 'rooms' }, { name: 'replays' }, { name: 'health' }],
}) as OpenApiDocument;

export const openApiComponentSchemas: Record<string, unknown> = (openApiDocument.components
    ?.schemas ?? {}) as Record<string, unknown>;

export const openApiMeta = {
    schemaVersion: SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
} as const;

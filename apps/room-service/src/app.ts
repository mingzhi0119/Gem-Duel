import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import { createMatchSession, type MatchSession } from '@gem-duel/application';
import { createClockPort, createEnginePorts, createIdPort } from '@gem-duel/adapters';
import {
    CreateRoomRequestSchema,
    JoinRoomRequestSchema,
    RoomWsMessageSchema,
    type CreateRoomRequest,
    type TypedResult,
} from '@gem-duel/contracts';
import { createRoomAuthority } from './authority';
import { createRoomError } from './errors';
import { createInMemoryRoomAuthorityStore, type RoomAuthorityStore } from './store';

interface RoomServiceClock {
    now(): string;
}

interface IdGenerator {
    next(prefix?: string): string;
}

type RoomSessionFactory = (request: CreateRoomRequest) => ReturnType<typeof createMatchSession>;

export interface BuildRoomServiceAppOptions {
    logger?: boolean;
    clock?: RoomServiceClock;
    roomIdPort?: IdGenerator;
    connectionIdPort?: IdGenerator;
    roomStore?: RoomAuthorityStore;
    defaultSeed?: number;
    createSession?: RoomSessionFactory;
}

const getHttpStatusForRoomError = (error: DomainError) => {
    if (error.code === 'ROOM_NOT_FOUND') {
        return 404;
    }

    return 409;
};

type DomainError = Extract<TypedResult<never>, { ok: false }>['error'];

const resolveWsUrl = (request: FastifyRequest, roomId: string) => {
    const forwardedProtoHeader = request.headers['x-forwarded-proto'];
    const forwardedHostHeader = request.headers['x-forwarded-host'];
    const forwardedProto = Array.isArray(forwardedProtoHeader)
        ? forwardedProtoHeader[0]
        : forwardedProtoHeader;
    const forwardedHost = Array.isArray(forwardedHostHeader)
        ? forwardedHostHeader[0]
        : forwardedHostHeader;
    const protocol = forwardedProto ?? request.protocol ?? 'http';
    const host = forwardedHost ?? request.headers.host ?? '127.0.0.1';
    const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
    return `${wsProtocol}://${host}/ws/rooms/${roomId}`;
};

const createOnlineSession = (
    request: CreateRoomRequest,
    defaultSeed: number
): ReturnType<typeof createMatchSession> => {
    const seed = request.seed ?? defaultSeed;
    return createMatchSession(
        {
            seed,
            mode: 'online',
            flags: {
                ...request.flags,
                onlineAuthoritative: true,
            },
        },
        createEnginePorts(seed)
    );
};

export const buildRoomServiceApp = async (
    options: BuildRoomServiceAppOptions = {}
): Promise<FastifyInstance> => {
    const app = Fastify({ logger: options.logger ?? true });
    const clock = options.clock ?? createClockPort();
    const roomIdPort = options.roomIdPort ?? createIdPort('room');
    const connectionIdPort = options.connectionIdPort ?? createIdPort('connection');
    const roomStore = options.roomStore ?? createInMemoryRoomAuthorityStore();
    const defaultSeed = options.defaultSeed ?? 20260416;
    const createSession =
        options.createSession ??
        ((request: CreateRoomRequest) => createOnlineSession(request, defaultSeed));
    const authority = createRoomAuthority({
        clock,
        roomIdPort,
        connectionIdPort,
        roomStore,
        createSession({
            request,
        }): { ok: true; value: MatchSession } | { ok: false; error: DomainError } {
            return createSession(request);
        },
    });

    await app.register(cors, { origin: true });
    await app.register(websocket);

    app.get('/health', async () => ({
        service: 'room-service',
        status: 'ok',
        version: 'step5-room-authority',
        timestamp: clock.now(),
    }));

    app.post('/rooms', async (request, reply) => {
        const payload = CreateRoomRequestSchema.parse(request.body);
        const detail = authority.createRoom(payload, (roomId) => resolveWsUrl(request, roomId));

        if (!detail.ok) {
            reply.status(500);
            return {
                ok: false,
                error: detail.error,
            };
        }

        reply.status(201);
        return detail.value;
    });

    app.get('/rooms/:roomId', async (request, reply) => {
        const roomId = (request.params as { roomId: string }).roomId;
        const detail = authority.getRoomDetail(roomId, resolveWsUrl(request, roomId));
        if (!detail) {
            reply.status(404);
            return {
                ok: false,
                error: createRoomError('ROOM_NOT_FOUND', `Room ${roomId} was not found.`, {
                    roomId,
                }),
            };
        }

        return detail;
    });

    app.post('/rooms/:roomId/join', async (request, reply) => {
        const roomId = (request.params as { roomId: string }).roomId;
        const payload = JoinRoomRequestSchema.parse(request.body);
        const result = authority.previewJoin(roomId, payload, resolveWsUrl(request, roomId));

        if (!result.ok) {
            reply.status(getHttpStatusForRoomError(result.error));
            return {
                ok: false,
                error: result.error,
            };
        }

        return result.value;
    });

    app.get('/replays/:replayId', async (request, reply) => {
        const replayId = (request.params as { replayId: string }).replayId;
        const replay = authority.getReplayDetail(replayId);
        if (!replay) {
            reply.status(404);
            return {
                ok: false,
                error: createRoomError('ROOM_NOT_FOUND', `Replay ${replayId} was not found.`, {
                    replayId,
                }),
            };
        }

        return replay;
    });

    app.register(async (wsApp) => {
        wsApp.get('/ws/rooms/:roomId', { websocket: true }, (socket, request) => {
            const roomId = (request.params as { roomId: string }).roomId;
            const connectionId = authority.registerConnection(
                roomId,
                resolveWsUrl(request, roomId),
                (message) => {
                    socket.send(JSON.stringify(message));
                }
            );

            socket.on('message', (raw: unknown) => {
                try {
                    const serialized =
                        typeof raw === 'string'
                            ? raw
                            : Buffer.isBuffer(raw)
                              ? raw.toString()
                              : Array.isArray(raw)
                                ? Buffer.concat(raw).toString()
                                : String(raw);
                    const message = RoomWsMessageSchema.parse(JSON.parse(serialized));
                    if (
                        message.type === 'room.state' ||
                        message.type === 'match.patch' ||
                        message.type === 'match.resync' ||
                        message.type === 'match.observe' ||
                        message.type === 'room.error'
                    ) {
                        const roomError = createRoomError(
                            'ROOM_COMMAND_FORBIDDEN',
                            `Message type ${message.type} is not valid as a client-originated websocket message.`,
                            { roomId }
                        );
                        socket.send(
                            JSON.stringify({
                                type: 'room.error',
                                error: roomError,
                            })
                        );
                        return;
                    }

                    authority.onMessage(connectionId, message);
                } catch (error: unknown) {
                    app.log.error(error);
                }
            });

            socket.on('close', () => {
                authority.onDisconnect(connectionId);
            });

            socket.on('error', (error: unknown) => {
                app.log.error(error);
            });
        });
    });

    return app;
};

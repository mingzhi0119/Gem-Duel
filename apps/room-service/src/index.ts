import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import {
    CreateRoomRequestSchema,
    JoinRoomRequestSchema,
    MatchCommandEnvelopeSchema,
    toPlayerSnapshot,
    toSpectatorSnapshot,
    type PlayerSnapshot,
    type ReplayDetail,
    type RoomDetail,
} from '@gem-duel/contracts';
import { createMatchSession, type MatchSession } from '@gem-duel/application';
import { createEnginePorts, createInMemoryRoomRepository } from '@gem-duel/adapters';

interface ActiveRoomSession {
    session: MatchSession;
    processedCommands: Map<string, PlayerSnapshot>;
}

interface ServiceError {
    code: string;
    category: 'validation';
    message: string;
    recoverable: boolean;
}

const app = Fastify({ logger: true });
const repository = createInMemoryRoomRepository();
const sessions = new Map<string, ActiveRoomSession>();

await app.register(cors, { origin: true });
await app.register(websocket);

const createServiceError = (code: string, message: string): ServiceError => ({
    code,
    category: 'validation',
    message,
    recoverable: true,
});

const getRoomState = (roomId: string) => sessions.get(roomId) ?? null;

const getVisibleRoomDetail = (roomId: string): RoomDetail | null => {
    const room = repository.get(roomId);
    const roomState = getRoomState(roomId);
    if (!room) {
        return null;
    }

    return {
        ...room.detail,
        snapshot: roomState
            ? toPlayerSnapshot(roomState.session.snapshot(), 'p1')
            : room.detail.snapshot,
    };
};

app.get('/health', async () => ({
    service: 'room-service',
    status: 'ok',
    version: 'step2-prep',
    timestamp: new Date().toISOString(),
}));

app.post('/rooms', async (request, reply) => {
    const payload = CreateRoomRequestSchema.parse(request.body);
    const roomId = `room-${repository.list().length + 1}`;
    const seed = payload.seed ?? 20260416;
    const session = createMatchSession(
        {
            seed,
            mode: 'online',
            flags: {
                ...payload.flags,
                onlineAuthoritative: true,
            },
        },
        createEnginePorts(seed)
    );

    if (!session.ok) {
        reply.status(500);
        return {
            ok: false,
            error: session.error,
        };
    }

    sessions.set(roomId, {
        session: session.value,
        processedCommands: new Map(),
    });

    const detail: RoomDetail = {
        roomId,
        hostPlayer: 'p1',
        playerCount: 1,
        status: 'waiting',
        mode: 'online',
        createdAt: new Date().toISOString(),
        snapshot: toPlayerSnapshot(session.value.snapshot(), 'p1'),
        canJoin: true,
        wsUrl: `ws://localhost:${process.env.ROOM_SERVICE_PORT ?? 8787}/ws/rooms/${roomId}`,
    };

    repository.create({
        roomId,
        request: payload,
        detail,
    });

    reply.status(201);
    return detail;
});

app.get('/rooms/:roomId', async (request, reply) => {
    const detail = getVisibleRoomDetail((request.params as { roomId: string }).roomId);
    if (!detail) {
        reply.status(404);
        return {
            ok: false,
            message: 'Room not found.',
        };
    }

    return detail;
});

app.post('/rooms/:roomId/join', async (request, reply) => {
    const roomId = (request.params as { roomId: string }).roomId;
    const payload = JoinRoomRequestSchema.parse(request.body);
    const result = repository.join(roomId, payload);

    if (!result.ok) {
        reply.status(404);
        return result;
    }

    return getVisibleRoomDetail(roomId) ?? result.value.detail;
});

app.get('/replays/:replayId', async (request, reply) => {
    const roomId = (request.params as { replayId: string }).replayId;
    const roomState = getRoomState(roomId);
    if (!roomState) {
        reply.status(404);
        return {
            ok: false,
            message: 'Replay not found.',
        };
    }

    const replay: ReplayDetail = {
        replayId: roomId,
        bundle: roomState.session.replay(),
    };
    return replay;
});

app.register(async (wsApp) => {
    wsApp.get('/ws/rooms/:roomId', { websocket: true }, (socket, request) => {
        const roomId = (request.params as { roomId: string }).roomId;
        const roomState = getRoomState(roomId);
        const detail = getVisibleRoomDetail(roomId);

        socket.send(
            JSON.stringify({
                type: 'room.state',
                room: detail,
            })
        );

        socket.on('message', (raw) => {
            try {
                const message = JSON.parse(raw.toString()) as { type: string; command?: unknown };
                if (!roomState) {
                    socket.send(
                        JSON.stringify({
                            type: 'room.error',
                            error: createServiceError(
                                'ROOM_NOT_FOUND',
                                `Room ${roomId} was not found.`
                            ),
                        })
                    );
                    return;
                }

                if (message.type === 'room.watch') {
                    const spectatorSnapshot = toSpectatorSnapshot(roomState.session.snapshot());
                    socket.send(
                        JSON.stringify({
                            type: 'match.observe',
                            seq: spectatorSnapshot.sequence,
                            snapshot: spectatorSnapshot,
                        })
                    );
                    return;
                }

                if (message.type === 'match.command' && message.command) {
                    const envelope = MatchCommandEnvelopeSchema.parse(message.command);
                    const currentSnapshot = roomState.session.snapshot();

                    const cached = roomState.processedCommands.get(envelope.clientCommandId);
                    if (cached) {
                        socket.send(
                            JSON.stringify({
                                type: 'match.patch',
                                seq: cached.sequence,
                                snapshot: cached,
                            })
                        );
                        return;
                    }

                    if (envelope.expectedSeq !== currentSnapshot.sequence) {
                        const playerSnapshot = toPlayerSnapshot(
                            currentSnapshot,
                            envelope.issuedBy ?? 'p1'
                        );
                        socket.send(
                            JSON.stringify({
                                type: 'match.resync',
                                lastKnownSeq: envelope.expectedSeq,
                                snapshot: playerSnapshot,
                            })
                        );
                        return;
                    }

                    const result = roomState.session.dispatch(envelope.command);
                    if (result.ok) {
                        const playerSnapshot = toPlayerSnapshot(
                            result.value,
                            envelope.issuedBy ?? 'p1'
                        );
                        roomState.processedCommands.set(envelope.clientCommandId, playerSnapshot);
                        socket.send(
                            JSON.stringify({
                                type: 'match.patch',
                                seq: playerSnapshot.sequence,
                                snapshot: playerSnapshot,
                            })
                        );
                    } else {
                        socket.send(
                            JSON.stringify({
                                type: 'room.error',
                                error: result.error,
                                seq: currentSnapshot.sequence,
                            })
                        );
                    }
                }
            } catch (error) {
                app.log.error(error);
            }
        });
    });
});

const port = Number(process.env.ROOM_SERVICE_PORT ?? 8787);

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
    app.log.error(error);
    process.exit(1);
});

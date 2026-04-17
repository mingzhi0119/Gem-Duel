import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import {
    CreateRoomRequestSchema,
    JoinRoomRequestSchema,
    type ReplayDetail,
    type RoomDetail,
} from '@gem-duel/contracts';
import { createMatchSession, type MatchSession } from '@gem-duel/application';
import { createEnginePorts, createInMemoryRoomRepository } from '@gem-duel/adapters';

const app = Fastify({ logger: true });
const repository = createInMemoryRoomRepository();
const sessions = new Map<string, MatchSession>();

await app.register(cors, { origin: true });
await app.register(websocket);

app.get('/health', async () => ({
    service: 'room-service',
    status: 'ok',
    version: '0.1.0',
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

    sessions.set(roomId, session.value);

    const detail: RoomDetail = {
        roomId,
        hostPlayer: 'p1',
        playerCount: 1,
        status: 'waiting',
        mode: 'online',
        createdAt: new Date().toISOString(),
        snapshot: session.value.snapshot(),
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
    const room = repository.get((request.params as { roomId: string }).roomId);
    if (!room) {
        reply.status(404);
        return {
            ok: false,
            message: 'Room not found.',
        };
    }

    return {
        ...room.detail,
        snapshot: sessions.get(room.summary.roomId)?.snapshot() ?? room.detail.snapshot,
    };
});

app.post('/rooms/:roomId/join', async (request, reply) => {
    const roomId = (request.params as { roomId: string }).roomId;
    const payload = JoinRoomRequestSchema.parse(request.body);
    const result = repository.join(roomId, payload);

    if (!result.ok) {
        reply.status(404);
        return result;
    }

    return result.value.detail;
});

app.get('/replays/:replayId', async (request, reply) => {
    const roomId = (request.params as { replayId: string }).replayId;
    const session = sessions.get(roomId);
    if (!session) {
        reply.status(404);
        return {
            ok: false,
            message: 'Replay not found.',
        };
    }

    const replay: ReplayDetail = {
        replayId: roomId,
        bundle: session.replay(),
    };
    return replay;
});

app.register(async (wsApp) => {
    wsApp.get('/ws/rooms/:roomId', { websocket: true }, (socket, request) => {
        const roomId = (request.params as { roomId: string }).roomId;
        const session = sessions.get(roomId);

        socket.send(
            JSON.stringify({
                type: 'room.state',
                room: repository.get(roomId)?.detail ?? null,
            })
        );

        socket.on('message', (raw) => {
            try {
                const message = JSON.parse(raw.toString()) as { type: string; command?: unknown };
                if (message.type === 'match.command' && session && message.command) {
                    const result = session.dispatch(message.command as never);
                    if (result.ok) {
                        socket.send(
                            JSON.stringify({
                                type: 'match.patch',
                                snapshot: result.value,
                            })
                        );
                    } else {
                        socket.send(
                            JSON.stringify({
                                type: 'room.error',
                                error: result.error,
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

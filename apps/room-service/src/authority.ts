import type { MatchSession } from '@gem-duel/application';
import type {
    CreateRoomRequest,
    JoinRoomRequest,
    MatchCommandEnvelope,
    PlayerSnapshot,
    ReplayDetail,
    ReplayBundle,
    RoomDetail,
    RoomWsMessage,
    SpectatorSnapshot,
    TypedResult,
} from '@gem-duel/contracts';
import { createRoomError } from './errors';
import {
    createInMemoryRoomAuthorityStore,
    type CachedCommandResult,
    type RoomAuthorityStore,
    type RoomRuntime,
} from './store';

type DomainError = Extract<TypedResult<never>, { ok: false }>['error'];
type PlayerId = PlayerSnapshot['viewer'];

type ViewerBinding =
    | { kind: 'unbound' }
    | { kind: 'player'; playerId: PlayerId; playerName: string }
    | { kind: 'spectator'; spectatorName: string | null };

interface AuthorityConnection {
    connectionId: string;
    roomId: string;
    wsUrl: string;
    binding: ViewerBinding;
    send: (message: RoomWsMessage) => void;
}

type ClientMessage = Extract<
    RoomWsMessage,
    { type: 'room.join' | 'room.watch' | 'match.command' | 'room.leave' }
>;

interface RoomAuthorityClock {
    now(): string;
}

interface IdGenerator {
    next(prefix?: string): string;
}

export interface CreateRoomSessionInput {
    request: CreateRoomRequest;
}

export interface RoomAuthorityOptions {
    roomStore?: RoomAuthorityStore;
    roomIdPort: IdGenerator;
    connectionIdPort: IdGenerator;
    clock: RoomAuthorityClock;
    createSession(input: CreateRoomSessionInput): TypedResult<MatchSession>;
}

const PLAYER_IDS: PlayerId[] = ['p1', 'p2'];

const countBoundPlayers = (room: RoomRuntime) =>
    PLAYER_IDS.filter((playerId) => room.seatBindings[playerId] !== undefined).length;

const isRoomCompleted = (room: RoomRuntime) => room.replay !== null;

const isRoomJoinable = (room: RoomRuntime) => !isRoomCompleted(room) && countBoundPlayers(room) < 2;

const getRoomStatus = (room: RoomRuntime): RoomDetail['status'] => {
    if (isRoomCompleted(room)) {
        return 'completed';
    }

    return countBoundPlayers(room) === 2 ? 'active' : 'waiting';
};

const buildRoomDetail = (
    room: RoomRuntime,
    wsUrl: string,
    binding: ViewerBinding = { kind: 'unbound' }
) => {
    const viewModel =
        binding.kind === 'player'
            ? room.session.viewModel(binding.playerId)
            : room.session.viewModel('spectator');

    return {
        roomId: room.roomId,
        hostPlayer: room.hostPlayer,
        playerCount: countBoundPlayers(room),
        status: getRoomStatus(room),
        mode: room.request.mode,
        createdAt: room.createdAt,
        snapshot: viewModel.snapshot,
        availableActions: viewModel.availableActions,
        canJoin: isRoomJoinable(room),
        wsUrl,
    };
};

const findRequestedSeat = (room: RoomRuntime, preferredSeat?: PlayerId): TypedResult<PlayerId> => {
    if (preferredSeat && room.seatBindings[preferredSeat]) {
        return {
            ok: false,
            error: createRoomError(
                'ROOM_SEAT_TAKEN',
                `Seat ${preferredSeat} is already bound in room ${room.roomId}.`,
                { roomId: room.roomId, preferredSeat }
            ),
        };
    }

    if (!isRoomJoinable(room)) {
        return {
            ok: false,
            error: createRoomError('ROOM_FULL', `Room ${room.roomId} cannot accept more players.`, {
                roomId: room.roomId,
            }),
        };
    }

    if (preferredSeat) {
        return {
            ok: true,
            value: preferredSeat,
        };
    }

    const openSeat = PLAYER_IDS.find((playerId) => room.seatBindings[playerId] === undefined);
    if (!openSeat) {
        return {
            ok: false,
            error: createRoomError('ROOM_FULL', `Room ${room.roomId} cannot accept more players.`, {
                roomId: room.roomId,
            }),
        };
    }

    return {
        ok: true,
        value: openSeat,
    };
};

const createMatchPatchSet = (room: RoomRuntime): CachedCommandResult['playerPatches'] => {
    const snapshot = room.session.snapshot();
    const p1View = room.session.viewModel('p1');
    const p2View = room.session.viewModel('p2');
    return {
        p1: {
            type: 'match.patch',
            seq: snapshot.sequence,
            snapshot: p1View.snapshot as PlayerSnapshot,
            availableActions: p1View.availableActions,
        },
        p2: {
            type: 'match.patch',
            seq: snapshot.sequence,
            snapshot: p2View.snapshot as PlayerSnapshot,
            availableActions: p2View.availableActions,
        },
    };
};

const createSpectatorMessage = (room: RoomRuntime): CachedCommandResult['spectatorMessage'] => {
    const snapshot = room.session.snapshot();
    const spectatorView = room.session.viewModel('spectator');
    return {
        type: 'match.observe',
        seq: snapshot.sequence,
        snapshot: spectatorView.snapshot as SpectatorSnapshot,
        availableActions: spectatorView.availableActions,
    };
};

export interface RoomAuthority {
    createRoom(
        request: CreateRoomRequest,
        getWsUrl: (roomId: string) => string
    ): TypedResult<RoomDetail>;
    getRoomDetail(roomId: string, wsUrl: string): RoomDetail | null;
    previewJoin(roomId: string, request: JoinRoomRequest, wsUrl: string): TypedResult<RoomDetail>;
    getReplayDetail(roomId: string): ReplayDetail | null;
    registerConnection(
        roomId: string,
        wsUrl: string,
        send: (message: RoomWsMessage) => void
    ): string;
    onMessage(connectionId: string, message: ClientMessage): void;
    onDisconnect(connectionId: string): void;
}

export const createRoomAuthority = (options: RoomAuthorityOptions): RoomAuthority => {
    const roomStore = options.roomStore ?? createInMemoryRoomAuthorityStore();
    const connections = new Map<string, AuthorityConnection>();
    const roomConnectionIds = new Map<string, Set<string>>();

    const getRoom = (roomId: string) => roomStore.get(roomId);

    const getConnection = (connectionId: string) => connections.get(connectionId) ?? null;

    const addConnectionToRoom = (roomId: string, connectionId: string) => {
        const existing = roomConnectionIds.get(roomId) ?? new Set<string>();
        existing.add(connectionId);
        roomConnectionIds.set(roomId, existing);
    };

    const removeConnectionFromRoom = (roomId: string, connectionId: string) => {
        const existing = roomConnectionIds.get(roomId);
        if (!existing) {
            return;
        }

        existing.delete(connectionId);
        if (existing.size === 0) {
            roomConnectionIds.delete(roomId);
            return;
        }

        roomConnectionIds.set(roomId, existing);
    };

    const sendRoomError = (connection: AuthorityConnection, error: DomainError, seq?: number) => {
        connection.send({
            type: 'room.error',
            error,
            ...(seq === undefined ? {} : { seq }),
        });
    };

    const maybeStoreReplay = (room: RoomRuntime, bundle?: ReplayBundle) => {
        const snapshot = room.session.snapshot();
        if (
            room.replay ||
            (snapshot.context.phase !== 'terminal' && snapshot.context.winner === null)
        ) {
            return;
        }

        roomStore.storeReplay(room.roomId, bundle ?? room.session.replay());
    };

    const sendBoundRoomState = (
        connection: AuthorityConnection,
        room: RoomRuntime,
        wsUrl: string
    ) => {
        connection.send({
            type: 'room.state',
            room: buildRoomDetail(room, wsUrl, connection.binding),
        });
    };

    const broadcastSuccessfulCommand = (room: RoomRuntime, cached: CachedCommandResult) => {
        const connectionIds = roomConnectionIds.get(room.roomId);
        if (!connectionIds) {
            return;
        }

        for (const connectionId of connectionIds) {
            const connection = connections.get(connectionId);
            if (!connection) {
                continue;
            }

            if (connection.binding.kind === 'player') {
                connection.send(cached.playerPatches[connection.binding.playerId]);
                continue;
            }

            if (connection.binding.kind === 'spectator') {
                connection.send(cached.spectatorMessage);
            }
        }
    };

    const releaseBinding = (connection: AuthorityConnection) => {
        if (connection.binding.kind !== 'player') {
            connection.binding = { kind: 'unbound' };
            return;
        }

        const room = getRoom(connection.roomId);
        if (room) {
            const binding = room.seatBindings[connection.binding.playerId];
            if (binding?.connectionId === connection.connectionId) {
                delete room.seatBindings[connection.binding.playerId];
                roomStore.upsert(room);
            }
        }

        connection.binding = { kind: 'unbound' };
    };

    return {
        createRoom(request, getWsUrl) {
            const session = options.createSession({ request });
            if (!session.ok) {
                return session;
            }

            const roomId = options.roomIdPort.next('room');
            const room: RoomRuntime = {
                roomId,
                hostPlayer: 'p1',
                createdAt: options.clock.now(),
                request,
                session: session.value,
                replay: null,
                seatBindings: {},
                processedCommands: new Map(),
            };

            roomStore.create(room);
            return {
                ok: true,
                value: buildRoomDetail(room, getWsUrl(roomId)),
            };
        },
        getRoomDetail(roomId, wsUrl) {
            const room = getRoom(roomId);
            if (!room) {
                return null;
            }

            return buildRoomDetail(room, wsUrl);
        },
        previewJoin(roomId, request, wsUrl) {
            const room = getRoom(roomId);
            if (!room) {
                return {
                    ok: false,
                    error: createRoomError('ROOM_NOT_FOUND', `Room ${roomId} was not found.`, {
                        roomId,
                    }),
                };
            }

            const seat = findRequestedSeat(room, request.preferredSeat);
            if (!seat.ok) {
                return seat;
            }

            return {
                ok: true,
                value: buildRoomDetail(room, wsUrl),
            };
        },
        getReplayDetail(roomId) {
            const room = getRoom(roomId);
            if (!room) {
                return null;
            }

            return {
                replayId: roomId,
                bundle: roomStore.getReplay(roomId) ?? room.session.replay(),
            };
        },
        registerConnection(roomId, wsUrl, send) {
            const connectionId = options.connectionIdPort.next('connection');
            connections.set(connectionId, {
                connectionId,
                roomId,
                wsUrl,
                binding: { kind: 'unbound' },
                send,
            });
            addConnectionToRoom(roomId, connectionId);
            return connectionId;
        },
        onMessage(connectionId, message) {
            const connection = getConnection(connectionId);
            if (!connection) {
                return;
            }

            const room = getRoom(connection.roomId);
            if (!room) {
                sendRoomError(
                    connection,
                    createRoomError('ROOM_NOT_FOUND', `Room ${connection.roomId} was not found.`, {
                        roomId: connection.roomId,
                    })
                );
                return;
            }

            switch (message.type) {
                case 'room.join': {
                    if (connection.binding.kind !== 'unbound') {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_ALREADY_BOUND',
                                `Connection ${connection.connectionId} is already bound in room ${room.roomId}.`,
                                { roomId: room.roomId }
                            )
                        );
                        return;
                    }

                    const seat = findRequestedSeat(room, message.preferredSeat);
                    if (!seat.ok) {
                        sendRoomError(connection, seat.error);
                        return;
                    }

                    connection.binding = {
                        kind: 'player',
                        playerId: seat.value,
                        playerName: message.playerName,
                    };
                    room.seatBindings[seat.value] = {
                        connectionId: connection.connectionId,
                        playerName: message.playerName,
                    };
                    roomStore.upsert(room);
                    sendBoundRoomState(connection, room, connection.wsUrl);
                    return;
                }
                case 'room.watch': {
                    if (connection.binding.kind !== 'unbound') {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_ALREADY_BOUND',
                                `Connection ${connection.connectionId} is already bound in room ${room.roomId}.`,
                                { roomId: room.roomId }
                            )
                        );
                        return;
                    }

                    connection.binding = {
                        kind: 'spectator',
                        spectatorName: message.spectatorName ?? null,
                    };
                    sendBoundRoomState(connection, room, connection.wsUrl);
                    return;
                }
                case 'room.leave': {
                    releaseBinding(connection);
                    sendBoundRoomState(connection, room, connection.wsUrl);
                    return;
                }
                case 'match.command': {
                    if (connection.binding.kind === 'unbound') {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_BINDING_REQUIRED',
                                `Connection ${connection.connectionId} must bind to a room seat before sending commands.`,
                                { roomId: room.roomId }
                            ),
                            room.session.snapshot().sequence
                        );
                        return;
                    }

                    if (connection.binding.kind === 'spectator') {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_COMMAND_FORBIDDEN',
                                `Spectators may not submit commands for room ${room.roomId}.`,
                                { roomId: room.roomId }
                            ),
                            room.session.snapshot().sequence
                        );
                        return;
                    }

                    if (getRoomStatus(room) !== 'active') {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_WAITING_FOR_PLAYERS',
                                `Room ${room.roomId} requires two bound players before commands may resolve.`,
                                { roomId: room.roomId }
                            ),
                            room.session.snapshot().sequence
                        );
                        return;
                    }

                    const envelope: MatchCommandEnvelope = message.command;
                    const currentSnapshot = room.session.snapshot();
                    if (connection.binding.playerId !== currentSnapshot.context.currentPlayer) {
                        sendRoomError(
                            connection,
                            createRoomError(
                                'ROOM_COMMAND_FORBIDDEN',
                                `Seat ${connection.binding.playerId} cannot act while ${currentSnapshot.context.currentPlayer} owns the turn in room ${room.roomId}.`,
                                {
                                    roomId: room.roomId,
                                    actingSeat: connection.binding.playerId,
                                    currentPlayer: currentSnapshot.context.currentPlayer,
                                }
                            ),
                            currentSnapshot.sequence
                        );
                        return;
                    }
                    const cached = room.processedCommands.get(envelope.clientCommandId);

                    if (cached) {
                        if (cached.owner !== connection.binding.playerId) {
                            sendRoomError(
                                connection,
                                createRoomError(
                                    'ROOM_COMMAND_FORBIDDEN',
                                    `Command ${envelope.clientCommandId} is already owned by another player in room ${room.roomId}.`,
                                    {
                                        roomId: room.roomId,
                                        clientCommandId: envelope.clientCommandId,
                                    }
                                ),
                                currentSnapshot.sequence
                            );
                            return;
                        }

                        connection.send(cached.playerPatches[connection.binding.playerId]);
                        return;
                    }

                    if (envelope.expectedSeq !== currentSnapshot.sequence) {
                        const playerView = room.session.viewModel(connection.binding.playerId);
                        connection.send({
                            type: 'match.resync',
                            lastKnownSeq: envelope.expectedSeq,
                            snapshot: playerView.snapshot,
                            availableActions: playerView.availableActions,
                        });
                        return;
                    }

                    const result = room.session.dispatch(envelope.command);
                    if (!result.ok) {
                        sendRoomError(connection, result.error, currentSnapshot.sequence);
                        return;
                    }

                    const cachedResult: CachedCommandResult = {
                        owner: connection.binding.playerId,
                        playerPatches: createMatchPatchSet(room),
                        spectatorMessage: createSpectatorMessage(room),
                    };
                    room.processedCommands.set(envelope.clientCommandId, cachedResult);
                    maybeStoreReplay(room);
                    roomStore.upsert(room);
                    broadcastSuccessfulCommand(room, cachedResult);
                    return;
                }
            }
        },
        onDisconnect(connectionId) {
            const connection = getConnection(connectionId);
            if (!connection) {
                return;
            }

            releaseBinding(connection);
            removeConnectionFromRoom(connection.roomId, connection.connectionId);
            connections.delete(connection.connectionId);
        },
    };
};

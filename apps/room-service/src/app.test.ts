import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    buildReplayInspectorModel,
    buildVisibleUiViewModel,
    buildUiViewModel,
    createMatchSession,
    type MatchSession,
} from '@gem-duel/application';
import { createEnginePorts } from '@gem-duel/adapters';
import type {
    CreateRoomRequest,
    GameCommand,
    GameSnapshot,
    ReplayBundle,
    RoomDetail,
    RoomWsMessage,
    TypedResult,
} from '@gem-duel/contracts';
import { RoomWsMessageSchema } from '@gem-duel/contracts';
import { buildRoomServiceApp } from './app';

const baseFlags = {
    roguelike: false,
    onlineAuthoritative: false,
    aiEnabled: false,
} as const;

const createRoomPayload: CreateRoomRequest = {
    mode: 'online',
    flags: baseFlags,
};

const readJson = <T>(body: string) => JSON.parse(body) as T;

class SocketHarness {
    private readonly queue: RoomWsMessage[] = [];
    private readonly waiters: Array<(message: RoomWsMessage) => void> = [];
    private readonly socket: WebSocket;

    private constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.addEventListener('message', (event) => {
            const message = RoomWsMessageSchema.parse(JSON.parse(String(event.data)));
            const waiter = this.waiters.shift();
            if (waiter) {
                waiter(message);
                return;
            }

            this.queue.push(message);
        });
    }

    static async connect(url: string) {
        const socket = new WebSocket(url);

        await new Promise<void>((resolve, reject) => {
            socket.addEventListener('open', () => resolve(), { once: true });
            socket.addEventListener(
                'error',
                () => reject(new Error(`Failed to open websocket ${url}.`)),
                { once: true }
            );
        });

        return new SocketHarness(socket);
    }

    send(message: object) {
        this.socket.send(JSON.stringify(message));
    }

    async nextMessage(timeoutMs = 1000): Promise<RoomWsMessage> {
        if (this.queue.length > 0) {
            return this.queue.shift()!;
        }

        return await new Promise<RoomWsMessage>((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = this.waiters.indexOf(resolve);
                if (index >= 0) {
                    this.waiters.splice(index, 1);
                }
                reject(new Error('Timed out waiting for websocket message.'));
            }, timeoutMs);

            this.waiters.push((message) => {
                clearTimeout(timeout);
                resolve(message);
            });
        });
    }

    async expectNoMessage(timeoutMs = 200) {
        await expect(this.nextMessage(timeoutMs)).rejects.toThrow(
            'Timed out waiting for websocket message.'
        );
    }

    async close() {
        if (
            this.socket.readyState === WebSocket.CLOSING ||
            this.socket.readyState === WebSocket.CLOSED
        ) {
            return;
        }

        await new Promise<void>((resolve) => {
            this.socket.addEventListener('close', () => resolve(), { once: true });
            this.socket.close();
        });
    }
}

const createRoom = async (urlBase: string) => {
    const response = await fetch(`${urlBase}/rooms`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(createRoomPayload),
    });
    expect(response.status).toBe(201);
    return (await response.json()) as RoomDetail;
};

const openSockets = async (port: number, roomId: string) =>
    await Promise.all([
        SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${roomId}`),
        SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${roomId}`),
        SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${roomId}`),
    ]);

const createCompletingSession = (request: CreateRoomRequest): TypedResult<MatchSession> => {
    const seed = request.seed ?? 20260416;
    const base = createMatchSession(
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

    if (!base.ok) {
        return base;
    }

    const initial = structuredClone(base.value.snapshot());
    let currentSnapshot = structuredClone(initial);
    const completedSnapshot = structuredClone(initial);
    completedSnapshot.context.phase = 'terminal';
    completedSnapshot.context.winner = 'p1';
    completedSnapshot.context.victoryReason = 'points';
    completedSnapshot.sequence = initial.sequence + 1;

    const replayBundle: ReplayBundle = {
        ...base.value.replay(),
        finalStateHash: 'step5-room-replay',
        resultSummary: {
            winner: 'p1',
            reason: 'points',
            turns: completedSnapshot.context.turn.turnNumber,
            finalSeq: completedSnapshot.sequence,
        },
    };

    return {
        ok: true,
        value: {
            dispatch(_command: GameCommand): TypedResult<GameSnapshot> {
                currentSnapshot = structuredClone(completedSnapshot);
                return {
                    ok: true,
                    value: currentSnapshot,
                };
            },
            snapshot() {
                return currentSnapshot;
            },
            replay() {
                return replayBundle;
            },
            replayInspector() {
                return buildReplayInspectorModel(replayBundle);
            },
            viewModel(viewer) {
                return buildUiViewModel(currentSnapshot, viewer ?? 'p1');
            },
            aiTrace() {
                return [];
            },
        },
    };
};

describe('buildRoomServiceApp', () => {
    let app: Awaited<ReturnType<typeof buildRoomServiceApp>>;
    let port: number;
    let urlBase: string;

    afterEach(async () => {
        await app?.close();
    });

    beforeEach(async () => {
        app = await buildRoomServiceApp({ logger: false });
        await app.listen({ port: 0, host: '127.0.0.1' });
        port = (app.server.address() as AddressInfo).port;
        urlBase = `http://127.0.0.1:${port}`;
    });

    it('creates an empty waiting room and keeps the HTTP join shim non-mutating', async () => {
        const created = await createRoom(urlBase);
        expect(created.playerCount).toBe(0);
        expect(created.status).toBe('waiting');
        expect(created.snapshot?.visibility).toBe('spectator');
        expect(created.availableActions).toEqual([]);

        const joinResponse = await fetch(`${urlBase}/rooms/${created.roomId}/join`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                playerName: 'Alice',
                preferredSeat: 'p1',
            }),
        });
        expect(joinResponse.status).toBe(200);

        const afterJoin = readJson<RoomDetail>(
            await (await fetch(`${urlBase}/rooms/${created.roomId}`)).text()
        );
        expect(afterJoin.playerCount).toBe(0);
        expect(afterJoin.status).toBe('waiting');
        expect(afterJoin.snapshot?.visibility).toBe('spectator');
    });

    it('assigns websocket seats authoritatively and rejects occupied seats', async () => {
        const room = await createRoom(urlBase);
        const [p1, p2, challenger] = await openSockets(port, room.roomId);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const p1State = await p1.nextMessage();
        expect(p1State.type).toBe('room.state');
        if (p1State.type !== 'room.state' || p1State.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state for p1.');
        }
        expect(p1State.room.snapshot.viewer).toBe('p1');
        expect(p1State.room.playerCount).toBe(1);
        expect(p1State.room.status).toBe('waiting');
        expect(p1State.room.availableActions.length).toBeGreaterThan(0);

        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        const p2State = await p2.nextMessage();
        expect(p2State.type).toBe('room.state');
        if (p2State.type !== 'room.state' || p2State.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state for p2.');
        }
        expect(p2State.room.snapshot.viewer).toBe('p2');
        expect(p2State.room.playerCount).toBe(2);
        expect(p2State.room.status).toBe('active');
        expect(p2State.room.availableActions).toEqual([]);

        challenger.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Cara',
            preferredSeat: 'p1',
        });
        const rejected = await challenger.nextMessage();
        expect(rejected.type).toBe('room.error');
        if (rejected.type !== 'room.error') {
            throw new Error('Expected room.error.');
        }
        expect(rejected.error.code).toBe('ROOM_SEAT_TAKEN');

        await Promise.all([p1.close(), p2.close(), challenger.close()]);
    });

    it('requires a player binding before commands and blocks spectators from commanding', async () => {
        const room = await createRoom(urlBase);
        const unbound = await SocketHarness.connect(
            `ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`
        );

        unbound.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-unbound',
                expectedSeq: room.snapshot!.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });
        const unboundError = await unbound.nextMessage();
        expect(unboundError.type).toBe('room.error');
        if (unboundError.type !== 'room.error') {
            throw new Error('Expected room.error.');
        }
        expect(unboundError.error.code).toBe('ROOM_BINDING_REQUIRED');

        const spectator = await SocketHarness.connect(
            `ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`
        );
        spectator.send({
            type: 'room.watch',
            roomId: room.roomId,
            spectatorName: 'Spec',
        });
        const spectatorState = await spectator.nextMessage();
        expect(spectatorState.type).toBe('room.state');
        if (
            spectatorState.type !== 'room.state' ||
            spectatorState.room?.snapshot?.visibility !== 'spectator'
        ) {
            throw new Error('Expected spectator room.state.');
        }
        expect(spectatorState.room.availableActions).toEqual([]);

        spectator.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-spectator',
                expectedSeq: spectatorState.room.snapshot.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });
        const spectatorError = await spectator.nextMessage();
        expect(spectatorError.type).toBe('room.error');
        if (spectatorError.type !== 'room.error') {
            throw new Error('Expected room.error.');
        }
        expect(spectatorError.error.code).toBe('ROOM_COMMAND_FORBIDDEN');

        await Promise.all([unbound.close(), spectator.close()]);
    });

    it('rejects player commands while the room is still waiting for the second player', async () => {
        const room = await createRoom(urlBase);
        const player = await SocketHarness.connect(
            `ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`
        );

        player.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const roomState = await player.nextMessage();
        expect(roomState.type).toBe('room.state');
        if (roomState.type !== 'room.state' || roomState.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state.');
        }

        player.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-waiting',
                expectedSeq: roomState.room.snapshot.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });
        const waitingError = await player.nextMessage();
        expect(waitingError.type).toBe('room.error');
        if (waitingError.type !== 'room.error') {
            throw new Error('Expected room.error.');
        }
        expect(waitingError.error.code).toBe('ROOM_WAITING_FOR_PLAYERS');

        await player.close();
    });

    it('ignores client-issuedBy, scopes actions per viewer, replays duplicate commands idempotently, and resyncs stale seq values', async () => {
        const room = await createRoom(urlBase);
        const [p1, p2, spectator] = await openSockets(port, room.roomId);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const p1State = await p1.nextMessage();
        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        await p2.nextMessage();
        spectator.send({
            type: 'room.watch',
            roomId: room.roomId,
            spectatorName: 'Spec',
        });
        await spectator.nextMessage();

        if (p1State.type !== 'room.state' || p1State.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state.');
        }

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-1',
                expectedSeq: p1State.room.snapshot.sequence,
                issuedBy: 'p2',
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });

        const [p1Patch, p2Patch, spectatorObserve] = await Promise.all([
            p1.nextMessage(),
            p2.nextMessage(),
            spectator.nextMessage(),
        ]);

        expect(p1Patch.type).toBe('match.patch');
        expect(p2Patch.type).toBe('match.patch');
        expect(spectatorObserve.type).toBe('match.observe');
        if (
            p1Patch.type !== 'match.patch' ||
            p2Patch.type !== 'match.patch' ||
            spectatorObserve.type !== 'match.observe'
        ) {
            throw new Error('Expected command fanout messages.');
        }
        if (p1Patch.snapshot.visibility !== 'player' || p2Patch.snapshot.visibility !== 'player') {
            throw new Error('Expected player-scoped match.patch payloads.');
        }
        expect(p1Patch.snapshot.visibility).toBe('player');
        expect(p1Patch.snapshot.viewer).toBe('p1');
        expect(p2Patch.snapshot.viewer).toBe('p2');
        expect(spectatorObserve.snapshot.visibility).toBe('spectator');
        expect(p1Patch.roomStatus).toBe('active');
        expect(p2Patch.roomStatus).toBe('active');
        expect(spectatorObserve.roomStatus).toBe('active');
        expect(p1Patch.availableActions.length).toBeGreaterThan(0);
        expect(p2Patch.availableActions).toEqual([]);
        expect(spectatorObserve.availableActions).toEqual([]);

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-1',
                expectedSeq: p1State.room.snapshot.sequence,
                issuedBy: 'p2',
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });
        const duplicatePatch = await p1.nextMessage();
        expect(duplicatePatch).toEqual(p1Patch);
        await Promise.all([p2.expectNoMessage(), spectator.expectNoMessage()]);

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-stale',
                expectedSeq: p1State.room.snapshot.sequence,
                command: { type: 'BEGIN_RESERVE' },
            },
        });
        const resync = await p1.nextMessage();
        expect(resync.type).toBe('match.resync');
        if (resync.type !== 'match.resync') {
            throw new Error('Expected match.resync.');
        }
        if (resync.snapshot.visibility !== 'player') {
            throw new Error('Expected a player-scoped resync snapshot.');
        }
        expect(resync.lastKnownSeq).toBe(p1State.room.snapshot.sequence);
        expect(resync.snapshot.visibility).toBe('player');
        expect(resync.snapshot.viewer).toBe('p1');
        expect(resync.snapshot.sequence).toBe(p1Patch.snapshot.sequence);
        expect(resync.roomStatus).toBe('active');
        expect(resync.availableActions).toEqual(p1Patch.availableActions);

        await Promise.all([p1.close(), p2.close(), spectator.close()]);
    });

    it('redacts spectator pending-selection drafts while keeping player resync state intact', async () => {
        const room = await createRoom(urlBase);
        const [p1, p2, spectator] = await openSockets(port, room.roomId);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const p1State = await p1.nextMessage();
        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        await p2.nextMessage();
        spectator.send({
            type: 'room.watch',
            roomId: room.roomId,
            spectatorName: 'Spec',
        });
        await spectator.nextMessage();

        if (p1State.type !== 'room.state' || p1State.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state.');
        }

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-begin-selection',
                expectedSeq: p1State.room.snapshot.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });

        const [p1BeginPatch] = await Promise.all([
            p1.nextMessage(),
            p2.nextMessage(),
            spectator.nextMessage(),
        ]);

        expect(p1BeginPatch.type).toBe('match.patch');
        if (p1BeginPatch.type !== 'match.patch' || p1BeginPatch.snapshot.visibility !== 'player') {
            throw new Error('Expected a player-scoped match.patch after BEGIN_GEM_SELECTION.');
        }

        const addPositionAction = p1BeginPatch.availableActions.find(
            (action) => action.command.type === 'TAKE_TOKENS_ADD_POSITION'
        );
        if (!addPositionAction || addPositionAction.command.type !== 'TAKE_TOKENS_ADD_POSITION') {
            throw new Error('Expected TAKE_TOKENS_ADD_POSITION after BEGIN_GEM_SELECTION.');
        }

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-add-selection',
                expectedSeq: p1BeginPatch.snapshot.sequence,
                command: addPositionAction.command,
            },
        });

        const [p1SelectionPatch, _p2SelectionPatch, spectatorObserve] = await Promise.all([
            p1.nextMessage(),
            p2.nextMessage(),
            spectator.nextMessage(),
        ]);

        expect(p1SelectionPatch.type).toBe('match.patch');
        expect(spectatorObserve.type).toBe('match.observe');
        if (
            p1SelectionPatch.type !== 'match.patch' ||
            p1SelectionPatch.snapshot.visibility !== 'player' ||
            spectatorObserve.type !== 'match.observe'
        ) {
            throw new Error('Expected player patch plus spectator observe after selection.');
        }

        expect(p1SelectionPatch.snapshot.pendingSelection).toMatchObject({
            action: 'TAKE_TOKENS',
            selectedPositions: [addPositionAction.command.positionId],
        });
        expect(spectatorObserve.snapshot.pendingSelection).toBeNull();
        expect(spectatorObserve.availableActions).toEqual([]);

        const spectatorView = buildVisibleUiViewModel(
            spectatorObserve.snapshot,
            spectatorObserve.availableActions,
            { roomStatus: spectatorObserve.roomStatus }
        );
        expect(spectatorView.selectionDraft).toBeNull();
        expect(spectatorView.boardCells.some((cell) => cell.selected)).toBe(false);

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-stale-after-selection',
                expectedSeq: p1BeginPatch.snapshot.sequence,
                command: { type: 'BEGIN_RESERVE' },
            },
        });
        const resync = await p1.nextMessage();
        expect(resync.type).toBe('match.resync');
        if (resync.type !== 'match.resync' || resync.snapshot.visibility !== 'player') {
            throw new Error('Expected a player-scoped match.resync after stale seq.');
        }
        expect(resync.snapshot.pendingSelection).toEqual(
            p1SelectionPatch.snapshot.pendingSelection
        );

        await Promise.all([p1.close(), p2.close(), spectator.close()]);
    });

    it('forbids a bound player from acting when the other seat owns the turn', async () => {
        const room = await createRoom(urlBase);
        const [p1, p2] = await Promise.all([
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
        ]);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const p1State = await p1.nextMessage();
        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        const p2State = await p2.nextMessage();

        if (p1State.type !== 'room.state' || p2State.type !== 'room.state') {
            throw new Error('Expected initial room.state messages.');
        }

        p2.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-out-of-turn',
                expectedSeq: p2State.room!.snapshot!.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });
        const forbidden = await p2.nextMessage();
        expect(forbidden.type).toBe('room.error');
        if (forbidden.type !== 'room.error') {
            throw new Error('Expected room.error.');
        }
        expect(forbidden.error.code).toBe('ROOM_COMMAND_FORBIDDEN');

        await Promise.all([p1.close(), p2.close()]);
    });

    it('returns rooms to waiting on room.leave and disconnect while keeping HTTP state spectator-safe', async () => {
        const room = await createRoom(urlBase);
        const [p1, p2] = await Promise.all([
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
        ]);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        await p1.nextMessage();
        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        await p2.nextMessage();

        p1.send({
            type: 'room.leave',
            roomId: room.roomId,
        });
        const leftState = await p1.nextMessage();
        expect(leftState.type).toBe('room.state');
        if (leftState.type !== 'room.state' || !leftState.room) {
            throw new Error('Expected room.state after room.leave.');
        }
        expect(leftState.room.playerCount).toBe(1);
        expect(leftState.room.status).toBe('waiting');
        expect(leftState.room.snapshot?.visibility).toBe('spectator');

        const afterLeave = readJson<RoomDetail>(
            await (await fetch(`${urlBase}/rooms/${room.roomId}`)).text()
        );
        expect(afterLeave.playerCount).toBe(1);
        expect(afterLeave.status).toBe('waiting');
        expect(afterLeave.snapshot?.visibility).toBe('spectator');

        await p2.close();
        await new Promise((resolve) => setTimeout(resolve, 50));

        const afterDisconnect = readJson<RoomDetail>(
            await (await fetch(`${urlBase}/rooms/${room.roomId}`)).text()
        );
        expect(afterDisconnect.playerCount).toBe(0);
        expect(afterDisconnect.status).toBe('waiting');
        expect(afterDisconnect.snapshot?.visibility).toBe('spectator');

        await p1.close();
    });

    it('stores the replay when a room completes and serves it from the replay endpoint', async () => {
        await app.close();
        app = await buildRoomServiceApp({
            logger: false,
            createSession: createCompletingSession,
        });
        await app.listen({ port: 0, host: '127.0.0.1' });
        port = (app.server.address() as AddressInfo).port;
        urlBase = `http://127.0.0.1:${port}`;

        const room = await createRoom(urlBase);
        const [p1, p2] = await Promise.all([
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
            SocketHarness.connect(`ws://127.0.0.1:${port}/ws/rooms/${room.roomId}`),
        ]);

        p1.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Alice',
        });
        const p1State = await p1.nextMessage();
        p2.send({
            type: 'room.join',
            roomId: room.roomId,
            playerName: 'Bob',
        });
        await p2.nextMessage();

        if (p1State.type !== 'room.state' || p1State.room?.snapshot?.visibility !== 'player') {
            throw new Error('Expected player room.state.');
        }

        p1.send({
            type: 'match.command',
            command: {
                clientCommandId: 'cmd-finish',
                expectedSeq: p1State.room.snapshot.sequence,
                command: { type: 'BEGIN_GEM_SELECTION' },
            },
        });

        const [p1Patch, p2Patch] = await Promise.all([p1.nextMessage(), p2.nextMessage()]);
        expect(p1Patch.type).toBe('match.patch');
        expect(p2Patch.type).toBe('match.patch');
        if (p1Patch.type !== 'match.patch' || p2Patch.type !== 'match.patch') {
            throw new Error('Expected match patches after the completing command.');
        }
        expect(p1Patch.snapshot.context.phase).toBe('terminal');
        expect(p1Patch.snapshot.context.winner).toBe('p1');
        expect(p1Patch.roomStatus).toBe('completed');
        expect(p2Patch.roomStatus).toBe('completed');

        const replayResponse = await fetch(`${urlBase}/replays/${room.roomId}`);
        expect(replayResponse.status).toBe(200);
        const replayDetail = readJson<{ replayId: string; bundle: ReplayBundle }>(
            await replayResponse.text()
        );
        expect(replayDetail.replayId).toBe(room.roomId);
        expect(replayDetail.bundle.finalStateHash).toBe('step5-room-replay');
        expect(replayDetail.bundle.resultSummary.winner).toBe('p1');
        expect(replayDetail.bundle.resultSummary.reason).toBe('points');

        const roomAfterCompletion = readJson<RoomDetail>(
            await (await fetch(`${urlBase}/rooms/${room.roomId}`)).text()
        );
        expect(roomAfterCompletion.status).toBe('completed');
        expect(roomAfterCompletion.availableActions).toEqual([]);

        await Promise.all([p1.close(), p2.close()]);
    });
});

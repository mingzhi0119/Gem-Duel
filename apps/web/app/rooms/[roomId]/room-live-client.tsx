'use client';

import {
    startTransition,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
    type FormEvent,
} from 'react';
import Link from 'next/link';
import {
    buildRoomUiViewModel,
    buildVisibleUiViewModel,
    type ViewerId,
} from '@gem-duel/application';
import {
    RoomWsMessageSchema,
    type PlayerSnapshot,
    type RoomDetail,
    type UiActionDescriptor,
    type UiViewModel,
} from '@gem-duel/contracts';
import { BoardScene, Section } from '@gem-duel/ui';
import { fetchRoomDetail } from '@/lib/browser-room-service';

type BindingState = 'unbound' | 'player' | 'spectator';
type SocketState = 'idle' | 'connecting' | 'open' | 'closed';
type PendingBinding = BindingState | 'leave' | null;
type PlayerId = PlayerSnapshot['viewer'];

const updateRoomRealtime = (
    room: RoomDetail | null,
    snapshot: RoomDetail['snapshot'],
    availableActions: RoomDetail['availableActions'],
    status?: RoomDetail['status']
): RoomDetail | null =>
    room
        ? {
              ...room,
              snapshot,
              availableActions,
              status: status ?? room.status,
          }
        : null;

export function RoomLiveClient({ roomId }: { roomId: string }) {
    const socketRef = useRef<WebSocket | null>(null);
    const commandCounterRef = useRef(0);
    const pendingBindingRef = useRef<PendingBinding>(null);
    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [viewModel, setViewModel] = useState<UiViewModel | null>(null);
    const [binding, setBinding] = useState<BindingState>('unbound');
    const [socketState, setSocketState] = useState<SocketState>('idle');
    const [playerName, setPlayerName] = useState('Player');
    const [spectatorName, setSpectatorName] = useState('Spectator');
    const [lastError, setLastError] = useState<string | null>(null);

    const applyRoomDetail = useEffectEvent((detail: RoomDetail | null) => {
        startTransition(() => {
            setRoom(detail);
            setViewModel(detail ? buildRoomUiViewModel(detail) : null);
        });
    });

    const handleRealtimePayload = useEffectEvent(
        (
            snapshot: NonNullable<RoomDetail['snapshot']>,
            availableActions: RoomDetail['availableActions'],
            roomStatus?: RoomDetail['status']
        ) => {
            startTransition(() => {
                setViewModel(buildVisibleUiViewModel(snapshot, availableActions, { roomStatus }));
                setRoom((currentRoom) =>
                    updateRoomRealtime(currentRoom, snapshot, availableActions, roomStatus)
                );
            });
        }
    );

    const handleSocketMessage = useEffectEvent((event: MessageEvent<string>) => {
        const message = RoomWsMessageSchema.parse(JSON.parse(event.data));
        switch (message.type) {
            case 'room.state': {
                applyRoomDetail(message.room);
                if (pendingBindingRef.current === 'leave') {
                    setBinding('unbound');
                } else if (message.room?.snapshot?.visibility === 'player') {
                    setBinding('player');
                } else if (pendingBindingRef.current === 'spectator' || binding === 'spectator') {
                    setBinding('spectator');
                } else if (binding !== 'player') {
                    setBinding('unbound');
                }
                pendingBindingRef.current = null;
                setLastError(null);
                return;
            }
            case 'match.patch':
            case 'match.resync':
            case 'match.observe':
                handleRealtimePayload(
                    message.snapshot,
                    message.availableActions,
                    message.roomStatus
                );
                if (message.type === 'match.observe') {
                    setBinding('spectator');
                }
                setLastError(null);
                return;
            case 'room.error':
                setLastError(message.error.message);
                return;
            default:
                return;
        }
    });

    const closeSocket = useEffectEvent(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        setSocketState('closed');
    });

    const openSocket = useEffectEvent(
        (
            buildFirstMessage: () =>
                | {
                      type: 'room.join';
                      roomId: string;
                      playerName: string;
                      preferredSeat?: PlayerId;
                  }
                | { type: 'room.watch'; roomId: string; spectatorName?: string }
        ) => {
            if (!room?.wsUrl) {
                setLastError('The room does not currently expose a websocket endpoint.');
                return;
            }

            closeSocket();
            setSocketState('connecting');
            setLastError(null);

            const socket = new WebSocket(room.wsUrl);
            socketRef.current = socket;

            socket.addEventListener('open', () => {
                setSocketState('open');
                socket.send(JSON.stringify(buildFirstMessage()));
            });
            socket.addEventListener('message', handleSocketMessage);
            socket.addEventListener('close', () => {
                setSocketState('closed');
            });
            socket.addEventListener('error', () => {
                setLastError('The live room websocket reported an error.');
            });
        }
    );

    useEffect(() => {
        let cancelled = false;

        fetchRoomDetail(roomId)
            .then((detail) => {
                if (cancelled) {
                    return;
                }
                startTransition(() => {
                    setRoom(detail);
                    setViewModel(detail ? buildRoomUiViewModel(detail) : null);
                });
            })
            .catch((caughtError) => {
                if (cancelled) {
                    return;
                }
                setLastError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : `Failed to load room ${roomId}.`
                );
            });

        return () => {
            cancelled = true;
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'room.leave', roomId }));
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [roomId]);

    const handleJoin = (preferredSeat?: PlayerId) => {
        pendingBindingRef.current = 'player';
        openSocket(() => ({
            type: 'room.join',
            roomId,
            playerName,
            ...(preferredSeat ? { preferredSeat } : {}),
        }));
    };

    const handleWatch = () => {
        pendingBindingRef.current = 'spectator';
        openSocket(() => ({
            type: 'room.watch',
            roomId,
            spectatorName,
        }));
    };

    const handleLeave = () => {
        pendingBindingRef.current = 'leave';
        setBinding('unbound');
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'room.leave', roomId }));
            return;
        }
        closeSocket();
    };

    const handleAction = (action: UiActionDescriptor) => {
        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN ||
            !viewModel ||
            viewModel.snapshot.visibility !== 'player'
        ) {
            setLastError('The player stream is not ready to submit commands.');
            return;
        }

        commandCounterRef.current += 1;
        socketRef.current.send(
            JSON.stringify({
                type: 'match.command',
                command: {
                    clientCommandId: `web-${roomId}-${commandCounterRef.current}`,
                    expectedSeq: viewModel.snapshot.sequence,
                    issuedBy: viewModel.snapshot.viewer,
                    command: action.command,
                },
            })
        );
    };

    const handleNameSubmit = (event: FormEvent) => {
        event.preventDefault();
    };

    const canSubmitActions =
        binding === 'player' &&
        socketState === 'open' &&
        viewModel?.viewerRole === 'player' &&
        viewModel.snapshot.visibility === 'player';
    const boardNote = viewModel ? (
        <p className="gd-muted">
            {viewModel.viewerRole === 'spectator'
                ? 'Spectators receive filtered state only and cannot submit commands.'
                : canSubmitActions
                  ? 'Commands are submitted through room-service with viewer-filtered state and authoritative sequencing.'
                  : 'This viewer is currently connected read-only; wait for the authoritative stream to re-enable commands.'}
        </p>
    ) : null;

    return (
        <>
            <Section title={`Room ${roomId}`}>
                <p className="gd-muted">
                    ZH: 该页面直接消费 room-service 的 viewer-filtered realtime stream，再由
                    `application` 归并成共享 `UiViewModel`。 EN: This page consumes the
                    viewer-filtered room-service realtime stream and lets `application` compose it
                    into the shared `UiViewModel`.
                </p>
                <div className="gd-grid">
                    <div className="gd-card">
                        <strong>Status</strong>
                        <span>{viewModel?.sessionStatus ?? room?.status ?? 'loading'}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Players</strong>
                        <span>{room?.playerCount ?? 0} / 2</span>
                    </div>
                    <div className="gd-card">
                        <strong>Binding</strong>
                        <span>{binding}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Socket</strong>
                        <span>{socketState}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Viewer</strong>
                        <span>
                            {viewModel
                                ? viewModel.viewerRole === 'player'
                                    ? (viewModel.seat as ViewerId)
                                    : 'spectator'
                                : 'spectator'}
                        </span>
                    </div>
                </div>
                <div className="gd-action-list">
                    <Link className="gd-link" href="/rooms">
                        Back to Rooms
                    </Link>
                    {room?.status === 'completed' ? (
                        <Link className="gd-link" href={`/replays/${roomId}`}>
                            Open Replay
                        </Link>
                    ) : null}
                </div>
            </Section>

            <Section title="Join or Watch">
                <form className="gd-form-stack" onSubmit={handleNameSubmit}>
                    <label className="gd-form-field">
                        <span>Player Name</span>
                        <input
                            value={playerName}
                            onChange={(event) => setPlayerName(event.target.value)}
                        />
                    </label>
                    <label className="gd-form-field">
                        <span>Spectator Name</span>
                        <input
                            value={spectatorName}
                            onChange={(event) => setSpectatorName(event.target.value)}
                        />
                    </label>
                </form>
                <div className="gd-action-list">
                    <button type="button" className="gd-button" onClick={() => handleJoin('p1')}>
                        Join as P1
                    </button>
                    <button type="button" className="gd-button" onClick={() => handleJoin('p2')}>
                        Join as P2
                    </button>
                    <button type="button" className="gd-link" onClick={handleWatch}>
                        Watch Room
                    </button>
                    <button
                        type="button"
                        className="gd-button gd-button-muted"
                        onClick={handleLeave}
                    >
                        Leave Stream
                    </button>
                </div>
                {lastError ? <p className="gd-error">{lastError}</p> : null}
            </Section>

            {viewModel ? (
                <BoardScene
                    eyebrow="Online Room"
                    viewModel={viewModel}
                    currentFinalStateHash={null}
                    hashUnavailableLabel={
                        room?.status === 'completed'
                            ? 'Replay hash in replay view'
                            : 'Authoritative live stream'
                    }
                    onSelect={canSubmitActions ? handleAction : undefined}
                    note={boardNote}
                    error={lastError}
                />
            ) : (
                <Section title="Realtime View">
                    <p className="gd-muted">
                        Load the room detail, then join as a player or spectator to start the live
                        stream.
                    </p>
                </Section>
            )}
        </>
    );
}

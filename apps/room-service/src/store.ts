import type { MatchSession } from '@gem-duel/application';
import type {
    CreateRoomRequest,
    PlayerSnapshot,
    ReplayBundle,
    SpectatorSnapshot,
} from '@gem-duel/contracts';

type PlayerId = PlayerSnapshot['viewer'];

export interface CachedCommandResult {
    owner: PlayerId;
    playerPatches: Record<
        PlayerId,
        {
            type: 'match.patch';
            seq: number;
            snapshot: PlayerSnapshot;
        }
    >;
    spectatorMessage: {
        type: 'match.observe';
        seq: number;
        snapshot: SpectatorSnapshot;
    };
}

export interface RoomSeatBinding {
    connectionId: string;
    playerName: string;
}

export interface RoomRuntime {
    roomId: string;
    hostPlayer: 'p1';
    createdAt: string;
    request: CreateRoomRequest;
    session: MatchSession;
    replay: ReplayBundle | null;
    seatBindings: Partial<Record<PlayerId, RoomSeatBinding>>;
    processedCommands: Map<string, CachedCommandResult>;
}

export interface RoomAuthorityStore {
    create(room: RoomRuntime): RoomRuntime;
    get(roomId: string): RoomRuntime | null;
    upsert(room: RoomRuntime): RoomRuntime;
    storeReplay(roomId: string, bundle: ReplayBundle): RoomRuntime | null;
    getReplay(roomId: string): ReplayBundle | null;
}

export const createInMemoryRoomAuthorityStore = (): RoomAuthorityStore => {
    const rooms = new Map<string, RoomRuntime>();

    return {
        create(room) {
            rooms.set(room.roomId, room);
            return room;
        },
        get(roomId) {
            return rooms.get(roomId) ?? null;
        },
        upsert(room) {
            rooms.set(room.roomId, room);
            return room;
        },
        storeReplay(roomId, bundle) {
            const room = rooms.get(roomId) ?? null;
            if (!room) {
                return null;
            }

            room.replay = bundle;
            rooms.set(roomId, room);
            return room;
        },
        getReplay(roomId) {
            return rooms.get(roomId)?.replay ?? null;
        },
    };
};

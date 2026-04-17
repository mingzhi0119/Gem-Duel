import type {
    CreateRoomRequest,
    JoinRoomRequest,
    ReplayBundle,
    RoomDetail,
    RoomSummary,
    TypedResult,
} from '@gem-duel/contracts';
import type { EnginePorts, IdPort } from '@gem-duel/core-engine';
import { createDomainError } from '@gem-duel/domain';

const hashNamespace = (value: string) => {
    let hash = 2166136261;
    for (const char of value) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

export const createSeededRng = (seed: number, stream = 'root') => {
    const baseSeed = seed || 1;
    let current = baseSeed;

    const next = () => {
        current |= 0;
        current = (current + 0x6d2b79f5) | 0;
        let t = Math.imul(current ^ (current >>> 15), 1 | current);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return {
        next,
        nextInt(maxExclusive: number) {
            return Math.floor(next() * maxExclusive);
        },
        fork(namespace: string) {
            return createSeededRng(
                baseSeed ^ hashNamespace(`${stream}:${namespace}`),
                `${stream}:${namespace}`
            );
        },
    };
};

export const createClockPort = (fixedIso?: string) => ({
    now: () => fixedIso ?? new Date().toISOString(),
});

export const createIdPort = (seedPrefix = 'id'): IdPort => {
    let counter = 0;
    return {
        next(prefix = seedPrefix) {
            counter += 1;
            return `${prefix}-${counter}`;
        },
    };
};

export const createEnginePorts = (seed: number): EnginePorts => ({
    rng: createSeededRng(seed),
    clock: createClockPort(),
    id: createIdPort('match'),
});

export interface RoomRecord {
    summary: RoomSummary;
    detail: RoomDetail;
    replay: ReplayBundle | null;
}

export const createInMemoryRoomRepository = () => {
    const rooms = new Map<string, RoomRecord>();

    return {
        list() {
            return [...rooms.values()].map((room) => room.summary);
        },
        get(roomId: string) {
            return rooms.get(roomId) ?? null;
        },
        upsert(room: RoomRecord) {
            rooms.set(room.summary.roomId, room);
            return room;
        },
        create(input: { roomId: string; request: CreateRoomRequest; detail: RoomDetail }) {
            const summary: RoomSummary = {
                roomId: input.roomId,
                hostPlayer: 'p1',
                playerCount: 1,
                status: 'waiting',
                mode: input.request.mode,
                createdAt: new Date().toISOString(),
            };
            const record = {
                summary,
                detail: input.detail,
                replay: null,
            };
            rooms.set(input.roomId, record);
            return record;
        },
        join(roomId: string, _request: JoinRoomRequest): TypedResult<RoomRecord> {
            const room = rooms.get(roomId);
            if (!room) {
                return {
                    ok: false,
                    error: createDomainError(
                        'ROOM_NOT_FOUND',
                        'validation',
                        `Room ${roomId} was not found.`
                    ),
                };
            }

            room.summary.playerCount = Math.min(2, room.summary.playerCount + 1);
            room.summary.status = 'active';
            room.detail = {
                ...room.detail,
                canJoin: room.summary.playerCount < 2,
            };

            return {
                ok: true,
                value: room,
            };
        },
    };
};

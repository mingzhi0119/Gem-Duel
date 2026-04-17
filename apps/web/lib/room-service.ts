import {
    type CreateRoomRequest,
    type HealthResponse,
    type JoinRoomRequest,
    type ReplayDetail,
    type RoomDetail,
} from '@gem-duel/contracts';

const roomServiceUrl = process.env.ROOM_SERVICE_URL;

type UnavailableBody = {
    ok: false;
    message: string;
};

type ProxyResult<T> = {
    status: number;
    body: T | UnavailableBody;
};

const buildUnavailable = (resource: string): ProxyResult<never> => ({
    status: 503,
    body: {
        ok: false,
        message: `${resource} is unavailable because ROOM_SERVICE_URL is not configured.`,
    },
});

export const proxyHealth = async (): Promise<ProxyResult<HealthResponse>> => {
    if (!roomServiceUrl) {
        return buildUnavailable('health');
    }

    const response = await fetch(`${roomServiceUrl}/health`, { cache: 'no-store' });
    return {
        status: response.status,
        body: await response.json(),
    };
};

export const proxyCreateRoom = async (
    payload: CreateRoomRequest
): Promise<ProxyResult<RoomDetail>> => {
    if (!roomServiceUrl) {
        return buildUnavailable('room creation');
    }

    const response = await fetch(`${roomServiceUrl}/rooms`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    return {
        status: response.status,
        body: await response.json(),
    };
};

export const proxyRoom = async (roomId: string): Promise<ProxyResult<RoomDetail>> => {
    if (!roomServiceUrl) {
        return buildUnavailable('room detail');
    }

    const response = await fetch(`${roomServiceUrl}/rooms/${roomId}`, { cache: 'no-store' });
    return {
        status: response.status,
        body: await response.json(),
    };
};

export const proxyJoinRoom = async (
    roomId: string,
    payload: JoinRoomRequest
): Promise<ProxyResult<RoomDetail>> => {
    if (!roomServiceUrl) {
        return buildUnavailable('room join');
    }

    const response = await fetch(`${roomServiceUrl}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    return {
        status: response.status,
        body: await response.json(),
    };
};

export const proxyReplay = async (replayId: string): Promise<ProxyResult<ReplayDetail>> => {
    if (!roomServiceUrl) {
        return buildUnavailable('replay');
    }

    const response = await fetch(`${roomServiceUrl}/replays/${replayId}`, { cache: 'no-store' });
    return {
        status: response.status,
        body: await response.json(),
    };
};

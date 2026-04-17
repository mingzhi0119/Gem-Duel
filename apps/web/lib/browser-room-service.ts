import {
    CreateRoomRequestSchema,
    ReplayDetailSchema,
    RoomDetailSchema,
    type CreateRoomRequest,
    type ReplayDetail,
    type RoomDetail,
} from '@gem-duel/contracts';

const readErrorMessage = (body: unknown, fallback: string) => {
    if (body && typeof body === 'object') {
        const maybeMessage =
            'error' in body &&
            body.error &&
            typeof body.error === 'object' &&
            'message' in body.error &&
            typeof body.error.message === 'string'
                ? body.error.message
                : 'message' in body && typeof body.message === 'string'
                  ? body.message
                  : null;
        if (maybeMessage) {
            return maybeMessage;
        }
    }

    return fallback;
};

const parseJsonResponse = async <T>(
    response: Response,
    schema: { parse(input: unknown): T },
    fallback: string
): Promise<T> => {
    const body = await response.json();
    if (!response.ok) {
        throw new Error(readErrorMessage(body, fallback));
    }

    return schema.parse(body);
};

export const fetchRoomDetail = async (roomId: string): Promise<RoomDetail> =>
    parseJsonResponse(
        await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' }),
        RoomDetailSchema,
        `Failed to load room ${roomId}.`
    );

export const createRoomFromBrowser = async (payload: CreateRoomRequest): Promise<RoomDetail> => {
    const request = CreateRoomRequestSchema.parse(payload);
    return parseJsonResponse(
        await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request),
        }),
        RoomDetailSchema,
        'Failed to create room.'
    );
};

export const fetchReplayDetail = async (replayId: string): Promise<ReplayDetail> =>
    parseJsonResponse(
        await fetch(`/api/replays/${replayId}`, { cache: 'no-store' }),
        ReplayDetailSchema,
        `Failed to load replay ${replayId}.`
    );

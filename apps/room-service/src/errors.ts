import type { TypedResult } from '@gem-duel/contracts';

type DomainError = Extract<TypedResult<never>, { ok: false }>['error'];

export const ROOM_ERROR_CODES = [
    'ROOM_NOT_FOUND',
    'ROOM_FULL',
    'ROOM_SEAT_TAKEN',
    'ROOM_BINDING_REQUIRED',
    'ROOM_COMMAND_FORBIDDEN',
    'ROOM_ALREADY_BOUND',
    'ROOM_WAITING_FOR_PLAYERS',
] as const;

export type RoomErrorCode = (typeof ROOM_ERROR_CODES)[number];

const ROOM_ERROR_CATEGORY_BY_CODE: Record<RoomErrorCode, DomainError['category']> = {
    ROOM_NOT_FOUND: 'validation',
    ROOM_FULL: 'conflict',
    ROOM_SEAT_TAKEN: 'conflict',
    ROOM_BINDING_REQUIRED: 'authz',
    ROOM_COMMAND_FORBIDDEN: 'authz',
    ROOM_ALREADY_BOUND: 'conflict',
    ROOM_WAITING_FOR_PLAYERS: 'conflict',
};

export const createRoomError = (
    code: RoomErrorCode,
    message: string,
    details?: Record<string, unknown>
): DomainError => ({
    code,
    category: ROOM_ERROR_CATEGORY_BY_CODE[code],
    message,
    recoverable: ROOM_ERROR_CATEGORY_BY_CODE[code] !== 'infra',
    details,
});

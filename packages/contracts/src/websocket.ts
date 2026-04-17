import { z } from 'zod';
import { DomainErrorSchema } from './shared/base';
import { PlayerIdSchema } from './shared/enums';
import { GameCommandSchema } from './game';
import { RoomDetailSchema } from './http';
import { PlayerSnapshotSchema, SpectatorSnapshotSchema, VisibleSnapshotSchema } from './snapshots';
import { UiActionDescriptorSchema } from './ui';

export const MatchCommandEnvelopeSchema = z.object({
    clientCommandId: z.string().min(1),
    expectedSeq: z.number().int().min(0),
    issuedBy: PlayerIdSchema.optional(),
    command: GameCommandSchema,
});

export const RoomJoinMessageSchema = z.object({
    type: z.literal('room.join'),
    roomId: z.string().min(1),
    playerName: z.string().min(1),
    preferredSeat: PlayerIdSchema.optional(),
});

export const RoomWatchMessageSchema = z.object({
    type: z.literal('room.watch'),
    roomId: z.string().min(1),
    spectatorName: z.string().min(1).optional(),
});

export const RoomStateMessageSchema = z.object({
    type: z.literal('room.state'),
    room: RoomDetailSchema.nullable(),
});

export const MatchCommandMessageSchema = z.object({
    type: z.literal('match.command'),
    command: MatchCommandEnvelopeSchema,
});

export const MatchPatchMessageSchema = z.object({
    type: z.literal('match.patch'),
    seq: z.number().int().min(0),
    snapshot: VisibleSnapshotSchema,
    availableActions: z.array(UiActionDescriptorSchema),
});

export const MatchResyncMessageSchema = z.object({
    type: z.literal('match.resync'),
    lastKnownSeq: z.number().int().min(0),
    snapshot: VisibleSnapshotSchema,
    availableActions: z.array(UiActionDescriptorSchema),
});

export const MatchObserveMessageSchema = z.object({
    type: z.literal('match.observe'),
    seq: z.number().int().min(0),
    snapshot: SpectatorSnapshotSchema,
    availableActions: z.array(UiActionDescriptorSchema),
});

export const RoomLeaveMessageSchema = z.object({
    type: z.literal('room.leave'),
    roomId: z.string().min(1),
});

export const RoomErrorMessageSchema = z.object({
    type: z.literal('room.error'),
    error: DomainErrorSchema,
    seq: z.number().int().min(0).optional(),
});

export const RoomWsMessageSchema = z.discriminatedUnion('type', [
    RoomJoinMessageSchema,
    RoomWatchMessageSchema,
    RoomStateMessageSchema,
    MatchCommandMessageSchema,
    MatchPatchMessageSchema,
    MatchResyncMessageSchema,
    MatchObserveMessageSchema,
    RoomLeaveMessageSchema,
    RoomErrorMessageSchema,
]);

export interface WsMessageRegistration {
    type: RoomWsMessage['type'];
    componentName: string;
    operationId: string;
    action: 'send' | 'receive';
    summary: string;
}

export const WS_MESSAGE_REGISTRATIONS: WsMessageRegistration[] = [
    {
        type: 'room.join',
        componentName: 'RoomJoinMessage',
        operationId: 'joinRoomSocket',
        action: 'send',
        summary: 'Client requests to join an online room.',
    },
    {
        type: 'room.watch',
        componentName: 'RoomWatchMessage',
        operationId: 'watchRoomSocket',
        action: 'send',
        summary: 'Client enters spectator mode for a room.',
    },
    {
        type: 'room.state',
        componentName: 'RoomStateMessage',
        operationId: 'receiveRoomState',
        action: 'receive',
        summary: 'Server sends the visible room detail snapshot.',
    },
    {
        type: 'match.command',
        componentName: 'MatchCommandMessage',
        operationId: 'submitMatchCommand',
        action: 'send',
        summary: 'Client submits a deterministic match command.',
    },
    {
        type: 'match.patch',
        componentName: 'MatchPatchMessage',
        operationId: 'receiveMatchPatch',
        action: 'receive',
        summary: 'Server broadcasts a new filtered snapshot patch.',
    },
    {
        type: 'match.resync',
        componentName: 'MatchResyncMessage',
        operationId: 'receiveMatchResync',
        action: 'receive',
        summary: 'Server resynchronizes a client after a sequence mismatch.',
    },
    {
        type: 'match.observe',
        componentName: 'MatchObserveMessage',
        operationId: 'observeMatchSocket',
        action: 'receive',
        summary: 'Server streams spectator-safe snapshots.',
    },
    {
        type: 'room.leave',
        componentName: 'RoomLeaveMessage',
        operationId: 'leaveRoomSocket',
        action: 'send',
        summary: 'Client leaves the room stream.',
    },
    {
        type: 'room.error',
        componentName: 'RoomErrorMessage',
        operationId: 'receiveRoomError',
        action: 'receive',
        summary: 'Server reports an authoritative room error.',
    },
];

export type MatchCommandEnvelope = z.infer<typeof MatchCommandEnvelopeSchema>;
export type RoomWsMessage = z.infer<typeof RoomWsMessageSchema>;
export type PlayerRealtimeSnapshot = z.infer<typeof PlayerSnapshotSchema>;

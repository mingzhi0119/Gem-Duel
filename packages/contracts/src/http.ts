import { z } from 'zod';
import { GameModeSchema, PlayerIdSchema } from './shared/enums';
import { MatchFlagsSchema } from './shared/base';
import { ReplayBundleSchema } from './replay';
import { VisibleSnapshotSchema } from './snapshots';
import { UiActionDescriptorSchema } from './ui';

export const RoomSummarySchema = z.object({
    roomId: z.string().min(1),
    hostPlayer: PlayerIdSchema,
    playerCount: z.number().int().min(0).max(2),
    status: z.enum(['waiting', 'active', 'completed']),
    mode: GameModeSchema,
    createdAt: z.string().datetime(),
});

export const RoomDetailSchema = RoomSummarySchema.extend({
    snapshot: VisibleSnapshotSchema.nullable(),
    availableActions: z.array(UiActionDescriptorSchema),
    canJoin: z.boolean(),
    wsUrl: z.string().url(),
});

export const CreateRoomRequestSchema = z.object({
    mode: GameModeSchema.default('online'),
    seed: z.number().int().nonnegative().optional(),
    flags: MatchFlagsSchema,
});

export const JoinRoomRequestSchema = z.object({
    playerName: z.string().min(1),
    preferredSeat: PlayerIdSchema.optional(),
});

export const HealthResponseSchema = z.object({
    service: z.string().min(1),
    status: z.enum(['ok', 'degraded']),
    version: z.string().min(1),
    timestamp: z.string().datetime(),
});

export const ReplayDetailSchema = z.object({
    replayId: z.string().min(1),
    bundle: ReplayBundleSchema,
});

export type RoomSummary = z.infer<typeof RoomSummarySchema>;
export type RoomDetail = z.infer<typeof RoomDetailSchema>;
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ReplayDetail = z.infer<typeof ReplayDetailSchema>;

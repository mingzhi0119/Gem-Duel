import { z } from 'zod';
import { RULESET_VERSION, type MatchState, type PlayerId } from '@gem-duel/domain';
import type { GameEvent } from './game';
import { GameEventSchema } from './game';
import {
    HiddenStateSchema,
    MatchContextSchema,
    PendingEffectSchema,
    PlayersByIdSchema,
    GemInventorySchema,
} from './shared/base';
import { ENGINE_VERSION, PlayerIdSchema, SCHEMA_VERSION } from './shared/enums';

const SharedSnapshotSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    engineVersion: z.literal(ENGINE_VERSION),
    context: MatchContextSchema,
    gemBank: GemInventorySchema,
    players: PlayersByIdSchema,
    eventLog: z.array(GameEventSchema),
    replayCursor: z.number().int().min(0).nullable(),
    sequence: z.number().int().min(0),
    pendingEffects: z.array(PendingEffectSchema),
});

export const AuthoritativeSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('authoritative'),
    hiddenState: HiddenStateSchema,
});

export const PlayerSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('player'),
    viewer: PlayerIdSchema,
});

export const SpectatorSnapshotSchema = SharedSnapshotSchema.extend({
    visibility: z.literal('spectator'),
});

export const VisibleSnapshotSchema = z.union([PlayerSnapshotSchema, SpectatorSnapshotSchema]);

export const GameSnapshotSchema = AuthoritativeSnapshotSchema satisfies z.ZodType<
    MatchState & {
        schemaVersion: typeof SCHEMA_VERSION;
        rulesetVersion: typeof RULESET_VERSION;
        engineVersion: typeof ENGINE_VERSION;
        eventLog: GameEvent[];
        visibility: 'authoritative';
    }
>;

export type GameSnapshot = z.infer<typeof GameSnapshotSchema>;
export type AuthoritativeSnapshot = z.infer<typeof AuthoritativeSnapshotSchema>;
export type PlayerSnapshot = z.infer<typeof PlayerSnapshotSchema>;
export type SpectatorSnapshot = z.infer<typeof SpectatorSnapshotSchema>;
export type VisibleSnapshot = z.infer<typeof VisibleSnapshotSchema>;

const stripHiddenState = (snapshot: AuthoritativeSnapshot) => ({
    schemaVersion: snapshot.schemaVersion,
    rulesetVersion: snapshot.rulesetVersion,
    engineVersion: snapshot.engineVersion,
    context: snapshot.context,
    gemBank: snapshot.gemBank,
    players: snapshot.players,
    eventLog: snapshot.eventLog,
    replayCursor: snapshot.replayCursor,
    sequence: snapshot.sequence,
    pendingEffects: snapshot.pendingEffects,
});

export const toPlayerSnapshot = (
    snapshot: AuthoritativeSnapshot,
    viewer: PlayerId
): PlayerSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'player',
    viewer,
});

export const toSpectatorSnapshot = (snapshot: AuthoritativeSnapshot): SpectatorSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'spectator',
});

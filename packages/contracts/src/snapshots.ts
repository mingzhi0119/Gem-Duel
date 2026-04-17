import { z } from 'zod';
import {
    RULESET_VERSION,
    type MatchState,
    type PlayerId,
    type PublicPlayerState,
} from '@gem-duel/domain';
import type { GameEvent } from './game';
import { GameEventSchema } from './game';
import { RunContextSchema } from './run';
import {
    ActiveEffectSchema,
    BoardCellSchema,
    EffectPromptSchema,
    HiddenStateSchema,
    MatchContextSchema,
    PlayersByIdSchema,
    PublicPlayersByIdSchema,
    PyramidRowSchema,
    ReserveSlotSchema,
    RoyalCardSchema,
} from './shared/base';
import { ENGINE_VERSION, PlayerIdSchema, SCHEMA_VERSION } from './shared/enums';

const SharedVisibleSnapshotSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    engineVersion: z.literal(ENGINE_VERSION),
    context: MatchContextSchema,
    board: z.array(BoardCellSchema),
    pyramid: z.array(PyramidRowSchema),
    royalSupply: z.array(RoyalCardSchema),
    privilegeSupply: z.number().int().min(0).max(3),
    players: PublicPlayersByIdSchema,
    eventLog: z.array(GameEventSchema),
    replayCursor: z.number().int().min(0).nullable(),
    sequence: z.number().int().min(0),
    runContext: RunContextSchema.nullable(),
    activeEffects: z.array(ActiveEffectSchema),
    effectPrompts: z.array(EffectPromptSchema),
});

export const AuthoritativeSnapshotSchema = SharedVisibleSnapshotSchema.extend({
    visibility: z.literal('authoritative'),
    players: PlayersByIdSchema,
    hiddenState: HiddenStateSchema,
});

export const PlayerSnapshotSchema = SharedVisibleSnapshotSchema.extend({
    visibility: z.literal('player'),
    viewer: PlayerIdSchema,
    viewerReserveSlots: z.array(ReserveSlotSchema),
});

export const SpectatorSnapshotSchema = SharedVisibleSnapshotSchema.extend({
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

const toPublicPlayerState = (
    player: AuthoritativeSnapshot['players'][PlayerId]
): PublicPlayerState => ({
    id: player.id,
    score: player.score,
    crowns: player.crowns,
    privileges: player.privileges,
    inventory: player.inventory,
    reserveSlots: player.reserveSlots.map((slot) => ({
        slotId: slot.slotId,
        occupied: slot.card !== null,
    })),
    tableau: player.tableau,
    royals: player.royals,
});

const projectPublicPlayers = (snapshot: AuthoritativeSnapshot) => ({
    p1: toPublicPlayerState(snapshot.players.p1),
    p2: toPublicPlayerState(snapshot.players.p2),
});

const stripHiddenState = (snapshot: AuthoritativeSnapshot) => ({
    schemaVersion: snapshot.schemaVersion,
    rulesetVersion: snapshot.rulesetVersion,
    engineVersion: snapshot.engineVersion,
    context: snapshot.context,
    board: snapshot.board,
    pyramid: snapshot.pyramid,
    royalSupply: snapshot.royalSupply,
    privilegeSupply: snapshot.privilegeSupply,
    players: projectPublicPlayers(snapshot),
    eventLog: snapshot.eventLog,
    replayCursor: snapshot.replayCursor,
    sequence: snapshot.sequence,
    runContext: snapshot.runContext,
    activeEffects: snapshot.activeEffects,
    effectPrompts: snapshot.effectPrompts,
});

export const toPlayerSnapshot = (
    snapshot: AuthoritativeSnapshot,
    viewer: PlayerId
): PlayerSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'player',
    viewer,
    viewerReserveSlots: structuredClone(snapshot.players[viewer].reserveSlots),
});

export const toSpectatorSnapshot = (snapshot: AuthoritativeSnapshot): SpectatorSnapshot => ({
    ...stripHiddenState(snapshot),
    visibility: 'spectator',
});

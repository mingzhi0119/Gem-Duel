import { z } from 'zod';
import { GameCommandSchema, GameEventSchema } from './game';
import { GameSnapshotSchema } from './snapshots';
import { PlayerIdSchema, SCHEMA_VERSION, ENGINE_VERSION } from './shared/enums';
import { RULESET_VERSION } from '@gem-duel/domain';

export const ReplayCommandSchema = z.object({
    clientCommandId: z.string().min(1),
    expectedSeq: z.number().int().min(0),
    issuedBy: PlayerIdSchema.nullable(),
    command: GameCommandSchema,
});

export const ReplayBundleSchema = z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rulesetVersion: z.literal(RULESET_VERSION),
    engineVersion: z.literal(ENGINE_VERSION),
    seed: z.number().int().nonnegative(),
    initialSnapshot: GameSnapshotSchema,
    commands: z.array(ReplayCommandSchema),
    events: z.array(GameEventSchema),
    finalStateHash: z.string().min(1),
    resultSummary: z.object({
        winner: PlayerIdSchema.nullable(),
        turns: z.number().int().min(0),
        finalSeq: z.number().int().min(0),
    }),
});

export type ReplayCommand = z.infer<typeof ReplayCommandSchema>;
export type ReplayBundle = z.infer<typeof ReplayBundleSchema>;

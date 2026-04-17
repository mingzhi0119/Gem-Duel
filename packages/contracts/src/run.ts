import { z } from 'zod';
import type {
    BuffCatalogEntry,
    BuffInstance,
    BuffInstanceStateValue,
    MetaState,
    RunContext,
    RunRewardOffer,
    RunState,
} from '@gem-duel/domain';
import {
    BuffAcquisitionSourceSchema,
    BuffIdSchema,
    BuffLifecycleSchema,
    BuffRaritySchema,
    BuffScopeSchema,
    BuffTriggerStyleSchema,
    EffectAtomSchema,
    EffectHookPointSchema,
    PlayerIdSchema,
    RunRewardSourceSchema,
    RunStatusSchema,
} from './shared/enums';

export const BuffInstanceStateValueSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
]) satisfies z.ZodType<BuffInstanceStateValue>;

export const BuffCatalogEntrySchema = z.object({
    id: BuffIdSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    rarity: BuffRaritySchema,
    scope: BuffScopeSchema,
    triggerStyle: BuffTriggerStyleSchema,
    lifecycle: BuffLifecycleSchema,
    hookPoint: EffectHookPointSchema,
    effectAtoms: z.array(EffectAtomSchema),
    stacking: z.literal('unique'),
    replayImpact: z.string().min(1),
}) satisfies z.ZodType<BuffCatalogEntry>;

export const BuffInstanceSchema = z.object({
    id: BuffIdSchema,
    owner: PlayerIdSchema,
    source: BuffAcquisitionSourceSchema,
    acquiredAtMatchIndex: z.number().int().min(0),
    state: z.record(BuffInstanceStateValueSchema),
}) satisfies z.ZodType<BuffInstance>;

export const RunRewardOfferSchema = z.object({
    offerId: z.string().min(1),
    source: RunRewardSourceSchema,
    options: z.array(BuffIdSchema).min(1).max(3),
}) satisfies z.ZodType<RunRewardOffer>;

export const RunContextSchema = z.object({
    runId: z.string().min(1),
    matchIndex: z.number().int().min(1),
    wins: z.number().int().min(0).max(3),
    losses: z.number().int().min(0).max(1),
    activeBuffs: z.array(BuffInstanceSchema),
}) satisfies z.ZodType<RunContext>;

export const RunStateSchema = z.object({
    runId: z.string().min(1),
    seed: z.number().int().nonnegative(),
    mode: z.enum(['local', 'ai', 'online']),
    matchIndex: z.number().int().min(1),
    activeMatchId: z.string().min(1).nullable(),
    ownedBuffs: z.array(BuffInstanceSchema),
    wins: z.number().int().min(0).max(3),
    losses: z.number().int().min(0).max(1),
    status: RunStatusSchema,
    currentOffer: RunRewardOfferSchema.nullable(),
}) satisfies z.ZodType<RunState>;

export const MetaStateSchema = z.object({
    profileId: z.string().min(1),
    unlockedBuffIds: z.array(BuffIdSchema),
    unlockedDifficultyIds: z.array(z.string().min(1)),
    completedRunIds: z.array(z.string().min(1)),
    totalRuns: z.number().int().min(0),
    lastUpdatedAt: z.string().datetime().nullable(),
}) satisfies z.ZodType<MetaState>;

export type RunContextContract = z.infer<typeof RunContextSchema>;
export type {
    BuffCatalogEntry,
    BuffId,
    BuffInstance,
    MetaState,
    RunContext,
    RunRewardOffer,
    RunState,
} from '@gem-duel/domain';

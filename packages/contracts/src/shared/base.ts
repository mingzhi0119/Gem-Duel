import { z } from 'zod';
import {
    RULESET_VERSION,
    type ActiveEffect,
    type DomainError,
    type HiddenState,
    type MatchContext,
    type MatchFlags,
    type PlayerState,
} from '@gem-duel/domain';
import {
    EffectAtomSchema,
    EffectExecutionScopeSchema,
    EffectHookPointSchema,
    EffectLifecycleStageSchema,
    EffectOutcomeSchema,
    EffectSourceSchema,
    ErrorCategorySchema,
    GameModeSchema,
    GamePhaseSchema,
    GemColorSchema,
    PlayerIdSchema,
} from './enums';

export const MatchFlagsSchema = z.object({
    roguelike: z.boolean(),
    onlineAuthoritative: z.boolean(),
    aiEnabled: z.boolean(),
}) satisfies z.ZodType<MatchFlags>;

export const GemInventorySchema = z.object({
    blue: z.number().int().min(0),
    white: z.number().int().min(0),
    green: z.number().int().min(0),
    black: z.number().int().min(0),
    red: z.number().int().min(0),
    pearl: z.number().int().min(0),
    gold: z.number().int().min(0),
});

export const PlayerStateSchema = z.object({
    id: PlayerIdSchema,
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    privileges: z.number().int().min(0),
    reservedCards: z.number().int().min(0),
    tableauCards: z.number().int().min(0),
    inventory: GemInventorySchema,
}) satisfies z.ZodType<PlayerState>;

export const PlayersByIdSchema = z.object({
    p1: PlayerStateSchema,
    p2: PlayerStateSchema,
});

export const MatchContextSchema = z.object({
    matchId: z.string().min(1),
    schemaVersion: z.string().min(1),
    rulesetVersion: z.literal(RULESET_VERSION),
    seed: z.number().int().nonnegative(),
    mode: GameModeSchema,
    phase: GamePhaseSchema,
    step: z.number().int().min(0),
    currentPlayer: PlayerIdSchema,
    winner: PlayerIdSchema.nullable(),
    flags: MatchFlagsSchema,
}) satisfies z.ZodType<MatchContext>;

export const ActiveEffectSchema = z.object({
    effectId: z.string().min(1),
    parentEffectId: z.string().min(1).nullable(),
    atom: EffectAtomSchema,
    hookPoint: EffectHookPointSchema,
    source: EffectSourceSchema,
    scope: EffectExecutionScopeSchema,
    owner: PlayerIdSchema.nullable(),
    sequence: z.number().int().min(0),
    stage: EffectLifecycleStageSchema,
    rngNamespace: z.string().min(1),
}) satisfies z.ZodType<ActiveEffect>;

export const EffectOutcomeValueSchema = EffectOutcomeSchema;

export const HiddenStateSchema = z.object({
    bag: z.array(GemColorSchema),
    deckOrder: z.record(z.array(z.string().min(1))),
    extraTurns: z.object({
        p1: z.number().int().min(0),
        p2: z.number().int().min(0),
    }),
}) satisfies z.ZodType<HiddenState>;

export const DomainErrorSchema = z.object({
    code: z.string().min(1),
    category: ErrorCategorySchema,
    message: z.string().min(1),
    recoverable: z.boolean(),
    details: z.record(z.unknown()).optional(),
}) satisfies z.ZodType<DomainError>;

export const TypedResultSuccessSchema = <T extends z.ZodTypeAny>(payload: T) =>
    z.object({
        ok: z.literal(true),
        value: payload,
    });

export const TypedResultFailureSchema = z.object({
    ok: z.literal(false),
    error: DomainErrorSchema,
});

export type TypedResult<T> = { ok: true; value: T } | { ok: false; error: DomainError };

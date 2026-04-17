import { z } from 'zod';
import { MatchFlagsSchema } from './shared/base';
import {
    EffectAtomSchema,
    EffectHookPointSchema,
    GameModeSchema,
    GamePhaseSchema,
    GemColorSchema,
    PlayerIdSchema,
} from './shared/enums';

export const GameCommandSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('SELECT_MODE'),
        mode: GameModeSchema,
        flags: MatchFlagsSchema,
    }),
    z.object({
        type: z.literal('START_MATCH'),
    }),
    z.object({
        type: z.literal('BEGIN_GEM_SELECTION'),
    }),
    z.object({
        type: z.literal('TAKE_GEM'),
        color: GemColorSchema,
    }),
    z.object({
        type: z.literal('BEGIN_RESERVE'),
    }),
    z.object({
        type: z.literal('RESERVE_CARD'),
        slot: z.number().int().min(1).max(3),
    }),
    z.object({
        type: z.literal('BEGIN_BUY'),
    }),
    z.object({
        type: z.literal('BUY_CARD'),
        scoreGain: z.number().int().min(0).max(5),
    }),
    z.object({
        type: z.literal('BEGIN_PRIVILEGE'),
    }),
    z.object({
        type: z.literal('USE_PRIVILEGE'),
        color: GemColorSchema.exclude(['gold']),
    }),
    z.object({
        type: z.literal('BEGIN_ROYAL_RESOLUTION'),
    }),
    z.object({
        type: z.literal('SELECT_ROYAL'),
        crownsGain: z.number().int().min(1).max(3),
    }),
    z.object({
        type: z.literal('BEGIN_BUFF_RESOLUTION'),
    }),
    z.object({
        type: z.literal('RESOLVE_BUFF'),
        scoreGain: z.number().int().min(0).max(3),
    }),
    z.object({
        type: z.literal('ENTER_REPLAY'),
    }),
    z.object({
        type: z.literal('EXIT_REPLAY'),
    }),
    z.object({
        type: z.literal('FINISH_MATCH'),
        winner: PlayerIdSchema,
    }),
]);

export const GameEventSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('match.modeSelected'), mode: GameModeSchema }),
    z.object({ type: z.literal('match.started') }),
    z.object({ type: z.literal('phase.changed'), phase: GamePhaseSchema }),
    z.object({ type: z.literal('gem.taken'), color: GemColorSchema }),
    z.object({ type: z.literal('card.reserved'), slot: z.number().int().min(1).max(3) }),
    z.object({ type: z.literal('card.bought'), scoreGain: z.number().int().min(0) }),
    z.object({ type: z.literal('privilege.used'), color: GemColorSchema }),
    z.object({ type: z.literal('royal.selected'), crownsGain: z.number().int().min(1) }),
    z.object({ type: z.literal('buff.resolved'), scoreGain: z.number().int().min(0) }),
    z.object({
        type: z.literal('effect.enqueued'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
        hookPoint: EffectHookPointSchema,
    }),
    z.object({
        type: z.literal('effect.resolved'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
    }),
    z.object({ type: z.literal('replay.entered') }),
    z.object({ type: z.literal('replay.exited') }),
    z.object({ type: z.literal('match.finished'), winner: PlayerIdSchema }),
]);

export type GameCommand = z.infer<typeof GameCommandSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;

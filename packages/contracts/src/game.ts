import { z } from 'zod';
import { MatchFlagsSchema } from './shared/base';
import {
    BoardPositionIdSchema,
    BonusColorSchema,
    CardLevelSchema,
    EffectAtomSchema,
    EffectExecutionScopeSchema,
    EffectHookPointSchema,
    EffectOutcomeSchema,
    EffectSourceSchema,
    GameModeSchema,
    GamePhaseSchema,
    GemColorSchema,
    PlayerIdSchema,
    ReserveSlotIdSchema,
    StealableGemColorSchema,
    VictoryReasonSchema,
} from './shared/enums';

export const PyramidCardSourceSchema = z.object({
    kind: z.literal('pyramid'),
    level: CardLevelSchema,
    slot: z.number().int().min(1).max(5),
});

export const DeckCardSourceSchema = z.object({
    kind: z.literal('deck'),
    level: CardLevelSchema,
});

export const ReserveCardSourceSchema = z.object({
    kind: z.literal('reserve'),
    slotId: ReserveSlotIdSchema,
});

export const ReserveSourceSchema = z.discriminatedUnion('kind', [
    PyramidCardSourceSchema,
    DeckCardSourceSchema,
]);

export const BuySourceSchema = z.discriminatedUnion('kind', [
    PyramidCardSourceSchema,
    ReserveCardSourceSchema,
]);

export const BoardTokenDeltaSchema = z.object({
    positionId: BoardPositionIdSchema,
    token: GemColorSchema,
});

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
        type: z.literal('TAKE_TOKENS'),
        positions: z.array(BoardPositionIdSchema).min(1).max(3),
    }),
    z.object({
        type: z.literal('BEGIN_RESERVE'),
    }),
    z.object({
        type: z.literal('RESERVE_CARD'),
        goldPosition: BoardPositionIdSchema,
        source: ReserveSourceSchema,
    }),
    z.object({
        type: z.literal('BEGIN_BUY'),
    }),
    z.object({
        type: z.literal('BUY_CARD'),
        source: BuySourceSchema,
    }),
    z.object({
        type: z.literal('BEGIN_PRIVILEGE'),
    }),
    z.object({
        type: z.literal('USE_PRIVILEGE'),
        positions: z.array(BoardPositionIdSchema).min(1).max(3),
    }),
    z.object({
        type: z.literal('REPLENISH_BOARD'),
    }),
    z.object({
        type: z.literal('DISCARD_TOKEN'),
        color: GemColorSchema,
    }),
    z.object({
        type: z.literal('SELECT_ROYAL'),
        royalId: z.string().min(1),
    }),
    z.object({
        type: z.literal('TAKE_EFFECT_BOARD_TOKEN'),
        effectId: z.string().min(1),
        positionId: BoardPositionIdSchema,
    }),
    z.object({
        type: z.literal('STEAL_OPPONENT_TOKEN'),
        effectId: z.string().min(1),
        color: StealableGemColorSchema,
    }),
    z.object({
        type: z.literal('SELECT_BONUS_COLOR'),
        effectId: z.string().min(1),
        color: BonusColorSchema,
    }),
    z.object({
        type: z.literal('ENTER_REPLAY'),
    }),
    z.object({
        type: z.literal('EXIT_REPLAY'),
    }),
]);

export const GameEventSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('match.modeSelected'), mode: GameModeSchema }),
    z.object({ type: z.literal('match.started') }),
    z.object({
        type: z.literal('match.setupCompleted'),
        firstPlayer: PlayerIdSchema,
        privilegeRecipient: PlayerIdSchema,
    }),
    z.object({ type: z.literal('phase.changed'), phase: GamePhaseSchema }),
    z.object({
        type: z.literal('turn.segmentChanged'),
        segment: z.enum(['optional', 'mandatory', 'cleanup']),
        optionalStep: z.enum(['privilege', 'replenish', 'done']),
        pendingDiscardCount: z.number().int().min(0),
    }),
    z.object({
        type: z.literal('tokens.taken'),
        player: PlayerIdSchema,
        source: z.enum(['mandatory', 'privilege', 'effect']),
        positions: z.array(BoardPositionIdSchema),
        colors: z.array(GemColorSchema),
    }),
    z.object({
        type: z.literal('tokens.discarded'),
        player: PlayerIdSchema,
        color: GemColorSchema,
    }),
    z.object({
        type: z.literal('tokens.stolen'),
        player: PlayerIdSchema,
        fromPlayer: PlayerIdSchema,
        color: StealableGemColorSchema,
    }),
    z.object({
        type: z.literal('board.replenished'),
        player: PlayerIdSchema,
        positions: z.array(BoardTokenDeltaSchema),
    }),
    z.object({
        type: z.literal('privilege.used'),
        player: PlayerIdSchema,
        positions: z.array(BoardPositionIdSchema),
        spent: z.number().int().min(1).max(3),
    }),
    z.object({
        type: z.literal('privilege.awarded'),
        player: PlayerIdSchema,
        source: EffectSourceSchema,
    }),
    z.object({
        type: z.literal('card.reserved'),
        player: PlayerIdSchema,
        source: ReserveSourceSchema,
        cardId: z.string().min(1),
        goldPosition: BoardPositionIdSchema,
    }),
    z.object({
        type: z.literal('card.bought'),
        player: PlayerIdSchema,
        source: BuySourceSchema,
        cardId: z.string().min(1),
        bonusColor: BonusColorSchema.nullable(),
        goldSpent: z.number().int().min(0),
    }),
    z.object({
        type: z.literal('card.bonusColorSelected'),
        player: PlayerIdSchema,
        cardId: z.string().min(1),
        color: BonusColorSchema,
    }),
    z.object({
        type: z.literal('pyramid.refilled'),
        level: CardLevelSchema,
        slot: z.number().int().min(1).max(5),
        cardId: z.string().min(1).nullable(),
    }),
    z.object({
        type: z.literal('royal.milestoneReached'),
        player: PlayerIdSchema,
        milestone: z.union([z.literal(3), z.literal(6)]),
    }),
    z.object({
        type: z.literal('royal.selected'),
        player: PlayerIdSchema,
        royalId: z.string().min(1),
    }),
    z.object({
        type: z.literal('effect.spawned'),
        effectId: z.string().min(1),
        parentEffectId: z.string().min(1).nullable(),
        atom: EffectAtomSchema,
        hookPoint: EffectHookPointSchema,
        source: EffectSourceSchema,
        scope: EffectExecutionScopeSchema,
        owner: PlayerIdSchema.nullable(),
        sequence: z.number().int().min(0),
        stage: z.literal('scheduled'),
        rngNamespace: z.string().min(1),
    }),
    z.object({
        type: z.literal('effect.started'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
        sequence: z.number().int().min(0),
        stage: z.literal('running'),
    }),
    z.object({
        type: z.literal('effect.completed'),
        effectId: z.string().min(1),
        atom: EffectAtomSchema,
        sequence: z.number().int().min(0),
        stage: z.literal('completed'),
        outcome: EffectOutcomeSchema,
    }),
    z.object({ type: z.literal('replay.entered') }),
    z.object({ type: z.literal('replay.exited') }),
    z.object({
        type: z.literal('match.finished'),
        winner: PlayerIdSchema,
        reason: VictoryReasonSchema,
    }),
]);

export type GameCommand = z.infer<typeof GameCommandSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;

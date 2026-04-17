import { z } from 'zod';
import {
    PENDING_SELECTION_ACTIONS,
    RULESET_VERSION,
    type ActiveEffect,
    type BoardCellState,
    type PendingSelectionState,
    type BonusColorPrompt,
    type DiscardPrompt,
    type DomainError,
    type EffectPrompt,
    type HiddenState,
    type JewelCardState,
    type MatchContext,
    type MatchFlags,
    type OpponentTokenPrompt,
    type PlayerState,
    type PublicPlayerState,
    type PublicReserveSlotState,
    type PyramidRowState,
    type PyramidSlotState,
    type ReserveSlotState,
    type RoyalCardState,
    type RoyalSelectionPrompt,
    type TurnState,
    type BoardTokenPrompt,
} from '@gem-duel/domain';
import {
    BoardPositionIdSchema,
    BonusColorSchema,
    CardLevelSchema,
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
    JewelCardAbilitySchema,
    OptionalTurnStepSchema,
    PlayerIdSchema,
    PrintedBonusColorSchema,
    ReserveSlotIdSchema,
    StealableGemColorSchema,
    TurnSegmentSchema,
    VictoryReasonSchema,
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

export const JewelCardSchema = z.object({
    cardId: z.string().min(1),
    level: CardLevelSchema,
    points: z.number().int().min(0),
    crowns: z.number().int().min(0),
    printedBonusColor: PrintedBonusColorSchema,
    bonusColor: BonusColorSchema.nullable(),
    bonusCount: z.number().int().min(0),
    cost: GemInventorySchema,
    ability: JewelCardAbilitySchema,
}) satisfies z.ZodType<JewelCardState>;

export const RoyalCardSchema = z.object({
    royalId: z.string().min(1),
    points: z.number().int().min(0),
    crowns: z.number().int().min(0),
    ability: JewelCardAbilitySchema,
    label: z.string().min(1),
}) satisfies z.ZodType<RoyalCardState>;

export const BoardCellSchema = z.object({
    positionId: BoardPositionIdSchema,
    row: z.number().int().min(0).max(4),
    col: z.number().int().min(0).max(4),
    token: GemColorSchema.nullable(),
}) satisfies z.ZodType<BoardCellState>;

export const PyramidSlotSchema = z.object({
    level: CardLevelSchema,
    slot: z.number().int().min(1).max(5),
    card: JewelCardSchema.nullable(),
}) satisfies z.ZodType<PyramidSlotState>;

export const PyramidRowSchema = z.object({
    level: CardLevelSchema,
    slots: z.array(PyramidSlotSchema),
}) satisfies z.ZodType<PyramidRowState>;

export const ReserveSlotSchema = z.object({
    slotId: ReserveSlotIdSchema,
    sourceLevel: CardLevelSchema.nullable(),
    card: JewelCardSchema.nullable(),
}) satisfies z.ZodType<ReserveSlotState>;

export const PublicReserveSlotSchema = z.object({
    slotId: ReserveSlotIdSchema,
    occupied: z.boolean(),
}) satisfies z.ZodType<PublicReserveSlotState>;

export const PlayerStateSchema = z.object({
    id: PlayerIdSchema,
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    privileges: z.number().int().min(0).max(3),
    inventory: GemInventorySchema,
    reserveSlots: z.array(ReserveSlotSchema),
    tableau: z.array(JewelCardSchema),
    royals: z.array(RoyalCardSchema),
}) satisfies z.ZodType<PlayerState>;

export const PublicPlayerStateSchema = z.object({
    id: PlayerIdSchema,
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    privileges: z.number().int().min(0).max(3),
    inventory: GemInventorySchema,
    reserveSlots: z.array(PublicReserveSlotSchema),
    tableau: z.array(JewelCardSchema),
    royals: z.array(RoyalCardSchema),
}) satisfies z.ZodType<PublicPlayerState>;

export const PlayersByIdSchema = z.object({
    p1: PlayerStateSchema,
    p2: PlayerStateSchema,
});

export const PublicPlayersByIdSchema = z.object({
    p1: PublicPlayerStateSchema,
    p2: PublicPlayerStateSchema,
});

export const TurnStateSchema = z.object({
    turnNumber: z.number().int().min(1),
    segment: TurnSegmentSchema,
    optionalStep: OptionalTurnStepSchema,
    mandatoryActionTaken: z.boolean(),
    pendingDiscardCount: z.number().int().min(0),
}) satisfies z.ZodType<TurnState>;

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
    victoryReason: VictoryReasonSchema.nullable(),
    flags: MatchFlagsSchema,
    turn: TurnStateSchema,
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

export const RoyalSelectionPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.literal('gain_royal'),
    milestone: z.union([z.literal(3), z.literal(6)]),
    royalIds: z.array(z.string().min(1)),
}) satisfies z.ZodType<RoyalSelectionPrompt>;

export const BoardTokenPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.literal('take_board_token'),
    allowedColors: z.array(BonusColorSchema),
    count: z.number().int().min(1).max(3),
}) satisfies z.ZodType<BoardTokenPrompt>;

export const OpponentTokenPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.literal('take_opponent_token'),
    targetPlayer: PlayerIdSchema,
    allowedColors: z.array(StealableGemColorSchema),
}) satisfies z.ZodType<OpponentTokenPrompt>;

export const BonusColorPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.literal('override_bonus_color'),
    cardId: z.string().min(1),
    allowedColors: z.array(BonusColorSchema),
}) satisfies z.ZodType<BonusColorPrompt>;

export const DiscardPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.literal('discard_to_limit'),
    remaining: z.number().int().min(1),
}) satisfies z.ZodType<DiscardPrompt>;

export const EffectPromptSchema = z.discriminatedUnion('atom', [
    RoyalSelectionPromptSchema,
    BoardTokenPromptSchema,
    OpponentTokenPromptSchema,
    BonusColorPromptSchema,
    DiscardPromptSchema,
]) satisfies z.ZodType<EffectPrompt>;

export const PendingSelectionActionSchema = z.enum(PENDING_SELECTION_ACTIONS);

export const TakeTokensPendingSelectionSchema = z.object({
    action: z.literal('TAKE_TOKENS'),
    selectedPositions: z.array(BoardPositionIdSchema).max(3),
    maxSelections: z.literal(3),
});

export const UsePrivilegePendingSelectionSchema = z.object({
    action: z.literal('USE_PRIVILEGE'),
    selectedPositions: z.array(BoardPositionIdSchema).max(3),
    maxSelections: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const PendingSelectionStateSchema = z.discriminatedUnion('action', [
    TakeTokensPendingSelectionSchema,
    UsePrivilegePendingSelectionSchema,
]) satisfies z.ZodType<PendingSelectionState>;

export const EffectOutcomeValueSchema = EffectOutcomeSchema;

export const HiddenStateSchema = z.object({
    bag: z.array(GemColorSchema),
    deckOrder: z.object({
        level1: z.array(z.string().min(1)),
        level2: z.array(z.string().min(1)),
        level3: z.array(z.string().min(1)),
    }),
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

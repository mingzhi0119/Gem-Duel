import { z } from 'zod';
import {
    BOARD_POSITION_IDS,
    BONUS_COLORS,
    CARD_LEVELS,
    DECK_LEVEL_KEYS,
    EFFECT_ATOMS,
    EFFECT_EXECUTION_SCOPES,
    EFFECT_HOOK_POINTS,
    EFFECT_LIFECYCLE_STAGES,
    EFFECT_OUTCOMES,
    EFFECT_SOURCES,
    ERROR_CATEGORIES,
    GAME_MODES,
    GAME_PHASES,
    GEM_COLORS,
    JEWEL_CARD_ABILITIES,
    OPTIONAL_TURN_STEPS,
    PLAYER_IDS,
    RESERVE_SLOT_IDS,
    STEALABLE_GEM_COLORS,
    TURN_SEGMENTS,
    VICTORY_REASONS,
} from '@gem-duel/domain';

export const SCHEMA_VERSION = '5.0.0';
export const ENGINE_VERSION = '2026.04-step4';

export const PlayerIdSchema = z.enum(PLAYER_IDS);
export const GameModeSchema = z.enum(GAME_MODES);
export const GamePhaseSchema = z.enum(GAME_PHASES);
export const GemColorSchema = z.enum(GEM_COLORS);
export const BonusColorSchema = z.enum(BONUS_COLORS);
export const StealableGemColorSchema = z.enum(STEALABLE_GEM_COLORS);
export const BoardPositionIdSchema = z.enum(BOARD_POSITION_IDS);
export const DeckLevelKeySchema = z.enum(DECK_LEVEL_KEYS);
export const ReserveSlotIdSchema = z.enum(RESERVE_SLOT_IDS);
export const TurnSegmentSchema = z.enum(TURN_SEGMENTS);
export const OptionalTurnStepSchema = z.enum(OPTIONAL_TURN_STEPS);
export const JewelCardAbilitySchema = z.enum(JEWEL_CARD_ABILITIES);
export const VictoryReasonSchema = z.enum(VICTORY_REASONS);
export const PrintedBonusColorSchema = z.union([BonusColorSchema, z.literal('gold'), z.null()]);
export const CardLevelSchema = z.union([
    z.literal(CARD_LEVELS[0]),
    z.literal(CARD_LEVELS[1]),
    z.literal(CARD_LEVELS[2]),
]);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);
export const EffectAtomSchema = z.enum(EFFECT_ATOMS);
export const EffectHookPointSchema = z.enum(EFFECT_HOOK_POINTS);
export const EffectSourceSchema = z.enum(EFFECT_SOURCES);
export const EffectExecutionScopeSchema = z.enum(EFFECT_EXECUTION_SCOPES);
export const EffectLifecycleStageSchema = z.enum(EFFECT_LIFECYCLE_STAGES);
export const EffectOutcomeSchema = z.enum(EFFECT_OUTCOMES);

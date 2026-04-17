import { z } from 'zod';
import {
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
    PLAYER_IDS,
} from '@gem-duel/domain';

export const SCHEMA_VERSION = '4.0.0';
export const ENGINE_VERSION = '2026.04-step3';

export const PlayerIdSchema = z.enum(PLAYER_IDS);
export const GameModeSchema = z.enum(GAME_MODES);
export const GamePhaseSchema = z.enum(GAME_PHASES);
export const GemColorSchema = z.enum(GEM_COLORS);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);
export const EffectAtomSchema = z.enum(EFFECT_ATOMS);
export const EffectHookPointSchema = z.enum(EFFECT_HOOK_POINTS);
export const EffectSourceSchema = z.enum(EFFECT_SOURCES);
export const EffectExecutionScopeSchema = z.enum(EFFECT_EXECUTION_SCOPES);
export const EffectLifecycleStageSchema = z.enum(EFFECT_LIFECYCLE_STAGES);
export const EffectOutcomeSchema = z.enum(EFFECT_OUTCOMES);

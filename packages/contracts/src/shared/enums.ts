import { z } from 'zod';
import {
    EFFECT_ATOMS,
    EFFECT_HOOK_POINTS,
    ERROR_CATEGORIES,
    GAME_MODES,
    GAME_PHASES,
    GEM_COLORS,
    PLAYER_IDS,
} from '@gem-duel/domain';

export const SCHEMA_VERSION = '2.0.0';
export const ENGINE_VERSION = '2026.04-step2';

export const PlayerIdSchema = z.enum(PLAYER_IDS);
export const GameModeSchema = z.enum(GAME_MODES);
export const GamePhaseSchema = z.enum(GAME_PHASES);
export const GemColorSchema = z.enum(GEM_COLORS);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);
export const EffectAtomSchema = z.enum(EFFECT_ATOMS);
export const EffectHookPointSchema = z.enum(EFFECT_HOOK_POINTS);

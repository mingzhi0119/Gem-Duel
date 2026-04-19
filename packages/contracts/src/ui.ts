import { z } from 'zod';
import { GameCommandSchema } from './game';
import { VisibleSnapshotSchema } from './snapshots';
import { GemInventorySchema, PublicReserveSlotSchema } from './shared/base';
import {
    BoardPositionIdSchema,
    BuffIdSchema,
    CardLevelSchema,
    GemColorSchema,
    PlayerIdSchema,
    PrintedBonusColorSchema,
    ReserveSlotIdSchema,
} from './shared/enums';

export const UiActionDescriptorSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    command: GameCommandSchema,
    disabled: z.boolean().optional(),
});

export const UiViewerRoleSchema = z.enum(['player', 'spectator']);
export const UiSessionStatusSchema = z.enum([
    'waiting-opponent',
    'active',
    'completed',
    'replay',
    'resyncing',
    'disconnected',
]);
export const UiBoardSelectionKindSchema = z.enum(['mandatory', 'privilege', 'effect', 'reserve']);
export const UiMarketZoneSchema = z.enum(['pyramid', 'deck', 'reserve']);
export const UiSelectionModelSchema = z.enum(['engine-prompt', 'pending-command']);
export const UiSelectionCommandTypeSchema = z.enum([
    'TAKE_TOKENS',
    'USE_PRIVILEGE',
    'RESERVE_CARD',
    'SELECT_ROYAL',
    'TAKE_EFFECT_BOARD_TOKEN',
    'STEAL_OPPONENT_TOKEN',
    'SELECT_BONUS_COLOR',
    'DISCARD_TOKEN',
]);

export const UiBoardCellSchema = z.object({
    positionId: BoardPositionIdSchema,
    row: z.number().int().min(0).max(4),
    col: z.number().int().min(0).max(4),
    token: GemColorSchema.nullable(),
    selectable: z.boolean(),
    selected: z.boolean(),
    selectionKind: UiBoardSelectionKindSchema.nullable(),
    reason: z.string().min(1).nullable(),
});

export const UiMarketSlotSchema = z.object({
    ref: z.string().min(1),
    zone: UiMarketZoneSchema,
    owner: PlayerIdSchema.nullable(),
    level: CardLevelSchema.nullable(),
    slot: z.number().int().min(1).max(5).nullable(),
    slotId: ReserveSlotIdSchema.nullable(),
    occupied: z.boolean(),
    cardId: z.string().min(1).nullable(),
    selectableAsBuy: z.boolean(),
    selectableAsReserve: z.boolean(),
    reason: z.string().min(1).nullable(),
    score: z.number().int().min(0).nullable(),
    crowns: z.number().int().min(0).nullable(),
    bonusGem: PrintedBonusColorSchema,
    bonusCount: z.number().int().min(0).nullable(),
    cost: GemInventorySchema.nullable(),
    accentColor: GemColorSchema.nullable(),
    patternKey: z.string().min(1).nullable(),
});

export const UiPlayerZoneSchema = z.object({
    playerId: PlayerIdSchema,
    isViewer: z.boolean(),
    isCurrentPlayer: z.boolean(),
    actionableSeat: z.boolean(),
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    privileges: z.number().int().min(0).max(3),
    inventory: GemInventorySchema,
    reserveSlots: z.array(PublicReserveSlotSchema),
    tableauCount: z.number().int().min(0),
    royalCount: z.number().int().min(0),
});

export const UiRoyalOfferSchema = z.object({
    royalId: z.string().min(1),
    label: z.string().min(1),
    selectable: z.boolean(),
    reason: z.string().min(1).nullable(),
    score: z.number().int().min(0),
    crowns: z.number().int().min(0),
    accentKey: z.string().min(1).nullable(),
    patternKey: z.string().min(1).nullable(),
    tagLabel: z.string().min(1).nullable(),
});

export const UiPromptSchema = z.object({
    effectId: z.string().min(1),
    atom: z.string().min(1),
    label: z.string().min(1),
    remainingSelections: z.number().int().min(0).nullable(),
    allowedBoardPositions: z.array(BoardPositionIdSchema),
    allowedColors: z.array(GemColorSchema),
    royalIds: z.array(z.string().min(1)),
    targetPlayer: PlayerIdSchema.nullable(),
    cardId: z.string().min(1).nullable(),
});

export const UiSelectionDraftSchema = z.object({
    model: UiSelectionModelSchema,
    commandType: UiSelectionCommandTypeSchema,
    effectId: z.string().min(1).nullable(),
    selectedBoardPositions: z.array(BoardPositionIdSchema),
    goldPosition: BoardPositionIdSchema.nullable(),
    remainingSelections: z.number().int().min(0).nullable(),
});

export const UiRunPanelSchema = z.object({
    runId: z.string().min(1),
    matchIndex: z.number().int().min(1),
    wins: z.number().int().min(0),
    losses: z.number().int().min(0),
    activeBuffIds: z.array(BuffIdSchema),
});

export const UiViewModelSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    viewerRole: UiViewerRoleSchema,
    seat: PlayerIdSchema.nullable(),
    sessionStatus: UiSessionStatusSchema,
    snapshot: VisibleSnapshotSchema,
    boardCells: z.array(UiBoardCellSchema),
    marketSlots: z.array(UiMarketSlotSchema),
    playerZones: z.array(UiPlayerZoneSchema),
    royalOffers: z.array(UiRoyalOfferSchema),
    promptStack: z.array(UiPromptSchema),
    selectionDraft: UiSelectionDraftSchema.nullable(),
    runPanel: UiRunPanelSchema.nullable(),
    availableActions: z.array(UiActionDescriptorSchema),
});

export type UiActionDescriptor = z.infer<typeof UiActionDescriptorSchema>;
export type UiViewerRole = z.infer<typeof UiViewerRoleSchema>;
export type UiSessionStatus = z.infer<typeof UiSessionStatusSchema>;
export type UiBoardCell = z.infer<typeof UiBoardCellSchema>;
export type UiMarketSlot = z.infer<typeof UiMarketSlotSchema>;
export type UiPlayerZone = z.infer<typeof UiPlayerZoneSchema>;
export type UiRoyalOffer = z.infer<typeof UiRoyalOfferSchema>;
export type UiPrompt = z.infer<typeof UiPromptSchema>;
export type UiSelectionDraft = z.infer<typeof UiSelectionDraftSchema>;
export type UiRunPanel = z.infer<typeof UiRunPanelSchema>;
export type UiViewModel = z.infer<typeof UiViewModelSchema>;

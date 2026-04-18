import type {
    GameSnapshot,
    RoomDetail,
    UiActionDescriptor,
    UiViewModel,
    VisibleSnapshot,
} from '@gem-duel/contracts';

import type { ViewerId } from '../shared/types';
import { buildActions } from './actions';
import { buildBoardCells } from './board';
import {
    buildUiSubtitle,
    buildUiTitle,
    buildVisibleSnapshot,
    deriveSessionStatus,
    getViewerSeat,
    type BuildVisibleUiViewModelOptions,
} from './metadata';
import { buildMarketSlots } from './market';
import { buildPlayerZones, buildRoyalOffers } from './player-zones';
import { buildPromptStack } from './prompts';
import { buildRunPanel } from './run-panel';
import { buildSelectionDraft } from './selection';

const canViewerAct = (snapshot: GameSnapshot, viewer: ViewerId) =>
    viewer !== 'spectator' && viewer === snapshot.context.currentPlayer;

export const buildVisibleUiViewModel = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[] = [],
    options: BuildVisibleUiViewModelOptions = {}
): UiViewModel => ({
    title: buildUiTitle(snapshot),
    subtitle: buildUiSubtitle(snapshot),
    viewerRole: snapshot.visibility === 'player' ? 'player' : 'spectator',
    seat: getViewerSeat(snapshot),
    sessionStatus: deriveSessionStatus(snapshot, options),
    snapshot,
    boardCells: buildBoardCells(snapshot, availableActions),
    marketSlots: buildMarketSlots(snapshot, availableActions),
    playerZones: buildPlayerZones(snapshot, availableActions),
    royalOffers: buildRoyalOffers(snapshot, availableActions),
    promptStack: buildPromptStack(snapshot),
    selectionDraft: buildSelectionDraft(snapshot),
    runPanel: buildRunPanel(snapshot),
    availableActions,
});

export const buildRoomUiViewModel = (
    room: Pick<RoomDetail, 'snapshot' | 'availableActions' | 'status'>
): UiViewModel | null =>
    room.snapshot
        ? buildVisibleUiViewModel(room.snapshot, room.availableActions, {
              roomStatus: room.status,
          })
        : null;

export const buildUiViewModel = (snapshot: GameSnapshot, viewer: ViewerId = 'p1'): UiViewModel =>
    buildVisibleUiViewModel(
        buildVisibleSnapshot(snapshot, viewer),
        canViewerAct(snapshot, viewer) ? buildActions(snapshot) : []
    );

import type {
    GameSnapshot,
    RoomDetail,
    UiSessionStatus,
    VisibleSnapshot,
} from '@gem-duel/contracts';
import { toPlayerSnapshot, toSpectatorSnapshot } from '@gem-duel/contracts';

import type { ViewerId } from '../shared/types';

export interface BuildVisibleUiViewModelOptions {
    roomStatus?: RoomDetail['status'];
    sessionStatus?: UiSessionStatus;
}

export const buildVisibleSnapshot = (snapshot: GameSnapshot, viewer: ViewerId) =>
    viewer === 'spectator' ? toSpectatorSnapshot(snapshot) : toPlayerSnapshot(snapshot, viewer);

export const buildUiTitle = (snapshot: VisibleSnapshot | GameSnapshot) =>
    `Gem Duel ${snapshot.context.mode.toUpperCase()} Match`;

export const buildUiSubtitle = (snapshot: VisibleSnapshot | GameSnapshot) =>
    [
        `Phase: ${snapshot.context.phase}`,
        `Turn: ${snapshot.context.currentPlayer}`,
        `Segment: ${snapshot.context.turn.segment}`,
        snapshot.runContext
            ? `Run ${snapshot.runContext.matchIndex} | W ${snapshot.runContext.wins} | L ${snapshot.runContext.losses}`
            : null,
    ]
        .filter(Boolean)
        .join(' | ');

export const deriveSessionStatus = (
    snapshot: VisibleSnapshot,
    options: BuildVisibleUiViewModelOptions = {}
): UiSessionStatus => {
    if (options.sessionStatus) {
        return options.sessionStatus;
    }

    if (options.roomStatus === 'waiting') {
        return 'waiting-opponent';
    }

    if (
        options.roomStatus === 'completed' ||
        snapshot.context.phase === 'terminal' ||
        snapshot.context.winner !== null
    ) {
        return 'completed';
    }

    if (snapshot.context.phase === 'replay' || snapshot.replayCursor !== null) {
        return 'replay';
    }

    return 'active';
};

export const getViewerSeat = (snapshot: VisibleSnapshot) =>
    snapshot.visibility === 'player' ? snapshot.viewer : null;

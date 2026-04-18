import type { UiActionDescriptor, UiBoardCell, VisibleSnapshot } from '@gem-duel/contracts';

export const buildBoardCells = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[]
): UiBoardCell[] => {
    const mandatoryPositions = new Set<string>();
    const privilegePositions = new Set<string>();
    const effectPositions = new Set<string>();
    const reserveGoldPositions = new Set<string>();
    const selectedPositions = new Set(snapshot.pendingSelection?.selectedPositions ?? []);

    for (const action of availableActions) {
        switch (action.command.type) {
            case 'TAKE_TOKENS_ADD_POSITION':
                mandatoryPositions.add(action.command.positionId);
                break;
            case 'USE_PRIVILEGE_ADD_POSITION':
                privilegePositions.add(action.command.positionId);
                break;
            case 'TAKE_EFFECT_BOARD_TOKEN':
                effectPositions.add(action.command.positionId);
                break;
            case 'RESERVE_CARD':
                reserveGoldPositions.add(action.command.goldPosition);
                break;
        }
    }

    if (snapshot.pendingSelection?.action === 'TAKE_TOKENS') {
        for (const position of snapshot.pendingSelection.selectedPositions) {
            mandatoryPositions.add(position);
        }
    }

    if (snapshot.pendingSelection?.action === 'USE_PRIVILEGE') {
        for (const position of snapshot.pendingSelection.selectedPositions) {
            privilegePositions.add(position);
        }
    }

    return snapshot.board.map((cell) => {
        let selectionKind: UiBoardCell['selectionKind'] = null;
        if (mandatoryPositions.has(cell.positionId)) {
            selectionKind = 'mandatory';
        } else if (privilegePositions.has(cell.positionId)) {
            selectionKind = 'privilege';
        } else if (effectPositions.has(cell.positionId)) {
            selectionKind = 'effect';
        } else if (reserveGoldPositions.has(cell.positionId)) {
            selectionKind = 'reserve';
        }

        return {
            positionId: cell.positionId,
            row: cell.row,
            col: cell.col,
            token: cell.token,
            selectable: selectionKind !== null,
            selected: selectedPositions.has(cell.positionId),
            selectionKind,
            reason: null,
        };
    });
};

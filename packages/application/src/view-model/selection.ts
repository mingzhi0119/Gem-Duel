import type { UiSelectionDraft, VisibleSnapshot } from '@gem-duel/contracts';

export const getVisiblePrivilegePositionCap = (snapshot: VisibleSnapshot) =>
    snapshot.runContext?.activeBuffs.some(
        (buff) => buff.owner === snapshot.context.currentPlayer && buff.id === 'double_agent'
    )
        ? 2
        : 3;

export const buildSelectionDraft = (snapshot: VisibleSnapshot): UiSelectionDraft | null => {
    const prompt = snapshot.effectPrompts[0];
    if (prompt) {
        switch (prompt.atom) {
            case 'gain_royal':
                return {
                    model: 'engine-prompt',
                    commandType: 'SELECT_ROYAL',
                    effectId: prompt.effectId,
                    selectedBoardPositions: [],
                    goldPosition: null,
                    remainingSelections: 1,
                };
            case 'take_board_token':
                return {
                    model: 'engine-prompt',
                    commandType: 'TAKE_EFFECT_BOARD_TOKEN',
                    effectId: prompt.effectId,
                    selectedBoardPositions: [],
                    goldPosition: null,
                    remainingSelections: prompt.count,
                };
            case 'take_opponent_token':
                return {
                    model: 'engine-prompt',
                    commandType: 'STEAL_OPPONENT_TOKEN',
                    effectId: prompt.effectId,
                    selectedBoardPositions: [],
                    goldPosition: null,
                    remainingSelections: 1,
                };
            case 'override_bonus_color':
                return {
                    model: 'engine-prompt',
                    commandType: 'SELECT_BONUS_COLOR',
                    effectId: prompt.effectId,
                    selectedBoardPositions: [],
                    goldPosition: null,
                    remainingSelections: 1,
                };
            case 'discard_to_limit':
                return {
                    model: 'engine-prompt',
                    commandType: 'DISCARD_TOKEN',
                    effectId: prompt.effectId,
                    selectedBoardPositions: [],
                    goldPosition: null,
                    remainingSelections: prompt.remaining,
                };
        }
    }

    if (snapshot.visibility === 'spectator') {
        return null;
    }

    if (snapshot.pendingSelection?.action === 'TAKE_TOKENS') {
        return {
            model: 'pending-command',
            commandType: 'TAKE_TOKENS',
            effectId: null,
            selectedBoardPositions: [...snapshot.pendingSelection.selectedPositions],
            goldPosition: null,
            remainingSelections:
                snapshot.pendingSelection.maxSelections -
                snapshot.pendingSelection.selectedPositions.length,
        };
    }

    if (snapshot.pendingSelection?.action === 'USE_PRIVILEGE') {
        return {
            model: 'pending-command',
            commandType: 'USE_PRIVILEGE',
            effectId: null,
            selectedBoardPositions: [...snapshot.pendingSelection.selectedPositions],
            goldPosition: null,
            remainingSelections:
                snapshot.pendingSelection.maxSelections -
                snapshot.pendingSelection.selectedPositions.length,
        };
    }

    switch (snapshot.context.phase) {
        case 'gemSelection':
            return {
                model: 'pending-command',
                commandType: 'TAKE_TOKENS',
                effectId: null,
                selectedBoardPositions: [],
                goldPosition: null,
                remainingSelections: 3,
            };
        case 'privilege':
            return {
                model: 'pending-command',
                commandType: 'USE_PRIVILEGE',
                effectId: null,
                selectedBoardPositions: [],
                goldPosition: null,
                remainingSelections: getVisiblePrivilegePositionCap(snapshot),
            };
        case 'reserving':
            return {
                model: 'pending-command',
                commandType: 'RESERVE_CARD',
                effectId: null,
                selectedBoardPositions: [],
                goldPosition: null,
                remainingSelections: 1,
            };
        default:
            return null;
    }
};

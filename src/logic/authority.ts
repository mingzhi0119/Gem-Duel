import { GameState, GameAction } from '../types';

/**
 * Validates if an action received from a Guest is permissible.
 *
 * @param state - Current game state
 * @param action - Action requested by Guest
 * @returns true if action is valid to process, false otherwise
 */
export const validateOnlineAction = (state: GameState, action: GameAction): boolean => {
    if (action.type === 'INIT' || action.type === 'INIT_DRAFT') return true;

    // In Online Mode, if I am Host (P1), I receive actions from Guest (P2).
    // Guest should only send actions when it is their turn (P2).

    if (state.turn !== 'p2') {
        console.warn(
            `Host rejected request: Action ${action.type} received during ${state.turn}'s turn`
        );
        return false;
    }
    return true;
};

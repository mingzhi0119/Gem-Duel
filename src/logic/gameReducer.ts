/**
 * Main Game Reducer
 *
 * Central dispatcher for all game actions.
 * Uses Immer for efficient immutable state updates.
 */

import { produce } from 'immer';
import {
    handleTakeGems,
    handleReplenish,
    handleTakeBonusGem,
    handleDiscardGem,
    handleStealGem,
} from './actions/boardActions';
import {
    handleBuyCard,
    handleInitiateBuyJoker,
    handleInitiateReserve,
    handleInitiateReserveDeck,
    handleCancelReserve,
    handleReserveCard,
    handleReserveDeck,
    handleDiscardReserved,
} from './actions/marketActions';
import { handleSelectRoyalCard, handleForceRoyalSelection } from './actions/royalActions';
import {
    handleUsePrivilege,
    handleActivatePrivilege,
    handleCancelPrivilege,
} from './actions/privilegeActions';
import {
    handleSelectBuff,
    handleInit,
    handleInitDraft,
    handleRerollBuffs,
} from './actions/buffActions';
import {
    handleDebugAddCrowns,
    handleDebugAddPoints,
    handleDebugAddPrivilege,
    handlePeekDeck,
    handleCloseModal,
} from './actions/miscActions';
import { GameAction, GameState } from '../types';

/**
 * Main reducer function
 *
 * Dispatches actions to appropriate handlers using Immer for efficient
 * immutable state updates. All handlers receive a draft state that can be
 * modified directly - Immer ensures immutability under the hood.
 *
 * @param state - Current game state
 * @param action - Action to apply
 * @returns New game state (or same state for null inputs)
 */
export const applyAction = (state: GameState | null, action: GameAction): GameState | null => {
    // 1. BOOTSTRAP / SYNC ACTIONS
    if (action.type === 'INIT') {
        return handleInit(null, action.payload);
    }
    if (action.type === 'INIT_DRAFT') {
        return handleInitDraft(null, action.payload);
    }
    if (action.type === 'FORCE_SYNC' || action.type === 'FLATTEN') {
        return action.payload; // Atomic state replacement
    }

    // 2. STATE GUARD
    if (!state) {
        return null;
    }

    // 3. MUTATION ACTIONS
    return produce(state, (draft) => {
        // Clear transient UI feedback
        draft.lastFeedback = null;
        draft.toastMessage = null;

        switch (action.type) {
            // ========== INITIALIZATION & SETUP ==========
            case 'SELECT_BUFF':
                handleSelectBuff(draft, action.payload);
                break;

            // ========== BOARD ACTIONS ==========
            case 'TAKE_GEMS':
                handleTakeGems(draft, action.payload);
                break;

            case 'REPLENISH':
                handleReplenish(draft, action.payload);
                break;

            case 'TAKE_BONUS_GEM':
                handleTakeBonusGem(draft, action.payload);
                break;

            case 'DISCARD_GEM':
                handleDiscardGem(draft, action.payload);
                break;

            case 'STEAL_GEM':
                handleStealGem(draft, action.payload);
                break;

            // ========== MARKET ACTIONS ==========
            case 'INITIATE_BUY_JOKER':
                handleInitiateBuyJoker(draft, action.payload);
                break;

            case 'BUY_CARD':
                handleBuyCard(draft, action.payload);
                break;

            case 'INITIATE_RESERVE':
                handleInitiateReserve(draft, action.payload);
                break;

            case 'INITIATE_RESERVE_DECK':
                handleInitiateReserveDeck(draft, action.payload);
                break;

            case 'CANCEL_RESERVE':
                handleCancelReserve(draft);
                break;

            case 'RESERVE_CARD':
                handleReserveCard(draft, action.payload);
                break;

            case 'RESERVE_DECK':
                handleReserveDeck(draft, action.payload);
                break;

            case 'DISCARD_RESERVED':
                handleDiscardReserved(draft, action.payload);
                break;

            // ========== PRIVILEGE ACTIONS ==========
            case 'ACTIVATE_PRIVILEGE':
                handleActivatePrivilege(draft);
                break;

            case 'USE_PRIVILEGE':
                handleUsePrivilege(draft, action.payload);
                break;

            case 'CANCEL_PRIVILEGE':
                handleCancelPrivilege(draft);
                break;

            // ========== ROYAL ACTIONS ==========
            case 'FORCE_ROYAL_SELECTION':
                handleForceRoyalSelection(draft);
                break;

            case 'SELECT_ROYAL_CARD':
                handleSelectRoyalCard(draft, action.payload);
                break;

            // ========== DEBUG ACTIONS ==========
            case 'DEBUG_ADD_CROWNS':
                handleDebugAddCrowns(draft, action.payload);
                break;

            case 'UNDO':
            case 'REDO':
                if (draft.mode === 'ONLINE_MULTIPLAYER') {
                    console.warn('Undo/Redo blocked in Online Mode');
                    return;
                }
                break;

            case 'DEBUG_ADD_POINTS':
                handleDebugAddPoints(draft, action.payload);
                break;

            case 'DEBUG_ADD_PRIVILEGE':
                handleDebugAddPrivilege(draft, action.payload);
                break;

            case 'DEBUG_REROLL_BUFFS':
                handleRerollBuffs(draft, action.payload);
                break;

            // ========== MODAL ACTIONS ==========
            case 'PEEK_DECK':
                handlePeekDeck(draft, action.payload);
                break;

            case 'CLOSE_MODAL':
                handleCloseModal(draft);
                break;

            // ========== FALLBACK ==========
            default: {
                // This block should theoretically be unreachable if all cases are covered
                const _exhaustiveCheck: never = action;
                console.warn('Unknown action type:', (action as { type: string }).type);
                break;
            }
        }
    });
};

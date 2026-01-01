import { produce } from 'immer';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { GameState, BUFF_NONE, GemInventory } from '../../types';

/**
 * Creates a fully initialized mock GameState with optional overrides.
 * This ensures that tests always start with a valid state structure,
 * avoiding the need for 'as any' casting.
 */
export const createMockState = (overrides: Partial<GameState> = {}): GameState => {
    return produce(INITIAL_STATE_SKELETON, (draft) => {
        // Ensure critical nested structures exist (just in case skeleton is minimal)
        if (!draft.playerBuffs) draft.playerBuffs = { p1: BUFF_NONE, p2: BUFF_NONE };
        if (!draft.playerTableau) draft.playerTableau = { p1: [], p2: [] };
        if (!draft.playerRoyals) draft.playerRoyals = { p1: [], p2: [] };
        if (!draft.royalMilestones) draft.royalMilestones = { p1: {}, p2: {} };
        if (!draft.inventories) {
            const emptyInv: GemInventory = {
                blue: 0,
                white: 0,
                green: 0,
                black: 0,
                red: 0,
                pearl: 0,
                gold: 0,
            };
            draft.inventories = { p1: { ...emptyInv }, p2: { ...emptyInv } };
        }
        if (!draft.extraPoints) draft.extraPoints = { p1: 0, p2: 0 };
        if (!draft.extraCrowns) draft.extraCrowns = { p1: 0, p2: 0 };

        // Apply overrides
        Object.assign(draft, overrides);
    }) as GameState;
};

import { describe, it, expect } from 'vitest';
import { produce } from 'immer';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { handleReplenish, handleTakeGems } from '../actions/boardActions';
import { handleBuyCard } from '../actions/marketActions';
import { BUFFS, GAME_PHASES, GEM_TYPES } from '../../constants';
import { GameState, Card } from '../../types';

describe('Gem Limit Timing Rules', () => {
    const createBaseState = () => {
        const state = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;
        state.turn = 'p1';
        state.phase = GAME_PHASES.IDLE;
        return state;
    };

    it('Rule: Operations not restricted (Can take 3 gems when already at 9)', () => {
        let state = createBaseState();
        // Setup: 9 gems
        state.inventories.p1 = { blue: 9, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 };
        // Board has 3 gems in a line
        state.board[0][0] = { type: GEM_TYPES.RED, uid: 'r1' };
        state.board[0][1] = { type: GEM_TYPES.RED, uid: 'r2' };
        state.board[0][2] = { type: GEM_TYPES.RED, uid: 'r3' };

        // Action: Take 3 gems
        state = produce(state, (draft) => {
            handleTakeGems(draft, {
                coords: [
                    { r: 0, c: 0 },
                    { r: 0, c: 1 },
                    { r: 0, c: 2 },
                ],
            });
        });

        const total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
        expect(total).toBe(12);
        // After TakeGems, finalizeTurn is called. 12 > 10, so should be in discard phase.
        expect(state.phase).toBe(GAME_PHASES.DISCARD_EXCESS_GEMS);
        expect(state.turn).toBe('p1'); // Turn hasn't switched
    });

    it('Rule: Mid-turn excess allowed (Replenish gives gem > 10, but BuyCard brings it back down)', () => {
        let state = createBaseState();
        // Setup: 10 gems + Aggressive Expansion buff (gives gem on replenish)
        state.playerBuffs.p1 = BUFFS.AGGRESSIVE_EXPANSION;
        state.inventories.p1 = {
            blue: 10,
            white: 0,
            green: 0,
            black: 0,
            red: 0,
            gold: 0,
            pearl: 0,
        };
        state.board[0][0] = { type: GEM_TYPES.RED, uid: 'r1' }; // Board not empty to trigger logic

        // 1. Optional Action: Replenish -> Total gems becomes 11
        state = produce(state, (draft) => {
            handleReplenish(draft, { randoms: { expansionColor: 'blue' } });
        });

        let total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
        expect(total).toBe(11);
        // CRITICAL: Should still be IDLE, allowing main action
        expect(state.phase).toBe(GAME_PHASES.IDLE);

        // 2. Main Action: Buy a card costing 2 blue gems
        const card = {
            id: 'test-card',
            level: 1,
            cost: { blue: 2, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
            points: 1,
        } as Card;

        state = produce(state, (draft) => {
            handleBuyCard(draft, { card, source: 'market' });
        });

        total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
        expect(total).toBe(9); // 11 - 2 = 9
        // Turn should switch normally now
        expect(state.turn).toBe('p2');
        expect(state.phase).toBe(GAME_PHASES.IDLE);
    });
});

import { describe, it, expect } from 'vitest';
import { applyAction } from '../../gameReducer';
import { INITIAL_STATE_SKELETON } from '../../initialState';
import { GAME_PHASES } from '../../../constants';
import { generateGemPool } from '../../../utils';
import { GameAction, GameState } from '../../../types';

// Helper to create a clean state with a pre-filled board
const createTestState = (): GameState => {
    const state = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;
    const gemPool = generateGemPool();
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            state.board[r][c] = gemPool[r * 5 + c];
        }
    }
    return state;
};

describe('Board Actions - Edge Cases', () => {
    it('should switch to DISCARD_EXCESS_GEMS mode when gem count exceeds 10', () => {
        const state = createTestState();
        // Pre-load player 1's inventory to 9 gems
        state.inventories.p1.red = 9;

        // Place two blue gems for p1 to take
        state.board[0][0] = { type: { id: 'blue', color: '', border: '', label: '' }, uid: 'b1' };
        state.board[0][1] = { type: { id: 'blue', color: '', border: '', label: '' }, uid: 'b2' };

        const action: GameAction = {
            type: 'TAKE_GEMS',
            payload: {
                coords: [
                    { r: 0, c: 0 },
                    { r: 0, c: 1 },
                ],
            },
        };

        const nextState = applyAction(state, action);
        if (!nextState) throw new Error('State update failed');

        // Assertions
        expect(nextState.inventories.p1.red).toBe(9);
        expect(nextState.inventories.p1.blue).toBe(2);
        const totalGems = Object.values(nextState.inventories.p1).reduce((a, b) => a + b, 0);
        expect(totalGems).toBe(11);

        // Critical: The game should enter discard mode and the turn should NOT change
        expect(nextState.phase).toBe(GAME_PHASES.DISCARD_EXCESS_GEMS);
        expect(nextState.turn).toBe('p1');
    });

    it('should grant opponent a privilege when taking 3 gems of the same color', () => {
        const state = createTestState();
        state.privileges.p2 = 0; // Ensure opponent starts with 0 privileges

        // Place three red gems in a line
        state.board[1][0] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r1' };
        state.board[1][1] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r2' };
        state.board[1][2] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r3' };

        const action: GameAction = {
            type: 'TAKE_GEMS',
            payload: {
                coords: [
                    { r: 1, c: 0 },
                    { r: 1, c: 1 },
                    { r: 1, c: 2 },
                ],
            },
        };

        const nextState = applyAction(state, action);
        if (!nextState) throw new Error('State update failed');

        // Assertions
        expect(nextState.inventories.p1.red).toBe(3);
        // Critical: Opponent (p2) should gain a privilege
        expect(nextState.privileges.p2).toBe(1);
        // Turn should switch to p2
        expect(nextState.turn).toBe('p2');
    });

    it('should correctly handle privilege logic when total privileges are already at max (3)', () => {
        const state = createTestState();
        // Pre-load privileges to the max limit
        state.privileges.p1 = 2;
        state.privileges.p2 = 1;

        // Place three red gems for p1 to take, triggering the privilege rule
        state.board[1][0] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r1' };
        state.board[1][1] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r2' };
        state.board[1][2] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r3' };

        const action: GameAction = {
            type: 'TAKE_GEMS',
            payload: {
                coords: [
                    { r: 1, c: 0 },
                    { r: 1, c: 1 },
                    { r: 1, c: 2 },
                ],
            },
        };

        const nextState = applyAction(state, action);
        if (!nextState) throw new Error('State update failed');

        // Assertions
        // Critical: p1 should lose a privilege to give one to p2, as the total cannot exceed 3.
        expect(nextState.privileges.p1).toBe(1);
        expect(nextState.privileges.p2).toBe(2);
    });

    it('should process gem taking correctly even with invalid (non-linear) coordinates', () => {
        const state = createTestState();

        // Invalid "L" shape selection
        const action: GameAction = {
            type: 'TAKE_GEMS',
            payload: {
                coords: [
                    { r: 0, c: 0 },
                    { r: 0, c: 1 },
                    { r: 1, c: 1 },
                ],
            },
        };

        // Force specific colors to avoid collision if random generation makes them same
        state.board[0][0] = { type: { id: 'blue', color: '', border: '', label: '' }, uid: 'b1' };
        state.board[0][1] = { type: { id: 'green', color: '', border: '', label: '' }, uid: 'g1' };
        state.board[1][1] = { type: { id: 'red', color: '', border: '', label: '' }, uid: 'r1' };

        const nextState = applyAction(state, action);
        if (!nextState) throw new Error('State update failed');

        // Assertions
        expect(nextState.inventories.p1['blue']).toBe(1);
        expect(nextState.inventories.p1['green']).toBe(1);
        expect(nextState.inventories.p1['red']).toBe(1);
        expect(nextState.board[0][0].type.id).toBe('empty');
        expect(nextState.board[0][1].type.id).toBe('empty');
        expect(nextState.board[1][1].type.id).toBe('empty');
    });
});

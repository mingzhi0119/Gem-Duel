import { describe, it, expect, vi } from 'vitest';
import { validateOnlineAction } from '../authority';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { GameState, GameAction } from '../../types';

describe('Authority Validator', () => {
    const mockState: GameState = {
        ...INITIAL_STATE_SKELETON,
        mode: 'ONLINE_MULTIPLAYER',
        isHost: true, // I am P1
        turn: 'p1', // It is P1's turn
    };

    it('should allow INIT action', () => {
        const action: GameAction = { type: 'INIT', payload: { initRandoms: { p1: {}, p2: {} } } };
        expect(validateOnlineAction(mockState, action)).toBe(true);
    });

    it('should allow INIT_DRAFT action', () => {
        const action: GameAction = { type: 'INIT_DRAFT', payload: { mode: 'ONLINE_MULTIPLAYER' } };
        expect(validateOnlineAction(mockState, action)).toBe(true);
    });

    it('should REJECT guest action when it is Host turn', () => {
        const state = { ...mockState, turn: 'p1' } as GameState;
        const action: GameAction = { type: 'TAKE_GEMS', payload: { coords: [] } };

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(validateOnlineAction(state, action)).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should ALLOW guest action when it is Guest turn', () => {
        const state = { ...mockState, turn: 'p2' } as GameState;
        const action: GameAction = { type: 'TAKE_GEMS', payload: { coords: [] } };

        expect(validateOnlineAction(state, action)).toBe(true);
    });
});

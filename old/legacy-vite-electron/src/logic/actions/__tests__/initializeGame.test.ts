import { describe, it, expect } from 'vitest';
import { handleInit, handleInitDraft } from '../buffActions';
import { BUFFS, GAME_PHASES } from '../../../constants';
import { BuffInitPayload } from '../../../types';

describe('Game Initialization Direct', () => {
    it('handleInit should create game state', () => {
        const payload: BuffInitPayload = {
            board: Array.from({ length: 5 }, () =>
                Array.from({ length: 5 }, () => ({ type: { id: 'red' } }))
            ) as unknown as unknown,
            bag: [] as unknown as unknown,
            market: { 1: [], 2: [], 3: [] } as unknown as unknown,
            decks: { 1: [], 2: [], 3: [] } as unknown as unknown,
        };

        const result = handleInit(null, payload);

        expect(result).toBeDefined();
        expect(result.turn).toBe('p1');
        expect(result.phase).toBe('IDLE');
        expect(result.playerBuffs.p1).toBeDefined();
        expect(result.playerBuffs.p2).toBeDefined();
    });

    it('handleInitDraft should create draft state', () => {
        const payload: Record<string, unknown> = {
            board: Array.from({ length: 5 }, () =>
                Array.from({ length: 5 }, () => ({ type: { id: 'red' } }))
            ),
            bag: [],
            market: { 1: [], 2: [], 3: [] },
            decks: { 1: [], 2: [], 3: [] },
            draftPool: [BUFFS.PRIVILEGE_FAVOR, BUFFS.HEAD_START],
            buffLevel: 1,
        };

        const result = handleInitDraft(null, payload);

        expect(result).toBeDefined();
        expect(result.phase).toBe('DRAFT_PHASE');
        expect(result.turn).toBe('p1');
        expect(result.draftPool.length).toBe(2);
        expect(result.buffLevel).toBe(1);
    });
});

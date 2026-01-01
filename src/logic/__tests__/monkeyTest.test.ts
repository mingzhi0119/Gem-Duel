import { describe, it, expect } from 'vitest';
import { produce } from 'immer';
import { applyAction } from '../gameReducer';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { generateGemPool, generateDeck, shuffleArray } from '../../utils';
import { GameState, PlayerKey, Buff, GameAction } from '../../types';
import { BONUS_COLORS, BUFFS } from '../../constants';
import { applyBuffInitEffects } from '../actions/buffActions';

describe('Monkey Test - Random Stress Test', () => {
    // Helper: Create a fully initialized game state for testing
    const createFullInitialState = (): GameState => {
        const isRogue = Math.random() > 0.5;

        // Deep clone the skeleton to ensure it's fully mutable
        const skeleton = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;

        const state = produce(skeleton, (draft) => {
            const pool = generateGemPool();
            // Fill board
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    draft.board[r][c] = pool.pop()!;
                }
            }
            draft.bag = pool;

            // Fill decks and market
            for (const lvl of [1, 2, 3] as const) {
                const deck = generateDeck(lvl, isRogue);
                draft.decks[lvl] = deck;
                const marketSize = lvl === 1 ? 5 : lvl === 2 ? 4 : 3;
                draft.market[lvl] = draft.decks[lvl].splice(0, marketSize);
            }

            // Assign random buffs
            const level = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
            const levelBuffs = Object.values(BUFFS).filter((b) => b.level === level);
            const p1Buff = shuffleArray(levelBuffs)[0] as Buff;
            const p2Buff = shuffleArray(levelBuffs)[1 % levelBuffs.length] as Buff;

            draft.playerBuffs.p1 = { ...p1Buff };
            draft.playerBuffs.p2 = { ...p2Buff };
        });

        const basics = ['red', 'green', 'blue', 'white', 'black'];
        const randoms = {
            p1: {
                randomGems: [basics[0], basics[1]],
                reserveCardLevel: 1,
                preferenceColor: basics[2],
            },
            p2: {
                randomGems: [basics[3], basics[4]],
                reserveCardLevel: 2,
                preferenceColor: basics[0],
            },
        };

        // Wrap in produce because state from Immer is frozen
        return produce(state, (draft) => {
            applyBuffInitEffects(draft, randoms);
        });
    };

    // Helper: Check state invariants
    const checkInvariants = (state: GameState, actionTrace: unknown[]) => {
        const errorContext = (msg: string) =>
            `Invariant Violated: ${msg}\nLast Action: ${JSON.stringify(actionTrace[actionTrace.length - 1])}`;

        // 1. Inventory non-negative
        for (const player of ['p1', 'p2'] as PlayerKey[]) {
            const inv = state.inventories[player];
            Object.entries(inv).forEach(([color, count]) => {
                if (typeof count !== 'number' || count < 0) {
                    throw new Error(
                        errorContext(`Player ${player} has invalid ${color} count: ${count}`)
                    );
                }
            });
        }

        // 2. Board Integrity
        if (state.board.length !== 5) throw new Error(errorContext('Board height corrupted'));
        state.board.forEach((row, r) => {
            if (row.length !== 5) throw new Error(errorContext(`Board row ${r} width corrupted`));
            row.forEach((cell, c) => {
                if (!cell || !cell.type || !cell.type.id) {
                    throw new Error(errorContext(`Board cell at [${r}, ${c}] corrupted`));
                }
            });
        });

        // 3. Market Integrity
        for (const lvl of [1, 2, 3] as const) {
            const market = state.market[lvl];
            const expectedSize = lvl === 1 ? 5 : lvl === 2 ? 4 : 3;
            if (market.length !== expectedSize) {
                throw new Error(errorContext(`Market L${lvl} size corrupted: ${market.length}`));
            }
        }
    };

    it('should survive 5000 random interactions with Roguelike buffs without entering an illegal state', () => {
        // Always test with buffs enabled for maximum complexity
        let state = createFullInitialState();
        const actionTrace: unknown[] = [];
        const actionTypes = [
            'TAKE_GEMS',
            'REPLENISH',
            'BUY_CARD',
            'RESERVE_CARD',
            'DISCARD_GEM',
            'ACTIVATE_PRIVILEGE',
            'USE_PRIVILEGE',
            'PEEK_DECK',
            'CLOSE_MODAL',
        ];

        for (let i = 0; i < 5000; i++) {
            const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            let payload: unknown = undefined;

            // Generate somewhat plausible payloads to stress deep logic paths
            switch (type) {
                case 'TAKE_GEMS':
                    payload = {
                        coords: [
                            { r: Math.floor(Math.random() * 5), c: Math.floor(Math.random() * 5) },
                        ],
                    };
                    break;
                case 'BUY_CARD': {
                    const lvl = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
                    const card = state.market[lvl][0]; // Try to buy the first card in a random row
                    if (card) payload = { card, source: 'market' };
                    break;
                }
                case 'RESERVE_CARD': {
                    const lvl = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
                    const card = state.market[lvl][0];
                    if (card) payload = { card, level: lvl, idx: 0 };
                    break;
                }
                case 'DISCARD_GEM':
                    payload = BONUS_COLORS[Math.floor(Math.random() * BONUS_COLORS.length)];
                    break;
                case 'PEEK_DECK':
                    payload = { level: Math.floor(Math.random() * 3) + 1 };
                    break;
                case 'REPLENISH':
                    payload = {
                        randoms: {
                            expansionColor: 'red',
                            extortionColor: 'blue',
                        },
                    };
                    break;
            }

            const action = { type, payload };
            actionTrace.push(action);

            try {
                const nextState = applyAction(state, action as GameAction);
                if (nextState) {
                    state = nextState;
                    checkInvariants(state, actionTrace);
                }
            } catch (err: unknown) {
                console.error('Monkey Test Crash Detected!');
                console.error('Iteration:', i);
                console.error('Trace:', JSON.stringify(actionTrace, null, 2));
                throw err;
            }
        }

        expect(state).toBeDefined();
    });
});

import { describe, it, expect } from 'vitest';
import { produce } from 'immer';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { BUFFS, GAME_PHASES, GEM_TYPES } from '../../constants';
import { applyBuffInitEffects } from '../actions/buffActions';
import { handleBuyCard, handleReserveCard, handleDiscardReserved } from '../actions/marketActions';
import { handleReplenish } from '../actions/boardActions';
import { handleUsePrivilege } from '../actions/privilegeActions';
import { calculateTransaction } from '../../utils';
import { getPlayerScore, hasExcessGems } from '../selectors';
import { finalizeTurn } from '../turnManager';
import { GameState, Card } from '../../types';

// Helper to create state with a specific buff for P1
const createBuffState = (buffId: string, initRandoms: Record<string, unknown> = {}): GameState => {
    let state = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
    const fullBuff = Object.values(BUFFS).find((b) => b.id === buffId);
    if (!fullBuff) throw new Error(`Buff ${buffId} not found`);

    // Assign buff
    state.playerBuffs.p1 = JSON.parse(JSON.stringify(fullBuff));
    state.playerBuffs.p1.state = {};

    // Apply init effects
    state = produce(state, (draft: GameState) => {
        applyBuffInitEffects(draft, { p1: initRandoms });
    });

    return state;
};

// Helper to give infinite gems for cost testing
const giveInfiniteGems = (state: GameState, player: 'p1' | 'p2') => {
    return produce(state, (draft) => {
        draft.inventories[player] = {
            red: 10,
            green: 10,
            blue: 10,
            white: 10,
            black: 10,
            pearl: 10,
            gold: 10,
        };
    });
};

describe('Comprehensive Buff Tests', () => {
    describe('Level 1: Minor Tweaks', () => {
        it('PRIVILEGE_FAVOR: Starts with 1 extra privilege', () => {
            const state = createBuffState(BUFFS.PRIVILEGE_FAVOR.id);
            expect(state.extraPrivileges.p1).toBe(1);
        });

        it('HEAD_START: Starts with 1 random extra gem', () => {
            const state = createBuffState(BUFFS.HEAD_START.id, { randomGems: ['red'] });
            expect(state.inventories.p1.red).toBe(1);
            expect(state.extraAllocation.p1.red).toBe(1);
        });

        it('ROYAL_BLOOD: Starts with 1 extra crown', () => {
            const state = createBuffState(BUFFS.ROYAL_BLOOD.id);
            expect(state.extraCrowns.p1).toBe(1);
        });

        it('DEEP_POCKETS: Gem cap is 12', () => {
            let state = createBuffState(BUFFS.DEEP_POCKETS.id);
            expect(state.playerBuffs.p1.effects.passive?.gemCap).toBe(12);

            state = produce(state, (draft) => {
                draft.inventories.p1.blue = 11;
            });
            expect(hasExcessGems(state, 'p1')).toBe(false);

            state = produce(state, (draft) => {
                draft.inventories.p1.blue = 13;
            });
            expect(hasExcessGems(state, 'p1')).toBe(true);
        });

        it('BACKUP_SUPPLY: Starts with 2 random extra gems', () => {
            const state = createBuffState(BUFFS.BACKUP_SUPPLY.id, {
                randomGems: ['green', 'black'],
            });
            expect(state.inventories.p1.green).toBe(1);
            expect(state.inventories.p1.black).toBe(1);
        });

        it('PATIENT_INVESTOR: Extra gold on first reserve', () => {
            let state = createBuffState(BUFFS.PATIENT_INVESTOR.id);
            // Fix turn manually via produce since createBuffState returns frozen object
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.decks[1] = [{ id: 'c1', level: 1, cost: {}, points: 0 } as Card];
            });

            // First reserve
            state = produce(state, (draft) => {
                handleReserveCard(draft, { card: { id: 'c1' } as Card, level: 1, idx: 0 });
                // Manually merge result because handle functions return new state (draft is modified in place inside them usually, but strict mode might vary)
                // handleReserveCard returns the modified state. With Immer produce, we usually void return.
                // But our handlers return State.
                // Correct pattern with these handlers in test:
                handleReserveCard(draft, { card: { id: 'c1' } as Card, level: 1, idx: 0 });
                // Since handlers modify the draft passed to them (if they use immer internally? No, they take State and return State).
                // Wait, our handlers take `state` and return `state`. They modify it using Immer if they are inside a reducer,
                // OR they assume they receive a draft?
                // Checking gameReducer.ts -> `return produce(state, (draft) => { ... })`
                // Checking actions -> They look like `(state: GameState, ...) => GameState`.
                // They modify properties directly: `state.pendingBuy = ...`.
                // This implies they expect a Mutable Draft (Immer draft) OR they rely on the caller to pass a mutable object.
                // In my test `state` is frozen.
                // So I must call them INSIDE produce.
            });

            expect(state.inventories.p1.gold).toBe(1);
            expect(state.extraAllocation.p1.gold).toBe(1);

            // Second reserve
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                handleReserveCard(draft, { card: { id: 'c2' } as Card, level: 1, idx: 0 });
            });
            expect(state.inventories.p1.gold).toBe(1);
        });

        it('INSIGHT: Flag revealDeck1 is true', () => {
            const state = createBuffState(BUFFS.INSIGHT.id);
            expect(state.playerBuffs.p1.effects.passive?.revealDeck1).toBe(true);
        });

        it('DOWN_PAYMENT: Discount 1 basic gem for reserved cards', () => {
            let state = createBuffState(BUFFS.DOWN_PAYMENT.id);
            state = giveInfiniteGems(state, 'p1');
            const card = { level: 1, cost: { red: 2 } } as Card;

            // Not reserved
            let res = calculateTransaction(
                card,
                state.inventories.p1,
                [],
                state.playerBuffs.p1,
                false
            );
            expect(res.gemsPaid.red).toBe(2);

            // Reserved
            res = calculateTransaction(card, state.inventories.p1, [], state.playerBuffs.p1, true);
            expect(res.gemsPaid.red).toBe(1);
        });

        it('NIMBLE_FINGERS: Gain random gem on reserve', () => {
            let state = createBuffState(BUFFS.NIMBLE_FINGERS.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.decks[1] = [{ id: 'c1', level: 1, cost: {}, points: 0 } as Card];
            });

            state = produce(state, (draft) => {
                handleReserveCard(draft, { card: { id: 'c1' } as Card, level: 1, idx: 0 });
            });

            const total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
            expect(total).toBe(1);
            expect(state.toastMessage).toContain('Nimble Fingers');
        });
    });

    describe('Level 2: Tactical Shifts', () => {
        it('PEARL_TRADER: Starts with pearl + Cap 11', () => {
            const state = createBuffState(BUFFS.PEARL_TRADER.id);
            expect(state.inventories.p1.pearl).toBe(1);
            expect(state.playerBuffs.p1.effects.passive?.gemCap).toBe(11);
        });

        it('GOLD_RESERVE: Starts with gold + reserved card', () => {
            let state = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
            state.decks[1] = [{ id: 'res1', level: 1, cost: {}, points: 0 } as Card];
            state.playerBuffs.p1 = BUFFS.GOLD_RESERVE;
            state = produce(state, (draft: GameState) => {
                applyBuffInitEffects(draft, { p1: { reserveCardLevel: 1 } });
            });

            expect(state.inventories.p1.gold).toBe(1);
            expect(state.playerReserved.p1.length).toBe(1);
        });

        it('COLOR_PREFERENCE: Discount works', () => {
            const state = createBuffState(BUFFS.COLOR_PREFERENCE.id, { preferenceColor: 'red' });
            const cost = calculateTransaction(
                { level: 1, cost: { red: 1 } } as Card,
                state.inventories.p1,
                state.playerTableau.p1
            );
            expect(cost.gemsPaid.red).toBe(0);
        });

        it('EXTORTION: Steals on 2nd Replenish', () => {
            let state = createBuffState(BUFFS.EXTORTION.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.inventories.p2.blue = 5;
                // Ensure board is not empty so Replenish logic triggers (penalty/effects block)
                draft.board[0][0] = { type: GEM_TYPES.RED, uid: 'r1' };
            });

            // 1st
            state = produce(state, (draft) => {
                handleReplenish(draft);
            });
            expect(state.inventories.p2.blue).toBe(5);

            // 2nd
            state = produce(state, (draft) => {
                handleReplenish(draft, { randoms: { extortionColor: 'blue' } });
            });
            expect(state.inventories.p2.blue).toBe(4);
            expect(state.inventories.p1.blue).toBe(1);
        });

        it('FLEXIBLE_DISCOUNT: Reduces L2/L3 cost (basic gems only)', () => {
            let state = createBuffState(BUFFS.FLEXIBLE_DISCOUNT.id);

            state = giveInfiniteGems(state, 'p1');

            const l2Card = { level: 2, cost: { red: 2 }, points: 0 } as Card;

            const l1Card = { level: 1, cost: { red: 2 }, points: 0 } as Card;

            const pearlCard = { level: 2, cost: { pearl: 1 }, points: 0 } as Card;

            const res2 = calculateTransaction(
                l2Card,
                state.inventories.p1,
                [],
                state.playerBuffs.p1
            );

            expect(res2.gemsPaid.red).toBe(1); // 2 - 1 = 1

            const res1 = calculateTransaction(
                l1Card,
                state.inventories.p1,
                [],
                state.playerBuffs.p1
            );

            expect(res1.gemsPaid.red).toBe(2);

            const resPearl = calculateTransaction(
                pearlCard,
                state.inventories.p1,
                [],
                state.playerBuffs.p1
            );

            expect(resPearl.gemsPaid.pearl).toBe(1); // No discount for pearls
        });

        it('BOUNTY_HUNTER: Gains gem on buying crown card', () => {
            let state = createBuffState(BUFFS.BOUNTY_HUNTER.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.inventories.p1.gold = 10;
            });

            const crownCard = { level: 1, cost: { red: 0 }, crowns: 1, points: 1 } as Card;

            state = produce(state, (draft) => {
                handleBuyCard(draft, {
                    card: crownCard,
                    source: 'market',
                    randoms: { bountyHunterColor: 'blue' },
                });
            });

            expect(state.inventories.p1.blue).toBe(1);
        });

        it('RECYCLER: Refunds 1 RANDOM basic gem from cost for L2/L3', () => {
            let state = createBuffState(BUFFS.RECYCLER.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.inventories.p1 = {
                    red: 5,
                    blue: 5,
                    white: 0,
                    green: 0,
                    black: 0,
                    gold: 0,
                    pearl: 1,
                };
            });

            // Card costs 3 red and 1 pearl
            const l2Card = { level: 2, cost: { red: 3, pearl: 1 }, points: 1 } as Card;
            state = produce(state, (draft) => {
                handleBuyCard(draft, { card: l2Card, source: 'market' });
            });

            // Since only 'red' is a basic gem in the cost, it MUST return red.
            // Pearl should be ignored.
            // Net red: 5 - 3 + 1 = 3.
            expect(state.inventories.p1.red).toBe(3);
            expect(state.extraAllocation.p1.red).toBe(1);
            expect(state.toastMessage?.toUpperCase()).toContain('RECYCLED 1 RED');
        });
        it('AGGRESSIVE_EXPANSION: Gains gem on replenish', () => {
            let state = createBuffState(BUFFS.AGGRESSIVE_EXPANSION.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
            });

            state = produce(state, (draft) => {
                handleReplenish(draft, { randoms: { expansionColor: 'green' } });
            });

            expect(state.inventories.p1.green).toBe(1);
        });

        it('SPECULATOR: Gain 2 gems after buying reserved card', () => {
            let state = createBuffState(BUFFS.SPECULATOR.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.playerReserved.p1 = [{ id: 'res1', level: 1, cost: {}, points: 0 } as Card];
                draft.inventories.p1.gold = 10;
            });

            state = produce(state, (draft) => {
                handleBuyCard(draft, { card: state.playerReserved.p1[0], source: 'reserved' });
            });

            const total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
            expect(total).toBe(12); // 10 gold + 2 random
            expect(state.toastMessage).toContain('Speculator');
        });

        it('HOARDER: Gain gem at start of turn if holding 3 cards', () => {
            let state = createBuffState(BUFFS.HOARDER.id);
            state = produce(state, (draft) => {
                draft.turn = 'p2'; // Opponent ends turn
                draft.playerReserved.p1 = [
                    { id: 'r1' } as Card,
                    { id: 'r2' } as Card,
                    { id: 'r3' } as Card,
                ];
            });

            state = produce(state, (draft) => {
                finalizeTurn(draft, 'p1');
            });

            const total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);
            expect(total).toBe(1);
            expect(state.toastMessage).toContain('Hoarder');
        });
    });

    describe('Level 3: Game Changers', () => {
        it('GREED_KING: +1 Point per card', () => {
            let state = createBuffState(BUFFS.GREED_KING.id);
            state = produce(state, (draft) => {
                draft.playerTableau.p1 = [
                    { id: 'c1', points: 1 } as Card,
                    { id: 'c2', points: 2 } as Card,
                ];
            });

            const score = getPlayerScore(state, 'p1');
            expect(score).toBe(5); // 1+1 + 2+1 = 5
        });

        it('DOUBLE_AGENT: Privilege takes 2 gems', () => {
            let state = createBuffState(BUFFS.DOUBLE_AGENT.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.privileges.p1 = 1;
                draft.board[0][0] = { type: GEM_TYPES.RED, uid: 'r1' };
                draft.board[0][1] = { type: GEM_TYPES.BLUE, uid: 'b1' };
            });

            // 1st Gem
            state = produce(state, (draft) => {
                handleUsePrivilege(draft, { r: 0, c: 0 });
            });
            expect(state.privilegeGemCount).toBe(1);

            // 2nd Gem
            state = produce(state, (draft) => {
                handleUsePrivilege(draft, { r: 0, c: 1 });
            });
            expect(state.privilegeGemCount).toBe(0);
            expect(state.inventories.p1.red).toBe(1);
            expect(state.inventories.p1.blue).toBe(1);
        });

        it('ALL_SEEING_EYE: Gold counts double (half gold cost) for L3', () => {
            const state = createBuffState(BUFFS.ALL_SEEING_EYE.id);
            const l3Card = { level: 3, cost: { red: 4 } } as Card;

            const res = calculateTransaction(
                l3Card,
                { ...state.inventories.p1, gold: 10 },
                [],
                state.playerBuffs.p1
            );
            expect(res.goldCost).toBe(2);
        });

        it('WONDER_ARCHITECT: L3 cost reduced by 3 (basic gems only, first 3 cards)', () => {
            let state = createBuffState(BUFFS.WONDER_ARCHITECT.id);

            state = giveInfiniteGems(state, 'p1');

            const l3Card = { level: 3, cost: { red: 5 }, points: 0 } as Card;

            const l3PearlCard = { level: 3, cost: { pearl: 1 }, points: 0 } as Card;

            // 1st Card

            let res = calculateTransaction(l3Card, state.inventories.p1, [], state.playerBuffs.p1);

            expect(res.gemsPaid.red).toBe(2); // 5 - 3 = 2

            // Simulate buying 3 cards

            state = produce(state, (draft) => {
                draft.playerBuffs.p1.state = { l3PurchasedCount: 3 };
            });

            // 4th Card (No discount)

            res = calculateTransaction(l3Card, state.inventories.p1, [], state.playerBuffs.p1);

            expect(res.gemsPaid.red).toBe(5);

            const resPearl = calculateTransaction(
                l3PearlCard,
                state.inventories.p1,
                [],
                state.playerBuffs.p1
            );

            expect(resPearl.gemsPaid.pearl).toBe(1); // No discount for pearls
        });

        it('MINIMALIST: Double bonus for first 2 cards', () => {
            let state = createBuffState(BUFFS.MINIMALIST.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.inventories.p1.gold = 10;
            });

            const card = { level: 1, cost: { red: 0 }, bonusColor: 'green', bonusCount: 1 } as Card;

            // 1st Card
            state = produce(state, (draft) => {
                handleBuyCard(draft, { card, source: 'market' });
            });
            expect(state.playerTableau.p1[0].bonusCount).toBe(2);

            // 2nd Card
            state = produce(state, (draft) => {
                handleBuyCard(draft, { card: { ...card, id: 'c2' }, source: 'market' });
            });
            expect(state.playerTableau.p1[1].bonusCount).toBe(2);
        });

        it('PACIFIST: Immune to stealing', () => {
            let state = createBuffState(BUFFS.PACIFIST.id);

            state = produce(state, (draft) => {
                draft.turn = 'p2';
                draft.inventories.p1.red = 5;
                draft.playerBuffs.p2 = BUFFS.EXTORTION;
                draft.playerBuffs.p2.state = { refillCount: 1 };
            });

            state = produce(state, (draft) => {
                handleReplenish(draft, { randoms: { extortionColor: 'red' } });
            });

            expect(state.inventories.p1.red).toBe(5);
        });

        it('PUPPET_MASTER: Can discard reserved card for random gem', () => {
            let state = createBuffState(BUFFS.PUPPET_MASTER.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.playerReserved.p1 = [{ id: 'res1', level: 1, cost: {}, points: 0 } as Card];
            });

            state = produce(state, (draft) => {
                handleDiscardReserved(draft, { cardId: 'res1' });
            });

            expect(state.playerReserved.p1.length).toBe(0);
            expect(state.decks[1].length).toBe(1);
            expect(Object.values(state.inventories.p1).reduce((a, b) => a + b, 0)).toBe(1);
        });

        it('COLLECTOR: Can steal opponent reserved card + Win 22', () => {
            let state = createBuffState(BUFFS.COLLECTOR.id);
            state = produce(state, (draft) => {
                draft.turn = 'p1';
                draft.playerReserved.p2 = [{ id: 'target', level: 1, cost: {}, points: 0 } as Card];
            });

            state = produce(state, (draft) => {
                handleReserveCard(draft, {
                    card: state.playerReserved.p2[0],
                    isSteal: true,
                    level: 1,
                    idx: 0,
                });
            });

            expect(state.playerReserved.p1[0].id).toBe('target');
            expect(state.playerReserved.p2.length).toBe(0);

            // Win condition test
            state = produce(state, (draft) => {
                draft.extraPoints.p1 = 21;
            });
            state = produce(state, (draft) => {
                finalizeTurn(draft, 'p2');
            });
            expect(state.winner).toBe(null); // 21 < 22

            state = produce(state, (draft) => {
                draft.extraPoints.p1 = 22;
            });
            state = produce(state, (draft) => {
                finalizeTurn(draft, 'p2');
            });
            expect(state.winner).toBe('p1');
        });
    });
});

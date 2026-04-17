import { describe, it, expect, beforeEach } from 'vitest';
import { finalizeTurn } from '../turnManager';
import { produce } from 'immer';
import { GameState, GemInventory, RoyalCard, Card, Buff } from '../../types';
import { createMockState } from './testHelpers';

describe('turnManager', () => {
    let baseState: GameState;

    beforeEach(() => {
        baseState = createMockState({ turn: 'p1' });
    });

    describe('finalizeTurn', () => {
        it('should switch turn to next player', () => {
            const state = produce(baseState, (draft) => {
                finalizeTurn(draft, 'p2');
            });

            expect(state.turn).toBe('p2');
            expect(state.phase).toBe('IDLE');
        });

        describe('Win Conditions', () => {
            it('should declare winner if points goal reached (default 20)', () => {
                const startState = createMockState({
                    turn: 'p1',
                    extraPoints: { p1: 20, p2: 0 },
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.winner).toBe('p1');
            });

            it('should declare winner if crowns goal reached (default 10)', () => {
                const startState = createMockState({
                    turn: 'p1',
                    extraCrowns: { p1: 10, p2: 0 },
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.winner).toBe('p1');
            });

            it('should declare winner if single color points reached (default 10)', () => {
                // Need to add cards to tableau
                const card = { points: 10, bonusColor: 'blue', isBuff: false } as unknown as Card;
                const startState = produce(baseState, (draft) => {
                    draft.playerTableau.p1.push(card);
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.winner).toBe('p1');
            });
        });

        describe('Royal Milestones', () => {
            it('should trigger royal selection at 3 crowns', () => {
                const startState = createMockState({
                    turn: 'p1',
                    extraCrowns: { p1: 3, p2: 0 },
                    royalDeck: [{ id: 'royal1' }] as unknown as RoyalCard[], // ensure deck not empty
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.phase).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[3]).toBe(true);
                expect(state.nextPlayerAfterRoyal).toBe('p2'); // Should return to this after royal
                expect(state.winner).toBe(null); // Game not over
            });

            it('should trigger royal selection at 6 crowns', () => {
                const startState = createMockState({
                    turn: 'p1',
                    extraCrowns: { p1: 6, p2: 0 },
                    royalDeck: [{ id: 'royal1' }] as unknown as RoyalCard[],
                    royalMilestones: { p1: { 3: true }, p2: {} }, // 3 already taken
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.phase).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[6]).toBe(true);
            });
        });

        describe('Gem Capacity', () => {
            it('should trigger discard phase if gems > 10', () => {
                const startState = produce(baseState, (draft) => {
                    draft.inventories.p1 = { blue: 11 } as unknown as GemInventory;
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                expect(state.phase).toBe('DISCARD_EXCESS_GEMS');
                expect(state.nextPlayerAfterRoyal).toBe('p2');
                // Turn should NOT change yet
                expect(state.turn).toBe('p1');
            });

            it('should respect buffed gem capacity', () => {
                const startState = produce(baseState, (draft) => {
                    draft.inventories.p1 = { blue: 11 } as unknown as GemInventory;
                    draft.playerBuffs.p1 = {
                        effects: { passive: { gemCap: 12 } },
                    } as unknown as Buff;
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });

                // 11 <= 12, so valid. Should switch turn.
                expect(state.turn).toBe('p2');
                expect(state.phase).toBe('IDLE');
            });
        });

        describe('Buff Stacking and Numerical Limits', () => {
            it('should handle extremely high point values without crashing', () => {
                const startState = createMockState({
                    turn: 'p1',
                    extraPoints: { p1: Number.MAX_SAFE_INTEGER - 100, p2: 0 },
                });
                const state = produce(startState, (draft) => {
                    draft.playerTableau.p1.push({
                        points: 200,
                        bonusColor: 'red',
                    } as unknown as Card);
                    finalizeTurn(draft, 'p2');
                });
                expect(state.winner).toBe('p1');
            });

            it('should correctly apply pointBonus from buffs', () => {
                const startState = produce(baseState, (draft) => {
                    draft.playerBuffs.p1 = {
                        id: 'test',
                        level: 3,
                        label: 'Test',
                        desc: '',
                        effects: { passive: { pointBonus: 5 } },
                    } as unknown as Buff;
                    draft.playerTableau.p1.push({
                        points: 0,
                        bonusColor: 'red',
                    } as unknown as Card);
                    draft.playerRoyals.p1.push({
                        points: 0,
                        bonusColor: 'blue',
                        ability: 'none',
                        label: '',
                    } as unknown as RoyalCard);
                });
                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });
                // 2 items * 5 bonus = 10 points

                // Win condition is 20 by default. Should not win yet.
                expect(state.winner).toBe(null);

                const winningState = produce(startState, (draft) => {
                    // Add more items to reach 20 points
                    draft.playerTableau.p1.push({
                        points: 0,
                        bonusColor: 'green',
                    } as unknown as Card);
                    draft.playerTableau.p1.push({
                        points: 0,
                        bonusColor: 'white',
                    } as unknown as Card);
                    finalizeTurn(draft, 'p2');
                });
                // 4 items * 5 bonus = 20 points. Should win.
                expect(winningState.winner).toBe('p1');
            });

            it('should handle multiple crown milestones in one turn', () => {
                // If a player somehow gets 6 crowns in one go (e.g. initial buff + royal card)
                const startState = createMockState({
                    turn: 'p1',
                    extraCrowns: { p1: 6, p2: 0 },
                    royalDeck: [{ id: 'r1' }, { id: 'r2' }] as unknown as RoyalCard[],
                    royalMilestones: { p1: { 3: false, 6: false }, p2: {} },
                });
                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                });
                // Should hit 6 milestone first? Or 3?

                // current logic: if ((crowns >= 3 && !milestones[3]) || (crowns >= 6 && !milestones[6]))
                // it picks one.
                expect(state.phase).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[6] || state.royalMilestones.p1[3]).toBe(true);
            });
        });
    });
});

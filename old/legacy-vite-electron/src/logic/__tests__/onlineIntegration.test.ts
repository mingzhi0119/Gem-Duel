import { describe, it, expect } from 'vitest';
import { applyAction } from '../gameReducer';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { generateGemPool, generateDeck } from '../../utils';
import { GameState, GameAction, BuffInitPayload } from '../../types';

// Mock utils to ensure deterministic RNG for "Host" setup generation
// But since we are testing synchronization, we want Host to generate "random" stuff
// and Guest to receive it exactly as is.

describe('Online Integration Simulation', () => {
    // Helper to simulate the network layer
    const simulateNetworkParams = () => {
        // Initial state should be null to simulate "before game starts" for the reducer
        // OR we handle INIT specially by passing null.
        // In the hook, the reducer starts with null state for the first action.
        let hostState: GameState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
        let guestState: GameState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));

        // Host performs an action
        const hostAct = (action: GameAction) => {
            if (action.type === 'INIT' || action.type === 'INIT_DRAFT') {
                const newState = applyAction(null, action);
                if (!newState) throw new Error('Host init failed');
                hostState = newState;
            } else {
                const newState = applyAction(hostState, action);
                if (!newState) throw new Error('Host action failed');
                hostState = newState;
            }
            return action; // Broadcast this
        };

        // Guest receives an action
        const guestReceive = (action: GameAction) => {
            // Simulate the intercept logic in useGameLogic handleRemoteAction
            if (action.type === 'INIT' || action.type === 'INIT_DRAFT') {
                // In actual hook, this calls clearAndInit.
                // Here we simulate it by resetting state to skeleton then applying INIT.
                // Actually, handleInit logic in reducer REPLACES the state content based on payload.
                // So calling applyAction with INIT on current guestState should work
                // IF handleInit implementation is correct (it merges payload into skeleton).
                // But wait, the hook uses clearAndInit which sets history=[action].
                // The reducer's handleInit merges payload into skeleton.
                // So effectively, we just apply the action.
                const newState = applyAction(null, action); // Pass null to trigger INIT handler logic
                if (!newState) throw new Error('Guest init failed');
                guestState = newState;
            } else if (action.type === 'FLATTEN') {
                // FLATTEN payload IS the state.
                guestState = action.payload;
            } else {
                const newState = applyAction(guestState, action);
                if (!newState) throw new Error(`Guest action ${action.type} failed`);
                guestState = newState;
            }
        };

        return {
            getHostState: () => hostState,
            getGuestState: () => guestState,
            dispatchBroadcast: (action: GameAction) => {
                // Host applies locally
                const broadcastAction = hostAct(action);
                // Network delay simulation? No need for unit test.
                // Guest receives
                guestReceive(broadcastAction);
            },
            guestActLocal: (action: GameAction) => {
                // Guest performs action locally -> sends to Host
                const newState = applyAction(guestState, action);
                if (!newState) throw new Error('Guest local action failed');
                guestState = newState;
                // Host receives
                // In real game, logic is symmetric.
                const hostNewState = applyAction(hostState, action);
                if (!hostNewState) throw new Error('Host failed to apply guest action');
                hostState = hostNewState;
            },
        };
    };

    it('should synchronize Classic Game initialization', () => {
        const { getHostState, getGuestState, dispatchBroadcast } = simulateNetworkParams();

        // 1. Host starts game
        const pool = generateGemPool();
        const d1 = generateDeck(1);
        const d2 = generateDeck(2);
        const d3 = generateDeck(3);
        const market = { 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 5) };

        // This payload mimics what startGame generates
        const setupPayload: BuffInitPayload = {
            board: Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => pool.pop()!)),
            bag: pool,
            market: market,
            decks: { 1: d1, 2: d2, 3: d3 },
            isPvE: false,
            isOnline: true,
            isHost: true,
        };

        const action: GameAction = { type: 'INIT', payload: setupPayload };
        dispatchBroadcast(action);

        const h = getHostState();
        const g = getGuestState();

        expect(g.phase).toBe('IDLE');
        expect(g.turn).toBe('p1');
        // Check Board sync
        expect(g.board[0][0].uid).toBe(h.board[0][0].uid);
        // Check Market sync
        expect(g.market[1][0]?.id).toBe(h.market[1][0]?.id);
        // Check Decks
        expect(g.decks[3].length).toBe(h.decks[3].length);
    });

    it('should synchronize Roguelike Draft and Flattening', () => {
        const { getHostState, getGuestState, dispatchBroadcast, guestActLocal } =
            simulateNetworkParams();

        // 1. Host starts Roguelike
        const setupPayload: Record<string, unknown> = {
            // ... minimal setup ...
            board: [],
            bag: [],
            market: { 1: [], 2: [], 3: [] },
            decks: { 1: [], 2: [], 3: [] },
            mode: 'ONLINE_MULTIPLAYER',
            isHost: true,
            initRandoms: { p1: {}, p2: {} },
            draftPool: ['privilege_favor', 'head_start'],
            buffLevel: 1,
        };

        const initDraftAction: GameAction = { type: 'INIT_DRAFT', payload: setupPayload };
        dispatchBroadcast(initDraftAction);

        let h = getHostState();
        let g = getGuestState();

        expect(g.phase).toBe('DRAFT_PHASE');
        expect(g.turn).toBe('p1'); // P1 picks first now

        // 2. P1 (Host) selects Buff
        // Host must provide p2DraftPoolIndices to sync the pool
        const p2Indices = [0, 1, 2, 3]; // Deterministic indices for test
        const selectBuffAction: GameAction = {
            type: 'SELECT_BUFF',
            payload: {
                buffId: 'privilege_favor',
                randomColor: 'red',
                p2DraftPoolIndices: p2Indices,
            },
        };
        dispatchBroadcast(selectBuffAction);

        h = getHostState();
        g = getGuestState();

        expect(h.playerBuffs.p1.id).toBe('privilege_favor');
        expect(g.playerBuffs.p1.id).toBe('privilege_favor');
        expect(g.turn).toBe('p2');
        expect(g.p2DraftPool).toBeDefined();

        // 3. Guest (P2) selects Buff
        const p2BuffId = g.p2DraftPool![0];
        const guestSelectBuffAction: GameAction = {
            type: 'SELECT_BUFF',
            payload: { buffId: p2BuffId, randomColor: 'blue' },
        };
        guestActLocal(guestSelectBuffAction);

        h = getHostState();
        g = getGuestState();

        expect(h.phase).toBe('IDLE');
        expect(g.phase).toBe('IDLE');
        expect(h.playerBuffs.p2.id).toBe(p2BuffId);

        // 4. Flattening
        // In the Hook, Host detects IDLE and broadcasts FLATTEN?
        // actually, both sides run the useEffect.
        // Host runs useEffect -> calls clearAndInit -> sets history.
        // Does Host broadcast FLATTEN? No, the hook logic doesn't broadcast internal history changes unless recordAction is called.
        // The useEffect calls clearAndInit directly.
        // Wait, if both sides compute the state identically, they both flatten locally.
        // BUT, if P2 pool was different, their states are now divergent!

        // We need to verify if P2 pool divergence matters.
        // It matters if P2 selected a buff that Host thinks is invalid?
        // handleSelectBuff checks: const selectedBuff = currentPool.find...
        // If Host generated Pool A and Guest generated Pool B.
        // Guest picks from B. Host receives action. Host checks Pool A.
        // If Buff is not in Pool A -> Logic ignores it -> State Desync!
    });
});

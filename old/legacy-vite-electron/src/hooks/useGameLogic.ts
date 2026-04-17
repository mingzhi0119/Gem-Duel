import { useEffect, useMemo } from 'react';
import { GameState, GemCoord, GameAction } from '../types';
import { useAIController } from './useAIController';
import { useGameState } from './useGameState';
import { useGameNetwork } from './useGameNetwork';
import { useGameInteractions } from './useGameInteractions';

export const useGameLogic = (
    shouldConnect: boolean = false,
    targetIP: string = 'localhost',
    isReviewing: boolean = false
) => {
    // 1. Core State Management
    const { gameState, dispatch, historyControls } = useGameState();

    // 2. Network & Authority Layer
    const { online, networkDispatch } = useGameNetwork(
        gameState,
        dispatch,
        historyControls.clearAndInit,
        shouldConnect,
        targetIP
    );

    // 3. User Interaction Handlers
    const interactions = useGameInteractions(
        gameState,
        networkDispatch,
        historyControls.currentIndex,
        isReviewing
    );

    const isViewingHistory =
        historyControls.historyLength > 0 &&
        historyControls.currentIndex < historyControls.historyLength - 1;

    // 4. AI Controller
    useAIController(gameState, networkDispatch, isViewingHistory);

    // 5. Flattening Logic (moved from original useGameLogic)
    useEffect(() => {
        if (
            gameState.phase === 'IDLE' &&
            historyControls.historyLength > 1 &&
            historyControls.history.some((a) => a.type === 'SELECT_BUFF' || a.type === 'INIT_DRAFT')
        ) {
            const flattenedAction: GameAction = {
                type: 'FLATTEN',
                payload: JSON.parse(JSON.stringify(gameState)),
            };
            historyControls.clearAndInit(flattenedAction);
        }
    }, [
        gameState.phase,
        historyControls.history,
        historyControls.clearAndInit,
        gameState,
        historyControls.historyLength,
        historyControls,
    ]);

    const result = useMemo(
        () => ({
            state: {
                ...gameState,
                selectedGems: interactions.selectedGems,
                errorMsg: interactions.errorMsg,
            } as Readonly<GameState & { selectedGems: GemCoord[]; errorMsg: string | null }>,

            handlers: {
                ...interactions.handlers,
                importHistory: historyControls.importHistory,
            },

            getters: interactions.getters,

            historyControls: {
                ...historyControls,
                // Override undo/redo to block in online mode
                undo: () =>
                    !gameState.mode.startsWith('ONLINE') &&
                    historyControls.canUndo &&
                    historyControls.undo(),
                redo: () =>
                    !gameState.mode.startsWith('ONLINE') &&
                    historyControls.canRedo &&
                    historyControls.redo(),
                canUndo: !gameState.mode.startsWith('ONLINE') && historyControls.canUndo,
                canRedo: !gameState.mode.startsWith('ONLINE') && historyControls.canRedo,
            },

            online: {
                ...online,
                latency: online.latency,
                isUnstable: online.isUnstable,
            },
        }),
        [gameState, interactions, historyControls, online]
    );

    return result;
};

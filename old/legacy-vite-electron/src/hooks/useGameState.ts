import { useMemo, useCallback, useRef } from 'react';
import { useActionHistory } from './useActionHistory';
import { applyAction } from '../logic/gameReducer';
import { INITIAL_STATE_SKELETON } from '../logic/initialState';
import { GameState, GameAction } from '../types';

export const useGameState = () => {
    // 1. Core State & History
    const {
        history,
        currentIndex,
        recordAction: recordLocalAction,
        undo,
        redo,
        canUndo,
        canRedo,
        jumpToStep,
        importHistory,
        clearAndInit,
    } = useActionHistory();

    // 2. Persistent State Cache to maintain referential integrity
    const stateCache = useRef<Map<number, GameState>>(new Map());
    const lastActionZero = useRef<GameAction | null>(null);

    // 3. Derive GameState from History with caching
    const gameState = useMemo(() => {
        if (history.length === 0) {
            stateCache.current.clear();
            lastActionZero.current = null;
            return INITIAL_STATE_SKELETON;
        }

        // If the first action has changed, the entire history was replaced (Flatten/Import)
        // We must clear the cache to avoid stale states.
        if (history[0] !== lastActionZero.current) {
            stateCache.current.clear();
            lastActionZero.current = history[0];
        }

        const limit = Math.min(currentIndex, history.length - 1);

        // Try to find the closest cached state
        let lastKnownIndex = -1;
        for (let i = limit; i >= -1; i--) {
            if (stateCache.current.has(i) || i === -1) {
                lastKnownIndex = i;
                break;
            }
        }

        let state =
            lastKnownIndex === -1
                ? INITIAL_STATE_SKELETON
                : stateCache.current.get(lastKnownIndex)!;

        // Apply actions from the last known state to the current limit
        for (let i = lastKnownIndex + 1; i <= limit; i++) {
            const nextState = applyAction(state, history[i]);
            if (nextState) {
                state = nextState;
                // Cache every step to make undo/redo instantaneous and stable
                stateCache.current.set(i, state);
            }
        }

        // Clean up cache for branches that no longer exist (if history was truncated)
        if (stateCache.current.size > history.length) {
            Array.from(stateCache.current.keys()).forEach((key) => {
                if (key >= history.length) stateCache.current.delete(key);
            });
        }

        return state;
    }, [currentIndex, history]);

    const dispatch = useCallback(
        (action: GameAction) => {
            recordLocalAction(action);
        },
        [recordLocalAction]
    );

    return {
        gameState,
        dispatch,
        historyControls: {
            undo,
            redo,
            canUndo,
            canRedo,
            jumpToStep,
            importHistory,
            clearAndInit,
            currentIndex,
            historyLength: history.length,
            history,
        },
    };
};

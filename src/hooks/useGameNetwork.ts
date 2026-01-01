import { useCallback, useEffect, useRef } from 'react';
import { useOnlineManager } from './useOnlineManager';
import { validateOnlineAction } from '../logic/authority';
import { generateGameStateHash } from '../utils/checksum';
import { applyAction } from '../logic/gameReducer';
import { GameState, GameAction } from '../types';

export const useGameNetwork = (
    gameState: GameState,
    localDispatch: (action: GameAction) => void,
    clearAndInit: (action: GameAction) => void,
    shouldConnect: boolean,
    targetIP: string = 'localhost'
) => {
    // Ref to break circular dependency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onlineRef = useRef<any>(null);

    // Remote Action Handler (Logic for RECEIVING)
    const handleRemoteAction = useCallback(
        (action: GameAction, remoteChecksum?: string) => {
            console.log(`[NET-RECEIVE] Action: ${action.type}`, action.payload);
            if (action.type === 'INIT' || action.type === 'INIT_DRAFT') {
                const guestAction = {
                    ...action,
                    payload: { ...action.payload, isHost: false },
                };
                clearAndInit(guestAction);
            } else {
                if (remoteChecksum && gameState) {
                    const predicted = applyAction(gameState, action);
                    const localHash = generateGameStateHash(predicted);
                    if (localHash !== remoteChecksum) {
                        console.error(`DESYNC: Local ${localHash} vs Remote ${remoteChecksum}`);
                        // Trigger Recovery
                        onlineRef.current?.sendSystemMessage({ type: 'REQUEST_FULL_SYNC' });
                        return; // Do NOT apply corrupt action
                    }
                }
                localDispatch(action);
            }
        },
        [localDispatch, clearAndInit, gameState]
    );

    const handleStateReceived = useCallback(
        (authoritativeState: GameState) => {
            const guestStateSnapshot = { ...authoritativeState, isHost: false };
            localDispatch({ type: 'FORCE_SYNC', payload: guestStateSnapshot });
        },
        [localDispatch]
    );

    const handleGuestRequest = useCallback(
        (action: GameAction) => {
            if (gameState.mode === 'ONLINE_MULTIPLAYER' && gameState.isHost) {
                if (validateOnlineAction(gameState, action)) {
                    localDispatch(action);
                }
            }
        },
        [gameState, localDispatch]
    );

    const online = useOnlineManager(
        handleRemoteAction,
        handleStateReceived,
        handleGuestRequest,
        gameState.mode === 'ONLINE_MULTIPLAYER' || shouldConnect,
        () => gameState,
        targetIP
    );

    // Sync ref
    useEffect(() => {
        onlineRef.current = online;
    }, [online]);

    // Smart Dispatcher (Logic for SENDING/RECORDING)
    const networkDispatch = useCallback(
        (action: GameAction) => {
            console.log(`[ACTION-RECORD] Type: ${action.type}`, action.payload);
            const isInit = action.type === 'INIT' || action.type === 'INIT_DRAFT';

            if (gameState.mode === 'ONLINE_MULTIPLAYER') {
                if (gameState.isHost) {
                    localDispatch(action);

                    // Predict and sync immediately for initial actions
                    if (isInit) {
                        const next = applyAction(null, action);
                        const hash = generateGameStateHash(next);
                        online.sendAction(action, hash);
                    }
                } else {
                    if (gameState.turn === 'p2') {
                        online.sendGuestRequest(action);
                    }
                }
                return;
            }

            localDispatch(action);

            // If we are starting an online game from local, broadcast it
            if (isInit && (action.payload.mode === 'ONLINE_MULTIPLAYER' || shouldConnect)) {
                const next = applyAction(null, action);
                const hash = generateGameStateHash(next);
                online.sendAction(action, hash);
            }
        },
        [gameState, online, localDispatch, shouldConnect]
    );

    // Host Broadcast Effect
    useEffect(() => {
        if (gameState.mode === 'ONLINE_MULTIPLAYER' && gameState.isHost) {
            online.sendState(gameState);
        }
    }, [gameState.mode, gameState.isHost, online.sendState, gameState, online]);
    // Note: removed history.length dependency to avoid excessive broadcasting,
    // but Host should probably broadcast on meaningful state changes.
    // Ideally this is handled by the "Smart Dispatcher" sending actions,
    // and sync is only for recovery or join.
    // Keeping it simple to match original logic but being careful.

    return {
        online,
        networkDispatch,
    };
};

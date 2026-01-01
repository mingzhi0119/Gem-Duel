import { useState, useCallback, useMemo, useEffect } from 'react';
import { GRID_SIZE, BUFFS } from '../constants';
import { generateGemPool, generateDeck, shuffleArray, calculateTransaction } from '../utils';
import { processGemClick, processOpponentGemClick } from '../logic/interactionManager';
import { getPlayerScore, getCrownCount } from '../logic/selectors';
import { validateGemSelection } from '../logic/validators';
import {
    GameState,
    Card,
    PlayerKey,
    GemCoord,
    GemColor,
    GameAction,
    GemTypeObject,
    GameMode,
    BoardCell,
    BuffInitPayload,
    BuyCardPayload,
    RoyalCard,
    InitiateBuyJokerPayload,
    InitiateReservePayload,
    InitiateReserveDeckPayload,
    Buff,
} from '../types';

export const useGameInteractions = (
    gameState: GameState,
    networkDispatch: (action: GameAction) => void,
    currentIndex: number, // Used to reset selection on history change
    isReviewing: boolean = false
) => {
    const [selectedGems, setSelectedGems] = useState<GemCoord[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        setSelectedGems([]);
    }, [currentIndex]);

    useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => {
                setErrorMsg(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    const canLocalInteract = useMemo(() => {
        if (isReviewing || gameState.winner) return false;
        const mode = gameState.mode;
        if (mode === 'LOCAL_PVP') return true;
        if (mode === 'PVE') return gameState.turn === 'p1';
        if (mode === 'ONLINE_MULTIPLAYER') {
            const myRole: PlayerKey = gameState.isHost ? 'p1' : 'p2';
            return gameState.turn === myRole;
        }
        return true;
    }, [gameState.mode, gameState.turn, gameState.isHost, gameState.winner, isReviewing]);

    // --- Helpers ---
    const isSelected = useCallback(
        (r: number, c: number) => selectedGems.some((s) => s.r === r && s.c === c),
        [selectedGems]
    );
    const canAfford = useCallback(
        (card: Card, isReserved: boolean = false) => {
            if (!gameState) return false;
            const player = gameState.turn;
            const { affordable } = calculateTransaction(
                card,
                gameState.inventories[player],
                gameState.playerTableau[player],
                gameState.playerBuffs[player],
                isReserved
            );
            return affordable;
        },
        [gameState]
    );

    // Initialization Logic
    const startGame = useCallback(
        (
            mode: GameMode,
            options: { useBuffs: boolean; isHost?: boolean } = { useBuffs: false }
        ) => {
            const isRogue = options.useBuffs;
            const fullPool = generateGemPool();
            const initialBoardFlat = fullPool.slice(0, 25);
            const initialBag = fullPool.slice(25);
            const newBoard: BoardCell[][] = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                const row: BoardCell[] = [];
                for (let c = 0; c < GRID_SIZE; c++) {
                    row.push(initialBoardFlat[r * GRID_SIZE + c]);
                }
                newBoard.push(row);
            }
            const d1 = generateDeck(1, isRogue);
            const d2 = generateDeck(2, isRogue);
            const d3 = generateDeck(3, isRogue);
            const market = { 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 5) };
            const decks = { 1: d1, 2: d2, 3: d3 };

            const basics = ['red', 'green', 'blue', 'white', 'black'];
            const initRandoms = {
                p1: {
                    randomGems: Array.from(
                        { length: 5 },
                        () => basics[Math.floor(Math.random() * 5)]
                    ),
                    reserveCardLevel: Math.floor(Math.random() * 3) + 1,
                    preferenceColor: basics[Math.floor(Math.random() * 5)],
                },
                p2: {
                    randomGems: Array.from(
                        { length: 5 },
                        () => basics[Math.floor(Math.random() * 5)]
                    ),
                    reserveCardLevel: Math.floor(Math.random() * 3) + 1,
                    preferenceColor: basics[Math.floor(Math.random() * 5)],
                },
            };

            const setupData: BuffInitPayload = {
                mode,
                board: newBoard,
                bag: initialBag,
                market,
                decks,
                initRandoms,
                isHost: options.isHost ?? true,
            };

            if (options.useBuffs) {
                const level = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
                const levelBuffs = (Object.values(BUFFS) as Buff[]).filter(
                    (b) => b.level === level
                );

                // Select 3 for P1 from DIFFERENT categories
                const categoriesSeen = new Set<string>();
                const p1Pool: typeof levelBuffs = [];
                const shuffledPool = shuffleArray([...levelBuffs]);

                for (const b of shuffledPool) {
                    if (b.category && !categoriesSeen.has(b.category)) {
                        p1Pool.push(b);
                        categoriesSeen.add(b.category);
                        if (p1Pool.length === 3) break;
                    }
                }

                // IDs only
                setupData.draftPool = p1Pool.map((b) => b.id);
                setupData.buffLevel = level;

                const action: GameAction = {
                    type: 'INIT_DRAFT',
                    payload: setupData as unknown as Record<string, unknown>,
                };
                networkDispatch(action);
            } else {
                const action: GameAction = { type: 'INIT', payload: setupData };
                networkDispatch(action);
            }
        },
        [networkDispatch]
    );

    const handleSelfGemClick = useCallback(
        (gemId: string) => {
            if (!canLocalInteract || gameState.phase !== 'DISCARD_EXCESS_GEMS') return;
            const action: GameAction = { type: 'DISCARD_GEM', payload: gemId };
            networkDispatch(action);
        },
        [canLocalInteract, gameState.phase, networkDispatch]
    );

    const handleGemClick = useCallback(
        (r: number, c: number) => {
            if (!canLocalInteract || gameState.winner) return;
            const result = processGemClick(gameState, r, c, selectedGems);
            if (result.error) return setErrorMsg(result.error);
            if (result.action) return networkDispatch(result.action);
            if (result.newSelection) setSelectedGems(result.newSelection);
        },
        [canLocalInteract, gameState, selectedGems, networkDispatch]
    );

    const handleOpponentGemClick = useCallback(
        (gemId: string) => {
            if (!canLocalInteract) return;
            const result = processOpponentGemClick(gameState, gemId as GemColor);
            if (result.error) return setErrorMsg(result.error);
            if (result.action) networkDispatch(result.action);
        },
        [canLocalInteract, gameState, networkDispatch]
    );

    const handleConfirmTake = useCallback(() => {
        if (!canLocalInteract || selectedGems.length === 0) return;
        const check = validateGemSelection(selectedGems);
        if (!check.valid) return setErrorMsg(check.error || 'Invalid!');
        if (check.hasGap) return setErrorMsg('Gap detected!');
        const buff = gameState.playerBuffs?.[gameState.turn];
        if (buff?.effects?.passive?.noTake3 && selectedGems.length === 3)
            return setErrorMsg('Cannot take 3 gems!');
        const action: GameAction = { type: 'TAKE_GEMS', payload: { coords: selectedGems } };
        networkDispatch(action);
        setSelectedGems([]);
    }, [canLocalInteract, selectedGems, gameState.playerBuffs, gameState.turn, networkDispatch]);

    const handleReplenish = useCallback(() => {
        if (!canLocalInteract || gameState.bag.length === 0) return;
        const basics = ['red', 'green', 'blue', 'white', 'black'];
        const opponent = gameState.turn === 'p1' ? 'p2' : 'p1';
        const stealable = Object.keys(gameState.inventories[opponent]).filter(
            (k) => k !== 'gold' && k !== 'pearl' && gameState.inventories[opponent][k] > 0
        );
        const action: GameAction = {
            type: 'REPLENISH',
            payload: {
                randoms: {
                    expansionColor: basics[Math.floor(Math.random() * 5)] as GemColor,
                    extortionColor: (stealable.length > 0
                        ? stealable[Math.floor(Math.random() * stealable.length)]
                        : undefined) as GemColor | undefined,
                },
            },
        };
        networkDispatch(action);
    }, [
        canLocalInteract,
        gameState.bag.length,
        gameState.turn,
        gameState.inventories,
        networkDispatch,
    ]);

    const handleReserveCard = useCallback(
        (card: Card, level: number, idx: number) => {
            if (!canLocalInteract || gameState.playerReserved[gameState.turn].length >= 3) return;
            const hasGold = gameState.board.flat().some((cell) => cell.type.id === 'gold');
            if (hasGold) {
                const action: GameAction = {
                    type: 'INITIATE_RESERVE',
                    payload: { card, level: level as 1 | 2 | 3, idx },
                };
                networkDispatch(action);
                setErrorMsg('Select a Gold gem.');
            } else {
                const action: GameAction = {
                    type: 'RESERVE_CARD',
                    payload: { card, level: level as 1 | 2 | 3, idx },
                };
                networkDispatch(action);
            }
        },
        [
            canLocalInteract,
            gameState.playerReserved,
            gameState.turn,
            gameState.board,
            networkDispatch,
        ]
    );

    const handleReserveDeck = useCallback(
        (level: number) => {
            if (!canLocalInteract || gameState.playerReserved[gameState.turn].length >= 3) return;
            if (gameState.decks[level as 1 | 2 | 3].length === 0) return setErrorMsg('Deck empty!');
            const hasGold = gameState.board.flat().some((cell) => cell.type.id === 'gold');
            if (hasGold) {
                const action: GameAction = {
                    type: 'INITIATE_RESERVE_DECK',
                    payload: { level: level as 1 | 2 | 3 },
                };
                networkDispatch(action);
            } else {
                const action: GameAction = {
                    type: 'RESERVE_DECK',
                    payload: { level: level as 1 | 2 | 3 },
                };
                networkDispatch(action);
            }
        },
        [
            canLocalInteract,
            gameState.playerReserved,
            gameState.turn,
            gameState.decks,
            gameState.board,
            networkDispatch,
        ]
    );

    const initiateBuy = useCallback(
        (
            card: Card,
            source: string = 'market',
            marketInfo?: InitiateBuyJokerPayload['marketInfo']
        ) => {
            if (!canLocalInteract) return;
            const affordable = canAfford(card, source === 'reserved');
            if (!affordable) return setErrorMsg('Cannot afford!');
            if (card.bonusColor === 'gold') {
                const action: GameAction = {
                    type: 'INITIATE_BUY_JOKER',
                    payload: { card, source, marketInfo },
                };
                networkDispatch(action);
            } else {
                const basics = ['red', 'green', 'blue', 'white', 'black'];
                const action: GameAction = {
                    type: 'BUY_CARD',
                    payload: {
                        card,
                        source: source as 'market' | 'reserved',
                        marketInfo,
                        randoms: {
                            bountyHunterColor: basics[Math.floor(Math.random() * 5)] as GemColor,
                        },
                    },
                };
                networkDispatch(action);
            }
        },
        [canLocalInteract, canAfford, networkDispatch]
    );

    const handleSelectBonusColor = useCallback(
        (color: string) => {
            if (
                !canLocalInteract ||
                gameState.phase !== 'SELECT_CARD_COLOR' ||
                !gameState.pendingBuy
            )
                return;
            const { card, source, marketInfo } = gameState.pendingBuy;
            const basics = ['red', 'green', 'blue', 'white', 'black'];
            const action: GameAction = {
                type: 'BUY_CARD',
                payload: {
                    card: { ...card, bonusColor: color as GemColor },
                    source: source as 'market' | 'reserved',
                    marketInfo,
                    randoms: {
                        bountyHunterColor: basics[Math.floor(Math.random() * 5)] as GemColor,
                    },
                },
            };
            networkDispatch(action);
        },
        [canLocalInteract, gameState.phase, gameState.pendingBuy, networkDispatch]
    );

    const handleSelectRoyal = useCallback(
        (royalCard: RoyalCard) => {
            if (!canLocalInteract) return;
            const action: GameAction = { type: 'SELECT_ROYAL_CARD', payload: { card: royalCard } };
            networkDispatch(action);
        },
        [canLocalInteract, networkDispatch]
    );

    const handleCancelReserve = useCallback(() => {
        if (canLocalInteract) {
            const action: GameAction = { type: 'CANCEL_RESERVE' };
            networkDispatch(action);
        }
    }, [canLocalInteract, networkDispatch]);

    const handleCancelPrivilege = useCallback(() => {
        if (canLocalInteract) {
            const action: GameAction = { type: 'CANCEL_PRIVILEGE' };
            networkDispatch(action);
        }
    }, [canLocalInteract, networkDispatch]);

    const activatePrivilegeMode = useCallback(() => {
        if (!canLocalInteract || gameState.phase !== 'IDLE') return;
        const hasPrivilege =
            gameState.privileges[gameState.turn] > 0 ||
            (gameState.extraPrivileges && gameState.extraPrivileges[gameState.turn] > 0);
        if (hasPrivilege) {
            if (!gameState.board.flat().some((g) => g.type.id !== 'empty' && g.type.id !== 'gold'))
                return setErrorMsg('No gems.');
            const action: GameAction = { type: 'ACTIVATE_PRIVILEGE' };
            networkDispatch(action);
            setSelectedGems([]);
        }
    }, [
        canLocalInteract,
        gameState.phase,
        gameState.privileges,
        gameState.turn,
        gameState.extraPrivileges,
        gameState.board,
        networkDispatch,
    ]);

    const checkAndInitiateBuyReserved = useCallback(
        (card: Card, execute: boolean = false) => {
            if (!canLocalInteract) return false;
            const affordable = canAfford(card, true);
            if (execute && affordable) initiateBuy(card, 'reserved');
            return affordable;
        },
        [canLocalInteract, canAfford, initiateBuy]
    );

    const handleDebugAddCrowns = useCallback(
        (pid: PlayerKey) => {
            if (!gameState.winner) {
                const action: GameAction = { type: 'DEBUG_ADD_CROWNS', payload: pid };
                networkDispatch(action);
            }
        },
        [gameState.winner, networkDispatch]
    );

    const handleDebugAddPoints = useCallback(
        (pid: PlayerKey) => {
            if (!gameState.winner) {
                const action: GameAction = { type: 'DEBUG_ADD_POINTS', payload: pid };
                networkDispatch(action);
            }
        },
        [gameState.winner, networkDispatch]
    );

    const handleDebugAddPrivilege = useCallback(
        (pid: PlayerKey) => {
            if (!gameState.winner) {
                const action: GameAction = { type: 'DEBUG_ADD_PRIVILEGE', payload: pid };
                networkDispatch(action);
            }
        },
        [gameState.winner, networkDispatch]
    );

    const handleForceRoyal = useCallback(() => {
        if (!gameState.winner) {
            const action: GameAction = { type: 'FORCE_ROYAL_SELECTION' };
            networkDispatch(action);
        }
    }, [gameState.winner, networkDispatch]);

    const handleSelectBuff = useCallback(
        (buffId: string) => {
            if (!canLocalInteract) return;
            const basics = ['red', 'green', 'blue', 'white', 'black'];
            const randomColor = basics[Math.floor(Math.random() * 5)] as GemColor;
            let p2DraftPoolIndices: number[] | undefined;

            if (gameState.turn === 'p1' && gameState.phase === 'DRAFT_PHASE') {
                const levelBuffs = (Object.values(BUFFS) as Buff[]).filter(
                    (b) => b.level === gameState.buffLevel
                );
                const selectedBuff = levelBuffs.find((b) => b.id === buffId);
                const selectedCategory = selectedBuff?.category;

                const p1ChoiceIdx = levelBuffs.findIndex((b) => b.id === buffId);

                // Slot 1: P1's Choice
                const finalIndices: number[] = [p1ChoiceIdx];

                // Slots 2-4: 3 new buffs of DIFFERENT categories, none matching selectedCategory
                const poolForP2 = levelBuffs.filter(
                    (b) => b.id !== buffId && b.category !== selectedCategory
                );
                const shuffledPool = shuffleArray([...poolForP2]);
                const categoriesSeen = new Set<string>();

                for (const b of shuffledPool) {
                    if (b.category && !categoriesSeen.has(b.category)) {
                        const idx = levelBuffs.findIndex((lb) => lb.id === b.id);
                        finalIndices.push(idx);
                        categoriesSeen.add(b.category);
                        if (finalIndices.length === 4) break;
                    }
                }
                p2DraftPoolIndices = finalIndices;
            }

            const action: GameAction = {
                type: 'SELECT_BUFF',
                payload: { buffId, randomColor, p2DraftPoolIndices },
            };
            networkDispatch(action);
        },
        [canLocalInteract, gameState.turn, gameState.phase, gameState.buffLevel, networkDispatch]
    );

    const handleCloseModal = useCallback(() => {
        const action: GameAction = { type: 'CLOSE_MODAL' };
        networkDispatch(action);
    }, [networkDispatch]);

    const handlePeekDeck = useCallback(
        (level: number) => {
            if (canLocalInteract) {
                const action: GameAction = {
                    type: 'PEEK_DECK',
                    payload: { level: level as 1 | 2 | 3 },
                };
                networkDispatch(action);
            }
        },
        [canLocalInteract, networkDispatch]
    );

    const handleRerollBuffs = useCallback(
        (level?: number) => {
            if (canLocalInteract) {
                const action: GameAction = {
                    type: 'DEBUG_REROLL_BUFFS',
                    payload: { level },
                };
                networkDispatch(action);
            }
        },
        [canLocalInteract, networkDispatch]
    );

    const boundGetPlayerScore = useCallback(
        (pid: PlayerKey) => getPlayerScore(gameState as GameState, pid),
        [gameState]
    );
    const boundGetCrownCount = useCallback(
        (pid: PlayerKey) => getCrownCount(gameState as GameState, pid),
        [gameState]
    );

    const handleDiscardReserved = useCallback(
        (cardId: string) => {
            if (canLocalInteract) {
                const action: GameAction = { type: 'DISCARD_RESERVED', payload: { cardId } };
                networkDispatch(action);
            }
        },
        [canLocalInteract, networkDispatch]
    );

    const handlers = useMemo(
        () => ({
            startGame,
            handleSelfGemClick,
            handleGemClick,
            handleOpponentGemClick,
            handleConfirmTake,
            handleReplenish,
            handleReserveCard,
            handleReserveDeck,
            handleDiscardReserved,
            initiateBuy,
            handleSelectBonusColor,
            handleSelectRoyal,
            handleCancelReserve,
            handleCancelPrivilege,
            activatePrivilegeMode,
            checkAndInitiateBuyReserved,
            handleDebugAddCrowns,
            handleDebugAddPoints,
            handleDebugAddPrivilege,
            handleForceRoyal,
            handleSelectBuff,
            handleCloseModal,
            handlePeekDeck,
            handleRerollBuffs,
        }),
        [
            startGame,
            handleSelfGemClick,
            handleGemClick,
            handleOpponentGemClick,
            handleConfirmTake,
            handleReplenish,
            handleReserveCard,
            handleReserveDeck,
            handleDiscardReserved,
            initiateBuy,
            handleSelectBonusColor,
            handleSelectRoyal,
            handleCancelReserve,
            handleCancelPrivilege,
            activatePrivilegeMode,
            checkAndInitiateBuyReserved,
            handleDebugAddCrowns,
            handleDebugAddPoints,
            handleDebugAddPrivilege,
            handleForceRoyal,
            handleSelectBuff,
            handleCloseModal,
            handlePeekDeck,
            handleRerollBuffs,
        ]
    );

    const getters = useMemo(
        () => ({
            getPlayerScore: boundGetPlayerScore,
            isSelected,
            getCrownCount: boundGetCrownCount,
            canAfford,
            isMyTurn: canLocalInteract,
        }),
        [boundGetPlayerScore, isSelected, boundGetCrownCount, canAfford, canLocalInteract]
    );

    const result = useMemo(
        () => ({
            selectedGems,
            errorMsg,
            isMyTurn: canLocalInteract,
            handlers,
            getters,
        }),
        [selectedGems, errorMsg, canLocalInteract, handlers, getters]
    );

    return result;
};

import { INITIAL_STATE_SKELETON } from '../initialState';
import { GAME_PHASES, BUFFS } from '../../constants';
import { shuffleArray } from '../../utils';
import {
    GameState,
    PlayerKey,
    Buff,
    GemColor,
    BuffInitPayload,
    SelectBuffPayload,
    BuffEffects,
    Card,
} from '../../types';

/**
 * Internal Helper: Apply initialization logic for a single player
 */
const applyPlayerInitLogic = (
    draft: GameState,
    pid: PlayerKey,
    randoms: Record<string, unknown>
) => {
    const rawBuff = draft.playerBuffs[pid];
    if (!rawBuff || rawBuff.id === 'none') return;

    // Reconstruction from ID
    const buff = Object.values(BUFFS).find((b) => b.id === rawBuff.id);
    if (!buff || !buff.effects) return;

    if (!draft.playerBuffs[pid].state) {
        draft.playerBuffs[pid].state = {};
    }

    const fx = (buff.effects as BuffEffects).onInit;
    if (fx) {
        if (fx.privilege)
            draft.extraPrivileges[pid] = (draft.extraPrivileges[pid] || 0) + fx.privilege;

        if (fx.randomGem) {
            const count = typeof fx.randomGem === 'number' ? fx.randomGem : 1;
            const randColors = randoms.randomGems as GemColor[];
            if (randColors) {
                randColors.slice(0, count).forEach((randColor: GemColor) => {
                    draft.inventories[pid][randColor]++;
                    draft.extraAllocation[pid][randColor]++;
                });
            }
        }

        if (fx.crowns) draft.extraCrowns[pid] = (draft.extraCrowns[pid] || 0) + fx.crowns;
        if (fx.pearl) {
            draft.inventories[pid].pearl += fx.pearl;
            draft.extraAllocation[pid].pearl += fx.pearl;
        }
        if (fx.gold) {
            draft.inventories[pid].gold += fx.gold;
            draft.extraAllocation[pid].gold += fx.gold;
        }

        if (fx.reserveCard) {
            const lvl = randoms.reserveCardLevel as 1 | 2 | 3;
            if (lvl && draft.decks[lvl].length > 0) {
                const card = draft.decks[lvl].pop()!;
                draft.playerReserved[pid].push(card);
            }
        }
    }

    if (buff.id === 'extortion') {
        const state = draft.playerBuffs[pid].state as Record<string, number>;
        state.refillCount = 0;
    }
    if (buff.id === 'pacifist') draft.extraPrivileges[pid] = (draft.extraPrivileges[pid] || 0) + 1;
    if (buff.id === 'color_preference') {
        const discountColor = randoms.preferenceColor as GemColor;
        if (discountColor) {
            const dummyId = `buff-color-pref-${pid}`;
            if (!draft.playerTableau[pid].some((c) => c.id.startsWith(dummyId))) {
                const dummyCard: Card = {
                    id: `${dummyId}-${Date.now()}`,
                    points: 0,
                    crowns: 0,
                    bonusColor: discountColor,
                    bonusCount: 1,
                    level: 1, // Using level 1 as dummy
                    cost: { red: 0, green: 0, blue: 0, white: 0, black: 0, pearl: 0, gold: 0 },
                    isBuff: true,
                };
                draft.playerTableau[pid].push(dummyCard);
            }
        }
    }
};

const ensureStructures = (draft: GameState) => {
    if (!draft.playerBuffs) draft.playerBuffs = { p1: BUFFS.NONE as Buff, p2: BUFFS.NONE as Buff };
    else {
        draft.playerBuffs = { ...draft.playerBuffs };
        // Inflate buffs from BUFFS constant if they are missing effects
        (['p1', 'p2'] as const).forEach((pid) => {
            const current = draft.playerBuffs[pid];
            if (current && (!current.effects || Object.keys(current.effects).length === 0)) {
                const full = Object.values(BUFFS).find((b) => b.id === current.id);
                if (full) {
                    draft.playerBuffs[pid] = {
                        ...JSON.parse(JSON.stringify(full)),
                        state: current.state || {},
                    };
                }
            }
        });
    }

    if (!draft.extraAllocation) {
        draft.extraAllocation = {
            p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
            p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
        };
    }
    if (!draft.extraPrivileges) draft.extraPrivileges = { p1: 0, p2: 0 };
    if (!draft.extraCrowns) draft.extraCrowns = { p1: 0, p2: 0 };
    if (!draft.extraPoints) draft.extraPoints = { p1: 0, p2: 0 };
    if (!draft.playerTurnCounts) draft.playerTurnCounts = { p1: 0, p2: 0 };
};

export const applyBuffInitEffects = (
    draft: GameState,
    initRandoms: Partial<Record<PlayerKey, Record<string, unknown>>> = {}
): GameState => {
    ensureStructures(draft);
    applyPlayerInitLogic(draft, 'p1', (initRandoms.p1 || {}) as Record<string, unknown>);
    applyPlayerInitLogic(draft, 'p2', (initRandoms.p2 || {}) as Record<string, unknown>);
    return draft;
};

export const handleInit = (state: GameState | null, payload: BuffInitPayload): GameState => {
    const skeleton = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;

    // Logic Regression Fix: Directly spread payload to match v3.1.0 behavior
    const initializedState: GameState = { ...skeleton, ...payload };

    ensureStructures(initializedState);

    const initRandoms = (payload.initRandoms || {}) as Record<PlayerKey, Record<string, unknown>>;
    applyPlayerInitLogic(initializedState, 'p1', initRandoms.p1 || {});
    applyPlayerInitLogic(initializedState, 'p2', initRandoms.p2 || {});

    return initializedState;
};

export const handleInitDraft = (
    state: GameState | null,
    payload: Record<string, unknown>
): GameState => {
    const { draftPool, buffLevel, ...gameSetup } = payload;
    console.log('[REDUCER-INIT-DRAFT] Incoming Pool IDs:', draftPool);

    const newState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;

    newState.draftPool = Array.isArray(draftPool)
        ? draftPool.map((b: unknown) => (typeof b === 'string' ? b : (b as { id: string }).id))
        : [];
    newState.buffLevel = (buffLevel as number) || 1;
    newState.pendingSetup = gameSetup as unknown as GameState['pendingSetup'];
    newState.playerTurnCounts = { p1: 0, p2: 0 };
    newState.draftOrder = ['p1', 'p2'];
    newState.phase = GAME_PHASES.DRAFT_PHASE;
    newState.turn = 'p1';

    const setup = gameSetup as Partial<GameState>;
    if (setup.mode) newState.mode = setup.mode;
    if (setup.isHost !== undefined) newState.isHost = setup.isHost;
    if (setup.board) newState.board = setup.board;
    if (setup.bag) newState.bag = setup.bag;
    if (setup.market) newState.market = setup.market;
    if (setup.decks) newState.decks = setup.decks;

    return newState;
};

export const handleSelectBuff = (state: GameState, payload: SelectBuffPayload | string): void => {
    const buffId = typeof payload === 'object' ? payload.buffId : payload;
    const randomColor = typeof payload === 'object' ? payload.randomColor : null;
    const initRandoms = typeof payload === 'object' ? payload.initRandoms : {};
    const p2Indices = typeof payload === 'object' ? payload.p2DraftPoolIndices : null;
    const player = state.turn;

    // Buff ID assignment - FULL OBJECT from BUFFS
    const fullBuff = Object.values(BUFFS).find((b) => b.id === buffId) || BUFFS.NONE;
    state.playerBuffs[player] = JSON.parse(JSON.stringify(fullBuff));
    state.playerBuffs[player].state = {};

    if (player === 'p1') {
        state.p1SelectedBuff = JSON.parse(JSON.stringify(fullBuff));
    }

    if (buffId === 'color_preference' && randomColor) {
        const buffState = state.playerBuffs[player].state as Record<string, unknown>;
        buffState.discountColor = randomColor;
    }

    const currentIdx = state.draftOrder.indexOf(player);
    if (currentIdx !== -1) {
        const nextPlayer = state.draftOrder[currentIdx + 1];

        if (nextPlayer) {
            state.turn = nextPlayer;
            if (nextPlayer === 'p2') {
                const levelBuffs = Object.values(BUFFS).filter((b) => b.level === state.buffLevel);
                if (p2Indices && p2Indices.length === 4) {
                    state.p2DraftPool = p2Indices.map((i) => (levelBuffs[i] as Buff).id);
                } else {
                    const shuffled = [...levelBuffs].sort(() => Math.random() - 0.5);
                    state.p2DraftPool = shuffled.slice(0, 4).map((b) => (b as Buff).id);
                }
            }
        } else {
            const setup = state.pendingSetup as
                | (Partial<GameState> & { initRandoms?: Record<string, unknown> })
                | null;
            if (setup) {
                if (setup.board) state.board = setup.board;
                if (setup.bag) state.bag = setup.bag;
                if (setup.market) state.market = setup.market;
                if (setup.decks) state.decks = setup.decks;
            }
            const finalInitRandoms = (setup?.initRandoms || initRandoms) as Record<
                PlayerKey,
                Record<string, unknown>
            >;
            state.pendingSetup = null;
            state.draftOrder = [];
            state.phase = GAME_PHASES.IDLE;
            state.turn = 'p1';

            ensureStructures(state);
            applyPlayerInitLogic(state, 'p2', finalInitRandoms.p2 || {});
        }
    }
};

export const handleRerollBuffs = (state: GameState, payload: { level?: number }): void => {
    if (state.phase !== GAME_PHASES.DRAFT_PHASE || state.turn !== 'p1') return;

    const level = payload.level ?? state.buffLevel;
    const levelBuffs = Object.values(BUFFS).filter((b) => b.level === level);

    const categoriesSeen = new Set<string>();
    const p1Pool: typeof levelBuffs = [];
    const shuffledPool = shuffleArray([...levelBuffs]);

    for (const b of shuffledPool) {
        if ('category' in b && b.category && !categoriesSeen.has(b.category)) {
            p1Pool.push(b);
            categoriesSeen.add(b.category);
            if (p1Pool.length === 3) break;
        }
    }

    state.buffLevel = level;
    state.draftPool = p1Pool.map((b) => b.id);
};

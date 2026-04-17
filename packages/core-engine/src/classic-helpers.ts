import {
    BOARD_POSITION_IDS,
    BONUS_COLORS,
    RULESET_VERSION,
    createEmptyBoard,
    createHiddenState,
    createPlayerState,
    createTurnState,
    type BoardPositionId,
    type BonusColor,
    type CardLevel,
    type GamePhase,
    type GemColor,
    type JewelCardState,
    type MatchFlags,
    type NamespacedRng,
    type PlayerId,
    type PlayerState,
    type ReserveSlotId,
    type RunContext,
    type VictoryReason,
} from '@gem-duel/domain';
import {
    ENGINE_VERSION,
    SCHEMA_VERSION,
    type GameCommand,
    type GameEvent,
    type GameSnapshot,
} from '@gem-duel/contracts';
import { CLASSIC_JEWEL_CARDS, CLASSIC_ROYAL_CARDS } from './classic-data';

const CARD_CATALOG = new Map(CLASSIC_JEWEL_CARDS.map((card) => [card.cardId, card]));
const COST_COLORS: readonly GemColor[] = ['blue', 'white', 'green', 'black', 'red', 'pearl'];
const TOKEN_RETURN_ORDER: readonly GemColor[] = [
    'blue',
    'white',
    'green',
    'black',
    'red',
    'pearl',
    'gold',
] as const;
const PYRAMID_ROW_SIZES: Record<CardLevel, number> = {
    1: 5,
    2: 4,
    3: 3,
};

export type ReserveSource = Extract<GameCommand, { type: 'RESERVE_CARD' }>['source'];
export type BuySource = Extract<GameCommand, { type: 'BUY_CARD' }>['source'];
export type PyramidSource = Extract<ReserveSource | BuySource, { kind: 'pyramid' }>;

export type RngPort = NamespacedRng;

export interface ClockPort {
    now(): string;
}

export interface IdPort {
    next(prefix?: string): string;
}

export interface EnginePorts {
    rng: RngPort;
    clock: ClockPort;
    id: IdPort;
}

export const cloneSnapshot = (snapshot: GameSnapshot): GameSnapshot => structuredClone(snapshot);

export const pushEvent = (snapshot: GameSnapshot, event: GameEvent) => {
    snapshot.eventLog.push(event);
    snapshot.sequence += 1;
    snapshot.context.step = snapshot.sequence;
};

export const setPhase = (snapshot: GameSnapshot, phase: GamePhase) => {
    if (snapshot.context.phase === phase) {
        return;
    }
    snapshot.context.phase = phase;
    pushEvent(snapshot, {
        type: 'phase.changed',
        phase,
    });
};

export const applyTurnState = (
    snapshot: GameSnapshot,
    update: Partial<GameSnapshot['context']['turn']>
) => {
    const previous = snapshot.context.turn;
    const next = {
        ...previous,
        ...update,
    };
    snapshot.context.turn = next;

    if (
        previous.segment !== next.segment ||
        previous.optionalStep !== next.optionalStep ||
        previous.pendingDiscardCount !== next.pendingDiscardCount
    ) {
        pushEvent(snapshot, {
            type: 'turn.segmentChanged',
            segment: next.segment,
            optionalStep: next.optionalStep,
            pendingDiscardCount: next.pendingDiscardCount,
        });
    }
};

export const nextPlayer = (player: PlayerId): PlayerId => (player === 'p1' ? 'p2' : 'p1');

export const getCurrentPlayerState = (snapshot: GameSnapshot): PlayerState =>
    snapshot.players[snapshot.context.currentPlayer];

export const getBoardCell = (snapshot: GameSnapshot, positionId: BoardPositionId) => {
    const cell = snapshot.board.find((entry) => entry.positionId === positionId);
    if (!cell) {
        throw new Error(`Unknown board position: ${positionId}`);
    }
    return cell;
};

export const setBoardToken = (
    snapshot: GameSnapshot,
    positionId: BoardPositionId,
    token: GemColor | null
) => {
    getBoardCell(snapshot, positionId).token = token;
};

export const createEmptyPyramid = (): GameSnapshot['pyramid'] => [
    {
        level: 1,
        slots: Array.from({ length: PYRAMID_ROW_SIZES[1] }, (_, index) => ({
            level: 1 as const,
            slot: index + 1,
            card: null,
        })),
    },
    {
        level: 2,
        slots: Array.from({ length: PYRAMID_ROW_SIZES[2] }, (_, index) => ({
            level: 2 as const,
            slot: index + 1,
            card: null,
        })),
    },
    {
        level: 3,
        slots: Array.from({ length: PYRAMID_ROW_SIZES[3] }, (_, index) => ({
            level: 3 as const,
            slot: index + 1,
            card: null,
        })),
    },
];

export const getDeckLevelKey = (level: CardLevel) => {
    switch (level) {
        case 1:
            return 'level1' as const;
        case 2:
            return 'level2' as const;
        case 3:
            return 'level3' as const;
    }
};

export const getPyramidRow = (snapshot: GameSnapshot, level: CardLevel) => {
    const row = snapshot.pyramid.find((entry) => entry.level === level);
    if (!row) {
        throw new Error(`Unknown pyramid level: ${level}`);
    }
    return row;
};

export const getPyramidSlot = (snapshot: GameSnapshot, source: PyramidSource) => {
    const row = getPyramidRow(snapshot, source.level);
    const slot = row.slots.find((entry) => entry.slot === source.slot);
    if (!slot) {
        throw new Error(`Unknown pyramid slot ${source.level}:${source.slot}`);
    }
    return slot;
};

export const getReserveSlot = (player: PlayerState, slotId: ReserveSlotId) => {
    const slot = player.reserveSlots.find((entry) => entry.slotId === slotId);
    if (!slot) {
        throw new Error(`Unknown reserve slot: ${slotId}`);
    }
    return slot;
};

export const findFirstEmptyReserveSlot = (player: PlayerState) =>
    player.reserveSlots.find((slot) => slot.card === null) ?? null;

export const lookupCard = (cardId: string): JewelCardState => {
    const card = CARD_CATALOG.get(cardId);
    if (!card) {
        throw new Error(`Unknown card id: ${cardId}`);
    }
    return structuredClone(card);
};

export const shuffleWithRng = <T>(items: readonly T[], rng: NamespacedRng): T[] => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const otherIndex = rng.nextInt(index + 1);
        const current = shuffled[index];
        const other = shuffled[otherIndex];
        if (current === undefined || other === undefined) {
            throw new Error('Shuffle index moved outside the source collection.');
        }
        shuffled[index] = other;
        shuffled[otherIndex] = current;
    }
    return shuffled;
};

export const getTotalTokens = (player: PlayerState) =>
    TOKEN_RETURN_ORDER.reduce((sum, color) => sum + player.inventory[color], 0);

export const recomputePlayerTotals = (player: PlayerState) => {
    player.score =
        player.tableau.reduce((sum, card) => sum + card.points, 0) +
        player.royals.reduce((sum, card) => sum + card.points, 0);
    player.crowns =
        player.tableau.reduce((sum, card) => sum + card.crowns, 0) +
        player.royals.reduce((sum, card) => sum + card.crowns, 0);
};

export const createInitialSnapshot = (
    ports: EnginePorts,
    seed: number,
    mode: GameSnapshot['context']['mode'],
    flags: MatchFlags,
    runContext: RunContext | null = null
): GameSnapshot => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: RULESET_VERSION,
    engineVersion: ENGINE_VERSION,
    visibility: 'authoritative',
    context: {
        matchId: ports.id.next('match'),
        schemaVersion: SCHEMA_VERSION,
        rulesetVersion: RULESET_VERSION,
        seed,
        mode,
        phase: 'initialization',
        step: 0,
        currentPlayer: 'p1',
        winner: null,
        victoryReason: null,
        flags,
        turn: createTurnState(),
    },
    board: createEmptyBoard(),
    pyramid: createEmptyPyramid(),
    royalSupply: [],
    privilegeSupply: 3,
    players: {
        p1: createPlayerState('p1'),
        p2: createPlayerState('p2'),
    },
    eventLog: [],
    replayCursor: null,
    sequence: 0,
    runContext: runContext ? structuredClone(runContext) : null,
    activeEffects: [],
    effectPrompts: [],
    pendingSelection: null,
    hiddenState: createHiddenState(),
});

export const collectBoardTokens = (snapshot: GameSnapshot, positions: BoardPositionId[]) =>
    positions.map((positionId) => {
        const cell = getBoardCell(snapshot, positionId);
        if (!cell.token) {
            throw new Error(`Board position ${positionId} is empty.`);
        }
        return {
            positionId,
            token: cell.token,
        };
    });

export const calculateCardPayment = (
    player: PlayerState,
    card: JewelCardState,
    options: {
        basicDiscount?: number;
    } = {}
) => {
    const paid: Record<GemColor, number> = {
        blue: 0,
        white: 0,
        green: 0,
        black: 0,
        red: 0,
        pearl: 0,
        gold: 0,
    };
    let goldSpent = 0;
    let remainingBasicDiscount = options.basicDiscount ?? 0;

    for (const color of COST_COLORS) {
        const printedCost = card.cost[color];
        const discount = BONUS_COLORS.includes(color as BonusColor)
            ? player.tableau.reduce(
                  (sum, tableauCard) =>
                      sum +
                      (tableauCard.bonusColor === color ? Math.max(1, tableauCard.bonusCount) : 0),
                  0
              )
            : 0;
        let needed = Math.max(0, printedCost - discount);
        if (
            remainingBasicDiscount > 0 &&
            BONUS_COLORS.includes(color as BonusColor) &&
            needed > 0
        ) {
            const appliedDiscount = Math.min(remainingBasicDiscount, needed);
            needed -= appliedDiscount;
            remainingBasicDiscount -= appliedDiscount;
        }
        const spendFromColor = Math.min(needed, player.inventory[color]);
        paid[color] = spendFromColor;
        goldSpent += needed - spendFromColor;
    }

    return {
        affordable: goldSpent <= player.inventory.gold,
        goldSpent,
        paid,
    };
};

export const returnTokensToBag = (
    snapshot: GameSnapshot,
    paid: Record<GemColor, number>,
    goldSpent: number
) => {
    const tokenCounts: Record<GemColor, number> = {
        ...paid,
        gold: goldSpent,
    };

    for (const color of TOKEN_RETURN_ORDER) {
        for (let count = 0; count < tokenCounts[color]; count += 1) {
            snapshot.hiddenState.bag.push(color);
        }
    }
};

export const getReserveSourceCard = (snapshot: GameSnapshot, source: ReserveSource) => {
    if (source.kind === 'pyramid') {
        return getPyramidSlot(snapshot, source).card;
    }
    const deckKey = getDeckLevelKey(source.level);
    const nextCardId = snapshot.hiddenState.deckOrder[deckKey][0];
    return nextCardId ? lookupCard(nextCardId) : null;
};

export const getBuySourceCard = (snapshot: GameSnapshot, source: BuySource) => {
    if (source.kind === 'pyramid') {
        return getPyramidSlot(snapshot, source).card;
    }
    return getReserveSlot(getCurrentPlayerState(snapshot), source.slotId).card;
};

export const getVictoryReasonForPlayer = (
    snapshot: GameSnapshot,
    playerId: PlayerId
): VictoryReason | null => {
    const player = snapshot.players[playerId];
    if (player.score >= 20) {
        return 'points';
    }
    if (player.crowns >= 10) {
        return 'crowns';
    }
    const singleColorWin = BONUS_COLORS.some((color) => {
        const prestige = player.tableau.reduce(
            (sum, card) => sum + (card.bonusColor === color ? card.points : 0),
            0
        );
        return prestige >= 10;
    });
    return singleColorWin ? 'singleColor' : null;
};

export const refillPyramidSlot = (snapshot: GameSnapshot, level: CardLevel, slot: number) => {
    const row = getPyramidRow(snapshot, level);
    const deckKey = getDeckLevelKey(level);
    const nextCardId = snapshot.hiddenState.deckOrder[deckKey].shift() ?? null;
    const targetSlot = row.slots.find((entry) => entry.slot === slot);
    if (!targetSlot) {
        throw new Error(`Unknown pyramid slot ${level}:${slot}`);
    }
    targetSlot.card = nextCardId ? lookupCard(nextCardId) : null;
    pushEvent(snapshot, {
        type: 'pyramid.refilled',
        level,
        slot,
        cardId: nextCardId,
    });
};

export const setupClassicMatch = (snapshot: GameSnapshot, ports: EnginePorts) => {
    const setupRng = ports.rng.fork(`match/${snapshot.context.matchId}/setup`);
    const [firstPlayer] = shuffleWithRng(['p1', 'p2'] as const, setupRng.fork('first-player'));
    if (!firstPlayer) {
        throw new Error('Could not determine a first player during setup.');
    }
    const secondPlayer = nextPlayer(firstPlayer);
    const boardTokens = shuffleWithRng(
        [
            ...Array.from({ length: 4 }, () => 'blue' as const),
            ...Array.from({ length: 4 }, () => 'white' as const),
            ...Array.from({ length: 4 }, () => 'green' as const),
            ...Array.from({ length: 4 }, () => 'black' as const),
            ...Array.from({ length: 4 }, () => 'red' as const),
            ...Array.from({ length: 2 }, () => 'pearl' as const),
            ...Array.from({ length: 3 }, () => 'gold' as const),
        ],
        setupRng.fork('board')
    );

    snapshot.board = createEmptyBoard();
    BOARD_POSITION_IDS.forEach((positionId, index) => {
        setBoardToken(snapshot, positionId, boardTokens[index] ?? null);
    });
    snapshot.hiddenState.bag = [];

    snapshot.pyramid = createEmptyPyramid();
    for (const level of [1, 2, 3] as const) {
        const deckKey = getDeckLevelKey(level);
        const deck = shuffleWithRng(
            CLASSIC_JEWEL_CARDS.filter((card) => card.level === level).map((card) => card.cardId),
            setupRng.fork(`deck-${deckKey}`)
        );
        const row = getPyramidRow(snapshot, level);
        row.slots.forEach((entry) => {
            const nextCardId = deck.shift() ?? null;
            entry.card = nextCardId ? lookupCard(nextCardId) : null;
        });
        snapshot.hiddenState.deckOrder[deckKey] = deck;
    }

    snapshot.royalSupply = shuffleWithRng(CLASSIC_ROYAL_CARDS, setupRng.fork('royals')).map(
        (card) => structuredClone(card)
    );
    snapshot.players = {
        p1: createPlayerState('p1'),
        p2: createPlayerState('p2'),
    };
    snapshot.players[secondPlayer].privileges = 1;
    snapshot.privilegeSupply = 2;
    snapshot.context.currentPlayer = firstPlayer;
    snapshot.context.winner = null;
    snapshot.context.victoryReason = null;
    snapshot.context.turn = createTurnState();

    pushEvent(snapshot, { type: 'match.started' });
    setPhase(snapshot, 'turnIdle');
    pushEvent(snapshot, {
        type: 'match.setupCompleted',
        firstPlayer,
        privilegeRecipient: secondPlayer,
    });
    applyTurnState(snapshot, snapshot.context.turn);
};

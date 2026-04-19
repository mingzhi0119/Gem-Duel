import { createLocalMatchSession, createPreparedLocalMatchSession } from '@gem-duel/application';
import type { GameCommand, GameSnapshot } from '@gem-duel/contracts';

const CLASSIC_LOCAL_FLAGS = {
    roguelike: false,
    onlineAuthoritative: false,
    aiEnabled: false,
} as const;

const ZERO_INVENTORY = {
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
} as const;

export const LOCAL_PHASE4_SCENARIO_IDS = [
    'take-three-linked-gems',
    'buy-first-pyramid-card',
    'use-privilege-two-cells',
    'reserve-blind-tier3',
    'resolve-bonus-token',
    'resolve-gain-royal',
    'terminal-victory',
    'debug-shell-fallback',
] as const;

export type LocalPhase4ScenarioId = (typeof LOCAL_PHASE4_SCENARIO_IDS)[number];

export interface LocalPhase4ScenarioDefinition {
    id: LocalPhase4ScenarioId;
    title: string;
    seed: number;
    startingFixtureSource: string;
    expectedFinalStateHash: string;
    expectedUiAssertions: string[];
    acceptanceCommands: GameCommand[];
    createStartingSnapshot: () => GameSnapshot;
}

const createBaseSnapshot = (seed: number) => {
    const session = createLocalMatchSession({
        seed,
        flags: CLASSIC_LOCAL_FLAGS,
    });

    if (!session.ok) {
        throw new Error(session.error.message);
    }

    const snapshot = structuredClone(session.value.snapshot());
    snapshot.context.mode = 'local';
    snapshot.context.flags = { ...CLASSIC_LOCAL_FLAGS };
    snapshot.context.currentPlayer = 'p1';
    snapshot.context.winner = null;
    snapshot.context.victoryReason = null;
    snapshot.context.turn = {
        turnNumber: 1,
        segment: 'mandatory',
        optionalStep: 'done',
        mandatoryActionTaken: false,
        pendingDiscardCount: 0,
    };
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    snapshot.players.p2.inventory = { ...ZERO_INVENTORY };
    snapshot.players.p1.privileges = 1;
    snapshot.players.p2.privileges = 0;
    snapshot.players.p1.royals = [];
    snapshot.players.p2.royals = [];
    snapshot.players.p1.tableau = [];
    snapshot.players.p2.tableau = [];
    snapshot.players.p1.score = 0;
    snapshot.players.p2.score = 0;
    snapshot.players.p1.crowns = 0;
    snapshot.players.p2.crowns = 0;
    snapshot.runContext = null;
    snapshot.activeEffects = [];
    snapshot.effectPrompts = [];
    snapshot.pendingSelection = null;
    snapshot.replayCursor = null;
    snapshot.eventLog = [];
    return snapshot;
};

const setBoardToken = (
    snapshot: GameSnapshot,
    positionId: string,
    token: GameSnapshot['board'][number]['token']
) => {
    const cell = snapshot.board.find((entry) => entry.positionId === positionId);
    if (cell) {
        cell.token = token;
    }
};

const clearGoldExcept = (snapshot: GameSnapshot, keepPositionId: string) => {
    for (const cell of snapshot.board) {
        if (cell.token === 'gold' && cell.positionId !== keepPositionId) {
            cell.token = null;
        }
    }
    setBoardToken(snapshot, keepPositionId, 'gold');
};

const createTakeThreeSnapshot = () => {
    const snapshot = createBaseSnapshot(2101);
    snapshot.context.phase = 'turnIdle';
    snapshot.players.p1.privileges = 0;
    setBoardToken(snapshot, 'r2c1', 'red');
    setBoardToken(snapshot, 'r2c2', 'green');
    setBoardToken(snapshot, 'r2c3', 'white');
    return snapshot;
};

const createBuyFirstCardSnapshot = () => {
    const snapshot = createBaseSnapshot(2102);
    snapshot.context.phase = 'turnIdle';
    const targetCard = snapshot.pyramid[0]?.slots[0]?.card;
    if (targetCard) {
        targetCard.cardId = 'phase4-buy-card';
        targetCard.points = 1;
        targetCard.crowns = 0;
        targetCard.ability = 'none';
        targetCard.cost = { ...ZERO_INVENTORY };
        targetCard.bonusColor = 'blue';
        targetCard.printedBonusColor = 'blue';
        targetCard.bonusCount = 1;
    }
    return snapshot;
};

const createPrivilegeSnapshot = () => {
    const snapshot = createBaseSnapshot(2103);
    snapshot.context.phase = 'turnIdle';
    snapshot.context.turn.segment = 'optional';
    snapshot.context.turn.optionalStep = 'privilege';
    snapshot.players.p1.privileges = 2;
    setBoardToken(snapshot, 'r2c2', 'blue');
    setBoardToken(snapshot, 'r2c3', 'white');
    setBoardToken(snapshot, 'r3c3', 'green');
    return snapshot;
};

const createReserveBlindSnapshot = () => {
    const snapshot = createBaseSnapshot(2104);
    snapshot.context.phase = 'turnIdle';
    clearGoldExcept(snapshot, 'r2c2');
    if (snapshot.hiddenState.deckOrder.level3.length === 0) {
        snapshot.hiddenState.deckOrder.level3.push('phase4-deck-l3');
    }
    return snapshot;
};

const createBonusTokenPromptSnapshot = () => {
    const snapshot = createBaseSnapshot(2105);
    snapshot.context.phase = 'turnIdle';
    snapshot.activeEffects = [
        {
            effectId: 'phase4-bonus-token',
            parentEffectId: null,
            atom: 'take_board_token',
            hookPoint: 'AFTER_BUY_CARD',
            source: 'card_ability',
            scope: 'active_player',
            owner: 'p1',
            sequence: snapshot.sequence,
            stage: 'running',
            rngNamespace: 'phase4/bonus-token',
        },
    ];
    snapshot.effectPrompts = [
        {
            effectId: 'phase4-bonus-token',
            atom: 'take_board_token',
            allowedColors: ['blue', 'green'],
            count: 1,
        },
    ];
    setBoardToken(snapshot, 'r2c2', 'blue');
    setBoardToken(snapshot, 'r2c3', 'green');
    return snapshot;
};

const createGainRoyalPromptSnapshot = () => {
    const snapshot = createBaseSnapshot(2106);
    snapshot.context.phase = 'turnIdle';
    snapshot.activeEffects = [
        {
            effectId: 'phase4-gain-royal',
            parentEffectId: null,
            atom: 'gain_royal',
            hookPoint: 'BEFORE_GAIN_ROYAL',
            source: 'royal_reward',
            scope: 'active_player',
            owner: 'p1',
            sequence: snapshot.sequence,
            stage: 'running',
            rngNamespace: 'phase4/gain-royal',
        },
    ];
    snapshot.effectPrompts = [
        {
            effectId: 'phase4-gain-royal',
            atom: 'gain_royal',
            milestone: 3,
            royalIds: ['phase4-royal-queen', 'phase4-royal-judge'],
        },
    ];
    snapshot.royalSupply = [
        {
            royalId: 'phase4-royal-queen',
            points: 3,
            crowns: 0,
            ability: 'none',
            label: 'Phase 4 Queen',
        },
        {
            royalId: 'phase4-royal-judge',
            points: 2,
            crowns: 0,
            ability: 'scroll',
            label: 'Phase 4 Judge',
        },
    ];
    return snapshot;
};

const createTerminalVictorySnapshot = () => {
    const snapshot = createBaseSnapshot(2107);
    snapshot.context.phase = 'terminal';
    snapshot.context.winner = 'p1';
    snapshot.context.victoryReason = 'points';
    snapshot.players.p1.score = 16;
    snapshot.players.p1.crowns = 6;
    return snapshot;
};

const PHASE4_SCENARIOS: Record<LocalPhase4ScenarioId, LocalPhase4ScenarioDefinition> = {
    'take-three-linked-gems': {
        id: 'take-three-linked-gems',
        title: 'Take Three Linked Gems',
        seed: 2101,
        startingFixtureSource:
            'Phase 4 local scenario fixture: classic local direct token-take start',
        expectedFinalStateHash: 'fnv1a-4901e416',
        expectedUiAssertions: [
            'board cell clicks add three linked positions and expose confirm',
            'selection draft tracks the chosen positions',
        ],
        acceptanceCommands: [
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c1' },
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c2' },
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c3' },
            { type: 'TAKE_TOKENS_CONFIRM' },
        ],
        createStartingSnapshot: createTakeThreeSnapshot,
    },
    'buy-first-pyramid-card': {
        id: 'buy-first-pyramid-card',
        title: 'Buy First Pyramid Card',
        seed: 2102,
        startingFixtureSource:
            'Phase 4 local scenario fixture: turn-idle zero-cost pyramid slot ready for direct buy',
        expectedFinalStateHash: 'fnv1a-5e7898ca',
        expectedUiAssertions: [
            'market primary affordance buys the card in the first pyramid slot',
            'the bought card leaves the market and advances the turn',
        ],
        acceptanceCommands: [
            {
                type: 'BUY_CARD',
                source: { kind: 'pyramid', level: 1, slot: 1 },
            },
        ],
        createStartingSnapshot: createBuyFirstCardSnapshot,
    },
    'use-privilege-two-cells': {
        id: 'use-privilege-two-cells',
        title: 'Use Privilege on Two Cells',
        seed: 2103,
        startingFixtureSource:
            'Phase 4 local scenario fixture: optional privilege window with direct board triggers',
        expectedFinalStateHash: 'fnv1a-7f397724',
        expectedUiAssertions: [
            'board clicks stage two privilege positions',
            'confirm completes the privilege action and returns to idle play',
        ],
        acceptanceCommands: [
            { type: 'USE_PRIVILEGE_ADD_POSITION', positionId: 'r2c2' },
            { type: 'USE_PRIVILEGE_ADD_POSITION', positionId: 'r2c3' },
            { type: 'USE_PRIVILEGE_CONFIRM' },
        ],
        createStartingSnapshot: createPrivilegeSnapshot,
    },
    'reserve-blind-tier3': {
        id: 'reserve-blind-tier3',
        title: 'Reserve Blind Tier-3 Card',
        seed: 2104,
        startingFixtureSource:
            'Phase 4 local scenario fixture: turn-idle reserve target with a unique gold cell and live level-3 deck',
        expectedFinalStateHash: 'fnv1a-1d060022',
        expectedUiAssertions: [
            'the reserve affordance targets the level-3 blind deck',
            'the reserved card occupies reserve-1 and consumes the unique gold cell',
        ],
        acceptanceCommands: [
            {
                type: 'RESERVE_CARD',
                goldPosition: 'r2c2',
                source: { kind: 'deck', level: 3 },
            },
        ],
        createStartingSnapshot: createReserveBlindSnapshot,
    },
    'resolve-bonus-token': {
        id: 'resolve-bonus-token',
        title: 'Resolve Bonus Token Prompt',
        seed: 2105,
        startingFixtureSource:
            'Phase 4 local scenario fixture: running take_board_token effect prompt',
        expectedFinalStateHash: 'fnv1a-29d626fa',
        expectedUiAssertions: [
            'prompt banner exposes the bonus-token effect',
            'highlighted board cells resolve the effect and clear the prompt',
        ],
        acceptanceCommands: [
            {
                type: 'TAKE_EFFECT_BOARD_TOKEN',
                effectId: 'phase4-bonus-token',
                positionId: 'r2c2',
            },
        ],
        createStartingSnapshot: createBonusTokenPromptSnapshot,
    },
    'resolve-gain-royal': {
        id: 'resolve-gain-royal',
        title: 'Resolve Gain Royal Prompt',
        seed: 2106,
        startingFixtureSource: 'Phase 4 local scenario fixture: running gain_royal effect prompt',
        expectedFinalStateHash: 'fnv1a-8a85199f',
        expectedUiAssertions: [
            'royal court exposes exactly the selectable royal offers',
            'clicking a royal resolves the effect and stores it on the player',
        ],
        acceptanceCommands: [
            {
                type: 'SELECT_ROYAL',
                royalId: 'phase4-royal-queen',
            },
        ],
        createStartingSnapshot: createGainRoyalPromptSnapshot,
    },
    'terminal-victory': {
        id: 'terminal-victory',
        title: 'Terminal Victory Overlay',
        seed: 2107,
        startingFixtureSource:
            'Phase 4 local scenario fixture: completed classic-local terminal snapshot',
        expectedFinalStateHash: 'fnv1a-bb5a3bf2',
        expectedUiAssertions: [
            'the terminal overlay appears for the completed local match',
            'no further actions are exposed to the player',
        ],
        acceptanceCommands: [],
        createStartingSnapshot: createTerminalVictorySnapshot,
    },
    'debug-shell-fallback': {
        id: 'debug-shell-fallback',
        title: 'Debug Shell Fallback',
        seed: 2101,
        startingFixtureSource:
            'Phase 4 local scenario fixture: debug-shell copy of take-three-linked-gems',
        expectedFinalStateHash: 'fnv1a-4901e416',
        expectedUiAssertions: [
            'shell=debug renders the legacy MatchView shell',
            'the fallback path can still complete a deterministic local scenario',
        ],
        acceptanceCommands: [
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c1' },
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c2' },
            { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c3' },
            { type: 'TAKE_TOKENS_CONFIRM' },
        ],
        createStartingSnapshot: createTakeThreeSnapshot,
    },
};

export const isLocalPhase4ScenarioId = (value: string): value is LocalPhase4ScenarioId =>
    LOCAL_PHASE4_SCENARIO_IDS.includes(value as LocalPhase4ScenarioId);

export const listLocalPhase4Scenarios = () =>
    LOCAL_PHASE4_SCENARIO_IDS.map((id) => PHASE4_SCENARIOS[id]);

export const getLocalPhase4Scenario = (scenarioId: LocalPhase4ScenarioId) =>
    PHASE4_SCENARIOS[scenarioId];

export const createLocalPhase4ScenarioSession = (scenarioId: LocalPhase4ScenarioId) => {
    const scenario = getLocalPhase4Scenario(scenarioId);
    return createPreparedLocalMatchSession({
        seed: scenario.seed,
        flags: CLASSIC_LOCAL_FLAGS,
        snapshot: scenario.createStartingSnapshot(),
    });
};

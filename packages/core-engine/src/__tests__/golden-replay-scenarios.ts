import type {
    GameCommand,
    GameSnapshot,
    ReplayBundle,
    ReplayCommand,
    TypedResult,
} from '@gem-duel/contracts';
import {
    buildReplayBundle,
    createMatchActorFromSnapshot,
    dispatchCommand,
    readSnapshot,
} from '../index';
import { createBootstrappedLocalActor, makeTestPorts } from './test-ports';

const ZERO_INVENTORY = {
    blue: 0,
    white: 0,
    green: 0,
    black: 0,
    red: 0,
    pearl: 0,
    gold: 0,
} as const;

const createReplayCommand = (
    snapshotSequence: number,
    issuedBy: 'p1' | 'p2' | null,
    command: GameCommand,
    index: number
): ReplayCommand => ({
    clientCommandId: `golden-command-${index + 1}`,
    expectedSeq: snapshotSequence,
    issuedBy,
    command,
});

const getBootstrappedSnapshot = (seed: number) => {
    const { actor } = createBootstrappedLocalActor(seed);
    return readSnapshot(actor);
};

const resetTurn = (snapshot: GameSnapshot, currentPlayer: 'p1' | 'p2' = 'p1') => {
    snapshot.context.currentPlayer = currentPlayer;
    snapshot.context.phase = 'turnIdle';
    snapshot.context.winner = null;
    snapshot.context.victoryReason = null;
    snapshot.context.turn = {
        turnNumber: 1,
        segment: 'optional',
        optionalStep: 'privilege',
        mandatoryActionTaken: false,
        pendingDiscardCount: 0,
    };
};

const setBoardToken = (
    snapshot: GameSnapshot,
    positionId: GameSnapshot['board'][number]['positionId'],
    token: GameSnapshot['board'][number]['token']
) => {
    const cell = snapshot.board.find((entry) => entry.positionId === positionId);
    if (!cell) {
        throw new Error(`Unknown board position ${positionId}.`);
    }
    cell.token = token;
};

const runScenario = (
    seed: number,
    initialSnapshot: GameSnapshot,
    execute: (
        record: (
            command: GameCommand
        ) => TypedResult<{ snapshot: GameSnapshot; eventCount: number }>
    ) => void
): ReplayBundle => {
    const { ports } = makeTestPorts(seed);
    const actor = createMatchActorFromSnapshot(initialSnapshot, ports);
    const commands: ReplayCommand[] = [];

    const record = (command: GameCommand) => {
        const before = readSnapshot(actor);
        commands.push(
            createReplayCommand(
                before.sequence,
                before.context.currentPlayer,
                command,
                commands.length
            )
        );
        const result = dispatchCommand(actor, command);
        if (!result.ok) {
            throw new Error(result.error.message);
        }
        return result;
    };

    execute(record);
    return buildReplayBundle(initialSnapshot, commands, readSnapshot(actor));
};

const buildTakeThreeDiscardReplay = () => {
    const seed = 21;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.inventory = {
        ...ZERO_INVENTORY,
        blue: 8,
    };
    snapshot.players.p1.privileges = 0;
    snapshot.players.p2.privileges = 0;
    snapshot.privilegeSupply = 3;
    setBoardToken(snapshot, 'r0c0', 'red');
    setBoardToken(snapshot, 'r0c1', 'red');
    setBoardToken(snapshot, 'r0c2', 'red');

    return {
        filename: 'take-three-discard.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'BEGIN_GEM_SELECTION' });
            record({ type: 'TAKE_TOKENS', positions: ['r0c0', 'r0c1', 'r0c2'] });
            record({ type: 'DISCARD_TOKEN', color: 'blue' });
        }),
    };
};

const buildReplenishReplay = () => {
    const seed = 22;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.privileges = 0;
    snapshot.players.p2.privileges = 0;
    snapshot.privilegeSupply = 3;
    snapshot.hiddenState.bag = ['blue', 'white'];
    setBoardToken(snapshot, 'r0c0', null);
    setBoardToken(snapshot, 'r0c1', null);

    return {
        filename: 'replenish-privilege-shift.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'REPLENISH_BOARD' });
        }),
    };
};

const buildReserveFaceUpReplay = () => {
    const seed = 23;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    setBoardToken(snapshot, 'r0c0', 'gold');
    const levelOneRow = snapshot.pyramid.find((row) => row.level === 1);
    if (!levelOneRow) {
        throw new Error('Expected a level-1 row for face-up reserve.');
    }
    levelOneRow.slots[0]!.card = {
        cardId: 'face-up-reserve-card',
        level: 1,
        points: 0,
        crowns: 0,
        printedBonusColor: 'green',
        bonusColor: 'green',
        bonusCount: 1,
        cost: { ...ZERO_INVENTORY },
        ability: 'none',
    };

    return {
        filename: 'reserve-face-up.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'BEGIN_RESERVE' });
            record({
                type: 'RESERVE_CARD',
                goldPosition: 'r0c0',
                source: { kind: 'pyramid', level: 1, slot: 1 },
            });
        }),
    };
};

const buildReserveBlindReplay = () => {
    const seed = 24;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    setBoardToken(snapshot, 'r0c1', 'gold');
    snapshot.hiddenState.deckOrder.level1 = ['l1-bl-0', ...snapshot.hiddenState.deckOrder.level1];

    return {
        filename: 'reserve-blind.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'BEGIN_RESERVE' });
            record({
                type: 'RESERVE_CARD',
                goldPosition: 'r0c1',
                source: { kind: 'deck', level: 1 },
            });
        }),
    };
};

const buildBuyChainReplay = () => {
    const seed = 25;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    setBoardToken(snapshot, 'r2c2', 'blue');
    const levelOneRow = snapshot.pyramid.find((row) => row.level === 1);
    if (!levelOneRow) {
        throw new Error('Expected a level-1 row for chained buy.');
    }
    levelOneRow.slots[0]!.card = {
        cardId: 'bonus-gem-card',
        level: 1,
        points: 0,
        crowns: 0,
        printedBonusColor: 'blue',
        bonusColor: 'blue',
        bonusCount: 1,
        cost: { ...ZERO_INVENTORY },
        ability: 'bonus_gem',
    };

    return {
        filename: 'buy-chained-ability.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'BEGIN_BUY' });
            const bought = record({
                type: 'BUY_CARD',
                source: { kind: 'pyramid', level: 1, slot: 1 },
            });
            if (!bought.ok) {
                throw new Error(bought.error.message);
            }
            const prompt = bought.value.snapshot.effectPrompts.find(
                (
                    entry
                ): entry is Extract<
                    (typeof bought.value.snapshot.effectPrompts)[number],
                    { atom: 'take_board_token' }
                > => entry.atom === 'take_board_token'
            );
            if (!prompt) {
                throw new Error('Expected a take_board_token prompt.');
            }
            record({
                type: 'TAKE_EFFECT_BOARD_TOKEN',
                effectId: prompt.effectId,
                positionId: 'r2c2',
            });
        }),
    };
};

const buildRoyalReplay = () => {
    const seed = 26;
    const snapshot = getBootstrappedSnapshot(seed);
    resetTurn(snapshot, 'p1');
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    snapshot.players.p1.tableau = [];
    snapshot.players.p1.royals = [];
    snapshot.players.p1.score = 0;
    snapshot.players.p1.crowns = 0;
    snapshot.royalSupply = [
        {
            royalId: 'royal-3pts',
            points: 3,
            crowns: 0,
            ability: 'none',
            label: 'The Queen',
        },
        {
            royalId: 'royal-scroll',
            points: 2,
            crowns: 0,
            ability: 'scroll',
            label: 'The Judge',
        },
    ];
    const levelOneRow = snapshot.pyramid.find((row) => row.level === 1);
    if (!levelOneRow) {
        throw new Error('Expected a level-1 row for royal replay.');
    }
    levelOneRow.slots[0]!.card = {
        cardId: 'royal-threshold-card',
        level: 1,
        points: 0,
        crowns: 3,
        printedBonusColor: 'blue',
        bonusColor: 'blue',
        bonusCount: 1,
        cost: { ...ZERO_INVENTORY },
        ability: 'none',
    };

    return {
        filename: 'royal-milestone-selection.step04.json',
        bundle: runScenario(seed, snapshot, (record) => {
            record({ type: 'BEGIN_BUY' });
            record({
                type: 'BUY_CARD',
                source: { kind: 'pyramid', level: 1, slot: 1 },
            });
            record({ type: 'SELECT_ROYAL', royalId: 'royal-3pts' });
        }),
    };
};

export const buildGoldenReplayBundles = () => [
    buildTakeThreeDiscardReplay(),
    buildReplenishReplay(),
    buildReserveFaceUpReplay(),
    buildReserveBlindReplay(),
    buildBuyChainReplay(),
    buildRoyalReplay(),
];

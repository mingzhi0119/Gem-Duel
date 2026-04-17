import type {
    GameCommand,
    GameSnapshot,
    ReplayBundle,
    ReplayCommand,
    TypedResult,
} from '@gem-duel/contracts';
import { createRunContext, type BuffId } from '@gem-duel/domain';
import {
    buildReplayBundle,
    createMatchActor,
    createMatchActorFromSnapshot,
    dispatchCommand,
    readSnapshot,
} from '../index';
import { createBootstrappedLocalActor, DEFAULT_FLAGS, makeTestPorts } from './test-ports';

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

const createBuffRunContext = (
    buffId: BuffId,
    state: Record<string, string | number | boolean | null> = {}
) =>
    createRunContext('run-step07', 1, 0, 0, [
        {
            id: buffId,
            owner: 'p1',
            source: 'starter',
            acquiredAtMatchIndex: 1,
            state,
        },
    ]);

const createGoldenFlags = (roguelike = true) => ({
    ...DEFAULT_FLAGS,
    roguelike,
});

const runScenarioFromActor = (
    actorFactory: () => {
        actor: ReturnType<typeof createMatchActor>;
        seed: number;
    },
    execute: (
        record: (
            command: GameCommand
        ) => TypedResult<{ snapshot: GameSnapshot; eventCount: number }>
    ) => void
): ReplayBundle => {
    const { actor } = actorFactory();
    const initialSnapshot = readSnapshot(actor);
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

const createBootstrappedSnapshot = (seed: number) => {
    const { actor } = createBootstrappedLocalActor(seed);
    return readSnapshot(actor);
};

const buildPrivilegeFavorReplay = () => {
    const seed = 31;
    return {
        filename: 'privilege-favor-setup.step07.json',
        bundle: runScenarioFromActor(
            () => ({
                seed,
                actor: createMatchActor(
                    {
                        seed,
                        mode: 'local',
                        flags: createGoldenFlags(),
                        runContext: createBuffRunContext('privilege_favor'),
                    },
                    makeTestPorts(seed).ports
                ),
            }),
            (record) => {
                record({
                    type: 'SELECT_MODE',
                    mode: 'local',
                    flags: createGoldenFlags(),
                });
                record({ type: 'START_MATCH' });
            }
        ),
    };
};

const buildDownPaymentReplay = () => {
    const seed = 32;
    const snapshot = createBootstrappedSnapshot(seed);
    snapshot.context.currentPlayer = 'p1';
    snapshot.context.flags = createGoldenFlags();
    snapshot.players.p1.inventory = { ...ZERO_INVENTORY };
    snapshot.players.p1.reserveSlots[0] = {
        slotId: 'reserve-1',
        sourceLevel: 1,
        card: {
            cardId: 'reserved-discount-card',
            level: 1,
            points: 1,
            crowns: 0,
            printedBonusColor: 'blue',
            bonusColor: 'blue',
            bonusCount: 1,
            cost: {
                ...ZERO_INVENTORY,
                red: 1,
            },
            ability: 'none',
        },
    };
    snapshot.runContext = createBuffRunContext('down_payment');

    return {
        filename: 'down-payment-reserve-buy.step07.json',
        bundle: runScenarioFromActor(
            () => ({
                seed,
                actor: createMatchActorFromSnapshot(snapshot, makeTestPorts(seed).ports),
            }),
            (record) => {
                record({ type: 'BEGIN_BUY' });
                record({
                    type: 'BUY_CARD',
                    source: { kind: 'reserve', slotId: 'reserve-1' },
                });
            }
        ),
    };
};

const buildExtortionReplay = () => {
    const seed = 33;
    const snapshot = createBootstrappedSnapshot(seed);
    snapshot.context.currentPlayer = 'p1';
    snapshot.context.flags = createGoldenFlags();
    snapshot.players.p2.inventory.red = 1;
    snapshot.hiddenState.bag = ['blue'];
    snapshot.board[0]!.token = null;
    snapshot.runContext = createBuffRunContext('extortion', {
        replenishCount: 1,
    });

    return {
        filename: 'extortion-second-replenish.step07.json',
        bundle: runScenarioFromActor(
            () => ({
                seed,
                actor: createMatchActorFromSnapshot(snapshot, makeTestPorts(seed).ports),
            }),
            (record) => {
                const replenished = record({ type: 'REPLENISH_BOARD' });
                if (!replenished.ok) {
                    throw new Error(replenished.error.message);
                }
                const prompt = replenished.value.snapshot.effectPrompts.find(
                    (
                        entry
                    ): entry is Extract<
                        (typeof replenished.value.snapshot.effectPrompts)[number],
                        { atom: 'take_opponent_token' }
                    > => entry.atom === 'take_opponent_token'
                );
                if (!prompt?.allowedColors[0]) {
                    throw new Error('Expected extortion to surface a take_opponent_token prompt.');
                }
                record({
                    type: 'STEAL_OPPONENT_TOKEN',
                    effectId: prompt.effectId,
                    color: prompt.allowedColors[0],
                });
            }
        ),
    };
};

const buildDoubleAgentReplay = () => {
    const seed = 34;
    const snapshot = createBootstrappedSnapshot(seed);
    snapshot.context.currentPlayer = 'p1';
    snapshot.context.flags = createGoldenFlags();
    snapshot.players.p1.privileges = 1;
    snapshot.runContext = createBuffRunContext('double_agent');
    snapshot.board[0]!.token = 'blue';
    snapshot.board[1]!.token = 'green';

    return {
        filename: 'double-agent-privilege-double.step07.json',
        bundle: runScenarioFromActor(
            () => ({
                seed,
                actor: createMatchActorFromSnapshot(snapshot, makeTestPorts(seed).ports),
            }),
            (record) => {
                record({ type: 'BEGIN_PRIVILEGE' });
                record({
                    type: 'USE_PRIVILEGE',
                    positions: ['r2c2', 'r2c3'],
                });
            }
        ),
    };
};

const buildDeepPocketsReplay = () => {
    const seed = 35;
    const snapshot = createBootstrappedSnapshot(seed);
    snapshot.context.currentPlayer = 'p1';
    snapshot.context.flags = createGoldenFlags();
    snapshot.players.p1.inventory = {
        ...ZERO_INVENTORY,
        blue: 11,
    };
    snapshot.runContext = createBuffRunContext('deep_pockets');
    snapshot.board[0]!.token = 'red';

    return {
        filename: 'deep-pockets-threshold.step07.json',
        bundle: runScenarioFromActor(
            () => ({
                seed,
                actor: createMatchActorFromSnapshot(snapshot, makeTestPorts(seed).ports),
            }),
            (record) => {
                record({ type: 'BEGIN_GEM_SELECTION' });
                record({
                    type: 'TAKE_TOKENS',
                    positions: ['r2c2'],
                });
            }
        ),
    };
};

export const buildGoldenReplayBundles = () => [
    buildPrivilegeFavorReplay(),
    buildDownPaymentReplay(),
    buildExtortionReplay(),
    buildDoubleAgentReplay(),
    buildDeepPocketsReplay(),
];

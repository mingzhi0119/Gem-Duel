import { createActor, assign, setup } from 'xstate';
import { createDomainError, type DomainError, type MatchFlags } from '@gem-duel/domain';
import type { GameCommand, GameSnapshot, TypedResult } from '@gem-duel/contracts';
import { applyAfterMatchSetupBuffs, applyAfterReplenishBoardBuffs } from './buff-runtime';
import {
    createInitialSnapshot,
    type EnginePorts,
    pushEvent,
    setBoardToken,
    setupClassicMatch,
    shuffleWithRng,
    applyTurnState,
} from './classic-helpers';
import { executeCommand, validateDispatch } from './classic-transitions';
import { awardPrivilegeWithEffect } from './classic-effects';

interface MachineContext {
    match: GameSnapshot;
}

const cloneSnapshot = (snapshot: GameSnapshot): GameSnapshot => structuredClone(snapshot);

const handleReplenishBoard = (snapshot: GameSnapshot, ports: EnginePorts) => {
    const emptyPositions = snapshot.board
        .filter((cell) => cell.token === null)
        .map((cell) => cell.positionId);
    const refillRng = ports.rng.fork(
        `match/${snapshot.context.matchId}/replenish/${snapshot.sequence + 1}`
    );
    const shuffledBag = shuffleWithRng(snapshot.hiddenState.bag, refillRng);
    const placed: Array<{
        positionId: GameSnapshot['board'][number]['positionId'];
        token: NonNullable<GameSnapshot['board'][number]['token']>;
    }> = [];

    for (const positionId of emptyPositions) {
        const nextToken = shuffledBag.shift() ?? null;
        if (!nextToken) {
            break;
        }
        setBoardToken(snapshot, positionId, nextToken);
        placed.push({ positionId, token: nextToken });
    }

    snapshot.hiddenState.bag = shuffledBag;
    pushEvent(snapshot, {
        type: 'board.replenished',
        player: snapshot.context.currentPlayer,
        positions: placed,
    });
    const updated = awardPrivilegeWithEffect(
        snapshot,
        ports,
        snapshot.context.currentPlayer === 'p1' ? 'p2' : 'p1',
        'optional_action',
        'AFTER_REPLENISH_BOARD'
    );
    const buffUpdated = applyAfterReplenishBoardBuffs(updated, ports);
    applyTurnState(buffUpdated, {
        segment: 'mandatory',
        optionalStep: 'done',
    });
    return buffUpdated;
};

const createMatchMachine = (ports: EnginePorts) =>
    setup({
        types: {
            context: {} as MachineContext,
            events: {} as GameCommand,
            input: {} as { snapshot: GameSnapshot },
        },
    }).createMachine({
        id: 'gem-duel-engine',
        initial: 'active',
        context: ({ input }) => ({ match: input.snapshot }),
        states: {
            active: {
                on: Object.fromEntries(
                    [
                        'SELECT_MODE',
                        'START_MATCH',
                        'BEGIN_GEM_SELECTION',
                        'TAKE_TOKENS_ADD_POSITION',
                        'TAKE_TOKENS_CONFIRM',
                        'TAKE_TOKENS_CANCEL',
                        'TAKE_TOKENS',
                        'BEGIN_RESERVE',
                        'RESERVE_CARD',
                        'BEGIN_BUY',
                        'BUY_CARD',
                        'BEGIN_PRIVILEGE',
                        'USE_PRIVILEGE_ADD_POSITION',
                        'USE_PRIVILEGE_CONFIRM',
                        'USE_PRIVILEGE_CANCEL',
                        'USE_PRIVILEGE',
                        'REPLENISH_BOARD',
                        'DISCARD_TOKEN',
                        'SELECT_ROYAL',
                        'TAKE_EFFECT_BOARD_TOKEN',
                        'STEAL_OPPONENT_TOKEN',
                        'SELECT_BONUS_COLOR',
                        'ENTER_REPLAY',
                        'EXIT_REPLAY',
                    ].map((type) => [
                        type,
                        {
                            actions: assign(({ context, event }) => ({
                                match: executeCommand(cloneSnapshot(context.match), event, ports, {
                                    setupClassicMatch: (snapshot, enginePorts) => {
                                        setupClassicMatch(snapshot, enginePorts);
                                        return applyAfterMatchSetupBuffs(snapshot, enginePorts);
                                    },
                                    replenishBoard: handleReplenishBoard,
                                }),
                            })),
                        },
                    ])
                ),
            },
        },
    });

export type MatchActor = ReturnType<typeof createMatchActor>;
export type { ClockPort, EnginePorts, IdPort, RngPort } from './classic-helpers';
export { getAllowedCommands, canDispatchCommand, validateDispatch } from './classic-transitions';

export const createMatchActorFromSnapshot = (snapshot: GameSnapshot, ports: EnginePorts) => {
    const actor = createActor(createMatchMachine(ports), {
        input: {
            snapshot: cloneSnapshot(snapshot),
        },
    });
    actor.start();
    return actor;
};

export const createMatchActor = (
    input: {
        seed: number;
        mode: GameSnapshot['context']['mode'];
        flags: MatchFlags;
        runContext?: GameSnapshot['runContext'];
    },
    ports: EnginePorts
) =>
    createMatchActorFromSnapshot(
        createInitialSnapshot(ports, input.seed, input.mode, input.flags, input.runContext ?? null),
        ports
    );

export const readSnapshot = (actor: MatchActor): GameSnapshot =>
    cloneSnapshot(actor.getSnapshot().context.match);

export const dispatchCommand = (
    actor: MatchActor,
    command: GameCommand
): TypedResult<{ snapshot: GameSnapshot; eventCount: number }> => {
    const currentSnapshot = actor.getSnapshot().context.match;
    const validation = validateDispatch(currentSnapshot, command);
    if (!validation.ok) {
        return validation;
    }

    actor.send(command);
    return {
        ok: true,
        value: {
            snapshot: readSnapshot(actor),
            eventCount: actor.getSnapshot().context.match.eventLog.length,
        },
    };
};

export const bootstrapMatch = (
    actor: MatchActor,
    mode: GameSnapshot['context']['mode'],
    flags: MatchFlags
): TypedResult<GameSnapshot> => {
    const selectMode = dispatchCommand(actor, { type: 'SELECT_MODE', mode, flags });
    if (!selectMode.ok) {
        return selectMode;
    }
    const start = dispatchCommand(actor, { type: 'START_MATCH' });
    if (!start.ok) {
        return start;
    }
    return {
        ok: true,
        value: start.value.snapshot,
    };
};

export const createEngineError = (
    code: string,
    message: string,
    details?: Record<string, unknown>
): DomainError => createDomainError(code, 'rules', message, details);

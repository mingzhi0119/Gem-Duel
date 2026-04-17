import { createActor, assign, setup } from 'xstate';
import {
    type DomainError,
    RULESET_VERSION,
    createDomainError,
    createHiddenState,
    createInitialGemBank,
    type PlayerState,
    createPlayerState,
    type GamePhase,
    type MatchFlags,
    type NamespacedRng,
} from '@gem-duel/domain';
import {
    ENGINE_VERSION,
    SCHEMA_VERSION,
    type GameCommand,
    type GameEvent,
    type GameSnapshot,
    type TypedResult,
} from '@gem-duel/contracts';
export * from './effect-lifecycle';

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

interface MachineContext {
    match: GameSnapshot;
}

const phaseChanged = (phase: GamePhase): GameEvent => ({
    type: 'phase.changed',
    phase,
});

const cloneSnapshot = (snapshot: GameSnapshot): GameSnapshot => structuredClone(snapshot);

const nextPlayer = (player: GameSnapshot['context']['currentPlayer']) =>
    player === 'p1' ? 'p2' : 'p1';

const getCurrentPlayerState = (snapshot: GameSnapshot): PlayerState =>
    snapshot.players[snapshot.context.currentPlayer];

const pushEvent = (snapshot: GameSnapshot, event: GameEvent) => {
    snapshot.eventLog.push(event);
    snapshot.sequence += 1;
    snapshot.context.step = snapshot.sequence;
};

const setPhase = (snapshot: GameSnapshot, phase: GamePhase) => {
    snapshot.context.phase = phase;
    pushEvent(snapshot, phaseChanged(phase));
};

const createInitialSnapshot = (
    ports: EnginePorts,
    seed: number,
    mode: GameSnapshot['context']['mode'],
    flags: MatchFlags
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
        flags,
    },
    gemBank: createInitialGemBank(),
    players: {
        p1: createPlayerState('p1'),
        p2: createPlayerState('p2'),
    },
    eventLog: [],
    replayCursor: null,
    sequence: 0,
    activeEffects: [],
    hiddenState: createHiddenState(),
});

const machine = setup({
    types: {
        context: {} as MachineContext,
        events: {} as GameCommand,
        input: {} as { snapshot: GameSnapshot },
    },
}).createMachine({
    id: 'gem-duel-engine',
    initial: 'initialization',
    context: ({ input }) => ({ match: input.snapshot }),
    states: {
        initialization: {
            on: {
                SELECT_MODE: {
                    target: 'modeSelection',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        match.context.mode = event.mode;
                        match.context.flags = event.flags;
                        pushEvent(match, { type: 'match.modeSelected', mode: event.mode });
                        setPhase(match, 'modeSelection');
                        return { match };
                    }),
                },
            },
        },
        modeSelection: {
            on: {
                START_MATCH: {
                    target: 'turnIdle',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        pushEvent(match, { type: 'match.started' });
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        turnIdle: {
            on: {
                BEGIN_GEM_SELECTION: {
                    target: 'gemSelection',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        setPhase(match, 'gemSelection');
                        return { match };
                    }),
                },
                BEGIN_RESERVE: {
                    target: 'reserving',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        setPhase(match, 'reserving');
                        return { match };
                    }),
                },
                BEGIN_BUY: {
                    target: 'buying',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        setPhase(match, 'buying');
                        return { match };
                    }),
                },
                BEGIN_PRIVILEGE: {
                    target: 'privilege',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        setPhase(match, 'privilege');
                        return { match };
                    }),
                },
                BEGIN_ROYAL_RESOLUTION: {
                    target: 'royalResolution',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        setPhase(match, 'royalResolution');
                        return { match };
                    }),
                },
                ENTER_REPLAY: {
                    target: 'replay',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        match.replayCursor = match.eventLog.length;
                        pushEvent(match, { type: 'replay.entered' });
                        setPhase(match, 'replay');
                        return { match };
                    }),
                },
                FINISH_MATCH: {
                    target: 'terminal',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        match.context.winner = event.winner;
                        pushEvent(match, { type: 'match.finished', winner: event.winner });
                        setPhase(match, 'terminal');
                        return { match };
                    }),
                },
            },
        },
        gemSelection: {
            on: {
                TAKE_GEM: {
                    target: 'turnIdle',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        const player = getCurrentPlayerState(match);
                        match.gemBank[event.color] = Math.max(0, match.gemBank[event.color] - 1);
                        player.inventory[event.color] += 1;
                        pushEvent(match, { type: 'gem.taken', color: event.color });
                        match.context.currentPlayer = nextPlayer(match.context.currentPlayer);
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        reserving: {
            on: {
                RESERVE_CARD: {
                    target: 'turnIdle',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        const player = getCurrentPlayerState(match);
                        player.reservedCards = Math.min(3, player.reservedCards + event.slot);
                        pushEvent(match, { type: 'card.reserved', slot: event.slot });
                        match.context.currentPlayer = nextPlayer(match.context.currentPlayer);
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        buying: {
            on: {
                BUY_CARD: {
                    target: 'turnIdle',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        const player = getCurrentPlayerState(match);
                        player.tableauCards += 1;
                        player.score += event.scoreGain;
                        pushEvent(match, { type: 'card.bought', scoreGain: event.scoreGain });
                        match.context.currentPlayer = nextPlayer(match.context.currentPlayer);
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        privilege: {
            on: {
                USE_PRIVILEGE: {
                    target: 'turnIdle',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        const player = getCurrentPlayerState(match);
                        if (player.privileges > 0 && match.gemBank[event.color] > 0) {
                            player.privileges -= 1;
                            player.inventory[event.color] += 1;
                            match.gemBank[event.color] -= 1;
                        }
                        pushEvent(match, { type: 'privilege.used', color: event.color });
                        match.context.currentPlayer = nextPlayer(match.context.currentPlayer);
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        royalResolution: {
            on: {
                SELECT_ROYAL: {
                    target: 'turnIdle',
                    actions: assign(({ context, event }) => {
                        const match = cloneSnapshot(context.match);
                        const player = getCurrentPlayerState(match);
                        player.crowns += event.crownsGain;
                        player.score += event.crownsGain;
                        pushEvent(match, { type: 'royal.selected', crownsGain: event.crownsGain });
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        replay: {
            on: {
                EXIT_REPLAY: {
                    target: 'turnIdle',
                    actions: assign(({ context }) => {
                        const match = cloneSnapshot(context.match);
                        match.replayCursor = null;
                        pushEvent(match, { type: 'replay.exited' });
                        setPhase(match, 'turnIdle');
                        return { match };
                    }),
                },
            },
        },
        terminal: {
            type: 'final',
        },
    },
});

const allowedCommands: Record<GamePhase, GameCommand['type'][]> = {
    initialization: ['SELECT_MODE'],
    modeSelection: ['START_MATCH'],
    turnIdle: [
        'BEGIN_GEM_SELECTION',
        'BEGIN_RESERVE',
        'BEGIN_BUY',
        'BEGIN_PRIVILEGE',
        'BEGIN_ROYAL_RESOLUTION',
        'ENTER_REPLAY',
        'FINISH_MATCH',
    ],
    gemSelection: ['TAKE_GEM'],
    reserving: ['RESERVE_CARD'],
    buying: ['BUY_CARD'],
    privilege: ['USE_PRIVILEGE'],
    royalResolution: ['SELECT_ROYAL'],
    replay: ['EXIT_REPLAY'],
    terminal: [],
};

export type MatchActor = ReturnType<typeof createMatchActor>;

export const createMatchActor = (
    input: {
        seed: number;
        mode: GameSnapshot['context']['mode'];
        flags: MatchFlags;
    },
    ports: EnginePorts
) => {
    const actor = createActor(machine, {
        input: {
            snapshot: createInitialSnapshot(ports, input.seed, input.mode, input.flags),
        },
    });

    actor.start();
    return actor;
};

export const readSnapshot = (actor: MatchActor): GameSnapshot =>
    cloneSnapshot(actor.getSnapshot().context.match);

export const dispatchCommand = (
    actor: MatchActor,
    command: GameCommand
): TypedResult<{ snapshot: GameSnapshot; eventCount: number }> => {
    const current = actor.getSnapshot().context.match.context.phase;
    if (!allowedCommands[current].includes(command.type)) {
        return {
            ok: false,
            error: createDomainError(
                'ENGINE_PHASE_GUARD',
                'rules',
                `Command ${command.type} is not allowed during ${current}.`,
                { phase: current, command: command.type }
            ),
        };
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

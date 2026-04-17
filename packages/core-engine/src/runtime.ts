import { createActor, assign, setup } from 'xstate';
import {
    type ActiveEffect,
    type DomainError,
    RULESET_VERSION,
    createDomainError,
    createHiddenState,
    createInitialGemBank,
    type GamePhase,
    type MatchFlags,
    type NamespacedRng,
    type PlayerState,
    createPlayerState,
} from '@gem-duel/domain';
import {
    ENGINE_VERSION,
    SCHEMA_VERSION,
    type GameCommand,
    type GameEvent,
    type GameSnapshot,
    type TypedResult,
} from '@gem-duel/contracts';
import {
    completeEffect,
    createEffectLifecycleActor,
    spawnEffect,
    startEffect,
} from './effect-lifecycle';

const ROYAL_EFFECT_ATOM = 'gain_royal';
const ROYAL_EFFECT_HOOK_POINT = 'BEFORE_GAIN_ROYAL';
const ROYAL_EFFECT_SOURCE = 'royal_reward';
const ROYAL_EFFECT_SCOPE = 'active_player';

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

const findPendingRoyalEffect = (snapshot: GameSnapshot): ActiveEffect | undefined =>
    snapshot.activeEffects.find((effect) => effect.atom === ROYAL_EFFECT_ATOM);

const buildRoyalEffectId = (snapshot: GameSnapshot) =>
    `${snapshot.context.matchId}-royal-${snapshot.sequence + 1}`;

const buildRoyalRngNamespace = (snapshot: GameSnapshot, effectId: string) =>
    `match/${snapshot.context.matchId}/royal/${snapshot.sequence + 1}/${effectId}`;

const beginRoyalHandoff = (snapshot: GameSnapshot, ports: EnginePorts): GameSnapshot => {
    const effectId = buildRoyalEffectId(snapshot);
    const rngNamespace = buildRoyalRngNamespace(snapshot, effectId);
    ports.rng.fork(rngNamespace);

    const spawned = spawnEffect(snapshot, {
        effectId,
        parentEffectId: null,
        atom: ROYAL_EFFECT_ATOM,
        hookPoint: ROYAL_EFFECT_HOOK_POINT,
        source: ROYAL_EFFECT_SOURCE,
        scope: ROYAL_EFFECT_SCOPE,
        owner: snapshot.context.currentPlayer,
        sequence: snapshot.sequence + 1,
        rngNamespace,
    });
    const started = startEffect(spawned.snapshot, spawned.actor);
    return started.snapshot;
};

const resolveRoyalSelection = (snapshot: GameSnapshot, crownsGain: number): GameSnapshot => {
    const activeRoyal = findPendingRoyalEffect(snapshot);
    if (!activeRoyal) {
        return snapshot;
    }

    const player = getCurrentPlayerState(snapshot);
    player.crowns += crownsGain;
    player.score += crownsGain;
    pushEvent(snapshot, { type: 'royal.selected', crownsGain });

    const lifecycleActor = createEffectLifecycleActor(activeRoyal);
    return completeEffect(snapshot, lifecycleActor, 'resolved').snapshot;
};

const createMatchMachine = (ports: EnginePorts, initialPhase: GamePhase) =>
    setup({
        types: {
            context: {} as MachineContext,
            events: {} as GameCommand,
            input: {} as { snapshot: GameSnapshot },
        },
    }).createMachine({
        id: 'gem-duel-engine',
        initial: initialPhase,
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
                        actions: assign(({ context }) => ({
                            match: beginRoyalHandoff(cloneSnapshot(context.match), ports),
                        })),
                    },
                    SELECT_ROYAL: {
                        actions: assign(({ context, event }) => ({
                            match: resolveRoyalSelection(
                                cloneSnapshot(context.match),
                                event.crownsGain
                            ),
                        })),
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
                            match.gemBank[event.color] = Math.max(
                                0,
                                match.gemBank[event.color] - 1
                            );
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

const createPhaseGuardError = (snapshot: GameSnapshot, command: GameCommand): DomainError =>
    createDomainError(
        'ENGINE_PHASE_GUARD',
        'rules',
        `Command ${command.type} is not allowed during ${snapshot.context.phase}.`,
        {
            phase: snapshot.context.phase,
            command: command.type,
            activeEffects: snapshot.activeEffects.map((effect) => ({
                effectId: effect.effectId,
                atom: effect.atom,
                stage: effect.stage,
            })),
        }
    );

export const getAllowedCommands = (snapshot: GameSnapshot): GameCommand['type'][] => {
    const pendingRoyal = findPendingRoyalEffect(snapshot);
    switch (snapshot.context.phase) {
        case 'initialization':
            return ['SELECT_MODE'];
        case 'modeSelection':
            return ['START_MATCH'];
        case 'turnIdle':
            return pendingRoyal
                ? ['SELECT_ROYAL']
                : [
                      'BEGIN_GEM_SELECTION',
                      'BEGIN_RESERVE',
                      'BEGIN_BUY',
                      'BEGIN_PRIVILEGE',
                      'BEGIN_ROYAL_RESOLUTION',
                      'ENTER_REPLAY',
                      'FINISH_MATCH',
                  ];
        case 'gemSelection':
            return ['TAKE_GEM'];
        case 'reserving':
            return ['RESERVE_CARD'];
        case 'buying':
            return ['BUY_CARD'];
        case 'privilege':
            return ['USE_PRIVILEGE'];
        case 'replay':
            return ['EXIT_REPLAY'];
        case 'terminal':
            return [];
    }
};

export const canDispatchCommand = (snapshot: GameSnapshot, command: GameCommand) =>
    getAllowedCommands(snapshot).includes(command.type);

export type MatchActor = ReturnType<typeof createMatchActor>;

export const createMatchActorFromSnapshot = (snapshot: GameSnapshot, ports: EnginePorts) => {
    const actor = createActor(createMatchMachine(ports, snapshot.context.phase), {
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
    },
    ports: EnginePorts
) =>
    createMatchActorFromSnapshot(
        createInitialSnapshot(ports, input.seed, input.mode, input.flags),
        ports
    );

export const readSnapshot = (actor: MatchActor): GameSnapshot =>
    cloneSnapshot(actor.getSnapshot().context.match);

export const dispatchCommand = (
    actor: MatchActor,
    command: GameCommand
): TypedResult<{ snapshot: GameSnapshot; eventCount: number }> => {
    const currentSnapshot = actor.getSnapshot().context.match;
    if (!canDispatchCommand(currentSnapshot, command)) {
        return {
            ok: false,
            error: createPhaseGuardError(currentSnapshot, command),
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

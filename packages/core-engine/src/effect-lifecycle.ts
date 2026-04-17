import { assign, createActor, setup } from 'xstate';
import type { ActiveEffect, EffectOutcome } from '@gem-duel/domain';
import type { GameSnapshot } from '@gem-duel/contracts';

interface EffectLifecycleContext {
    effect: ActiveEffect;
    outcome: EffectOutcome | null;
}

type EffectLifecycleEvent = { type: 'START' } | { type: 'COMPLETE'; outcome: EffectOutcome };

const cloneSnapshot = <T>(value: T): T => structuredClone(value);

const pushEvent = (snapshot: GameSnapshot, event: GameSnapshot['eventLog'][number]) => {
    snapshot.eventLog.push(event);
    snapshot.sequence += 1;
    snapshot.context.step = snapshot.sequence;
};

const updateActiveEffect = (snapshot: GameSnapshot, effect: ActiveEffect) => {
    const index = snapshot.activeEffects.findIndex((entry) => entry.effectId === effect.effectId);
    if (index >= 0) {
        snapshot.activeEffects[index] = effect;
        return;
    }

    snapshot.activeEffects.push(effect);
};

const effectLifecycleMachine = setup({
    types: {
        context: {} as EffectLifecycleContext,
        events: {} as EffectLifecycleEvent,
        input: {} as { effect: ActiveEffect },
    },
}).createMachine({
    id: 'effectLifecycle',
    initial: 'scheduled',
    context: ({ input }) => ({
        effect: {
            ...input.effect,
            stage: 'scheduled',
        },
        outcome: null,
    }),
    states: {
        scheduled: {
            on: {
                START: {
                    target: 'running',
                    actions: assign(({ context }) => ({
                        effect: {
                            ...context.effect,
                            stage: 'running',
                        },
                    })),
                },
            },
        },
        running: {
            on: {
                COMPLETE: {
                    target: 'completed',
                    actions: assign(({ context, event }) => ({
                        effect: {
                            ...context.effect,
                            stage: 'completed',
                        },
                        outcome: event.outcome,
                    })),
                },
            },
        },
        completed: {
            type: 'final',
        },
    },
});

export type EffectLifecycleActor = ReturnType<typeof createEffectLifecycleActor>;

export const createEffectLifecycleActor = (effect: Omit<ActiveEffect, 'stage'> | ActiveEffect) => {
    const actor = createActor(effectLifecycleMachine, {
        input: {
            effect: {
                ...effect,
                stage: 'scheduled',
            },
        },
    });

    actor.start();
    return actor;
};

export const readEffectLifecycle = (actor: EffectLifecycleActor) =>
    cloneSnapshot(actor.getSnapshot().context);

export const spawnEffect = (
    snapshot: GameSnapshot,
    effect: Omit<ActiveEffect, 'stage'>
): { snapshot: GameSnapshot; effect: ActiveEffect; actor: EffectLifecycleActor } => {
    const nextSnapshot = cloneSnapshot(snapshot);
    const scheduledEffect: ActiveEffect = {
        ...effect,
        stage: 'scheduled',
    };
    updateActiveEffect(nextSnapshot, scheduledEffect);
    pushEvent(nextSnapshot, {
        type: 'effect.spawned',
        effectId: scheduledEffect.effectId,
        parentEffectId: scheduledEffect.parentEffectId,
        atom: scheduledEffect.atom,
        hookPoint: scheduledEffect.hookPoint,
        source: scheduledEffect.source,
        scope: scheduledEffect.scope,
        owner: scheduledEffect.owner,
        sequence: scheduledEffect.sequence,
        stage: 'scheduled',
        rngNamespace: scheduledEffect.rngNamespace,
    });

    return {
        snapshot: nextSnapshot,
        effect: scheduledEffect,
        actor: createEffectLifecycleActor(scheduledEffect),
    };
};

export const startEffect = (
    snapshot: GameSnapshot,
    actor: EffectLifecycleActor
): { snapshot: GameSnapshot; effect: ActiveEffect } => {
    actor.send({ type: 'START' });
    const { effect } = readEffectLifecycle(actor);
    const nextSnapshot = cloneSnapshot(snapshot);
    updateActiveEffect(nextSnapshot, effect);
    pushEvent(nextSnapshot, {
        type: 'effect.started',
        effectId: effect.effectId,
        atom: effect.atom,
        sequence: effect.sequence,
        stage: 'running',
    });

    return {
        snapshot: nextSnapshot,
        effect,
    };
};

export const completeEffect = (
    snapshot: GameSnapshot,
    actor: EffectLifecycleActor,
    outcome: EffectOutcome
): { snapshot: GameSnapshot; effect: ActiveEffect; outcome: EffectOutcome } => {
    actor.send({ type: 'COMPLETE', outcome });
    const { effect } = readEffectLifecycle(actor);
    const nextSnapshot = cloneSnapshot(snapshot);
    nextSnapshot.activeEffects = nextSnapshot.activeEffects.filter(
        (entry) => entry.effectId !== effect.effectId
    );
    pushEvent(nextSnapshot, {
        type: 'effect.completed',
        effectId: effect.effectId,
        atom: effect.atom,
        sequence: effect.sequence,
        stage: 'completed',
        outcome,
    });

    return {
        snapshot: nextSnapshot,
        effect,
        outcome,
    };
};

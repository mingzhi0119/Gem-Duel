import type { TypedResult } from '@gem-duel/contracts';
import { createClockPort, createIdPort, createSeededRng } from '@gem-duel/adapters';
import {
    attachMatchToRun,
    buildRunContext,
    createRunState as createEngineRunState,
    finalizeRunMatch,
    selectRunReward,
    type EnginePorts,
} from '@gem-duel/core-engine';
import {
    createDefaultMetaState,
    createDomainError,
    type MatchFlags,
    type RunState,
} from '@gem-duel/domain';

import { createMatchSession } from './match';
import type { MatchSession, RunSession, RunSessionInput } from '../shared/types';

const buildRunMatchFlags = (mode: 'local' | 'ai'): MatchFlags => ({
    roguelike: true,
    onlineAuthoritative: false,
    aiEnabled: mode === 'ai',
});

const deriveRunMatchSeed = (seed: number, matchIndex: number) => seed + matchIndex - 1;

export const createRunSession = (input: RunSessionInput): TypedResult<RunSession> => {
    const ports = {
        rng: createSeededRng(input.seed, 'run-root'),
        clock: createClockPort(),
        id: createIdPort('run'),
    } satisfies EnginePorts;
    let currentMetaState = structuredClone(
        input.metaState ?? createDefaultMetaState('local-profile')
    );
    let currentRunState = createEngineRunState({
        seed: input.seed,
        mode: input.mode,
        metaState: currentMetaState,
        ports,
    });
    let currentMatchSession: MatchSession | null = null;

    const startNextMatch = (): TypedResult<RunState> => {
        const matchSeed = deriveRunMatchSeed(input.seed, currentRunState.matchIndex);
        const matchResult = createMatchSession(
            {
                seed: matchSeed,
                mode: input.mode,
                flags: buildRunMatchFlags(input.mode),
                runContext: buildRunContext(currentRunState),
            },
            {
                rng: createSeededRng(
                    matchSeed,
                    `run/${currentRunState.runId}/match/${currentRunState.matchIndex}`
                ),
                clock: ports.clock,
                id: ports.id,
            }
        );

        if (!matchResult.ok) {
            return matchResult;
        }

        currentMatchSession = matchResult.value;
        currentRunState = attachMatchToRun(currentRunState, currentMatchSession.snapshot());
        return {
            ok: true,
            value: currentRunState,
        };
    };

    const finalizeIfTerminal = () => {
        if (!currentMatchSession) {
            return null;
        }

        const snapshot = currentMatchSession.snapshot();
        if (snapshot.context.phase !== 'terminal') {
            return null;
        }

        const finalized = finalizeRunMatch(
            currentRunState,
            snapshot,
            currentMetaState,
            ports,
            ports.clock.now()
        );
        if (!finalized.ok) {
            return finalized;
        }

        currentRunState = finalized.value.runState;
        currentMetaState = finalized.value.metaState;
        return finalized;
    };

    return {
        ok: true,
        value: {
            state() {
                return structuredClone(currentRunState);
            },
            metaState() {
                return structuredClone(currentMetaState);
            },
            match() {
                return currentMatchSession;
            },
            dispatch(command) {
                if (!currentMatchSession) {
                    return {
                        ok: false,
                        error: createDomainError(
                            'ENGINE_PHASE_GUARD',
                            'rules',
                            'There is no active run match to receive commands.'
                        ),
                    };
                }

                const result = currentMatchSession.dispatch(command);
                if (!result.ok) {
                    return result;
                }

                const finalized = finalizeIfTerminal();
                if (finalized && !finalized.ok) {
                    return finalized;
                }

                return result;
            },
            snapshot() {
                return currentMatchSession?.snapshot() ?? null;
            },
            viewModel(viewer = 'p1') {
                return currentMatchSession?.viewModel(viewer) ?? null;
            },
            selectReward(buffId) {
                const selection = selectRunReward(currentRunState, buffId);
                if (!selection.ok) {
                    return selection;
                }

                currentRunState = selection.value;
                return startNextMatch();
            },
            replay() {
                return currentMatchSession?.replay() ?? null;
            },
            replayInspector() {
                return currentMatchSession ? currentMatchSession.replayInspector() : null;
            },
            aiTrace() {
                return currentMatchSession?.aiTrace() ?? [];
            },
        },
    };
};

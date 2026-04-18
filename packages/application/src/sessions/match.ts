import type { GameCommand, GameSnapshot, ReplayCommand, TypedResult } from '@gem-duel/contracts';
import { createEnginePorts } from '@gem-duel/adapters';
import {
    buildReplayBundle,
    createMatchActor,
    dispatchCommand,
    readSnapshot,
    type EnginePorts,
} from '@gem-duel/core-engine';

import { chooseAiAction } from '../ai/heuristic';
import { buildReplayInspectorModel, createReplayCommand } from '../replay/inspector';
import type {
    AiDecisionTrace,
    MatchSession,
    MatchSessionInput,
    ShellMatchSessionInput,
} from '../shared/types';
import { buildUiViewModel } from '../view-model';

export const createMatchSession = (
    input: MatchSessionInput,
    ports: EnginePorts
): TypedResult<MatchSession> => {
    const actor = createMatchActor(input, ports);
    const initialSnapshot = readSnapshot(actor);
    const commandLog: ReplayCommand[] = [];
    const aiDecisionLog: AiDecisionTrace[] = [];

    const recordedDispatch = (command: GameCommand) => {
        const snapshotBefore = readSnapshot(actor);
        const replayCommand = createReplayCommand(snapshotBefore, command, commandLog.length);
        const result = dispatchCommand(actor, command);
        if (result.ok) {
            commandLog.push(replayCommand);
        }
        return result;
    };

    const resolveAiTurns = (): TypedResult<GameSnapshot> => {
        if (input.mode !== 'ai') {
            return {
                ok: true,
                value: readSnapshot(actor),
            };
        }

        while (readSnapshot(actor).context.phase !== 'terminal') {
            const currentSnapshot = readSnapshot(actor);
            if (currentSnapshot.context.currentPlayer !== 'p2') {
                break;
            }

            const aiView = buildUiViewModel(currentSnapshot, 'p2');
            const decision = chooseAiAction(
                currentSnapshot,
                aiView.availableActions,
                input.seed,
                aiDecisionLog.length
            );
            if (!decision) {
                break;
            }

            aiDecisionLog.push(decision.trace);
            const result = recordedDispatch(decision.chosen.command);
            if (!result.ok) {
                return result;
            }
        }

        return {
            ok: true,
            value: readSnapshot(actor),
        };
    };

    const selectMode = recordedDispatch({
        type: 'SELECT_MODE',
        mode: input.mode,
        flags: input.flags,
    });
    if (!selectMode.ok) {
        return selectMode;
    }

    const startMatch = recordedDispatch({ type: 'START_MATCH' });
    if (!startMatch.ok) {
        return startMatch;
    }

    const aiBootstrap = resolveAiTurns();
    if (!aiBootstrap.ok) {
        return aiBootstrap;
    }

    return {
        ok: true,
        value: {
            dispatch(command) {
                const result = recordedDispatch(command);
                if (!result.ok) {
                    return result;
                }
                const aiResult = resolveAiTurns();
                if (!aiResult.ok) {
                    return aiResult;
                }
                return {
                    ok: true,
                    value: aiResult.value,
                };
            },
            snapshot() {
                return readSnapshot(actor);
            },
            replay() {
                return buildReplayBundle(initialSnapshot, [...commandLog], readSnapshot(actor));
            },
            replayInspector() {
                return buildReplayInspectorModel(
                    buildReplayBundle(initialSnapshot, [...commandLog], readSnapshot(actor))
                );
            },
            viewModel(viewer = 'p1') {
                return buildUiViewModel(readSnapshot(actor), viewer);
            },
            aiTrace() {
                return structuredClone(aiDecisionLog);
            },
        },
    };
};

export const createLocalMatchSession = (input: ShellMatchSessionInput): TypedResult<MatchSession> =>
    createMatchSession(
        {
            seed: input.seed,
            mode: 'local',
            flags: input.flags,
            runContext: input.runContext ?? null,
        },
        createEnginePorts(input.seed)
    );

export const createAiMatchSession = (input: ShellMatchSessionInput): TypedResult<MatchSession> =>
    createMatchSession(
        {
            seed: input.seed,
            mode: 'ai',
            flags: input.flags,
            runContext: input.runContext ?? null,
        },
        createEnginePorts(input.seed)
    );

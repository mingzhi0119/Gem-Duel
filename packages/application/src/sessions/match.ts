import type { GameCommand, ReplayCommand, TypedResult } from '@gem-duel/contracts';
import { createEnginePorts } from '@gem-duel/adapters';
import {
    buildReplayBundle,
    createMatchActor,
    createMatchActorFromSnapshot,
    dispatchCommand,
    readSnapshot,
    type EnginePorts,
} from '@gem-duel/core-engine';

import { resolveAiTurns } from '../ai/turn-resolver';
import { buildReplayInspectorModel, createReplayCommand } from '../replay/inspector';
import type {
    AiDecisionTrace,
    MatchSession,
    MatchSessionInput,
    PreparedShellMatchSessionInput,
    ShellMatchSessionInput,
} from '../shared/types';
import { buildUiViewModel } from '../view-model';

const bindMatchSession = ({
    actor,
    seed,
    mode,
    preludeCommands = [],
}: {
    actor: ReturnType<typeof createMatchActor>;
    seed: number;
    mode: MatchSessionInput['mode'];
    preludeCommands?: GameCommand[];
}): TypedResult<MatchSession> => {
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

    const resolvePendingAiTurns = () =>
        resolveAiTurns({
            mode,
            seed,
            getSnapshot: () => readSnapshot(actor),
            dispatch: recordedDispatch,
            aiDecisionLog,
        });

    for (const command of preludeCommands) {
        const result = recordedDispatch(command);
        if (!result.ok) {
            return result;
        }
    }

    const aiBootstrap = resolvePendingAiTurns();
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
                const aiResult = resolvePendingAiTurns();
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

export const createMatchSession = (
    input: MatchSessionInput,
    ports: EnginePorts
): TypedResult<MatchSession> =>
    bindMatchSession({
        actor: createMatchActor(input, ports),
        seed: input.seed,
        mode: input.mode,
        preludeCommands: [
            {
                type: 'SELECT_MODE',
                mode: input.mode,
                flags: input.flags,
            },
            { type: 'START_MATCH' },
        ],
    });

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

export const createPreparedLocalMatchSession = (
    input: PreparedShellMatchSessionInput
): TypedResult<MatchSession> => {
    const ports = createEnginePorts(input.seed);
    const actor = input.snapshot
        ? createMatchActorFromSnapshot(input.snapshot, ports)
        : createMatchActor(
              {
                  seed: input.seed,
                  mode: 'local',
                  flags: input.flags,
                  runContext: input.runContext ?? null,
              },
              ports
          );

    return bindMatchSession({
        actor,
        seed: input.seed,
        mode: 'local',
        preludeCommands: input.snapshot
            ? (input.bootstrapCommands ?? [])
            : [
                  {
                      type: 'SELECT_MODE',
                      mode: 'local',
                      flags: input.flags,
                  },
                  { type: 'START_MATCH' },
                  ...(input.bootstrapCommands ?? []),
              ],
    });
};

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

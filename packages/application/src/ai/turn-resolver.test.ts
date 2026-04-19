import { describe, expect, it } from 'vitest';
import type {
    GameCommand,
    GameSnapshot,
    TypedResult,
    UiActionDescriptor,
    UiViewModel,
} from '@gem-duel/contracts';

import type { AiDecisionTrace } from '../shared/types';
import { resolveAiTurns } from './turn-resolver';

const snapshotAt = (
    currentPlayer: 'p1' | 'p2',
    sequence: number,
    phase: GameSnapshot['context']['phase'] = 'turnIdle'
) =>
    ({
        context: {
            phase,
            currentPlayer,
            winner: null,
            victoryReason: null,
        },
        sequence,
    }) as GameSnapshot;

const makeAction = (id: string, command: GameCommand): UiActionDescriptor => ({
    id,
    label: id,
    command,
});

describe('resolveAiTurns', () => {
    it('returns immediately for non-ai sessions', () => {
        const traces: AiDecisionTrace[] = [];
        const currentSnapshot = snapshotAt('p1', 4);

        const result = resolveAiTurns({
            mode: 'local',
            seed: 91,
            getSnapshot: () => currentSnapshot,
            dispatch: () => {
                throw new Error('dispatch should not be called for local mode');
            },
            aiDecisionLog: traces,
        });

        expect(result).toEqual({
            ok: true,
            value: currentSnapshot,
        });
        expect(traces).toEqual([]);
    });

    it('dispatches deterministic AI actions until control returns to p1', () => {
        const snapshots = [snapshotAt('p2', 4), snapshotAt('p2', 5), snapshotAt('p1', 6)];
        const actions = [
            makeAction('ai-open', { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c2' }),
            makeAction('ai-follow', { type: 'REPLENISH_BOARD' }),
        ];
        const dispatched: GameCommand[] = [];
        const traces: AiDecisionTrace[] = [];
        let snapshotIndex = 0;

        const result = resolveAiTurns({
            mode: 'ai',
            seed: 91,
            getSnapshot: () => snapshots[snapshotIndex] ?? snapshots[snapshots.length - 1]!,
            dispatch: (command): TypedResult<GameSnapshot> => {
                dispatched.push(command);
                snapshotIndex += 1;
                return {
                    ok: true,
                    value: snapshots[snapshotIndex] ?? snapshots[snapshots.length - 1]!,
                };
            },
            aiDecisionLog: traces,
            buildViewModel: () =>
                ({
                    availableActions: [actions[snapshotIndex]!],
                }) as UiViewModel,
            chooseAction: (snapshot, availableActions, _seed, decisionIndex) => ({
                chosen: availableActions[0]!,
                trace: {
                    decisionIndex,
                    player: snapshot.context.currentPlayer,
                    sequence: snapshot.sequence,
                    chosenActionId: availableActions[0]!.id,
                    chosenCommandType: availableActions[0]!.command.type,
                    candidates: [],
                },
            }),
        });

        expect(result).toEqual({
            ok: true,
            value: snapshots[2],
        });
        expect(dispatched).toEqual(actions.map((action) => action.command));
        expect(traces.map((trace) => trace.chosenActionId)).toEqual(['ai-open', 'ai-follow']);
        expect(traces.map((trace) => trace.decisionIndex)).toEqual([0, 1]);
    });
});

import type { GameCommand, GameSnapshot, TypedResult, UiViewModel } from '@gem-duel/contracts';

import type { AiDecisionTrace, MatchSessionInput, ViewerId } from '../shared/types';
import { buildUiViewModel } from '../view-model';
import { chooseAiAction } from './heuristic';

export interface ResolveAiTurnsInput {
    mode: MatchSessionInput['mode'];
    seed: number;
    getSnapshot: () => GameSnapshot;
    dispatch: (command: GameCommand) => TypedResult<unknown>;
    aiDecisionLog: AiDecisionTrace[];
    buildViewModel?: (snapshot: GameSnapshot, viewer?: ViewerId) => UiViewModel;
    chooseAction?: typeof chooseAiAction;
}

export const resolveAiTurns = ({
    mode,
    seed,
    getSnapshot,
    dispatch,
    aiDecisionLog,
    buildViewModel = buildUiViewModel,
    chooseAction = chooseAiAction,
}: ResolveAiTurnsInput): TypedResult<GameSnapshot> => {
    if (mode !== 'ai') {
        return {
            ok: true,
            value: getSnapshot(),
        };
    }

    while (getSnapshot().context.phase !== 'terminal') {
        const currentSnapshot = getSnapshot();
        if (currentSnapshot.context.currentPlayer !== 'p2') {
            break;
        }

        const aiView = buildViewModel(currentSnapshot, 'p2');
        const decision = chooseAction(
            currentSnapshot,
            aiView.availableActions,
            seed,
            aiDecisionLog.length
        );
        if (!decision) {
            break;
        }

        aiDecisionLog.push(decision.trace);
        const result = dispatch(decision.chosen.command);
        if (!result.ok) {
            return result;
        }
    }

    return {
        ok: true,
        value: getSnapshot(),
    };
};

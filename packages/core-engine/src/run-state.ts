import {
    createDomainError,
    createRunContext,
    type BuffId,
    type GameMode,
    type MetaState,
    type RunState,
} from '@gem-duel/domain';
import type { GameSnapshot, TypedResult } from '@gem-duel/contracts';
import type { EnginePorts } from './runtime';

const OFFER_SIZE = 3;
const TARGET_WINS = 3;
const TARGET_LOSSES = 1;

const unique = <T>(items: readonly T[]) => [...new Set(items)];

const buildOffer = (
    ports: EnginePorts,
    runId: string,
    source: 'starter' | 'victory',
    matchIndex: number,
    unlockedBuffIds: readonly BuffId[],
    ownedBuffIds: readonly BuffId[]
) => {
    const pool = unique(unlockedBuffIds).filter((buffId) => !ownedBuffIds.includes(buffId));
    if (pool.length === 0) {
        return null;
    }

    const rng = ports.rng.fork(`run/${runId}/${source}/${matchIndex}`);
    const remaining = [...pool];
    const options: BuffId[] = [];
    while (remaining.length > 0 && options.length < Math.min(OFFER_SIZE, pool.length)) {
        const nextIndex = rng.nextInt(remaining.length);
        const [picked] = remaining.splice(nextIndex, 1);
        if (picked) {
            options.push(picked);
        }
    }

    return {
        offerId: `${runId}-${source}-${matchIndex}`,
        source,
        options,
    } satisfies RunState['currentOffer'];
};

const createBuffState = (buffId: BuffId): Record<string, string | number | boolean | null> =>
    buffId === 'extortion'
        ? {
              replenishCount: 0,
          }
        : {};

const getOwnedBuffIds = (runState: Pick<RunState, 'ownedBuffs'>) =>
    runState.ownedBuffs.map((buff) => buff.id);

const createRunError = (code: string, message: string, details?: Record<string, unknown>) =>
    createDomainError(code, 'rules', message, details);

export const createRunState = (input: {
    seed: number;
    mode: Exclude<GameMode, 'online'>;
    metaState: MetaState;
    ports: EnginePorts;
}): RunState => {
    const runId = input.ports.id.next('run');
    return {
        runId,
        seed: input.seed,
        mode: input.mode,
        matchIndex: 1,
        activeMatchId: null,
        ownedBuffs: [],
        wins: 0,
        losses: 0,
        status: 'draft',
        currentOffer: buildOffer(
            input.ports,
            runId,
            'starter',
            1,
            input.metaState.unlockedBuffIds,
            []
        ),
    };
};

export const buildRunContext = (
    runState: Pick<RunState, 'runId' | 'matchIndex' | 'wins' | 'losses' | 'ownedBuffs'>
) =>
    createRunContext(
        runState.runId,
        runState.matchIndex,
        runState.wins,
        runState.losses,
        runState.ownedBuffs
    );

export const selectRunReward = (runState: RunState, buffId: BuffId): TypedResult<RunState> => {
    if (!runState.currentOffer) {
        return {
            ok: false,
            error: createRunError(
                'ENGINE_RULE_GUARD',
                'There is no active reward offer to resolve.'
            ),
        };
    }
    if (!runState.currentOffer.options.includes(buffId)) {
        return {
            ok: false,
            error: createRunError(
                'ENGINE_RULE_GUARD',
                'The requested buff is not part of the active reward offer.',
                {
                    buffId,
                    offerId: runState.currentOffer.offerId,
                }
            ),
        };
    }

    return {
        ok: true,
        value: {
            ...runState,
            status: 'active',
            ownedBuffs: [
                ...runState.ownedBuffs,
                {
                    id: buffId,
                    owner: 'p1',
                    source: runState.currentOffer.source === 'starter' ? 'starter' : 'reward',
                    acquiredAtMatchIndex: runState.matchIndex,
                    state: createBuffState(buffId),
                },
            ],
            currentOffer: null,
        },
    };
};

export const attachMatchToRun = (runState: RunState, snapshot: GameSnapshot): RunState => ({
    ...runState,
    activeMatchId: snapshot.context.matchId,
});

export const syncRunStateFromSnapshot = (runState: RunState, snapshot: GameSnapshot): RunState => {
    if (!snapshot.runContext || snapshot.runContext.runId !== runState.runId) {
        return runState;
    }

    return {
        ...runState,
        ownedBuffs: structuredClone(snapshot.runContext.activeBuffs),
    };
};

export const finalizeRunMatch = (
    runState: RunState,
    snapshot: GameSnapshot,
    metaState: MetaState,
    ports: EnginePorts,
    completedAt: string | null
): TypedResult<{ runState: RunState; metaState: MetaState }> => {
    const syncedRun = syncRunStateFromSnapshot(runState, snapshot);
    const didPlayerWin = snapshot.context.winner === 'p1';
    const nextWins = syncedRun.wins + (didPlayerWin ? 1 : 0);
    const nextLosses = syncedRun.losses + (didPlayerWin ? 0 : 1);
    const isWon = nextWins >= TARGET_WINS;
    const isLost = nextLosses >= TARGET_LOSSES;

    const nextRunState: RunState = {
        ...syncedRun,
        activeMatchId: null,
        wins: nextWins,
        losses: nextLosses,
        status: isWon ? 'won' : isLost ? 'lost' : 'active',
        matchIndex: isWon || isLost ? syncedRun.matchIndex : syncedRun.matchIndex + 1,
        currentOffer:
            didPlayerWin && !isWon
                ? buildOffer(
                      ports,
                      syncedRun.runId,
                      'victory',
                      syncedRun.matchIndex + 1,
                      metaState.unlockedBuffIds,
                      getOwnedBuffIds(syncedRun)
                  )
                : null,
    };

    const isTerminal = nextRunState.status === 'won' || nextRunState.status === 'lost';
    const nextMetaState: MetaState = isTerminal
        ? {
              ...metaState,
              completedRunIds: unique([...metaState.completedRunIds, nextRunState.runId]),
              totalRuns: metaState.totalRuns + 1,
              lastUpdatedAt: completedAt,
          }
        : metaState;

    return {
        ok: true,
        value: {
            runState: nextRunState,
            metaState: nextMetaState,
        },
    };
};

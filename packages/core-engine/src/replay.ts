import {
    ENGINE_VERSION,
    SCHEMA_VERSION,
    type GameSnapshot,
    type ReplayBundle,
    type ReplayCommand,
    type TypedResult,
} from '@gem-duel/contracts';
import { RULESET_VERSION } from '@gem-duel/domain';
import {
    createMatchActorFromSnapshot,
    dispatchCommand,
    readSnapshot,
    type EnginePorts,
} from './runtime';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const sortKeysDeep = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map((item) => sortKeysDeep(item));
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, nestedValue]) => [key, sortKeysDeep(nestedValue)])
    );
};

const stableStringify = (value: unknown) => JSON.stringify(sortKeysDeep(value));

const cloneSnapshot = (snapshot: GameSnapshot): GameSnapshot => structuredClone(snapshot);

const createDeterministicHash = (input: string) => {
    let hash = 2166136261;
    for (const char of input) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const projectSnapshotForHash = (snapshot: GameSnapshot) => ({
    schemaVersion: snapshot.schemaVersion,
    rulesetVersion: snapshot.rulesetVersion,
    engineVersion: snapshot.engineVersion,
    visibility: snapshot.visibility,
    context: snapshot.context,
    board: snapshot.board,
    pyramid: snapshot.pyramid,
    royalSupply: snapshot.royalSupply,
    privilegeSupply: snapshot.privilegeSupply,
    players: snapshot.players,
    eventLog: snapshot.eventLog,
    replayCursor: snapshot.replayCursor,
    sequence: snapshot.sequence,
    activeEffects: snapshot.activeEffects,
    effectPrompts: snapshot.effectPrompts,
    hiddenState: snapshot.hiddenState,
});

export const createSnapshotHash = (snapshot: GameSnapshot) =>
    createDeterministicHash(stableStringify(projectSnapshotForHash(snapshot)));

export const buildReplayBundle = (
    initialSnapshot: GameSnapshot,
    commands: ReplayCommand[],
    finalSnapshot: GameSnapshot
): ReplayBundle => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: RULESET_VERSION,
    engineVersion: ENGINE_VERSION,
    seed: initialSnapshot.context.seed,
    initialSnapshot: cloneSnapshot(initialSnapshot),
    commands: structuredClone(commands),
    events: structuredClone(finalSnapshot.eventLog),
    finalStateHash: createSnapshotHash(finalSnapshot),
    resultSummary: {
        winner: finalSnapshot.context.winner,
        reason: finalSnapshot.context.victoryReason,
        turns: finalSnapshot.context.step,
        finalSeq: finalSnapshot.sequence,
    },
});

export const replayCommands = (
    bundle: ReplayBundle,
    ports: EnginePorts
): TypedResult<{ snapshot: GameSnapshot }> => {
    const actor = createMatchActorFromSnapshot(bundle.initialSnapshot, ports);

    for (const replayCommand of bundle.commands) {
        const result = dispatchCommand(actor, replayCommand.command);
        if (!result.ok) {
            return result;
        }
    }

    return {
        ok: true,
        value: {
            snapshot: readSnapshot(actor),
        },
    };
};

export interface ReplayVerificationResult {
    replayedSnapshot: GameSnapshot;
    recomputedFinalStateHash: string;
    matchesHash: boolean;
    matchesEvents: boolean;
}

export const verifyReplayBundle = (
    bundle: ReplayBundle,
    ports: EnginePorts
): TypedResult<ReplayVerificationResult> => {
    const replayed = replayCommands(bundle, ports);
    if (!replayed.ok) {
        return replayed;
    }

    const recomputedFinalStateHash = createSnapshotHash(replayed.value.snapshot);
    return {
        ok: true,
        value: {
            replayedSnapshot: replayed.value.snapshot,
            recomputedFinalStateHash,
            matchesHash: recomputedFinalStateHash === bundle.finalStateHash,
            matchesEvents:
                stableStringify(replayed.value.snapshot.eventLog) ===
                stableStringify(bundle.events),
        },
    };
};

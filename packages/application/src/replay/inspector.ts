import type {
    GameCommand,
    GameSnapshot,
    ReplayBundle,
    ReplayCommand,
    TypedResult,
} from '@gem-duel/contracts';
import { createEnginePorts } from '@gem-duel/adapters';
import {
    createSnapshotHash,
    createMatchActorFromSnapshot,
    dispatchCommand,
    readSnapshot,
    verifyReplayBundle,
} from '@gem-duel/core-engine';

import type { ReplayInspectorModel, ReplayInspectorStep } from '../shared/types';

export const createReplayCommand = (
    snapshot: GameSnapshot,
    command: GameCommand,
    index: number
): ReplayCommand => ({
    clientCommandId: `local-command-${index + 1}`,
    expectedSeq: snapshot.sequence,
    issuedBy: snapshot.context.currentPlayer,
    command,
});

export const buildReplayInspectorModel = (
    bundle: ReplayBundle
): TypedResult<ReplayInspectorModel> => {
    const verification = verifyReplayBundle(bundle, createEnginePorts(bundle.seed));
    if (!verification.ok) {
        return verification;
    }

    const actor = createMatchActorFromSnapshot(
        bundle.initialSnapshot,
        createEnginePorts(bundle.seed)
    );
    const steps: ReplayInspectorStep[] = [
        {
            index: 0,
            label: 'Initial Snapshot',
            command: null,
            snapshot: readSnapshot(actor),
            snapshotHash: createSnapshotHash(readSnapshot(actor)),
        },
    ];

    for (const [index, replayCommand] of bundle.commands.entries()) {
        const result = dispatchCommand(actor, replayCommand.command);
        if (!result.ok) {
            return result;
        }
        steps.push({
            index: index + 1,
            label: `${replayCommand.command.type} #${index + 1}`,
            command: replayCommand,
            snapshot: result.value.snapshot,
            snapshotHash: createSnapshotHash(result.value.snapshot),
        });
    }

    return {
        ok: true,
        value: {
            finalStateHash: bundle.finalStateHash,
            recomputedFinalStateHash: verification.value.recomputedFinalStateHash,
            matchesHash: verification.value.matchesHash,
            matchesEvents: verification.value.matchesEvents,
            steps,
        },
    };
};

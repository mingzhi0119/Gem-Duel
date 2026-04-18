'use client';

import { useEffect, useState } from 'react';
import type { GameCommand, GameSnapshot, VisibleSnapshot } from '@gem-duel/contracts';
import { SnapshotSummary } from '../primitives/snapshot-summary';
import { SidecarDrawer } from './sidecar-drawer';

export interface ReplayDrawerStep {
    index: number;
    label: string;
    command: { command: GameCommand } | null;
    snapshot: GameSnapshot | VisibleSnapshot;
}

export interface ReplayDrawerModel {
    finalStateHash: string;
    recomputedFinalStateHash: string;
    matchesHash: boolean;
    matchesEvents: boolean;
    steps: ReplayDrawerStep[];
}

export const ReplayDrawer = ({ model }: { model: ReplayDrawerModel }) => {
    const [selectedStepIndex, setSelectedStepIndex] = useState(Math.max(model.steps.length - 1, 0));

    useEffect(() => {
        setSelectedStepIndex(Math.max(model.steps.length - 1, 0));
    }, [model.finalStateHash, model.steps.length]);

    const selectedStep = model.steps[selectedStepIndex] ?? model.steps[model.steps.length - 1];
    if (!selectedStep) {
        return (
            <SidecarDrawer title="Replay Inspector">
                <p className="gd-muted">No replay steps available.</p>
            </SidecarDrawer>
        );
    }

    return (
        <>
            <SidecarDrawer title="Replay Inspector">
                <div className="gd-grid">
                    <div className="gd-card">
                        <strong>Stored Hash</strong>
                        <span>{model.finalStateHash}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Recomputed Hash</strong>
                        <span>{model.recomputedFinalStateHash}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Hash Check</strong>
                        <span>{model.matchesHash ? 'match' : 'mismatch'}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Event Check</strong>
                        <span>{model.matchesEvents ? 'match' : 'mismatch'}</span>
                    </div>
                </div>
                <div className="gd-action-list">
                    {model.steps.map((step) => (
                        <button
                            key={step.index}
                            type="button"
                            className="gd-button"
                            disabled={step.index === selectedStep.index}
                            onClick={() => setSelectedStepIndex(step.index)}
                        >
                            {step.index}. {step.label}
                        </button>
                    ))}
                </div>
            </SidecarDrawer>

            <SidecarDrawer title={`Replay Step ${selectedStep.index}`}>
                <p className="gd-muted">{selectedStep.label}</p>
                <SnapshotSummary snapshot={selectedStep.snapshot} />
                <pre className="gd-card gd-code-block">
                    <code>
                        {JSON.stringify(
                            selectedStep.command?.command ?? { type: 'INITIAL_SNAPSHOT' },
                            null,
                            2
                        )}
                    </code>
                </pre>
            </SidecarDrawer>
        </>
    );
};

'use client';

import { useEffect, useState } from 'react';
import type { GameCommand, GameSnapshot, VisibleSnapshot } from '@gem-duel/contracts';
import { getUiMessages, type UiLocale } from '../i18n/messages';
import { SnapshotSummary } from '../primitives/snapshot-summary';
import { SidecarDrawer } from './sidecar-drawer';

export interface ReplayDrawerStep {
    index: number;
    label: string;
    command: { command: GameCommand } | null;
    snapshot: GameSnapshot | VisibleSnapshot;
    snapshotHash: string;
}

export interface ReplayDrawerModel {
    finalStateHash: string;
    recomputedFinalStateHash: string;
    matchesHash: boolean;
    matchesEvents: boolean;
    steps: ReplayDrawerStep[];
}

export const ReplayDrawer = ({
    model,
    locale = 'en',
    selectedStepIndex: controlledSelectedStepIndex,
    onSelectStepIndex,
}: {
    model: ReplayDrawerModel;
    locale?: UiLocale;
    selectedStepIndex?: number;
    onSelectStepIndex?: (index: number) => void;
}) => {
    const messages = getUiMessages(locale).replay;
    const [uncontrolledSelectedStepIndex, setUncontrolledSelectedStepIndex] = useState(
        Math.max(model.steps.length - 1, 0)
    );
    const selectedStepIndex = controlledSelectedStepIndex ?? uncontrolledSelectedStepIndex;
    const setSelectedStepIndex = (index: number) => {
        onSelectStepIndex?.(index);
        if (controlledSelectedStepIndex === undefined) {
            setUncontrolledSelectedStepIndex(index);
        }
    };

    useEffect(() => {
        setSelectedStepIndex(Math.max(model.steps.length - 1, 0));
    }, [model.finalStateHash, model.steps.length]);

    const selectedStep = model.steps[selectedStepIndex] ?? model.steps[model.steps.length - 1];
    if (!selectedStep) {
        return (
            <SidecarDrawer title={messages.timelineTitle}>
                <p className="gd-muted">{messages.noSteps}</p>
            </SidecarDrawer>
        );
    }

    return (
        <>
            <SidecarDrawer title={messages.timelineTitle}>
                <div className="gd-grid">
                    <div className="gd-card">
                        <strong>{messages.storedHash}</strong>
                        <span data-testid="replay-stored-hash">{model.finalStateHash}</span>
                    </div>
                    <div className="gd-card">
                        <strong>{messages.recomputedHash}</strong>
                        <span data-testid="replay-recomputed-hash">
                            {model.recomputedFinalStateHash}
                        </span>
                    </div>
                    <div className="gd-card">
                        <strong>{messages.hashCheck}</strong>
                        <span>
                            {model.matchesHash ? messages.hashMatch : messages.hashMismatch}
                        </span>
                    </div>
                    <div className="gd-card">
                        <strong>{messages.eventCheck}</strong>
                        <span>
                            {model.matchesEvents ? messages.hashMatch : messages.hashMismatch}
                        </span>
                    </div>
                    <div className="gd-card">
                        <strong>{messages.currentStepHash}</strong>
                        <span data-testid="replay-current-step-hash">
                            {selectedStep.snapshotHash}
                        </span>
                    </div>
                </div>
                <div className="gd-replay-toolbar">
                    <button
                        type="button"
                        className="gd-button gd-button-muted"
                        data-testid="replay-prev-step"
                        disabled={selectedStep.index === 0}
                        onClick={() => setSelectedStepIndex(Math.max(selectedStep.index - 1, 0))}
                    >
                        {messages.previousStep}
                    </button>
                    <button
                        type="button"
                        className="gd-button"
                        data-testid="replay-next-step"
                        disabled={selectedStep.index === model.steps.length - 1}
                        onClick={() =>
                            setSelectedStepIndex(
                                Math.min(selectedStep.index + 1, model.steps.length - 1)
                            )
                        }
                    >
                        {messages.nextStep}
                    </button>
                    <span className="gd-shell-badge" data-testid="replay-selected-step-index">
                        {messages.currentStepLabel} {selectedStep.index}
                    </span>
                </div>
                <nav
                    className="gd-action-list"
                    aria-label={messages.timelineLabel}
                    data-testid="replay-timeline"
                >
                    {model.steps.map((step) => (
                        <button
                            key={step.index}
                            type="button"
                            className="gd-button"
                            data-testid={`replay-step-${step.index}`}
                            aria-current={step.index === selectedStep.index ? 'step' : undefined}
                            disabled={step.index === selectedStep.index}
                            onClick={() => setSelectedStepIndex(step.index)}
                        >
                            {step.index}. {step.label}
                        </button>
                    ))}
                </nav>
            </SidecarDrawer>

            <SidecarDrawer title={`${messages.stepPrefix} ${selectedStep.index}`}>
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

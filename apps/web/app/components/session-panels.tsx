'use client';

import { useEffect, useState } from 'react';
import type { AiDecisionTrace, ReplayInspectorModel } from '@gem-duel/application';
import { Section, SnapshotSummary } from '@gem-duel/ui';

export function ReplayInspectorPanel({ model }: { model: ReplayInspectorModel }) {
    const [selectedStepIndex, setSelectedStepIndex] = useState(Math.max(model.steps.length - 1, 0));

    useEffect(() => {
        setSelectedStepIndex(Math.max(model.steps.length - 1, 0));
    }, [model.finalStateHash, model.steps.length]);

    const selectedStep = model.steps[selectedStepIndex] ?? model.steps[model.steps.length - 1];
    if (!selectedStep) {
        return null;
    }

    return (
        <>
            <Section title="Replay Inspector">
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
            </Section>

            <Section title={`Replay Step ${selectedStep.index}`}>
                <p className="gd-muted">{selectedStep.label}</p>
                <SnapshotSummary snapshot={selectedStep.snapshot} />
                <pre className="gd-card">
                    <code>
                        {JSON.stringify(
                            selectedStep.command?.command ?? { type: 'INITIAL_SNAPSHOT' },
                            null,
                            2
                        )}
                    </code>
                </pre>
            </Section>
        </>
    );
}

export function AiTracePanel({ traces }: { traces: AiDecisionTrace[] }) {
    if (traces.length === 0) {
        return (
            <Section title="AI Trace">
                <p className="gd-muted">
                    The AI has not made a deterministic decision in this session yet.
                </p>
            </Section>
        );
    }

    return (
        <Section title="AI Trace">
            <ol className="gd-log">
                {traces.map((trace) => (
                    <li key={`${trace.sequence}-${trace.chosenActionId}`}>
                        <strong>{trace.chosenCommandType}</strong>
                        <span>
                            {' '}
                            by {trace.player} at seq {trace.sequence} via {trace.chosenActionId}
                        </span>
                        <pre className="gd-card">
                            <code>{JSON.stringify(trace.candidates.slice(0, 5), null, 2)}</code>
                        </pre>
                    </li>
                ))}
            </ol>
        </Section>
    );
}

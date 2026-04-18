'use client';

import { useMemo, useState } from 'react';
import { createAiMatchSession, createLocalMatchSession } from '@gem-duel/application';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { AiTraceDrawer, MatchView, ReplayDrawer, Section } from '@gem-duel/ui';

import {
    createLocalPhase4ScenarioSession,
    getLocalPhase4Scenario,
    type LocalPhase4ScenarioId,
} from '../local/scenarios';

export function MatchPlayground({
    mode,
    seed,
    aiEnabled,
    roguelike = true,
    shellMode = 'default',
    scenarioId = null,
}: {
    mode: 'local' | 'ai';
    seed: number;
    aiEnabled: boolean;
    roguelike?: boolean;
    shellMode?: 'default' | 'debug';
    scenarioId?: LocalPhase4ScenarioId | null;
}) {
    const scenario = scenarioId ? getLocalPhase4Scenario(scenarioId) : null;
    const sessionResult = useMemo(() => {
        const flags = {
            roguelike,
            onlineAuthoritative: false,
            aiEnabled,
        };

        if (mode === 'local' && scenarioId) {
            return createLocalPhase4ScenarioSession(scenarioId);
        }

        return mode === 'ai'
            ? createAiMatchSession({ seed, flags })
            : createLocalMatchSession({ seed, flags });
    }, [aiEnabled, mode, roguelike, scenarioId, seed]);
    const [, setRefreshKey] = useState(0);
    const [error, setError] = useState<string | null>(
        sessionResult.ok ? null : sessionResult.error.message
    );

    if (!sessionResult.ok) {
        return (
            <Section title={`Interactive ${mode.toUpperCase()} Session`}>
                <p>
                    {sessionResult.ok
                        ? 'Session initialization failed.'
                        : sessionResult.error.message}
                </p>
            </Section>
        );
    }

    const session = sessionResult.value;
    const viewModel = session.viewModel();
    const replayInspector = session.replayInspector();
    const aiTrace = session.aiTrace();

    const handleAction = (action: UiActionDescriptor) => {
        const result = session.dispatch(action.command);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setRefreshKey((value) => value + 1);
    };

    return (
        <>
            <MatchView
                viewModel={viewModel}
                onSelect={handleAction}
                error={error}
                note={
                    <>
                        <p className="gd-muted">
                            ZH: 这是应用层 session 直接驱动核心引擎的最小闭环。 EN: This is the
                            minimal vertical slice from the application layer to the deterministic
                            core engine.
                        </p>
                        {scenario ? (
                            <div className="gd-muted">
                                <p>
                                    Scenario:{' '}
                                    <strong data-testid="phase4-scenario-id">{scenario.id}</strong>
                                </p>
                                <p>Fixture Source: {scenario.startingFixtureSource}</p>
                                <p>
                                    Expected finalStateHash:{' '}
                                    <span data-testid="phase4-expected-hash">
                                        {scenario.expectedFinalStateHash}
                                    </span>
                                </p>
                            </div>
                        ) : null}
                        {shellMode === 'debug' ? (
                            <p className="gd-muted" data-testid="phase4-shell-mode">
                                Debug shell fallback is active for this local route.
                            </p>
                        ) : null}
                    </>
                }
            />
            {replayInspector.ok ? <ReplayDrawer model={replayInspector.value} /> : null}
            {mode === 'ai' ? <AiTraceDrawer traces={aiTrace} /> : null}
        </>
    );
}

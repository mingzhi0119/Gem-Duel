'use client';

import { useMemo, useState } from 'react';
import { createAiMatchSession, createLocalMatchSession } from '@gem-duel/application';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { AiTraceDrawer, MatchView, ReplayDrawer, Section } from '@gem-duel/ui';

export function MatchPlayground({
    mode,
    seed,
    aiEnabled,
}: {
    mode: 'local' | 'ai';
    seed: number;
    aiEnabled: boolean;
}) {
    const sessionResult = useMemo(() => {
        const flags = {
            roguelike: true,
            onlineAuthoritative: false,
            aiEnabled,
        };

        return mode === 'ai'
            ? createAiMatchSession({ seed, flags })
            : createLocalMatchSession({ seed, flags });
    }, [aiEnabled, mode, seed]);
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
                    <p className="gd-muted">
                        ZH: 这是应用层 session 直接驱动核心引擎的最小闭环。 EN: This is the minimal
                        vertical slice from the application layer to the deterministic core engine.
                    </p>
                }
            />
            {replayInspector.ok ? <ReplayDrawer model={replayInspector.value} /> : null}
            {mode === 'ai' ? <AiTraceDrawer traces={aiTrace} /> : null}
        </>
    );
}

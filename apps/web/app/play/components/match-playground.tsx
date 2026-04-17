'use client';

import { useMemo, useState } from 'react';
import { createAiMatchSession, createLocalMatchSession } from '@gem-duel/application';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { MatchView, Section } from '@gem-duel/ui';

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
    const [snapshot, setSnapshot] = useState(
        sessionResult.ok ? sessionResult.value.viewModel() : null
    );
    const [error, setError] = useState<string | null>(
        sessionResult.ok ? null : sessionResult.error.message
    );

    if (!sessionResult.ok || !snapshot) {
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

    const handleAction = (action: UiActionDescriptor) => {
        const result = session.dispatch(action.command);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setSnapshot(session.viewModel());
    };

    return (
        <MatchView
            viewModel={snapshot}
            onSelect={handleAction}
            error={error}
            note={
                <p className="gd-muted">
                    ZH: 这是应用层 session 直接驱动核心引擎的最小闭环。 EN: This is the minimal
                    vertical slice from the application layer to the deterministic core engine.
                </p>
            }
        />
    );
}

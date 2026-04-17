'use client';

import { useMemo, useState } from 'react';
import { createMatchSession } from '@gem-duel/application';
import { createEnginePorts } from '@gem-duel/adapters';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { ActionList, Section, SnapshotSummary } from '@gem-duel/ui';

export function MatchPlayground({
    mode,
    seed,
    aiEnabled,
}: {
    mode: 'local' | 'ai';
    seed: number;
    aiEnabled: boolean;
}) {
    const sessionResult = useMemo(
        () =>
            createMatchSession(
                {
                    seed,
                    mode,
                    flags: {
                        roguelike: true,
                        onlineAuthoritative: false,
                        aiEnabled,
                    },
                },
                createEnginePorts(seed)
            ),
        [aiEnabled, mode, seed]
    );
    const [snapshot, setSnapshot] = useState(
        sessionResult.ok ? sessionResult.value.snapshot() : null
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
        setSnapshot(result.value);
    };

    return (
        <>
            <Section title={`Interactive ${mode.toUpperCase()} Session`}>
                <p className="gd-muted">
                    ZH: 这是应用层 session 直接驱动核心引擎的最小闭环。 EN: This is the minimal
                    vertical slice from the application layer to the deterministic core engine.
                </p>
                {error && <p>{error}</p>}
                <SnapshotSummary snapshot={snapshot} />
            </Section>

            <Section title="Available Actions">
                <ActionList
                    actions={session.viewModel().availableActions}
                    onSelect={handleAction}
                />
            </Section>

            <Section title="Event Log">
                <ol className="gd-log">
                    {snapshot.eventLog.map((event, index) => (
                        <li key={`${event.type}-${index}`}>
                            <code>{event.type}</code>
                        </li>
                    ))}
                </ol>
            </Section>
        </>
    );
}

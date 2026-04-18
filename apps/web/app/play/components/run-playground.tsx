'use client';

import { useMemo, useState } from 'react';
import { createRunSession } from '@gem-duel/application';
import type { BuffId, RunState, UiActionDescriptor } from '@gem-duel/contracts';
import { AiTraceDrawer, MatchView, ReplayDrawer, Section } from '@gem-duel/ui';

const describeRunStatus = (runState: RunState) => {
    switch (runState.status) {
        case 'draft':
            return 'Pick one starter Buff to begin the run.';
        case 'active':
            return runState.currentOffer
                ? 'Victory reward ready. Pick one Buff to start the next match.'
                : 'Run is active.';
        case 'won':
            return 'Run complete. Three victories reached the Step 07 finish line.';
        case 'lost':
            return 'Run ended after the first loss.';
    }
};

export function RunPlayground({ seed, mode }: { seed: number; mode: 'local' | 'ai' }) {
    const sessionResult = useMemo(() => createRunSession({ seed, mode }), [mode, seed]);
    const [, setRefreshKey] = useState(0);
    const [error, setError] = useState<string | null>(
        sessionResult.ok ? null : sessionResult.error.message
    );

    if (!sessionResult.ok) {
        return (
            <Section title="Roguelike Run">
                <p>{sessionResult.error.message}</p>
            </Section>
        );
    }

    const session = sessionResult.value;
    const runState = session.state();
    const viewModel = session.viewModel();
    const replayInspector = session.replayInspector();

    const handleAction = (action: UiActionDescriptor) => {
        const result = session.dispatch(action.command);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setRefreshKey((value) => value + 1);
    };

    const handleRewardSelection = (buffId: BuffId) => {
        const result = session.selectReward(buffId);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setRefreshKey((value) => value + 1);
    };

    return (
        <>
            <Section title="Roguelike Run">
                <p className="gd-muted">
                    ZH: Step 07 先做 3 胜 1 负的最小 Roguelike 闭环。 EN: Step 07 ships a minimal 3
                    wins / 1 loss roguelike loop with deterministic Buff draft, match replay, and
                    local AI support.
                </p>
                {error ? <p className="gd-error">{error}</p> : null}
                <div className="gd-grid">
                    <div className="gd-card">
                        <strong>Status</strong>
                        <span>{runState.status}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Record</strong>
                        <span>
                            {runState.wins}W / {runState.losses}L
                        </span>
                    </div>
                    <div className="gd-card">
                        <strong>Match Index</strong>
                        <span>{runState.matchIndex}</span>
                    </div>
                    <div className="gd-card">
                        <strong>Owned Buffs</strong>
                        <span>
                            {runState.ownedBuffs.map((buff) => buff.id).join(', ') || 'none yet'}
                        </span>
                    </div>
                </div>
                <p className="gd-muted">{describeRunStatus(runState)}</p>
            </Section>

            {runState.currentOffer ? (
                <Section title="Buff Draft">
                    <p className="gd-muted">
                        Offer {runState.currentOffer.offerId} from {runState.currentOffer.source}
                    </p>
                    <div className="gd-action-list">
                        {runState.currentOffer.options.map((buffId) => (
                            <button
                                key={buffId}
                                type="button"
                                className="gd-button"
                                onClick={() => handleRewardSelection(buffId)}
                            >
                                {buffId}
                            </button>
                        ))}
                    </div>
                </Section>
            ) : null}

            {viewModel ? (
                <MatchView
                    viewModel={viewModel}
                    onSelect={handleAction}
                    error={error}
                    note={
                        <p className="gd-muted">
                            ZH: 当前 run 内的单局 replay 仍保持 match-scoped。 EN: Each run match
                            still produces a match-scoped replay bundle with `runContext` carried
                            inside the snapshot.
                        </p>
                    }
                />
            ) : null}

            {replayInspector?.ok ? <ReplayDrawer model={replayInspector.value} /> : null}
            {mode === 'ai' ? <AiTraceDrawer traces={session.aiTrace()} /> : null}
        </>
    );
}

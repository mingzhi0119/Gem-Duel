'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { createRunSession } from '@gem-duel/application';
import type { BuffId, RunState, UiActionDescriptor } from '@gem-duel/contracts';
import { Section, SidecarDrawer } from '@gem-duel/ui';

import { SessionBoardShell } from './session-board-shell';

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
    const replay = session.replay();
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

    const handleRewardSelection = (buffId: BuffId) => {
        const result = session.selectReward(buffId);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setRefreshKey((value) => value + 1);
    };

    const renderRunStatus = () => (
        <div className="gd-grid" data-testid="run-status-sidecar">
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
                <span>{runState.ownedBuffs.map((buff) => buff.id).join(', ') || 'none yet'}</span>
            </div>
            <p className="gd-muted">{describeRunStatus(runState)}</p>
        </div>
    );

    const renderDraftActions = (): ReactNode =>
        runState.currentOffer ? (
            <div data-testid="run-draft-sidecar">
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
            </div>
        ) : null;

    if (!viewModel || !replay?.finalStateHash) {
        return (
            <>
                <Section title="Roguelike Run">
                    <p className="gd-muted">
                        ZH: Step 07 先做 3 胜 1 负的最小 Roguelike 闭环。 EN: Step 07 ships a
                        minimal 3 wins / 1 loss roguelike loop with deterministic Buff draft, match
                        replay, and local AI support.
                    </p>
                    {error ? <p className="gd-error">{error}</p> : null}
                    {renderRunStatus()}
                </Section>

                {runState.currentOffer ? (
                    <Section title="Buff Draft">{renderDraftActions()}</Section>
                ) : null}
            </>
        );
    }

    return (
        <SessionBoardShell
            eyebrow="Roguelike Run"
            viewModel={viewModel}
            currentFinalStateHash={replay.finalStateHash}
            onSelect={handleAction}
            replayInspector={replayInspector?.ok ? replayInspector.value : null}
            aiTrace={mode === 'ai' ? aiTrace : null}
            boardNote={
                <p className="gd-muted">
                    ZH: `/play/run` 现与 classic-local 共用同一主盘面；run 的进度与 Buff draft
                    只保留在侧栏。 EN: `/play/run` now shares the same main board as classic local,
                    with run progression and Buff draft kept in sidecars only.
                </p>
            }
            extraSidecars={
                <>
                    <SidecarDrawer
                        title="Run Status"
                        mode="drawer"
                        triggerSummary={`${runState.status} • ${runState.matchIndex}`}
                        triggerBadge={
                            <span className="gd-shell-badge">
                                {runState.wins}W / {runState.losses}L
                            </span>
                        }
                        triggerTestId="run-status-drawer-trigger"
                        panelTestId="run-status-drawer"
                    >
                        {renderRunStatus()}
                    </SidecarDrawer>
                    {runState.currentOffer ? (
                        <SidecarDrawer
                            title="Buff Draft"
                            mode="drawer"
                            triggerSummary={`Offer ${runState.currentOffer.offerId}`}
                            triggerBadge={
                                <span className="gd-shell-badge">
                                    {runState.currentOffer.options.length}
                                </span>
                            }
                            triggerTestId="run-draft-drawer-trigger"
                            panelTestId="run-draft-drawer"
                        >
                            {renderDraftActions()}
                        </SidecarDrawer>
                    ) : null}
                </>
            }
            error={error}
        />
    );
}

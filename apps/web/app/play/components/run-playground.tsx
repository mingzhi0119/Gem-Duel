'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { createRunSession } from '@gem-duel/application';
import type { BuffId, RunState, UiActionDescriptor } from '@gem-duel/contracts';
import {
    DraftChoiceScene,
    Section,
    SidecarDrawer,
    getUiMessages,
    type UiLocale,
} from '@gem-duel/ui';

import { ProductBackLink } from '@/app/components/product-back-link';
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

export function RunPlayground({
    seed,
    mode,
    locale = 'en',
}: {
    seed: number;
    mode: 'local' | 'ai';
    locale?: UiLocale;
}) {
    const messages = getUiMessages(locale);
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

    const renderDraftActions = (): ReactNode => {
        const offer = runState.currentOffer;

        return offer ? (
            <div className="gd-draft-choice-grid" data-testid="run-draft-sidecar">
                {offer.options.map((buffId) => (
                    <article key={buffId} className="gd-draft-choice-card">
                        <button
                            type="button"
                            className="gd-draft-choice-card-button"
                            onClick={() => handleRewardSelection(buffId)}
                        >
                            <div className="gd-draft-choice-card-head">
                                <div className="gd-draft-choice-card-copy">
                                    <h2>{formatBuffLabel(buffId)}</h2>
                                    <p>{messages.runDraft.selectHint}</p>
                                </div>
                                <span className="gd-player-entry-card-badge">{offer.source}</span>
                            </div>
                            <div className="gd-draft-choice-card-body">
                                <div className="gd-draft-choice-card-stats">
                                    <div className="gd-draft-choice-stat">
                                        <span className="gd-draft-choice-stat-label">
                                            {messages.runDraft.recordLabel}
                                        </span>
                                        <span className="gd-draft-choice-stat-value">
                                            {runState.wins}W / {runState.losses}L
                                        </span>
                                    </div>
                                    <div className="gd-draft-choice-stat">
                                        <span className="gd-draft-choice-stat-label">
                                            {messages.runDraft.matchLabel}
                                        </span>
                                        <span className="gd-draft-choice-stat-value">
                                            {runState.matchIndex}
                                        </span>
                                    </div>
                                </div>
                                <div className="gd-draft-choice-card-meta">
                                    <span className="gd-product-status-strip">
                                        Offer {offer.offerId}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </article>
                ))}
            </div>
        ) : null;
    };

    if (!viewModel || !replay?.finalStateHash) {
        if (runState.currentOffer) {
            const isStarterDraft = runState.status === 'draft';
            const backHref = locale === 'zh' ? '/play/roguelike?lang=zh' : '/play/roguelike';

            return (
                <DraftChoiceScene
                    eyebrow={messages.runDraft.eyebrow}
                    title={
                        isStarterDraft
                            ? messages.runDraft.starterTitle
                            : messages.runDraft.rewardTitle
                    }
                    subtitle={
                        <p>
                            {isStarterDraft
                                ? messages.runDraft.starterNote
                                : messages.runDraft.rewardNote}
                        </p>
                    }
                    toolbar={
                        <ProductBackLink href={backHref}>
                            {messages.playerEntry.backHomeLabel}
                        </ProductBackLink>
                    }
                    status={
                        <>
                            <span className="gd-draft-choice-status-pill">
                                {isStarterDraft
                                    ? messages.runDraft.draftPhaseLabel
                                    : messages.runDraft.rewardPhaseLabel}
                            </span>
                            <span className="gd-draft-choice-status-pill">
                                {messages.runDraft.modeLabel}:{' '}
                                {mode === 'local'
                                    ? messages.runDraft.modeLocal
                                    : messages.runDraft.modeAi}
                            </span>
                            <span className="gd-draft-choice-status-pill">
                                {messages.runDraft.recordLabel}: {runState.wins}W /{' '}
                                {runState.losses}L
                            </span>
                        </>
                    }
                    footer={
                        <span>
                            {messages.runDraft.matchLabel} {runState.matchIndex} •{' '}
                            {messages.runDraft.selectHint}
                        </span>
                    }
                >
                    {renderDraftActions()}
                </DraftChoiceScene>
            );
        }

        return (
            <div className="gd-utility-route">
                <Section title="Roguelike Run">
                    <p className="gd-muted">
                        ZH: Step 07 先做 3 胜 1 负的最小 Roguelike 闭环。 EN: Step 07 ships a
                        minimal 3 wins / 1 loss roguelike loop with deterministic Buff draft, match
                        replay, and local AI support.
                    </p>
                    {error ? <p className="gd-error">{error}</p> : null}
                    {renderRunStatus()}
                </Section>
            </div>
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
                    ZH: 每场对局仍使用同一张主盘面，Run 进度与 Buff 选择通过侧栏继续推进。 EN: Each
                    match still plays on the shared board, while run progress and buff choices
                    continue through the sidecars.
                </p>
            }
            routeTopbar={
                <ProductBackLink
                    href={locale === 'zh' ? '/play/roguelike?lang=zh' : '/play/roguelike'}
                >
                    {messages.playerEntry.backHomeLabel}
                </ProductBackLink>
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
            locale={locale}
        />
    );
}

const formatBuffLabel = (buffId: BuffId) =>
    buffId
        .split('-')
        .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`)
        .join(' ');

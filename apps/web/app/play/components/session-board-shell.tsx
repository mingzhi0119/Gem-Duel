'use client';

import type { ReactNode } from 'react';
import type { AiDecisionTrace, ReplayInspectorModel } from '@gem-duel/application';
import type { UiActionDescriptor, UiViewModel } from '@gem-duel/contracts';
import type { UiLocale } from '@gem-duel/ui';
import type { BoardSceneScenarioMeta } from '@gem-duel/ui';
import { AiTraceDrawer, BoardScene, MatchView, ReplayDrawer } from '@gem-duel/ui';
import { SessionRail } from '@/app/components/session-rail';

export function SessionBoardShell({
    eyebrow,
    viewModel,
    currentFinalStateHash,
    onSelect,
    replayInspector,
    aiTrace = null,
    shellMode = 'default',
    scenarioMeta = null,
    boardNote,
    legacyShellNote,
    extraSidecars = null,
    error = null,
    locale = 'en',
}: {
    eyebrow: string;
    viewModel: UiViewModel;
    currentFinalStateHash: string;
    onSelect: (action: UiActionDescriptor) => void;
    replayInspector: ReplayInspectorModel | null;
    aiTrace?: AiDecisionTrace[] | null;
    shellMode?: 'default' | 'debug';
    scenarioMeta?: BoardSceneScenarioMeta | null;
    boardNote?: ReactNode;
    legacyShellNote?: ReactNode;
    extraSidecars?: ReactNode;
    error?: string | null;
    locale?: UiLocale;
}) {
    const sessionSurface =
        shellMode === 'default' ? (
            <BoardScene
                eyebrow={eyebrow}
                viewModel={viewModel}
                currentFinalStateHash={currentFinalStateHash}
                scenarioMeta={scenarioMeta}
                onSelect={onSelect}
                error={error}
                note={boardNote}
                extraSidecars={extraSidecars}
                locale={locale}
                railLead={
                    <SessionRail
                        locale={locale}
                        surface="play"
                        sessionStatus={viewModel.sessionStatus}
                        viewerRole={viewModel.viewerRole}
                        currentFinalStateHash={currentFinalStateHash}
                        hashUnavailableLabel="Live hash unavailable"
                    />
                }
            />
        ) : (
            <MatchView
                viewModel={viewModel}
                onSelect={onSelect}
                error={error}
                note={legacyShellNote ?? boardNote}
            />
        );

    return (
        <>
            {sessionSurface}
            {replayInspector ? <ReplayDrawer model={replayInspector} locale={locale} /> : null}
            {aiTrace ? <AiTraceDrawer traces={aiTrace} locale={locale} /> : null}
        </>
    );
}

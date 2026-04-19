'use client';

import { useEffect, type ReactNode } from 'react';
import type { AiDecisionTrace, ReplayInspectorModel } from '@gem-duel/application';
import type { UiActionDescriptor, UiViewModel } from '@gem-duel/contracts';
import type { UiLocale } from '@gem-duel/ui';
import type { BoardSceneScenarioMeta } from '@gem-duel/ui';
import { AiTraceDrawer, BoardScene, MatchView, ReplayDrawer, getUiMessages } from '@gem-duel/ui';
import {
    ActiveMatchShellFrame,
    MatchSurfaceInteractionProvider,
    useMatchSurfaceInteraction,
} from '@/app/components/active-match-shell';
import { SessionRail } from '@/app/components/session-rail';

function SessionBoardShellSurface({
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
    routeTopbar = null,
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
    routeTopbar?: ReactNode;
}) {
    const interactions = useMatchSurfaceInteraction();
    const messages = getUiMessages(locale);

    useEffect(() => {
        if (error) {
            interactions.announceMessage(error);
        }
    }, [error, interactions]);

    const handleSelect = (action: UiActionDescriptor) => {
        interactions.announceAction(action);
        onSelect(action);
    };

    const sharedExtraSidecars = (
        <>
            {extraSidecars}
            {replayInspector ? <ReplayDrawer model={replayInspector} locale={locale} /> : null}
            {aiTrace ? <AiTraceDrawer traces={aiTrace} locale={locale} /> : null}
        </>
    );
    const sessionSurface =
        shellMode === 'default' ? (
            <BoardScene
                eyebrow={eyebrow}
                viewModel={viewModel}
                currentFinalStateHash={currentFinalStateHash}
                scenarioMeta={scenarioMeta}
                onSelect={handleSelect}
                error={error}
                note={boardNote}
                extraSidecars={sharedExtraSidecars}
                locale={locale}
                railLead={
                    <SessionRail
                        locale={locale}
                        surface="play"
                        sessionStatus={viewModel.sessionStatus}
                        viewerRole={viewModel.viewerRole}
                        currentFinalStateHash={currentFinalStateHash}
                        hashUnavailableLabel={messages.sessionRail.hashUnavailableLabel}
                        presentation="inline"
                    />
                }
            />
        ) : (
            <MatchView
                viewModel={viewModel}
                onSelect={handleSelect}
                error={error}
                note={legacyShellNote ?? boardNote}
            />
        );

    return (
        <ActiveMatchShellFrame
            surface="play"
            routeTopbar={shellMode === 'debug' ? routeTopbar : null}
        >
            {sessionSurface}
        </ActiveMatchShellFrame>
    );
}

export function SessionBoardShell(props: {
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
    routeTopbar?: ReactNode;
}) {
    return (
        <MatchSurfaceInteractionProvider surface="play">
            <SessionBoardShellSurface {...props} />
        </MatchSurfaceInteractionProvider>
    );
}

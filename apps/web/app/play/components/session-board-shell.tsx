'use client';

import type { ReactNode } from 'react';
import type { AiDecisionTrace, ReplayInspectorModel } from '@gem-duel/application';
import type { UiActionDescriptor, UiViewModel } from '@gem-duel/contracts';
import type { BoardSceneScenarioMeta } from '@gem-duel/ui';
import { AiTraceDrawer, BoardScene, MatchView, ReplayDrawer } from '@gem-duel/ui';

export function SessionBoardShell({
    eyebrow,
    viewModel,
    currentFinalStateHash,
    onSelect,
    replayInspector,
    aiTrace = [],
    shellMode = 'default',
    scenarioMeta = null,
    boardNote,
    legacyShellNote,
    extraSidecars = null,
    error = null,
}: {
    eyebrow: string;
    viewModel: UiViewModel;
    currentFinalStateHash: string;
    onSelect: (action: UiActionDescriptor) => void;
    replayInspector: ReplayInspectorModel | null;
    aiTrace?: AiDecisionTrace[];
    shellMode?: 'default' | 'debug';
    scenarioMeta?: BoardSceneScenarioMeta | null;
    boardNote?: ReactNode;
    legacyShellNote?: ReactNode;
    extraSidecars?: ReactNode;
    error?: string | null;
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
            {replayInspector ? <ReplayDrawer model={replayInspector} /> : null}
            {aiTrace.length > 0 ? <AiTraceDrawer traces={aiTrace} /> : null}
        </>
    );
}

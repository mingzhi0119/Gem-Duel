import type { ReactNode } from 'react';
import type { UiActionDescriptor, UiViewModel } from '@gem-duel/contracts';
import { BoardSceneScaffold } from '../board/board-scaffold';
import { SidecarDrawer } from '../drawer/sidecar-drawer';
import { TurnHud } from '../hud/turn-hud';
import { MatchView } from '../views/match-view';

export const PlaygroundSceneFrame = ({
    eyebrow,
    title,
    description,
    viewModel,
    note,
    sidecarTitle = 'Scene Notes',
    sidecar,
    extraPanels,
    onSelect,
}: {
    eyebrow: string;
    title: string;
    description: ReactNode;
    viewModel: UiViewModel;
    note?: ReactNode;
    sidecarTitle?: string;
    sidecar?: ReactNode;
    extraPanels?: ReactNode;
    onSelect?: (action: UiActionDescriptor) => void;
}) => (
    <section className="gd-scene-frame" data-testid="playground-scene">
        <header className="gd-scene-frame-header">
            <div>
                <p className="gd-scene-eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
                <div className="gd-muted">{description}</div>
            </div>
            <div className="gd-scene-badge-group">
                <span className="gd-shell-badge">{viewModel.sessionStatus}</span>
                <span className="gd-shell-badge">{viewModel.viewerRole}</span>
            </div>
        </header>

        <div className="gd-scene-layout">
            <div className="gd-scene-stack">
                <MatchView
                    viewModel={viewModel}
                    onSelect={onSelect}
                    emptyActionLabel="Static fixture scene"
                    note={note}
                />
                <BoardSceneScaffold viewModel={viewModel} />
            </div>

            <div className="gd-scene-stack">
                <SidecarDrawer title="Turn HUD">
                    <TurnHud viewModel={viewModel} />
                </SidecarDrawer>
                {sidecar ? <SidecarDrawer title={sidecarTitle}>{sidecar}</SidecarDrawer> : null}
                {extraPanels}
            </div>
        </div>
    </section>
);

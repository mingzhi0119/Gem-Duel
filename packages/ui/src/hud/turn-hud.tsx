import type { UiViewModel } from '@gem-duel/contracts';

export const TurnHud = ({ viewModel }: { viewModel: UiViewModel }) => (
    <div className="gd-turn-hud">
        <span>Viewer: {viewModel.viewerRole}</span>
        <span>Seat: {viewModel.seat ?? 'spectator'}</span>
        <span>Phase: {viewModel.snapshot.context.phase}</span>
        <span>Current: {viewModel.snapshot.context.currentPlayer}</span>
    </div>
);

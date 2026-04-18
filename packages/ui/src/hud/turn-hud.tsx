import type { UiPlayerZone, UiViewModel } from '@gem-duel/contracts';

const formatSeatName = (playerId: UiPlayerZone['playerId']) => playerId.toUpperCase();

const getInventoryTotal = (zone: UiPlayerZone) =>
    Object.values(zone.inventory).reduce((sum, count) => sum + count, 0);

const getSeatStatus = (zone: UiPlayerZone, viewerRole: UiViewModel['viewerRole']) => {
    if (viewerRole === 'spectator') {
        return zone.isCurrentPlayer ? 'current table lead' : 'spectator read-only';
    }
    if (zone.isViewer && zone.isCurrentPlayer) {
        return 'viewer seat • on move';
    }
    if (zone.isViewer) {
        return 'viewer seat • waiting';
    }
    if (zone.isCurrentPlayer) {
        return 'opponent on move';
    }
    return 'opponent waiting';
};

const getActionCounter = (viewModel: UiViewModel) => {
    const viewerZone = viewModel.playerZones.find((zone) => zone.isViewer) ?? null;
    const current = viewerZone?.actionableSeat ? 1 : 0;

    if (viewModel.viewerRole === 'spectator' || viewModel.sessionStatus === 'replay') {
        return {
            current,
            total: 1,
            note: 'Read-only observer',
        };
    }

    if (!viewerZone) {
        return {
            current,
            total: 1,
            note: 'Read-only session',
        };
    }

    if (!viewerZone.isCurrentPlayer) {
        return {
            current,
            total: 1,
            note: 'Waiting for active seat',
        };
    }

    if (viewModel.selectionDraft?.remainingSelections != null) {
        return {
            current,
            total: 1,
            note: `${viewModel.selectionDraft.remainingSelections} picks left`,
        };
    }

    if (viewModel.promptStack[0]?.remainingSelections != null) {
        return {
            current,
            total: 1,
            note: `${viewModel.promptStack[0].remainingSelections} prompt choices left`,
        };
    }

    if (!viewModel.snapshot.context.turn.mandatoryActionTaken) {
        return {
            current,
            total: 1,
            note: 'Main action available',
        };
    }

    if (viewModel.snapshot.context.turn.optionalStep !== 'done') {
        return {
            current,
            total: 1,
            note: `Optional ${viewModel.snapshot.context.turn.optionalStep} window`,
        };
    }

    return {
        current,
        total: 1,
        note: 'Turn settled',
    };
};

const TurnSeat = ({
    zone,
    viewerRole,
}: {
    zone: UiPlayerZone;
    viewerRole: UiViewModel['viewerRole'];
}) => (
    <article
        className={[
            'gd-turn-seat',
            zone.isCurrentPlayer ? 'is-current' : '',
            zone.isViewer ? 'is-viewer' : '',
            zone.actionableSeat ? 'is-actionable' : '',
        ]
            .filter(Boolean)
            .join(' ')}
        data-testid={`turn-seat-${zone.playerId}`}
    >
        <div className="gd-turn-seat-header">
            <div className="gd-seat-avatar" aria-hidden="true">
                {formatSeatName(zone.playerId)}
            </div>

            <div className="gd-turn-seat-copy">
                <div className="gd-turn-seat-title-row">
                    <strong>{formatSeatName(zone.playerId)}</strong>
                    {zone.isViewer ? <span className="gd-shell-badge">viewer</span> : null}
                    {zone.isCurrentPlayer ? <span className="gd-shell-badge">turn</span> : null}
                </div>
                <p className="gd-muted">{getSeatStatus(zone, viewerRole)}</p>
            </div>
        </div>

        <div className="gd-turn-seat-metrics">
            <div className="gd-turn-seat-stat">
                <span className="gd-turn-seat-stat-label">VP</span>
                <strong className="gd-turn-seat-stat-value">{zone.score}</strong>
            </div>
            <div className="gd-turn-seat-stat">
                <span className="gd-turn-seat-stat-label">Crowns</span>
                <strong className="gd-turn-seat-stat-value">{zone.crowns}</strong>
            </div>
            <div className="gd-turn-seat-stat">
                <span className="gd-turn-seat-stat-label">Tokens</span>
                <strong className="gd-turn-seat-stat-value">{getInventoryTotal(zone)}</strong>
            </div>
        </div>
    </article>
);

export const TurnHud = ({ viewModel }: { viewModel: UiViewModel }) => {
    const zones = viewModel.playerZones;
    const leftSeat = zones[0] ?? null;
    const rightSeat = zones[1] ?? null;
    const actionCounter = getActionCounter(viewModel);

    return (
        <div className="gd-turn-hud" data-testid="turn-hud">
            {leftSeat ? <TurnSeat zone={leftSeat} viewerRole={viewModel.viewerRole} /> : null}

            <div className="gd-turn-center">
                <span className="gd-turn-center-kicker">
                    Turn {viewModel.snapshot.context.turn.turnNumber}
                </span>
                <strong className="gd-turn-center-player">
                    {formatSeatName(viewModel.snapshot.context.currentPlayer)} on move
                </strong>
                <span className="gd-turn-center-phase">
                    {viewModel.snapshot.context.phase} • {viewModel.snapshot.context.turn.segment}
                </span>
            </div>

            {rightSeat ? <TurnSeat zone={rightSeat} viewerRole={viewModel.viewerRole} /> : null}

            <div className="gd-action-counter" data-testid="turn-hud-action-counter">
                <span className="gd-action-counter-label">Action</span>
                <div className="gd-action-counter-values" aria-label="Action counter">
                    <strong className="gd-action-counter-current">{actionCounter.current}</strong>
                    <span className="gd-action-counter-divider">/</span>
                    <span className="gd-action-counter-total">{actionCounter.total}</span>
                </div>
                <span className="gd-action-counter-note">{actionCounter.note}</span>
            </div>
        </div>
    );
};

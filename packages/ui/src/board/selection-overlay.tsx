import type { UiSelectionDraft } from '@gem-duel/contracts';

export const SelectionOverlay = ({
    selectionDraft,
}: {
    selectionDraft: UiSelectionDraft | null;
}) =>
    selectionDraft ? (
        <div className="gd-selection-overlay">
            <div className="gd-card-slot-meta">
                <strong>{selectionDraft.commandType}</strong>
                <span className="gd-card-slot-status">{selectionDraft.model}</span>
            </div>
            <span>
                {selectionDraft.selectedBoardPositions.length} selected
                {selectionDraft.remainingSelections !== null
                    ? ` • ${selectionDraft.remainingSelections} remaining`
                    : ''}
            </span>
            {selectionDraft.selectedBoardPositions.length > 0 ? (
                <div className="gd-chip-row">
                    {selectionDraft.selectedBoardPositions.map((positionId) => (
                        <span key={positionId} className="gd-chip">
                            {positionId}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    ) : (
        <p className="gd-muted">No active selection draft.</p>
    );

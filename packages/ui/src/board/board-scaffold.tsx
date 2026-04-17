import type { UiViewModel } from '@gem-duel/contracts';

export const BoardSceneScaffold = ({ viewModel }: { viewModel: UiViewModel }) => (
    <section className="gd-board-scaffold">
        <div className="gd-board-header">
            <div>
                <strong>Board Scaffold</strong>
                <p className="gd-muted">
                    Phase 2.5 static scene fed only by `UiViewModel` fixture/projection data.
                </p>
            </div>
            <span className="gd-shell-badge">{viewModel.sessionStatus}</span>
        </div>
        <div className="gd-board-grid" aria-label="Board scaffold">
            {viewModel.boardCells.map((cell) => {
                const stateClass = cell.selected
                    ? 'gd-board-cell is-selected'
                    : cell.selectable
                      ? 'gd-board-cell is-selectable'
                      : 'gd-board-cell';
                return (
                    <div key={cell.positionId} className={stateClass}>
                        <span className="gd-board-pos">{cell.positionId}</span>
                        <strong>{cell.token ?? 'empty'}</strong>
                        <span>{cell.selectionKind ?? 'idle'}</span>
                    </div>
                );
            })}
        </div>
    </section>
);

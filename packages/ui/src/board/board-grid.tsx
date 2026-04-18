import type { UiBoardCell } from '@gem-duel/contracts';
import { TokenCell } from './token-cell';

export const BoardGrid = ({
    cells,
    label = 'Board grid',
    onSelectCell,
    isCellDisabled,
}: {
    cells: UiBoardCell[];
    label?: string;
    onSelectCell?: (cell: UiBoardCell) => void;
    isCellDisabled?: (cell: UiBoardCell) => boolean;
}) =>
    cells.length > 0 ? (
        <div className="gd-board-grid" aria-label={label}>
            {cells.map((cell) => (
                <TokenCell
                    key={cell.positionId}
                    cell={cell}
                    onSelect={onSelectCell}
                    disabled={isCellDisabled?.(cell) ?? false}
                />
            ))}
        </div>
    ) : (
        <p className="gd-muted">No board cells in this scene.</p>
    );

import type { UiBoardCell } from '@gem-duel/contracts';
import { TokenCell } from './token-cell';

export const BoardGrid = ({
    cells,
    label = 'Board grid',
}: {
    cells: UiBoardCell[];
    label?: string;
}) =>
    cells.length > 0 ? (
        <div className="gd-board-grid" aria-label={label}>
            {cells.map((cell) => (
                <TokenCell key={cell.positionId} cell={cell} />
            ))}
        </div>
    ) : (
        <p className="gd-muted">No board cells in this scene.</p>
    );

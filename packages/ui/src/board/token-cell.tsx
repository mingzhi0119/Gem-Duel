import type { UiBoardCell } from '@gem-duel/contracts';

const tokenClassByColor = {
    blue: 'is-blue',
    white: 'is-white',
    green: 'is-green',
    black: 'is-black',
    red: 'is-red',
    pearl: 'is-pearl',
    gold: 'is-gold',
} as const;

export const TokenCell = ({ cell }: { cell: UiBoardCell }) => {
    const tokenClass = cell.token ? tokenClassByColor[cell.token] : 'is-empty';
    const stateClass = cell.selected
        ? 'gd-board-cell is-selected'
        : cell.selectable
          ? 'gd-board-cell is-selectable'
          : 'gd-board-cell';

    return (
        <article
            className={`${stateClass} ${tokenClass}`}
            data-position-id={cell.positionId}
            aria-label={`Board cell ${cell.positionId}`}
        >
            <span className="gd-board-pos">{cell.positionId}</span>
            <strong>{cell.token ?? 'empty'}</strong>
            <span>{cell.selectionKind ?? 'idle'}</span>
            {cell.reason ? <span className="gd-muted">{cell.reason}</span> : null}
        </article>
    );
};

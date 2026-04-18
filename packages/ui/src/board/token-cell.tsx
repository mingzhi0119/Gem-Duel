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

export const TokenCell = ({
    cell,
    onSelect,
    disabled = false,
    testId,
}: {
    cell: UiBoardCell;
    onSelect?: (cell: UiBoardCell) => void;
    disabled?: boolean;
    testId?: string;
}) => {
    const tokenClass = cell.token ? tokenClassByColor[cell.token] : 'is-empty';
    const stateClass = cell.selected
        ? 'gd-board-cell is-selected'
        : cell.selectable
          ? 'gd-board-cell is-selectable'
          : 'gd-board-cell';
    const tokenLabel = cell.token ?? 'empty';
    const footerLabel = cell.selectionKind ?? (cell.selectable ? 'ready' : tokenLabel);
    const cellTitle = [cell.positionId, tokenLabel, cell.selectionKind, cell.reason]
        .filter((value): value is string => Boolean(value))
        .join(' | ');
    const content = (
        <>
            <span className="gd-board-pos">{cell.positionId}</span>
            <span className="gd-board-cell-core" aria-hidden="true">
                <span className="gd-board-cell-socket">
                    <span className="gd-board-cell-gem" />
                </span>
            </span>
            <span
                className={
                    cell.selectionKind || cell.selectable
                        ? 'gd-board-cell-state is-active'
                        : 'gd-board-cell-state'
                }
            >
                {footerLabel}
            </span>
        </>
    );

    if (onSelect) {
        return (
            <button
                type="button"
                className={`${stateClass} ${tokenClass} gd-board-cell-button`}
                data-position-id={cell.positionId}
                data-testid={testId ?? `board-cell-${cell.positionId}`}
                aria-label={`Board cell ${cell.positionId}`}
                aria-pressed={cell.selected}
                disabled={disabled}
                title={cellTitle}
                onClick={() => onSelect(cell)}
            >
                {content}
            </button>
        );
    }

    return (
        <article
            className={`${stateClass} ${tokenClass}`}
            data-position-id={cell.positionId}
            data-testid={testId ?? `board-cell-${cell.positionId}`}
            aria-label={`Board cell ${cell.positionId}`}
            title={cellTitle}
        >
            {content}
        </article>
    );
};

import type { UiMarketSlot } from '@gem-duel/contracts';

const renderSlotBody = (slot: UiMarketSlot) => (
    <>
        <div className="gd-card-slot-meta">
            <span className="gd-muted">{slot.zone}</span>
            <span className="gd-card-slot-status">
                {slot.selectableAsBuy ? 'buy' : slot.selectableAsReserve ? 'reserve' : 'locked'}
            </span>
        </div>
        <strong>{slot.cardId ?? 'hidden / empty'}</strong>
        <span>
            {slot.level ? `L${slot.level}` : 'no level'}
            {slot.slot ? ` • slot ${slot.slot}` : ''}
            {slot.slotId ? ` • ${slot.slotId}` : ''}
        </span>
        {slot.owner ? <span className="gd-muted">owner: {slot.owner}</span> : null}
        {slot.reason ? <span className="gd-muted">{slot.reason}</span> : null}
    </>
);

export const CardSlot = ({
    slot,
    onBuy,
    onReserve,
    buyDisabled = false,
    reserveDisabled = false,
    testId,
}: {
    slot: UiMarketSlot;
    onBuy?: (slot: UiMarketSlot) => void;
    onReserve?: (slot: UiMarketSlot) => void;
    buyDisabled?: boolean;
    reserveDisabled?: boolean;
    testId?: string;
}) => {
    const className = slot.selectableAsBuy
        ? 'gd-market-slot is-buyable'
        : slot.selectableAsReserve
          ? 'gd-market-slot is-reservable'
          : 'gd-market-slot';
    const primaryLabel =
        slot.zone === 'reserve' ? 'Buy reserved card' : slot.zone === 'pyramid' ? 'Buy card' : null;
    const reserveLabel = slot.zone === 'deck' ? `Reserve blind L${slot.level}` : 'Reserve';

    return (
        <article className={className} data-testid={testId ?? `market-slot-${slot.ref}`}>
            {onBuy ? (
                <button
                    type="button"
                    className="gd-card-slot-primary"
                    data-testid={`${testId ?? `market-slot-${slot.ref}`}-buy`}
                    disabled={buyDisabled}
                    onClick={() => onBuy(slot)}
                >
                    {renderSlotBody(slot)}
                    {primaryLabel ? (
                        <span className="gd-card-slot-action-hint">{primaryLabel}</span>
                    ) : null}
                </button>
            ) : (
                <div className="gd-card-slot-primary is-static">{renderSlotBody(slot)}</div>
            )}
            {onReserve ? (
                <div className="gd-card-slot-actions">
                    <button
                        type="button"
                        className="gd-chip-button"
                        data-testid={`${testId ?? `market-slot-${slot.ref}`}-reserve`}
                        disabled={reserveDisabled}
                        onClick={() => onReserve(slot)}
                    >
                        {reserveLabel}
                    </button>
                </div>
            ) : null}
        </article>
    );
};

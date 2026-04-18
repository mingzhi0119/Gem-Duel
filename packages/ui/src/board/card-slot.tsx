import type { UiMarketSlot } from '@gem-duel/contracts';

const getSlotStatusLabel = (slot: UiMarketSlot) =>
    slot.selectableAsBuy ? 'buy' : slot.selectableAsReserve ? 'reserve' : 'locked';

const getSlotLabel = (slot: UiMarketSlot) => {
    if (slot.cardId) {
        return slot.cardId;
    }

    if (slot.zone === 'deck') {
        return `blind tier ${slot.level ?? '?'}`;
    }

    if (slot.zone === 'reserve') {
        return slot.occupied ? 'reserved card' : 'empty reserve';
    }

    return 'sealed card';
};

const getSlotSubtitle = (slot: UiMarketSlot) => {
    if (slot.zone === 'deck') {
        return 'reserve from deck';
    }

    const parts = [
        slot.level ? `L${slot.level}` : null,
        slot.slot ? `slot ${slot.slot}` : null,
        slot.slotId ?? null,
    ].filter((part): part is string => part !== null);

    return parts.join(' / ') || 'fixture slot';
};

const getSlotZoneLabel = (slot: UiMarketSlot) => {
    switch (slot.zone) {
        case 'pyramid':
            return 'market';
        case 'deck':
            return 'deck';
        case 'reserve':
            return 'reserve';
    }
};

const renderSlotBody = (slot: UiMarketSlot) => (
    <div className="gd-card-slot-frame">
        <div className="gd-card-slot-head">
            <div className="gd-card-slot-meta">
                <span className="gd-card-slot-zone">{getSlotZoneLabel(slot)}</span>
                <span className="gd-card-slot-status">{getSlotStatusLabel(slot)}</span>
            </div>
            <span className="gd-card-slot-level">{slot.level ? `L${slot.level}` : 'AUX'}</span>
        </div>
        <div className="gd-card-slot-copy">
            <strong className="gd-card-slot-title">{getSlotLabel(slot)}</strong>
            <span className="gd-card-slot-subtitle">{getSlotSubtitle(slot)}</span>
            {slot.owner ? <span className="gd-card-slot-owner">{slot.owner}</span> : null}
            {slot.reason ? <span className="gd-card-slot-reason">{slot.reason}</span> : null}
        </div>
    </div>
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
    const slotTestId = testId ?? `market-slot-${slot.ref}`;
    const slotTitle = [slot.cardId, slot.reason].filter(Boolean).join(' | ') || undefined;

    return (
        <article
            className={className}
            data-testid={slotTestId}
            data-gd-market-zone={slot.zone}
            data-gd-market-level={slot.level ?? 'aux'}
            data-gd-occupied={slot.occupied}
        >
            {onBuy ? (
                <button
                    type="button"
                    className="gd-card-slot-primary"
                    data-testid={`${slotTestId}-buy`}
                    disabled={buyDisabled}
                    title={slotTitle}
                    onClick={() => onBuy(slot)}
                >
                    {renderSlotBody(slot)}
                    {primaryLabel ? (
                        <span className="gd-card-slot-action-hint">{primaryLabel}</span>
                    ) : null}
                </button>
            ) : (
                <div className="gd-card-slot-primary is-static" title={slotTitle}>
                    {renderSlotBody(slot)}
                </div>
            )}
            {onReserve ? (
                <div className="gd-card-slot-actions">
                    <button
                        type="button"
                        className="gd-chip-button"
                        data-testid={`${slotTestId}-reserve`}
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

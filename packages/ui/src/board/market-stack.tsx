import type { UiMarketSlot } from '@gem-duel/contracts';
import { CardSlot } from './card-slot';

const zoneOrder = ['pyramid', 'deck', 'reserve'] as const;

export const MarketStack = ({
    slots,
    onBuySlot,
    onReserveSlot,
    isBuyDisabled,
    isReserveDisabled,
}: {
    slots: UiMarketSlot[];
    onBuySlot?: (slot: UiMarketSlot) => void;
    onReserveSlot?: (slot: UiMarketSlot) => void;
    isBuyDisabled?: (slot: UiMarketSlot) => boolean;
    isReserveDisabled?: (slot: UiMarketSlot) => boolean;
}) => {
    if (slots.length === 0) {
        return <p className="gd-muted">No market fixture slots in this scene.</p>;
    }

    return (
        <div className="gd-market-stack">
            {zoneOrder.map((zone) => {
                const zoneSlots = slots.filter((slot) => slot.zone === zone);
                if (zoneSlots.length === 0) {
                    return null;
                }
                return (
                    <section key={zone} className="gd-market-lane">
                        <div className="gd-market-lane-header">
                            <strong>{zone}</strong>
                            <span className="gd-muted">{zoneSlots.length} slots</span>
                        </div>
                        <div className="gd-market-grid">
                            {zoneSlots.map((slot) => (
                                <CardSlot
                                    key={slot.ref}
                                    slot={slot}
                                    onBuy={
                                        onBuySlot && slot.selectableAsBuy ? onBuySlot : undefined
                                    }
                                    onReserve={
                                        onReserveSlot && slot.selectableAsReserve
                                            ? onReserveSlot
                                            : undefined
                                    }
                                    buyDisabled={isBuyDisabled?.(slot) ?? false}
                                    reserveDisabled={isReserveDisabled?.(slot) ?? false}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

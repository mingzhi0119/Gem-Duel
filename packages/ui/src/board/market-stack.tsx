import type { UiMarketSlot } from '@gem-duel/contracts';
import { CardSlot } from './card-slot';

const pyramidLevels = [3, 2, 1] as const;

const sortBySlotOrder = (left: UiMarketSlot, right: UiMarketSlot) => {
    const leftSlot = left.slot ?? 0;
    const rightSlot = right.slot ?? 0;
    if (leftSlot !== rightSlot) {
        return leftSlot - rightSlot;
    }

    return left.ref.localeCompare(right.ref);
};

export const MarketStack = ({
    slots,
    onBuySlot,
    onReserveSlot,
    isBuyDisabled,
    isReserveDisabled,
    locale = 'en',
}: {
    slots: UiMarketSlot[];
    onBuySlot?: (slot: UiMarketSlot) => void;
    onReserveSlot?: (slot: UiMarketSlot) => void;
    isBuyDisabled?: (slot: UiMarketSlot) => boolean;
    isReserveDisabled?: (slot: UiMarketSlot) => boolean;
    locale?: 'en' | 'zh';
}) => {
    if (slots.length === 0) {
        return <p className="gd-muted">No market fixture slots in this scene.</p>;
    }

    const pyramidSlots = slots.filter((slot) => slot.zone === 'pyramid');
    const deckSlots = slots.filter((slot) => slot.zone === 'deck');

    return (
        <div className="gd-market-stack">
            <div className="gd-market-pyramid">
                {pyramidLevels.map((level) => {
                    const tierSlots = pyramidSlots
                        .filter((slot) => slot.level === level)
                        .sort(sortBySlotOrder);
                    const deckSlot =
                        deckSlots.find((slot) => slot.level === level) ??
                        deckSlots.find((slot) => slot.level === null) ??
                        null;

                    return (
                        <section
                            key={level}
                            className={`gd-market-tier is-level-${level}`}
                            data-gd-market-level={level}
                        >
                            <div className="gd-market-tier-header">
                                <span className="gd-market-tier-label">L{level}</span>
                                <span className="gd-market-tier-count">{tierSlots.length}</span>
                            </div>
                            <div className="gd-market-tier-row">
                                <div className="gd-market-tier-deck">
                                    {deckSlot ? (
                                        <CardSlot
                                            slot={deckSlot}
                                            locale={locale}
                                            onReserve={
                                                onReserveSlot && deckSlot.selectableAsReserve
                                                    ? onReserveSlot
                                                    : undefined
                                            }
                                            reserveDisabled={isReserveDisabled?.(deckSlot) ?? false}
                                        />
                                    ) : null}
                                </div>
                                <div
                                    className={`gd-market-tier-grid is-level-${level}`}
                                    data-card-count={tierSlots.length}
                                >
                                    {tierSlots.map((slot) => (
                                        <CardSlot
                                            key={slot.ref}
                                            slot={slot}
                                            locale={locale}
                                            onBuy={
                                                onBuySlot && slot.selectableAsBuy
                                                    ? onBuySlot
                                                    : undefined
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
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

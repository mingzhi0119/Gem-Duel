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

const sortReserveSlots = (left: UiMarketSlot, right: UiMarketSlot) => {
    const ownerOrder = `${left.owner ?? 'z'}-${left.slotId ?? left.ref}`;
    const nextOwnerOrder = `${right.owner ?? 'z'}-${right.slotId ?? right.ref}`;
    return ownerOrder.localeCompare(nextOwnerOrder);
};

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

    const pyramidSlots = slots.filter((slot) => slot.zone === 'pyramid');
    const deckSlots = slots.filter((slot) => slot.zone === 'deck');
    const reserveSlots = slots.filter((slot) => slot.zone === 'reserve').sort(sortReserveSlots);
    const reserveOwners = Array.from(new Set(reserveSlots.map((slot) => slot.owner ?? 'reserve')));

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
                            <div className="gd-market-tier-heading">
                                <strong>Tier {level}</strong>
                                <span className="gd-muted">{tierSlots.length} cards</span>
                            </div>
                            <div className="gd-market-tier-row">
                                <div className="gd-market-tier-deck">
                                    {deckSlot ? (
                                        <CardSlot
                                            slot={deckSlot}
                                            onReserve={
                                                onReserveSlot && deckSlot.selectableAsReserve
                                                    ? onReserveSlot
                                                    : undefined
                                            }
                                            reserveDisabled={isReserveDisabled?.(deckSlot) ?? false}
                                        />
                                    ) : (
                                        <div
                                            className={`gd-market-deck-placeholder is-level-${level}`}
                                            aria-hidden="true"
                                        >
                                            <span className="gd-market-deck-placeholder-label">
                                                Deck
                                            </span>
                                            <span className="gd-market-deck-placeholder-level">
                                                L{level}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`gd-market-tier-grid is-level-${level}`}
                                    data-card-count={tierSlots.length}
                                >
                                    {tierSlots.map((slot) => (
                                        <CardSlot
                                            key={slot.ref}
                                            slot={slot}
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

            {reserveSlots.length > 0 ? (
                <section className="gd-market-reserve-bank">
                    <div className="gd-market-lane-header">
                        <strong>Reserve Bank</strong>
                        <span className="gd-muted">{reserveSlots.length} slots</span>
                    </div>
                    <div className="gd-market-reserve-layout">
                        {reserveOwners.map((ownerKey) => {
                            const ownerSlots = reserveSlots.filter(
                                (slot) => (slot.owner ?? 'reserve') === ownerKey
                            );
                            return (
                                <section key={ownerKey} className="gd-market-reserve-section">
                                    <div className="gd-market-reserve-section-header">
                                        <strong>
                                            {ownerKey === 'reserve'
                                                ? 'Shared reserve'
                                                : `${ownerKey.toUpperCase()} reserve`}
                                        </strong>
                                        <span className="gd-muted">{ownerSlots.length} slots</span>
                                    </div>
                                    <div className="gd-market-reserve-grid">
                                        {ownerSlots.map((slot) => (
                                            <CardSlot
                                                key={slot.ref}
                                                slot={slot}
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
                                </section>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </div>
    );
};

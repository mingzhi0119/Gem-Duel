import type { UiMarketSlot } from '@gem-duel/contracts';
import { CardSlot } from './card-slot';

const zoneOrder = ['pyramid', 'deck', 'reserve'] as const;

export const MarketStack = ({ slots }: { slots: UiMarketSlot[] }) => {
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
                                <CardSlot key={slot.ref} slot={slot} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};
